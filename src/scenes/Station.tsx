import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '../engine/store';
import { STATIONS } from '../data/stations';
import {
  setAmbience,
  playAnnouncementStatic,
  playFootstep,
  playStinger,
} from '../audio/AudioEngine';
import FogOverlay from '../effects/FogOverlay';
import RainOverlay from '../effects/RainOverlay';
import FlickerLight from '../effects/FlickerLight';
import DustParticles from '../effects/DustParticles';
import LightningFlash from '../effects/LightningFlash';
import RedEmergencyOverlay from '../effects/RedEmergencyOverlay';
import InteractionPrompt from '../components/InteractionPrompt';
import DialogueBox from '../components/DialogueBox';
import { pick, rngFor } from '../engine/rng';
import type { DialogueChoice, DialogueLine, InspectTextEntry, StationDef, StationObjectDef } from '../engine/types';
import './Station.css';

// Break-the-loop ending requires this many discovered clues (tuned 4-6 range).
const BREAK_LOOP_CLUE_THRESHOLD = 5;

const REBOARD_INSPECT_THRESHOLD = 2;
// Sector 0 only: raised reboard bar when the player engaged the optional
// followFootsteps hotspot (STORY_REFINEMENT_GUIDE.md §6.3). followFootsteps
// itself is never counted toward either threshold.
const SECTOR0_FOLLOWED_REBOARD_THRESHOLD = 3;
const REBOARD_FALLBACK_MS = 24000;
const ANNOUNCEMENT_DELAY_MS = 8000;
const SECTOR0_FOOTSTEP_DELAY_MS = 13000;

// ---------------------------------------------------------------------------
// System 3: leaf flavor-text variants (STORY_REFINEMENT_GUIDE.md §4, Inv. 3/7)
// ---------------------------------------------------------------------------

/** Flag that locks this run's variant choice for one object. Flags are
 *  boolean-only, so the variant index is encoded in the flag name. */
function flavorLockFlag(stationKey: string, objId: string, variant: number): string {
  return `flavor.${stationKey}.${objId}.v${variant}`;
}

interface ResolvedInspectSteps {
  /** The full progressive-reveal sequence for this object, this run. */
  steps: string[];
  /** Variant-mode only: the lock flag to set if it isn't set yet (null when
   *  the object is plain, or its variant is already locked). */
  lockFlagToSet: string | null;
}

/**
 * Pure: returns the progressive reveal steps for an object.
 * - Plain mode (every entry a string): the original steps, unchanged.
 * - Variant mode (`Array.isArray(inspectText[0])`): each entry is one full
 *   variant; a stray string entry is treated as a one-step variant. An
 *   existing lock flag wins; otherwise the variant is drawn from
 *   rngFor(runSeed, 'flavor:<station>.<obj>') and the caller locks it.
 */
function resolveInspectSteps(
  stationKey: string,
  obj: StationObjectDef,
  runSeed: number,
  flags: Record<string, boolean>
): ResolvedInspectSteps {
  const entries: InspectTextEntry[] = obj.inspectText;
  if (!Array.isArray(entries[0])) {
    // Plain mode. A nested entry here is malformed data; show its last line
    // rather than crash (the old placeholder behaviour).
    const steps = entries.map((e) => (Array.isArray(e) ? e[e.length - 1] ?? '' : e));
    return { steps, lockFlagToSet: null };
  }

  const variants = entries.map((e) => (Array.isArray(e) ? e : [e]));
  for (let n = 0; n < variants.length; n++) {
    if (flags[flavorLockFlag(stationKey, obj.id, n)]) {
      return { steps: variants[n], lockFlagToSet: null };
    }
  }
  const rolled = Math.floor(rngFor(runSeed, `flavor:${stationKey}.${obj.id}`)() * variants.length);
  const n = Math.min(Math.max(rolled, 0), variants.length - 1);
  return { steps: variants[n], lockFlagToSet: flavorLockFlag(stationKey, obj.id, n) };
}

// ---------------------------------------------------------------------------
// System 2: station anomaly pools (STORY_REFINEMENT_GUIDE.md §4, Inv. 2/4/7)
// ---------------------------------------------------------------------------

