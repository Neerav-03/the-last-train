import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useGameStore } from '../engine/store';
import { rngFor } from '../engine/rng';
import { setAmbience, playAnnouncementStatic } from '../audio/AudioEngine';
import RainOverlay from '../effects/RainOverlay';
import FogOverlay from '../effects/FogOverlay';
import FlickerLight from '../effects/FlickerLight';
import DustParticles from '../effects/DustParticles';
import InteractionPrompt from '../components/InteractionPrompt';
import DialogueBox from '../components/DialogueBox';
import type { DialogueLine } from '../engine/types';
import './Platform.css';

interface PlatformObject {
  id: string;
  label: string;
  x: number; // percent
  promptY: number; // percent, where the prompt floats
}

const OBJECTS: PlatformObject[] = [
  { id: 'platform.clock', label: 'Clock', x: 22, promptY: 34 },
  { id: 'platform.board', label: 'Departure Board', x: 46, promptY: 42 },
  { id: 'platform.bench', label: 'Bench', x: 68, promptY: 62 },
  { id: 'platform.payphone', label: 'Payphone', x: 87, promptY: 50 },
];

const PLAYER_MIN_X = 8;
const PLAYER_MAX_X = 92;
const PROXIMITY = 6;
const PLAYER_SPEED = 26; // percent per second
const PROGRESSION_INSPECT_THRESHOLD = 2;
const PROGRESSION_FALLBACK_MS = 27000;

const ANNOUNCEMENT_LINES: DialogueLine[] = [
  { speaker: 'PA SYSTEM', text: 'The train arriving at Platform 4 is...' },
  { speaker: 'PA SYSTEM', text: '—static—' },
  { speaker: 'PA SYSTEM', text: '...not for passengers.' },
];

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function getDialogueForObject(id: string, priorCount: number): DialogueLine[] {
  switch (id) {
    case 'platform.clock':
      return priorCount === 0
        ? [
            { speaker: 'STATION CLOCK', text: '2:17 AM' },
            { speaker: 'STATION CLOCK', text: "The second hand isn't moving." },
          ]
        : [{ speaker: 'STATION CLOCK', text: '2:17 AM' }];
    case 'platform.board':
      return [
        { speaker: 'DEPARTURE BOARD', text: 'PLATFORM 4' },
        { speaker: 'DEPARTURE BOARD', text: 'Next Train: —' },
      ];
    case 'platform.bench':
      return [
        {
          speaker: '',
          text: "Someone carved initials into the wood. They're not yours. Are they?",
        },
      ];
    case 'platform.payphone':
      return [
        {
          speaker: 'PAYPHONE',
          text: 'The receiver hangs off the hook. No dial tone. Just breathing, slow, on the line.',
        },
      ];
    default:
      return [];
  }
}

