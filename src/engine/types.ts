// Core shared types for THE LAST TRAIN.
// Content-data modules (passengers.ts, stations.ts, clues.ts) must conform to these exactly.

export type SceneId =
  | 'title'
  | 'platform'
  | 'trainArrival'
  | 'train'
  | 'station'
  | 'ending';

export type StationKey =
  | 'kalyanpur'
  | 'madhavNagar'
  | 'sector0'
  | 'unlisted'
  | 'emptyPlatform'
  | 'home'
  | 'lastStop';

export type EndingKey = 'getOff' | 'stayOn' | 'breakLoop';

export interface Vector2 {
  x: number;
  y: number;
}

// ---------- Clues ----------

export interface ClueDef {
  id: string;
  title: string;
  /** Flavor text shown when reading the clue in the journal. */
  description: string;
}

// ---------- Dialogue ----------

export interface DialogueLine {
  speaker: string;
  text: string;
}

/** A single dialogue-ending player choice (see STORY_REFINEMENT_GUIDE.md §6). */
export interface DialogueChoice {
  text: string;
  setFlags?: string[];
  /** Bonus/optional clues only — see Invariant 6. A clue eligible for requiredClueIds must NEVER be conditional on a choice. */
  awardsClues?: string[];
}

/** One "stage" of a passenger's dialogue, unlocked progressively. */
export interface DialogueStage {
  /** Minimum number of times the player has interacted with this passenger to see this stage (0-indexed threshold). */
  minInteractions: number;
  /** Optional: only available from this trip number onward (1-indexed, matches store.tripNumber). */
  minTrip?: number;
  /** Optional flag id required in store.flags before this stage can trigger. */
  requiresFlag?: string;
  /** Optional flag id that must NOT be set for this stage to trigger. */
  blockedByFlag?: string;
  lines: DialogueLine[];
  /** Flags to set once this stage's dialogue has fully played. */
  setFlags?: string[];
  /** Clue ids to award once this stage's dialogue has fully played. */
  awardsClues?: string[];
  /** If present, DialogueBox pauses on the final line and renders these as buttons instead of auto-advancing. */
  choices?: DialogueChoice[];
}

export interface PassengerDef {
  id: string;
  name: string;
  shortLabel: string; // e.g. "OLD MAN"
  seat: Vector2; // percentage-based position within the carriage viewport (0-100)
  dialogueStages: DialogueStage[];
  /**
   * @deprecated Vanish state is now resolved per-run on the store
   * (`vanishingPassengerId`, chosen from the fixed {businessman, student}
   * pool — see runSetup.ts / STORY_REFINEMENT_GUIDE.md Invariant 1) rather
   * than read off static passenger data. Left optional on the type only for
   * any leftover/legacy reference; new code should not set or read this.
   */
  disappearsAtTrip?: number;
  /** @deprecated see disappearsAtTrip — the disturbed-seat trace now always applies to whichever passenger is this run's vanishingPassengerId. */
  leavesTraceWhenGone?: boolean;
}

// ---------- Stations ----------

// order 1-2: mild · order 3-4: moderate · order 5-7: severe
// (STORY_REFINEMENT_GUIDE.md §4 System 2 / Invariant 2)
export type SeverityBand = 'mild' | 'moderate' | 'severe';

export interface StationDef {
  key: StationKey;
  order: number; // 1-7
  displayName: string;
  /** Short line shown on the station sign. */
  signText: string;
  /** Narrative flavor / ambience description used by the Station scene renderer. */
  ambience: string;
  /** Interactive inspectable objects unique to this station. */
  objects: StationObjectDef[];
  /** Announcement lines that may play while here. */
  announcements: string[];
  /** Clue ids that can be discovered at this station. */
  clueIds: string[];
  /** Whether the train is visibly missing / vanishes at this station (Station 5). */
  trainVanishes?: boolean;
  /** Escalation tier for this station; anomalyPool entries must match this band (Invariant 2). */
  severityBand: SeverityBand;
  /**
   * Pool of mutually-exclusive cosmetic/atmosphere variants; at most one is
   * spliced in per run, chosen via rngFor(runSeed, 'anomaly:'+key) on first
   * arrival. Must never carry clueIds (Invariant 4) and must match this
   * station's severityBand (Invariant 2).
   */
  anomalyPool?: StationObjectDef[];
}

/**
 * A single entry in a StationObjectDef.inspectText array.
 * - `string`  — a fixed reveal step, unchanged from the original behavior.
 * - `string[]` — a run-varied reveal step: when an object opts into leaf
 *   flavor-text variance (System 3), its whole `inspectText` becomes
 *   `string[][]` (each entry here is itself the full progressive-reveal
 *   array for one variant). The variant is chosen once via
 *   rngFor(runSeed, 'flavor:'+id) and locked into flags on first inspect;
 *   progressive reveal within the chosen variant works exactly as before.
 */
export type InspectTextEntry = string | string[];

export interface StationObjectDef {
  id: string;
  label: string;
  /** Position within the station viewport, percentage based. */
  position: Vector2;
  /** Lines of text revealed when inspected, first-time only (progressive resolves via interaction count if array length > 1). See InspectTextEntry for the optional variant-pool shape. */
  inspectText: InspectTextEntry[];
}

// ---------- Endings ----------

export interface EndingDef {
  key: EndingKey;
  title: string;
  lines: string[];
}

// ---------- Settings ----------

export interface GameSettings {
  masterVolume: number; // 0-1
  musicVolume: number; // 0-1
  sfxVolume: number; // 0-1
  reduceFlashing: boolean;
  screenShake: boolean;
}

// ---------- Save-able game state shape (see engine/store.ts for the full store) ----------

export interface PersistedState {
  scene: SceneId;
  tripNumber: number;
  currentStationIndex: number; // index into stations.ts order, -1 before boarding
  interactionCounts: Record<string, number>; // passengerId|objectId -> count
  flags: Record<string, boolean>;
  discoveredClues: string[];
  settings: GameSettings;
  hasSaveData: boolean;
  runSeed: number; // set once per playthrough in startNewGame()
  vanishingPassengerId: string; // 'businessman' | 'student', resolved once in startNewGame()
  requiredClueIds: string[]; // this run's breakLoop-required subset, resolved once in startNewGame()
}
