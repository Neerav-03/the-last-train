import { Fragment, useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../engine/store';
import { PASSENGERS } from '../data/passengers';
import type { DialogueChoice, DialogueStage, PassengerDef, Vector2 } from '../engine/types';
import DialogueBox from '../components/DialogueBox';
import InteractionPrompt from '../components/InteractionPrompt';
import FlickerLight from '../effects/FlickerLight';
import DustParticles from '../effects/DustParticles';
import RedEmergencyOverlay from '../effects/RedEmergencyOverlay';
import { playDoorSound, setAmbience } from '../audio/AudioEngine';
import { rngFor } from '../engine/rng';
import './TrainInterior.css';

const TOTAL_STATIONS = 7; // indices 0..6
const CHILD_GONE_FLAG = 'childGone';

interface OverheadLight {
  id: string;
  x: number;
  y: number;
}

const OVERHEAD_LIGHTS: OverheadLight[] = [
  { id: 'light-a', x: 10, y: 9 },
  { id: 'light-b', x: 29, y: 8 },
  { id: 'light-c', x: 48, y: 9 },
  { id: 'light-d', x: 67, y: 8 },
  { id: 'light-e', x: 85, y: 9 },
];

interface ActiveDialogue {
  passengerId: string;
  stage: DialogueStage;
}

// ---- deterministic per-trip "seeded" helpers ---------------------------
// The carriage should subtly change from trip to trip without being truly
// random each render, so every "variation" below is a pure function of
// runSeed + tripNumber (via rngFor, see engine/rng.ts) rather than
// Math.random(). Re-seeding onto runSeed (instead of tripNumber alone) means
// this micro-drift is still trip-progressive and stable within a run, but
// now also varies across playthroughs (STORY_REFINEMENT_GUIDE.md §3/§4 System 6).

function resolveStage(
  passenger: PassengerDef,
  priorInteractions: number,
  tripNumber: number,
  hasFlag: (flag: string) => boolean
): DialogueStage {
  const stages = passenger.dialogueStages ?? [];
  let resolved: DialogueStage | undefined;
  for (const stage of stages) {
    const meetsInteractions = stage.minInteractions <= priorInteractions;
    const meetsTrip = stage.minTrip === undefined || tripNumber >= stage.minTrip;
    const meetsRequiredFlag = !stage.requiresFlag || hasFlag(stage.requiresFlag);
    const passesBlockFlag = !stage.blockedByFlag || !hasFlag(stage.blockedByFlag);
    if (meetsInteractions && meetsTrip && meetsRequiredFlag && passesBlockFlag) {
      // last matching stage (by array order) wins
      resolved = stage;
    }
  }
  if (resolved) return resolved;
  const fallback = stages.find(
    (s) => s.minInteractions === 0 && s.minTrip === undefined && !s.requiresFlag && !s.blockedByFlag
  );
  if (fallback) return fallback;
  return { minInteractions: 0, lines: [{ speaker: passenger.shortLabel, text: '...' }] };
}

// ---- purely-visual passenger differentiation ----------------------------
// Silhouettes stay abstract/uncanny (this is the horror hub), but each
// passenger id gets a distinct posture plus a couple of decorative stroke
// marks so five bodies don't all read as one copy-pasted blob. This is
// keyed off the existing `id` field only — no new story data, no change to
// dialogue/interaction logic.

function passengerPostureClass(id: string): string {
  switch (id) {
    case 'oldMan':
      return 'posture-hunched';
    case 'businessman':
      return 'posture-rigid';
    case 'womanWithChild':
      return 'posture-holding';
    case 'student':
      return 'posture-slouch';
    case 'silentPassenger':
      return 'posture-still';
    default:
      return '';
  }
}

function PassengerDetail({ id }: { id: string }) {
  switch (id) {
    case 'oldMan':
      // a cane, held close to the body
      return <path className="passenger-detail" d="M29 38 L32 59 M29 38 L26 41" />;
    case 'businessman':
      // arms crossed over the chest
      return <path className="passenger-detail" d="M11 35 L27 45 M27 35 L11 45" />;
    case 'womanWithChild':
      // arms curved forward, cradling
      return <path className="passenger-detail" d="M9 45 C14 38 26 38 31 45" />;
    case 'student':
      // one arm bent up toward the ear (headphones)
      return <path className="passenger-detail" d="M29 22 C34 24 34 30 30 32" />;
    case 'silentPassenger':
      // hands folded, motionless, in the lap
      return <rect className="passenger-detail" x="16" y="50" width="8" height="4" rx="1.2" />;
    default:
      return null;
  }
}

export default function TrainInterior() {
  const tripNumber = useGameStore((s) => s.tripNumber);
  const currentStationIndex = useGameStore((s) => s.currentStationIndex);
  const flags = useGameStore((s) => s.flags);
  const runSeed = useGameStore((s) => s.runSeed);
  const vanishingPassengerId = useGameStore((s) => s.vanishingPassengerId);

  const [activeDialogue, setActiveDialogue] = useState<ActiveDialogue | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [emergencyFlash, setEmergencyFlash] = useState(false);

  // §6.6 — has the player already acknowledged the vanished passenger's
  // empty seat this (or a prior) session? Reading the persisted flag (rather
  // than local-only state) means the one-time prompt stays one-time across
  // reloads too.
  const vanishAcknowledged = !!flags['acknowledgedVanishing'];

  const canReboard = currentStationIndex < TOTAL_STATIONS - 1;
  const carriageExtended = tripNumber >= 5;

  useEffect(() => {
    setAmbience('trainStopped');
  }, []);

  // Rare, gated unsettling beat — never on every trip, and only once things
  // have already started to feel wrong.
  useEffect(() => {
    if (tripNumber < 5) return;
    const shouldFlash = rngFor(runSeed, 'emergency:' + tripNumber)() > 0.6;
    if (!shouldFlash) return;
    setAmbience('dread');
    setEmergencyFlash(true);
    const offTimer = window.setTimeout(() => setEmergencyFlash(false), 240);
    const settleTimer = window.setTimeout(() => setAmbience('trainStopped'), 900);
    return () => {
      window.clearTimeout(offTimer);
      window.clearTimeout(settleTimer);
    };
  }, [tripNumber, runSeed]);

  const handleTalk = (passenger: PassengerDef) => {
    if (activeDialogue) return;
    const store = useGameStore.getState();
    if (passenger.id === store.vanishingPassengerId && store.tripNumber >= 2) return;
    const count = store.interact(passenger.id);
    const stage = resolveStage(passenger, count - 1, store.tripNumber, store.hasFlag);
    setActiveDialogue({ passengerId: passenger.id, stage });
  };

  const handleDoorInteract = () => {
    if (activeDialogue) return;
    const store = useGameStore.getState();
    if (store.currentStationIndex >= TOTAL_STATIONS - 1) return;
    playDoorSound();
    store.arriveAtStation();
  };

  // §6.6 — the vanished passenger's now-empty seat. Purely optional and
  // never gates reboarding/progression (Invariant 8): it's an extra
  // DialogueBox prompt on an already-inert element, guarded so it only ever
  // fires once per save (see vanishAcknowledged above).
  const handleVanishSeatInteract = () => {
    if (activeDialogue) return;
    const store = useGameStore.getState();
    if (store.hasFlag('acknowledgedVanishing')) return;
    setActiveDialogue({
      passengerId: '__vanishAck',
      stage: {
        minInteractions: 0,
        lines: [
          {
            speaker: '',
            text: 'The seat across the aisle is still empty. It has been for a while now. Something about it makes you not want to look away.',
          },
        ],
        choices: [
          { text: 'Look away', setFlags: ['acknowledgedVanishing', 'vanishLookedAway'] },
          { text: 'Hold their gaze', setFlags: ['acknowledgedVanishing', 'vanishHeldGaze'] },
        ],
      },
    });
  };

  const handleDialogueComplete = () => {
    if (!activeDialogue) return;
    const store = useGameStore.getState();
    activeDialogue.stage.setFlags?.forEach((f) => store.setFlag(f, true));
    activeDialogue.stage.awardsClues?.forEach((c) => store.awardClue(c));
    setActiveDialogue(null);
  };

  // Applies both the stage's own base reward AND the chosen option's reward
  // (choices are additive on top of stage completion, never a replacement —
  // see STORY_REFINEMENT_GUIDE.md §6 / DialogueBox.tsx call-pattern note).
  const handleChoice = (choice: DialogueChoice) => {
    if (!activeDialogue) return;
    const store = useGameStore.getState();
    activeDialogue.stage.setFlags?.forEach((f) => store.setFlag(f, true));
    activeDialogue.stage.awardsClues?.forEach((c) => store.awardClue(c));
    choice.setFlags?.forEach((f) => store.setFlag(f, true));
    choice.awardsClues?.forEach((c) => store.awardClue(c));
    setActiveDialogue(null);
  };

  // E-to-interact for whatever the player is currently hovering (this scene
  // is a static hub — no walking sprite — so "proximity" is just hover).
  useEffect(() => {
    if (activeDialogue || !hoveredId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return;
      e.preventDefault();
      if (hoveredId === 'door') {
        handleDoorInteract();
        return;
      }
      if (hoveredId === 'vanishSeat') {
        handleVanishSeatInteract();
        return;
      }
      const passenger = PASSENGERS.find((p) => p.id === hoveredId);
      if (passenger) handleTalk(passenger);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredId, activeDialogue, tripNumber, currentStationIndex]);

  // -- which overhead lights have died this trip (progressive, seeded) ----
  const deadLightIds = useMemo(() => {
    const numDead = Math.min(2, Math.floor(tripNumber / 3));
    if (numDead <= 0) return new Set<string>();
    const scored = OVERHEAD_LIGHTS.map((l) => ({
      id: l.id,
      score: rngFor(runSeed, `lights:${tripNumber}:${l.id}`)(),
    })).sort((a, b) => b.score - a.score);
    return new Set(scored.slice(0, numDead).map((s) => s.id));
  }, [tripNumber, runSeed]);

  // -- the route map slowly stops matching reality -------------------------
  const routeMap = useMemo(() => {
    const anomalous = tripNumber >= 3;
    const rng = rngFor(runSeed, `routeMap:${tripNumber}`);
    const addExtraDot = anomalous && rng() > 0.5;
    const dotCount = TOTAL_STATIONS + (addExtraDot ? 1 : 0);
    const misalignedIndex = anomalous && !addExtraDot ? Math.floor(rng() * TOTAL_STATIONS) : -1;
    return { dotCount, misalignedIndex };
  }, [tripNumber, runSeed]);

  // -- seats drift a couple of percentage points on later trips ------------
  const seatPosition = (passenger: PassengerDef): Vector2 => {
    if (tripNumber < 4) return passenger.seat;
    const rng = rngFor(runSeed, `seat:${passenger.id}:${tripNumber}`);
    const dx = (rng() - 0.5) * 4;
    const dy = (rng() - 0.5) * 2.4;
    return {
      x: Math.min(96, Math.max(4, passenger.seat.x + dx)),
      y: Math.min(92, Math.max(30, passenger.seat.y + dy)),
    };
  };

  const seatShadeShift = Math.max(0, Math.min(tripNumber, 6)) * 0.02;
  const doorX = carriageExtended ? 97 : 91;
  const doorY = 55;

  return (
    <div className="train-interior screen-fade-enter">
      <DustParticles density={0.18} />
      <RedEmergencyOverlay active={emergencyFlash} />

      <div className={`carriage ${carriageExtended ? 'carriage--extended' : ''}`}>
        <div className="carriage-ceiling" />
        <div className="carriage-window-strip">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`window-${i}`} className="carriage-window">
              <div className="carriage-window-glass" />
            </div>
          ))}
        </div>

        <div className="carriage-luggage-rack carriage-luggage-rack--left" />
        <div className="carriage-luggage-rack carriage-luggage-rack--right" />

        <div
          className="carriage-seat-rows"
          style={{ filter: `brightness(${1 - seatShadeShift}) saturate(${1 - seatShadeShift})` }}
          aria-hidden="true"
        >
          {Array.from({ length: 5 }).map((_, row) => {
            const depth = 0.94 + row * 0.015;
            return (
              <div
                className="seat-row"
                key={`row-${row}`}
                style={{ transform: `scaleX(${depth})` }}
              >
                <div className="deco-seat" />
                <div className="deco-seat" />
                <div className="carriage-aisle-gap" />
                <div className="deco-seat" />
                <div className="deco-seat" />
              </div>
            );
          })}
        </div>

        <div className="carriage-floor" />

        <div className="route-map">
          <div className="route-map-label">LINE&nbsp;MAP</div>
          <div className="route-map-track">
            {Array.from({ length: routeMap.dotCount }).map((_, i) => (
              <span
                key={`stop-${i}`}
                className={[
                  'route-map-dot',
                  i <= currentStationIndex ? 'route-map-dot--visited' : '',
                  i === routeMap.misalignedIndex ? 'route-map-dot--off' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </div>
        </div>

        {OVERHEAD_LIGHTS.map((light) => {
          const dead = deadLightIds.has(light.id);
          return (
            <div
              key={`fixture-${light.id}`}
              className={`light-fixture ${dead ? 'light-fixture--dead' : ''}`}
              style={{ left: `${light.x}%`, top: `${light.y}%` }}
            />
          );
        })}

        {OVERHEAD_LIGHTS.map((light) => {
          const dead = deadLightIds.has(light.id);
          const warm = light.id === 'light-e';
          return (
            <div
              key={`pool-${light.id}`}
              className={`light-pool ${dead ? 'light-pool--dead' : ''} ${warm ? 'light-pool--warm' : ''}`}
              style={{ left: `${light.x}%` }}
            />
          );
        })}

        {OVERHEAD_LIGHTS.map((light) => {
          const dead = deadLightIds.has(light.id);
          return (
            <FlickerLight
              key={light.id}
              x={light.x}
              y={light.y}
              radius={170}
              color={dead ? '#2a2d35' : light.id === 'light-e' ? '#d8b874' : '#bcd3e8'}
              active={!dead}
            />
          );
        })}

        {carriageExtended && <div className="carriage-void-stretch" />}

        {PASSENGERS.map((passenger) => {
          // System 1 (Invariant 1) — vanish pool is exactly
          // {businessman, student}, resolved once per run on the store.
          const disappeared = passenger.id === vanishingPassengerId && tripNumber >= 2;
          const pos = disappeared ? passenger.seat : seatPosition(passenger);
          const isWomanWithChild = passenger.id === 'womanWithChild';
          const childVisible = isWomanWithChild && !flags[CHILD_GONE_FLAG];

          return (
            <Fragment key={passenger.id}>
              {disappeared ? (
                <>
                  <div
                    className="empty-seat empty-seat--disturbed"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    onMouseEnter={() => !vanishAcknowledged && setHoveredId('vanishSeat')}
                    onMouseLeave={() => setHoveredId((h) => (h === 'vanishSeat' ? null : h))}
                    onClick={handleVanishSeatInteract}
                  >
                    <div className="empty-seat-cushion" />
                    <div className="empty-seat-trace" />
                  </div>
                  {!activeDialogue && !vanishAcknowledged && (
                    <InteractionPrompt label="Look" x={pos.x} y={pos.y} />
                  )}
                </>
              ) : (
                <>
                  <div
                    className="passenger-slot"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    onMouseEnter={() => setHoveredId(passenger.id)}
                    onMouseLeave={() => setHoveredId((h) => (h === passenger.id ? null : h))}
                    onClick={() => handleTalk(passenger)}
                  >
                    <svg className="passenger-figure" viewBox="0 0 40 60" aria-hidden="true">
                      <g className={passengerPostureClass(passenger.id)}>
                        <ellipse cx="20" cy="12" rx="8" ry="9" />
                        <path d="M6 58 C6 36 12 26 20 26 C28 26 34 36 34 58 Z" />
                        <PassengerDetail id={passenger.id} />
                      </g>
                    </svg>
                    {isWomanWithChild && childVisible && (
                      <svg className="child-figure" viewBox="0 0 20 24" aria-hidden="true">
                        <ellipse cx="10" cy="6.5" rx="5" ry="5.5" />
                        <path d="M4 24 C4 16.5 6.5 13.5 10 13.5 C13.5 13.5 16 16.5 16 24 Z" />
                      </svg>
                    )}
                    <div className="passenger-label">{passenger.shortLabel}</div>
                  </div>
                  {!activeDialogue && (
                    <InteractionPrompt label="Talk" x={pos.x} y={pos.y} />
                  )}
                </>
              )}
            </Fragment>
          );
        })}

        <div
          className={`carriage-door ${canReboard ? '' : 'carriage-door--sealed'}`}
          style={{ left: `${doorX}%`, top: `${doorY}%` }}
          onMouseEnter={() => canReboard && setHoveredId('door')}
          onMouseLeave={() => setHoveredId((h) => (h === 'door' ? null : h))}
          onClick={handleDoorInteract}
        >
          <div className="carriage-door-frame" />
          <div className="carriage-door-window" />
        </div>
        {canReboard && !activeDialogue && (
          <InteractionPrompt label="Open Door" x={doorX} y={doorY} />
        )}
      </div>

      {activeDialogue && (
        <div className="dialogue-mount" key={activeDialogue.passengerId}>
          <DialogueBox
            lines={activeDialogue.stage.lines}
            choices={activeDialogue.stage.choices}
            onChoice={handleChoice}
            onComplete={handleDialogueComplete}
          />
        </div>
      )}
    </div>
  );
}