export default function Platform() {
  const playerTrackRef = useRef<HTMLDivElement>(null);
  const architectureRef = useRef<SVGSVGElement>(null);
  const [nearObjectId, setNearObjectId] = useState<string | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<DialogueLine[] | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [facing, setFacing] = useState<'left' | 'right'>('right');

  const playerXRef = useRef(50);
  const keysRef = useRef<Record<string, boolean>>({});
  const activeDialogueRef = useRef<DialogueLine[] | null>(null);
  const inspectedRef = useRef<Set<string>>(new Set());
  const readyToAdvanceRef = useRef(false);
  const advancedRef = useRef(false);
  const announcementCountRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const isMovingRef = useRef(false);
  const facingRef = useRef<'left' | 'right'>('right');

  useEffect(() => {
    activeDialogueRef.current = activeDialogue;
  }, [activeDialogue]);

  const advanceToTrainArrival = () => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    useGameStore.getState().goToScene('trainArrival');
  };

  // Ambience on mount.
  useEffect(() => {
    setAmbience('platform');
  }, []);

  // Fallback progression timer so the player can never get soft-locked.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      advanceToTrainArrival();
    }, PROGRESSION_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Distorted PA announcements — rare, at most twice.
  useEffect(() => {
    let timer: number;
    const scheduleNext = () => {
      if (announcementCountRef.current >= 2) return;
      // Seeded jitter (STORY_REFINEMENT_GUIDE.md §4 System 4) — timing only.
      const { runSeed } = useGameStore.getState();
      const delay =
        45000 + rngFor(runSeed, `timing:platform.announcement:${announcementCountRef.current}`)() * 25000;
      timer = window.setTimeout(() => {
        if (!activeDialogueRef.current && !advancedRef.current) {
          announcementCountRef.current += 1;
          playAnnouncementStatic();
          setActiveDialogue(ANNOUNCEMENT_LINES);
        }
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => window.clearTimeout(timer);
  }, []);

  // Keyboard input.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key.toLowerCase() === 'e' && !activeDialogueRef.current && nearObjectId) {
        inspect(nearObjectId);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearObjectId]);

  // Movement + proximity loop.
  useEffect(() => {
    let last = performance.now();
    // Movement writes transforms straight to the DOM: a React re-render of this
    // whole scene every frame is what made walking stutter.
    const applyPosition = () => {
      const x = playerXRef.current;
      if (playerTrackRef.current) playerTrackRef.current.style.transform = `translate3d(${x - 50}%, 0, 0)`;
      if (architectureRef.current) architectureRef.current.style.transform = `translate3d(${(x - 50) * -0.06}%, 0, 0)`;
    };
    applyPosition();

    const loop = (now: number) => {
      // Clamp so a dropped frame or a backgrounded tab can't teleport the player.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!activeDialogueRef.current) {
        let dx = 0;
        if (keysRef.current['a'] || keysRef.current['A'] || keysRef.current['ArrowLeft']) dx -= 1;
        if (keysRef.current['d'] || keysRef.current['D'] || keysRef.current['ArrowRight']) dx += 1;
        if (dx !== 0) {
          playerXRef.current = clamp(playerXRef.current + dx * PLAYER_SPEED * dt, PLAYER_MIN_X, PLAYER_MAX_X);
          applyPosition();
          const nextFacing = dx > 0 ? 'right' : 'left';
          if (facingRef.current !== nextFacing) {
            facingRef.current = nextFacing;
            setFacing(nextFacing);
          }
        }
        if (isMovingRef.current !== (dx !== 0)) {
          isMovingRef.current = dx !== 0;
          setIsMoving(isMovingRef.current);
        }
      } else if (isMovingRef.current) {
        isMovingRef.current = false;
        setIsMoving(false);
      }

      let closest: string | null = null;
      let closestDist = Infinity;
      for (const obj of OBJECTS) {
        const dist = Math.abs(playerXRef.current - obj.x);
        if (dist < PROXIMITY && dist < closestDist) {
          closest = obj.id;
          closestDist = dist;
        }
      }
      setNearObjectId((prev) => (prev === closest ? prev : closest));

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const inspect = (id: string) => {
    if (activeDialogueRef.current) return;
    const priorCount = useGameStore.getState().getInteractionCount(id);
    const lines = getDialogueForObject(id, priorCount);
    if (lines.length === 0) return;
    useGameStore.getState().interact(id);
    inspectedRef.current.add(id);
    if (inspectedRef.current.size >= PROGRESSION_INSPECT_THRESHOLD) {
      readyToAdvanceRef.current = true;
    }
    setActiveDialogue(lines);
  };

  const handleDialogueComplete = () => {
    setActiveDialogue(null);
    if (readyToAdvanceRef.current) {
      advanceToTrainArrival();
    }
  };

  const nearObject = OBJECTS.find((o) => o.id === nearObjectId) ?? null;

  const isNear = (id: string) => nearObjectId === id;

  return (
    <div className="platform-scene">
      <div className="platform-sky" />

      <svg
        ref={architectureRef}
        className="platform-architecture"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="platformCanopyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#15161b" />
            <stop offset="100%" stopColor="#0a0a0e" />
          </linearGradient>
        </defs>
        <path
          d="M0,10 Q50,2 100,10 L100,16 Q50,9 0,16 Z"
          fill="url(#platformCanopyGrad)"
          stroke="var(--color-line)"
          strokeWidth="0.15"
          opacity="0.9"
        />
        {[6, 24, 42, 60, 78, 94].map((x) => (
          <rect key={x} x={x} y="10" width="1" height="34" fill="#0d0e12" stroke="var(--color-line)" strokeWidth="0.05" opacity="0.8" />
        ))}
        <path d="M0,30 Q50,22 100,30" fill="none" stroke="var(--color-line)" strokeWidth="0.15" opacity="0.3" />
      </svg>

      <FogOverlay opacity={0.35} />
      <RainOverlay intensity={0.4} z={7} />
      <DustParticles density={0.15} />

      <FlickerLight x={46} y={18} radius={26} color="#d8b874" active />
      <FlickerLight x={16} y={14} radius={14} color="#7fa8c9" active />
      <FlickerLight x={82} y={14} radius={14} color="#7fa8c9" active />

      <div className="platform-station-sign">
        <span className="platform-station-sign-plate">STATION 12 &mdash; PLATFORM 4</span>
      </div>

      <div
        className={`platform-clock${isNear('platform.clock') ? ' is-near' : ''}`}
        style={{ left: `${OBJECTS[0].x}%` }}
        onClick={() => isNear('platform.clock') && inspect('platform.clock')}
      >
        <span>2:17</span>
      </div>

      <div
        className={`platform-board${isNear('platform.board') ? ' is-near' : ''}`}
        style={{ left: `${OBJECTS[1].x}%` }}
        onClick={() => isNear('platform.board') && inspect('platform.board')}
      >
        <div className="platform-board-line">PLATFORM 4</div>
        <div className="platform-board-line flicker-text">NEXT TRAIN: &mdash;</div>
      </div>

      <div
        className={`platform-bench${isNear('platform.bench') ? ' is-near' : ''}`}
        style={{ left: `${OBJECTS[2].x}%` }}
        onClick={() => isNear('platform.bench') && inspect('platform.bench')}
      />

      <div
        className={`platform-payphone${isNear('platform.payphone') ? ' is-near' : ''}`}
        style={{ left: `${OBJECTS[3].x}%` }}
        onClick={() => isNear('platform.payphone') && inspect('platform.payphone')}
      />

      <div className="platform-floor" />
      <div className="platform-tracks" />
      <div className="platform-rail-glint" />

      <div className="platform-player-track" ref={playerTrackRef} aria-hidden>
      <div
        className={`platform-player${isMoving ? ' is-walking' : ''}`}
        style={{ '--facing': facing === 'left' ? -1 : 1 } as CSSProperties}
      >
        <svg className="platform-player-figure" viewBox="0 0 24 56">
          <defs>
            <linearGradient id="platformCoatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#131318" />
              <stop offset="100%" stopColor="#050506" />
            </linearGradient>
          </defs>
          <ellipse cx="12" cy="53.5" rx="9" ry="2.2" fill="rgba(0,0,0,0.5)" />
          <path
            d="M4,18 C4,13 8,10 12,10 C16,10 20,13 20,18 L21,49 C21,52.5 18,54 12,54 C6,54 3,52.5 3,49 Z"
            fill="url(#platformCoatGrad)"
            stroke="#000"
            strokeWidth="0.6"
          />
          <path d="M9,16 L15,16 L14.2,25 L9.8,25 Z" fill="rgba(127,168,201,0.08)" />
          <circle cx="12" cy="6" r="5" fill="#0b0b0d" stroke="#000" strokeWidth="0.6" />
        </svg>
      </div>
      </div>

      {nearObject && !activeDialogue && (
        <InteractionPrompt label={`Inspect ${nearObject.label}`} x={nearObject.x} y={nearObject.promptY} />
      )}

      {activeDialogue && (
        <DialogueBox lines={activeDialogue} onComplete={handleDialogueComplete} />
      )}

      <div className="platform-vignette" />
    </div>
  );
}
