// Pure, run-seed-only resolution of the handful of "decided once at
// startNewGame()" randomized facts about a playthrough. Nothing here reads
// or writes the store directly — see engine/store.ts for how these are
// invoked and persisted.

import { pick, pickN, rngFor } from './rng';

// Invariant 1 (STORY_REFINEMENT_GUIDE.md §5): the vanish pool is exactly
// these two ids. Old Man, Woman, and Silent Passenger are permanently
// excluded — do not expand this without a full content pass.
const VANISH_CANDIDATES = ['businessman', 'student'] as const;

// Invariant 5: requiredClueIds draws ONLY from these 10 station-level clue
// ids — the ones unconditionally auto-awarded by awardStationClues() to any
// player who inspects one object at that station. Passenger-awarded clues
// (oldTicketStub, businessmanWatch, staticRecording) and any choice-gated
// clue (sharedGrief, the Sector 0 bonus clue) must NEVER be added here.
// vendingMachineReceipt is intentionally excluded: per §6.4 it is pulled out
// of Kalyanpur's blanket clueIds and awarded only via player choice, so it
// must stay outside the required-subset pool (Invariant 5/6).
const STATION_CLUE_IDS = [
  'incompleteStationMap',
  'newspaperClipping',
  'tornRailwayMap',
  'billboard',
  'timetable',
  'platformFigureSketch',
  'oldPhotograph',
  'passengerList',
  'conductorsLedger',
] as const;

const REQUIRED_CLUE_SUBSET_SIZE = 5;

/** Resolved once in startNewGame(). Never Old Man, Woman, or Silent Passenger. */
export function pickVanishCandidate(runSeed: number): string {
  return pick(rngFor(runSeed, 'vanish'), VANISH_CANDIDATES);
}

/** Resolved once in startNewGame(). Exactly 5 of the 10 station-level clue ids. */
export function pickRequiredClueSubset(runSeed: number): string[] {
  return pickN(rngFor(runSeed, 'breakLoopSet'), STATION_CLUE_IDS, REQUIRED_CLUE_SUBSET_SIZE);
}