/**
 * Pure: at most one anomaly per station per run, deterministic from runSeed.
 * The Last Stop never gets one (its finale stays fully authored). Entries
 * whose id collides with a regular object are ignored defensively.
 */
function selectAnomaly(station: StationDef, runSeed: number): StationObjectDef | null {
  if (station.key === 'lastStop') return null;
  const regularIds = new Set(station.objects.map((o) => o.id));
  const pool = (station.anomalyPool ?? []).filter((a) => !regularIds.has(a.id));
  if (pool.length === 0) return null;
  return pick(rngFor(runSeed, `anomaly:${station.key}`), pool);
}

// Kalyanpur vending machine, third inspect (§6.4): "Take it" awards the
// bonus clue + flag directly (never via station.clueIds — see Invariant 5/6);
// "Leave it" sets nothing. Declared once and applied generically by
// handleChoiceSelected below.
const VENDING_MACHINE_CHOICES: DialogueChoice[] = [
  { text: 'Take it', setFlags: ['tookReceipt'], awardsClues: ['vendingMachineReceipt'] },
  { text: 'Leave it' },
];
const EMPTY_PLATFORM_REVEAL_INSPECT_THRESHOLD = 2;
const EMPTY_PLATFORM_REVEAL_FALLBACK_MS = 20000;
const EMPTY_PLATFORM_TRAIN_DELAY_MS = 1400;
const HOME_REVEAL_INSPECT_THRESHOLD = 2;
const HOME_REVEAL_FALLBACK_MS = 16000;
const HOME_PULSE_MS = 2600;

function ambienceForStation(station: StationDef): 'stationOutdoor' | 'dread' | 'silence' | 'trainStopped' {
  switch (station.key) {
    case 'kalyanpur':
      return 'stationOutdoor';
    case 'madhavNagar':
      return 'trainStopped';
    case 'sector0':
    case 'unlisted':
      return 'dread';
    case 'emptyPlatform':
      return 'silence';
    case 'home':
      return 'stationOutdoor';
    default:
      return 'stationOutdoor';
  }
}

// ---------------------------------------------------------------------------
// Purely-visual helpers: deterministic "jitter" so wrongness-coded stations
// (sector0 / unlisted) get subtly off-kilter architecture that is stable
// across re-renders, without touching any gameplay/timing logic.
// ---------------------------------------------------------------------------

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function seededJitter(seed: number, index: number, spread: number): number {
  const v = Math.sin(seed + index * 12.9898) * 43758.5453;
  const frac = v - Math.floor(v);
  return (frac - 0.5) * 2 * spread;
}

const PILLAR_X_POSITIONS = [10, 28, 50, 72, 90];
const SPARSE_PILLAR_X_POSITIONS = [16, 50, 84];

/**
 * StationEnvironment — reusable small-station platform silhouette (canopy
 * pillars, signage plate, track bed) rendered as a stretched inline SVG.
 * Per-station mood is expressed through jitter/opacity/color only; no
 * gameplay state is read or written here.
 */
function StationEnvironment({ station, homeRevealed }: { station: StationDef; homeRevealed: boolean }) {
  const key = station.key;
  const wrong = key === 'sector0' || key === 'unlisted';
  const sparse = key === 'emptyPlatform';
  const domestic = key === 'home';
  const seed = hashSeed(key);
  const pillarXs = sparse ? SPARSE_PILLAR_X_POSITIONS : PILLAR_X_POSITIONS;
  const trackGradId = `station-track-grad-${key}`;

  return (
    <svg
      className={`station-env station-env--${key}`}
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={trackGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-fog)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-void)" stopOpacity="0.92" />
        </linearGradient>
      </defs>

      {/* track bed */}
      <polygon points="0,60 100,60 62,30 38,30" fill={`url(#${trackGradId})`} opacity="0.85" />
      <line x1="8" y1="60" x2="40" y2="30" stroke="var(--color-line)" strokeWidth="0.35" opacity="0.5" />
      <line x1="92" y1="60" x2="60" y2="30" stroke="var(--color-line)" strokeWidth="0.35" opacity="0.5" />

      {/* platform floor + edge stripe */}
      <rect x="0" y="46" width="100" height="14" fill="var(--color-bg-raised)" opacity="0.55" />
      <rect
        x="0"
        y="45.35"
        width="100"
        height="0.55"
        fill={domestic ? 'var(--color-accent-warm)' : 'var(--color-accent)'}
        opacity="0.32"
      />

      {/* pillars + canopy lamps */}
      {pillarXs.map((x, i) => {
        const jitter = wrong ? seededJitter(seed, i, 3.4) : 0;
        const topJitter = wrong ? seededJitter(seed, i + 100, 2.2) : 0;
        const tilt = wrong ? seededJitter(seed, i + 50, 3.5) : 0;
        const topY = 6 + topJitter;
        const px = x + jitter;
        const fade = domestic && homeRevealed ? Math.max(0.12, 1 - i * 0.2) : 1;
        return (
          <g
            key={x}
            transform={`rotate(${tilt} ${px} 46)`}
            opacity={fade}
            style={domestic ? { transition: 'opacity 1800ms var(--ease-cinematic)' } : undefined}
          >
            <rect x={px - 0.55} y={topY} width="1.1" height={46 - topY} fill="var(--color-steel)" opacity="0.7" />
            {domestic ? (
              <circle cx={px} cy={topY + 2} r="1.5" fill="var(--color-accent-warm)" opacity={homeRevealed ? 0.15 : 0.55} />
            ) : (
              <rect x={px - 2.4} y={topY - 1.3} width="4.8" height="1.3" fill="var(--color-line)" opacity="0.6" />
            )}
          </g>
        );
      })}

      {/* canopy roofline */}
      <polyline
        points={pillarXs
          .map((x, i) => {
            const jitter = wrong ? seededJitter(seed, i, 3.4) : 0;
            const topJitter = wrong ? seededJitter(seed, i + 100, 2.2) : 0;
            return `${x + jitter},${6 + topJitter}`;
          })
          .join(' ')}
        fill="none"
        stroke="var(--color-line)"
        strokeWidth="0.3"
        opacity="0.4"
      />

      {/* blank signage plate (decorative scenery; real sign text renders separately) */}
      {!sparse && (
        <rect
          x={pillarXs[1] - 6}
          y="16"
          width="12"
          height="4"
          fill="var(--color-bg)"
          stroke="var(--color-line)"
          strokeWidth="0.25"
          opacity="0.5"
        />
      )}
    </svg>
  );
}

export default function Station() {
  const currentStationIndex = useGameStore((s) => s.currentStationIndex);
  const station = STATIONS[currentStationIndex];

  if (!station) return null;

  if (station.key === 'lastStop') {
    return <LastStopStation key={station.key} station={station} />;
  }

  return <GenericStation key={station.key} station={station} />;
}

// ---------------------------------------------------------------------------
// Generic station (orders 1-6)
// ---------------------------------------------------------------------------

function GenericStation({ station }: { station: StationDef }) {
  const [activeDialogue, setActiveDialogue] = useState<DialogueLine[] | null>(null);
  const [activeChoices, setActiveChoices] = useState<DialogueChoice[] | null>(null);
  const [reboardAllowed, setReboardAllowed] = useState(false);
  const [trainVisible, setTrainVisible] = useState(false);
  const [lightningTrigger, setLightningTrigger] = useState(0);
  const [homeRevealed, setHomeRevealed] = useState(false);
  const [emergencyPulse, setEmergencyPulse] = useState(false);
  // Sector 0 only: the followFootsteps hotspot is hidden until the idle
  // beat reveals it (§6.3) — ignoring it forever costs nothing.
  const [footstepsRevealed, setFootstepsRevealed] = useState(false);

  const activeDialogueRef = useRef<DialogueLine[] | null>(null);
  const distinctInspectedRef = useRef<Set<string>>(new Set());
  const revealedRef = useRef(false); // emptyPlatform: train has silently reappeared
  const revealDialogueActiveRef = useRef(false);
  const pendingRevealRef = useRef(false);
  const homeRevealedRef = useRef(false);
  const footstepsPlayedRef = useRef(false); // sector0: idle-timer reveal has fired
  const followFootstepsEngagedRef = useRef(false); // sector0: player has inspected the hotspot
  const announcementShownRef = useRef(false);
  const reboardChimePlayedRef = useRef(false);

  // System 2: this run's anomaly for this station (or none). Deterministic
  // from runSeed, so it is stable within a run and across reloads.
  const runSeed = useGameStore((s) => s.runSeed);
  const anomaly = useMemo(() => selectAnomaly(station, runSeed), [station, runSeed]);

  useEffect(() => {
    activeDialogueRef.current = activeDialogue;
  }, [activeDialogue]);

  // Ambience on arrival.
  useEffect(() => {
    setAmbience(ambienceForStation(station));
  }, [station]);

  const awardStationClues = useCallback(() => {
    const store = useGameStore.getState();
    const visitedFlag = `station.${station.key}.cluesAwarded`;
    if (store.hasFlag(visitedFlag)) return;
    store.setFlag(visitedFlag, true);
    station.clueIds.forEach((id) => store.awardClue(id));
  }, [station]);

  // --- Empty platform "the train is gone" reveal sequence -------------------
  const triggerReveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setTrainVisible(true);
    playStinger();
    window.setTimeout(() => {
      const figureObj = station.objects.find((o) => o.id === 'figure');
      // The figure is deliberately plain (never varied), so this is always
      // its authored final line.
      let text = "You shouldn't have gotten off.";
      if (figureObj) {
        const { runSeed: seed, flags } = useGameStore.getState();
        const { steps } = resolveInspectSteps(station.key, figureObj, seed, flags);
        if (steps.length > 0) text = steps[steps.length - 1];
      }
      const speaker = figureObj ? figureObj.label : '···';
      revealDialogueActiveRef.current = true;
      setActiveDialogue([{ speaker, text }]);
    }, EMPTY_PLATFORM_TRAIN_DELAY_MS);
  }, [station]);

  const requestReveal = useCallback(() => {
    if (activeDialogueRef.current) {
      pendingRevealRef.current = true;
    } else {
      triggerReveal();
    }
  }, [triggerReveal]);

  useEffect(() => {
    if (!station.trainVanishes) return;
    const timer = window.setTimeout(() => {
      requestReveal();
    }, EMPTY_PLATFORM_REVEAL_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [station, requestReveal]);

  // --- Home: warmth curdles, void behind the tracks becomes visible ---------
  const triggerHomeReveal = useCallback(() => {
    if (homeRevealedRef.current) return;
    homeRevealedRef.current = true;
    setHomeRevealed(true);
    setAmbience('dread');
    setEmergencyPulse(true);
    window.setTimeout(() => setEmergencyPulse(false), HOME_PULSE_MS);
  }, []);

  useEffect(() => {
    if (station.key !== 'home') return;
    const timer = window.setTimeout(() => {
      triggerHomeReveal();
    }, HOME_REVEAL_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [station, triggerHomeReveal]);

  // --- Sector 0: footsteps that stop the instant you turn -------------------
  // Reveals the optional followFootsteps hotspot after the same idle window
  // that used to auto-play the beat; the sound/flash now only fire as a
  // reward if the player actually inspects it (handleInspect below). Purely
  // a reveal — never blocks reboarding on its own (Invariant 8).
  useEffect(() => {
    if (station.key !== 'sector0') return;
    const timer = window.setTimeout(() => {
      if (footstepsPlayedRef.current) return;
      footstepsPlayedRef.current = true;
      setFootstepsRevealed(true);
    }, SECTOR0_FOOTSTEP_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [station]);

  // --- Occasional PA announcement --------------------------------------------
  useEffect(() => {
    if (station.announcements.length === 0) return;
    // System 4: seeded jitter — timing only, never gates progression.
    const seed = useGameStore.getState().runSeed;
    const delay = ANNOUNCEMENT_DELAY_MS + rngFor(seed, `timing:announcement:${station.key}`)() * 5000;
    const timer = window.setTimeout(() => {
      if (announcementShownRef.current) return;
      if (activeDialogueRef.current) return;
      announcementShownRef.current = true;
      playAnnouncementStatic();
      const lines: DialogueLine[] = station.announcements.map((text) => ({
        speaker: 'PA SYSTEM',
        text,
      }));
      setActiveDialogue(lines);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [station]);

  // --- Reboard fallback timer (never soft-lock the player) ------------------
  useEffect(() => {
    if (station.trainVanishes) return; // reboarding there is gated by the reveal beat instead
    const timer = window.setTimeout(() => {
      setReboardAllowed(true);
    }, REBOARD_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [station]);

  const handleDialogueComplete = () => {
    const wasReveal = revealDialogueActiveRef.current;
    setActiveDialogue(null);
    if (wasReveal) {
      revealDialogueActiveRef.current = false;
      setReboardAllowed(true);
      return;
    }
    if (station.trainVanishes && !revealedRef.current) {
      if (
        pendingRevealRef.current ||
        distinctInspectedRef.current.size >= EMPTY_PLATFORM_REVEAL_INSPECT_THRESHOLD
      ) {
        pendingRevealRef.current = false;
        triggerReveal();
      }
    }
  };

  /** Resolve this run's steps for an object, lock its variant on first
   *  inspect, and return the line for the given interaction count. */
  const resolveLineForCount = (obj: StationObjectDef, count: number): string => {
    const store = useGameStore.getState();
    const { steps, lockFlagToSet } = resolveInspectSteps(station.key, obj, store.runSeed, store.flags);
    if (lockFlagToSet) store.setFlag(lockFlagToSet, true);
    if (steps.length === 0) return '';
    const idx = Math.min(Math.max(count - 1, 0), steps.length - 1);
    return steps[idx];
  };

  const handleInspect = (obj: StationObjectDef) => {
    if (activeDialogueRef.current) return;
    const id = `${station.key}.${obj.id}`;

    // System 2: an anomaly is pure atmosphere. It gets progressive text via
    // interact(), and nothing else: no awardStationClues(), no
    // distinctInspectedRef, no reboard / Home / Empty-Platform / Sector 0
    // threshold checks (Invariants 2 and 4), so structural timing is
    // identical whichever anomaly rolled.
    if (anomaly && obj.id === anomaly.id) {
      const anomalyCount = useGameStore.getState().interact(id);
      setActiveDialogue([{ speaker: obj.label, text: resolveLineForCount(obj, anomalyCount) }]);
      setActiveChoices(null);
      return;
    }

    const isFollowFootsteps = station.key === 'sector0' && obj.id === 'followFootsteps';
    const count = useGameStore.getState().interact(id);
    awardStationClues();

    if (isFollowFootsteps) {
      // §6.3: this hotspot never counts toward the tallied distinct-object
      // reboard threshold — it only raises the bar (see below), in exchange
      // for a bonus clue on first engagement. Ignoring it entirely never
      // costs anything (Invariant 8).
      if (!followFootstepsEngagedRef.current) {
        followFootstepsEngagedRef.current = true;
        const store = useGameStore.getState();
        store.setFlag('followedFootsteps', true);
        store.awardClue('unseenCompanion');
        playFootstep();
        setLightningTrigger((t) => t + 1);
        window.setTimeout(() => {
          playFootstep();
        }, 500);
      }
    } else {
      distinctInspectedRef.current.add(obj.id);
    }

    const line = resolveLineForCount(obj, count);

    // §6.4: Kalyanpur vending machine, exactly the 3rd inspect — present a
    // choice instead of auto-advancing. vendingMachineReceipt is only ever
    // awarded from the "Take it" branch below (via handleChoiceSelected),
    // never from station.clueIds (Invariant 5/6).
    const isVendingChoice = station.key === 'kalyanpur' && obj.id === 'vendingMachine' && count === obj.inspectText.length;

    setActiveDialogue([{ speaker: obj.label, text: line }]);
    setActiveChoices(isVendingChoice ? VENDING_MACHINE_CHOICES : null);

    const reboardThreshold =
      station.key === 'sector0' && followFootstepsEngagedRef.current
        ? SECTOR0_FOLLOWED_REBOARD_THRESHOLD
        : REBOARD_INSPECT_THRESHOLD;
    if (!station.trainVanishes && distinctInspectedRef.current.size >= reboardThreshold) {
      setReboardAllowed(true);
    }
    if (
      station.key === 'home' &&
      !homeRevealedRef.current &&
      distinctInspectedRef.current.size >= HOME_REVEAL_INSPECT_THRESHOLD
    ) {
      triggerHomeReveal();
    }
  };

  /** Applies a DialogueChoice's declared effects (§6) and closes the box.
   *  DialogueBox does not call onComplete for a choice pick, so this is the
   *  only place those effects land. */
  const handleChoiceSelected = (choice: DialogueChoice) => {
    const store = useGameStore.getState();
    choice.setFlags?.forEach((flag) => store.setFlag(flag, true));
    choice.awardsClues?.forEach((clueId) => store.awardClue(clueId));
    setActiveDialogue(null);
    setActiveChoices(null);
  };

  const handleReboard = () => {
    if (activeDialogueRef.current) return;
    useGameStore.getState().departStation();
  };

  useEffect(() => {
    if (reboardAllowed && !reboardChimePlayedRef.current) {
      reboardChimePlayedRef.current = true;
      playAnnouncementStatic();
    }
  }, [reboardAllowed]);

  const sceneClass = [
    'station-scene',
    `station-scene--${station.key}`,
    homeRevealed ? 'station-scene--home-revealed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Sector 0's followFootsteps hotspot stays hidden until the idle-beat
  // timer reveals it — ignoring it forever is fully supported (Invariant 8).
  const visibleObjects =
    station.key === 'sector0'
      ? station.objects.filter((obj) => obj.id !== 'followFootsteps' || footstepsRevealed)
      : station.objects;
  // The run's anomaly (if any) renders with exactly the same hotspot markup
  // and prompt as a regular object — no extra light, tint, flash or shake
  // (restrained per §7; nothing for Invariant 9 to gate).
  const hotspotObjects = anomaly ? [...visibleObjects, anomaly] : visibleObjects;
  const followFootstepsObj =
    station.key === 'sector0' ? station.objects.find((obj) => obj.id === 'followFootsteps') : undefined;

  return (
    <div className={sceneClass}>
      <StationEnvironment station={station} homeRevealed={homeRevealed} />
      {station.key === 'madhavNagar' && <div className="station-rain-sheen" aria-hidden="true" />}
      <FogOverlay opacity={station.key === 'emptyPlatform' ? 0.55 : 0.35} />
      {(station.key === 'kalyanpur' || station.key === 'madhavNagar') && (
        <RainOverlay intensity={station.key === 'kalyanpur' ? 0.45 : 0.2} z={2} />
      )}
      <DustParticles density={station.key === 'emptyPlatform' ? 0.1 : 0.2} />

      {renderStationLights(station, homeRevealed, emergencyPulse)}

      <LightningFlash trigger={lightningTrigger} />
      {station.key === 'home' && <RedEmergencyOverlay active={emergencyPulse} />}

      {station.key === 'home' && (
        <div className="station-void" aria-hidden="true" />
      )}

      {station.key === 'emptyPlatform' && trainVisible && (
        <div className="station-train-silhouette station-train-silhouette--reveal" aria-hidden="true" />
      )}

      {station.signText && (
        <div className={`station-sign${station.key === 'unlisted' ? ' station-sign--wrong' : ''}`}>
          {station.signText}
        </div>
      )}

      {/* Subtle, distinct marker for the followFootsteps hotspot (§7) — a
          faint dust trail rather than a loot-glow, so attentive players
          sense "there's more here" without the game announcing it. */}
      {footstepsRevealed && followFootstepsObj && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: `${followFootstepsObj.position.x - 12}%`,
            top: `${followFootstepsObj.position.y - 14}%`,
            width: '24%',
            height: '30%',
            zIndex: 4,
            pointerEvents: 'none',
          }}
        >
          <DustParticles density={0.35} />
        </div>
      )}

      <div className="station-objects">
        {hotspotObjects.map((obj) => (
          <div
            key={obj.id}
            className="station-hotspot"
            style={{ left: `${obj.position.x}%`, top: `${obj.position.y}%` }}
            role="button"
            tabIndex={0}
            aria-label={`Inspect ${obj.label}`}
            onClick={() => handleInspect(obj)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleInspect(obj);
              }
            }}
          >
            <span className="station-hotspot-marker">
              <span className="station-hotspot-ring" />
              <span className="station-hotspot-dot" />
              <span className="station-hotspot-bracket station-hotspot-bracket--tl" />
              <span className="station-hotspot-bracket station-hotspot-bracket--tr" />
              <span className="station-hotspot-bracket station-hotspot-bracket--bl" />
              <span className="station-hotspot-bracket station-hotspot-bracket--br" />
            </span>
          </div>
        ))}
      </div>

      {!activeDialogue &&
        hotspotObjects.map((obj) => (
          <InteractionPrompt
            key={`${obj.id}-prompt`}
            label={obj.label}
            x={obj.position.x}
            y={Math.max(4, obj.position.y - 6)}
          />
        ))}

      {reboardAllowed && !activeDialogue && (
        <>
          <div
            className="station-hotspot station-hotspot--reboard"
            style={{ left: '50%', top: '90%' }}
            role="button"
            tabIndex={0}
            aria-label="Board the train"
            onClick={handleReboard}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleReboard();
              }
            }}
          >
            <span className="station-hotspot-marker">
              <span className="station-hotspot-ring station-hotspot-ring--reboard" />
              <span className="station-hotspot-dot" />
              <span className="station-hotspot-bracket station-hotspot-bracket--tl" />
              <span className="station-hotspot-bracket station-hotspot-bracket--tr" />
              <span className="station-hotspot-bracket station-hotspot-bracket--bl" />
              <span className="station-hotspot-bracket station-hotspot-bracket--br" />
            </span>
          </div>
          <InteractionPrompt label="Board the Train" x={50} y={83} />
        </>
      )}

      {activeDialogue && (
        <DialogueBox
          lines={activeDialogue}
          onComplete={handleDialogueComplete}
          choices={activeChoices ?? undefined}
          onChoice={activeChoices ? handleChoiceSelected : undefined}
        />
      )}

      <div className="station-vignette" />
    </div>
  );
}

function renderStationLights(station: StationDef, homeRevealed: boolean, emergencyPulse: boolean) {
  switch (station.key) {
    case 'kalyanpur':
      return <FlickerLight x={30} y={22} radius={240} color="#d8a24a" active />;
    case 'madhavNagar':
      return <FlickerLight x={55} y={20} radius={260} color="#dce8f0" active />;
    case 'sector0':
      return <FlickerLight x={46} y={30} radius={150} color="#9aa2ad" active />;
    case 'unlisted':
      return <FlickerLight x={55} y={24} radius={230} color="#8a5050" active />;
    case 'emptyPlatform':
      return <FlickerLight x={30} y={35} radius={140} color="#6b7078" active />;
    case 'home':
      return (
        <FlickerLight
          x={28}
          y={30}
          radius={280}
          color="#d8b874"
          active={!(homeRevealed && !emergencyPulse)}
        />
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// The Last Stop — ending sequence
// ---------------------------------------------------------------------------

type LastStopPhase = 'intro1' | 'blackout' | 'intro2' | 'signReveal' | 'choice';

const INTRO_PART_1: DialogueLine[] = [
  { speaker: '', text: 'One by one, the remaining passengers rise and step off without a word.' },
  { speaker: '', text: 'The carriage empties around you until only the last bulb overhead is still burning.' },
  { speaker: '', text: 'At the far end of the car, the silent passenger finally stands.' },
  { speaker: '', text: 'They cross the aisle slowly, the way something moves when it has stopped needing to hurry.' },
  { speaker: '', text: '[They stand before you. Their face stays in shadow.]' },
  { speaker: '', text: 'Then, all at once, the lights go out.' },
];

const INTRO_PART_2_OPEN: DialogueLine[] = [
  { speaker: '', text: 'When the lights come back, the carriage is not the same.' },
  { speaker: '', text: 'A conductor is standing at the carriage door. You have never seen him before.' },
];

// Only plays if the player took the vending machine receipt at Kalyanpur (§6.4).
const INTRO_PART_2_RECEIPT: DialogueLine[] = [
  { speaker: '', text: 'His eyes drop to your pocket, to the curl of thermal paper you took at Kalyanpur.' },
  { speaker: 'CONDUCTOR', text: 'One more stop. You paid for it already.' },
];

const INTRO_PART_2_CLOSE: DialogueLine[] = [
  { speaker: '', text: 'He sets a clipboard and a worn ledger on the seat beside you, and waits.' },
  { speaker: 'CONDUCTOR', text: 'This is your stop.' },
];

function LastStopStation({ station }: { station: StationDef }) {
  const [phase, setPhase] = useState<LastStopPhase>('intro1');
  const discoveredClues = useGameStore((s) => s.discoveredClues);
  const requiredClueIds = useGameStore((s) => s.requiredClueIds);
  const tookReceipt = useGameStore((s) => !!s.flags.tookReceipt);

  // System 5: this run's breakLoop gate is its own 5-clue required subset
  // (drawn once in startNewGame() from station-level clues only, Invariant 5).
  // Legacy saves from before requiredClueIds existed have an empty list; fall
  // back to the original flat count threshold for those.
  const canBreakLoop =
    requiredClueIds.length > 0
      ? requiredClueIds.every((id) => discoveredClues.includes(id))
      : discoveredClues.length >= BREAK_LOOP_CLUE_THRESHOLD;

  const introPart2 = useMemo(
    () => [...INTRO_PART_2_OPEN, ...(tookReceipt ? INTRO_PART_2_RECEIPT : []), ...INTRO_PART_2_CLOSE],
    // Resolved once on arrival; the flag cannot change during this scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    setAmbience('dread');
  }, []);

  // The Last Stop's own station-level clues (passengerList, conductorsLedger)
  // are in the requiredClueIds pool, but this scripted scene has no inspect
  // hotspots, so awardStationClues() never ran for it. That made both clues
  // unreachable and let a run that drew either one lock out breakLoop. The
  // conductor now hands them over, unconditionally, before the choice appears.
  useEffect(() => {
    if (phase !== 'signReveal') return;
    const store = useGameStore.getState();
    station.clueIds.forEach((id) => store.awardClue(id));
  }, [phase, station]);

  useEffect(() => {
    if (phase !== 'signReveal') return;
    const timer = window.setTimeout(() => setPhase('choice'), 1800);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const finish = (ending: 'getOff' | 'stayOn' | 'breakLoop') => {
    useGameStore.getState().setEnding(ending);
  };

  return (
    <div className="station-scene station-scene--lastStop">
      <FogOverlay opacity={0.5} />
      <DustParticles density={0.18} />
      <FlickerLight x={50} y={28} radius={260} color="#8a8f9a" active={phase !== 'blackout'} />

      <div className={`laststop-blackout${phase === 'blackout' ? ' laststop-blackout--active' : ''}`} aria-hidden="true">
        <div className="laststop-blackout-flicker" />
      </div>

      {(phase === 'signReveal' || phase === 'choice') && (
        <div className="laststop-sign screen-fade-enter">
          <div className="laststop-sign-beam" aria-hidden="true" />
          <div className="laststop-sign-plate">
            <div className="laststop-sign-label">{station.signText}</div>
            <div className="laststop-time">2:17 AM</div>
          </div>
        </div>
      )}

      {phase === 'intro1' && (
        <DialogueBox
          lines={INTRO_PART_1}
          onComplete={() => {
            setPhase('blackout');
            window.setTimeout(() => setPhase('intro2'), 1500);
          }}
        />
      )}

      {phase === 'intro2' && (
        <DialogueBox lines={introPart2} onComplete={() => setPhase('signReveal')} />
      )}

      {phase === 'choice' && (
        <div className="laststop-choices screen-fade-enter">
          <button className="laststop-choice-button laststop-choice-button--getOff" onClick={() => finish('getOff')}>
            <span className="laststop-choice-label">Get off the train</span>
          </button>
          <button className="laststop-choice-button laststop-choice-button--stayOn" onClick={() => finish('stayOn')}>
            <span className="laststop-choice-label">Stay on the train</span>
          </button>
          {canBreakLoop && (
            <button
              className="laststop-choice-button laststop-choice-button--brake"
              onClick={() => finish('breakLoop')}
            >
              <span className="laststop-choice-brake-icon" aria-hidden="true" />
              <span className="laststop-choice-label">Pull the emergency brake</span>
            </button>
          )}
        </div>
      )}

      <div className="station-vignette" />
    </div>
  );
}
