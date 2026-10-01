// Shared constants/derivations for STORY_REFINEMENT_GUIDE.md §5 invariants.
import { STATIONS } from '../../src/data/stations';
import { pickRequiredClueSubset } from '../../src/engine/runSetup';
import { seedCorpus } from './seeds';

/** Invariant 1: the vanish pool is exactly these two passenger ids. */
export const VANISH_POOL = ['businessman', 'student'] as const;

/** Passengers permanently excluded from vanishing (Invariant 1). */
export const NEVER_VANISH = ['oldMan', 'womanWithChild', 'silentPassenger'] as const;

/** Guide §4 System 5: requiredClueIds is exactly this many ids. */
export const REQUIRED_CLUE_COUNT = 5;

/**
 * Invariants 5/6: never eligible for requiredClueIds. Passenger-awarded
 * (oldTicketStub, businessmanWatch, staticRecording) and choice/bonus-gated
 * (vendingMachineReceipt §6.4, sharedGrief §6.2, unseenCompanion §6.3).
 */
export const NEVER_REQUIRED = [
  'vendingMachineReceipt',
  'sharedGrief',
  'unseenCompanion',
  'oldTicketStub',
  'businessmanWatch',
  'staticRecording',
] as const;

/** Invariant 2: order 1-2 mild, 3-4 moderate, 5-7 severe. */
export function expectedBand(order: number): 'mild' | 'moderate' | 'severe' {
  if (order <= 2) return 'mild';
  if (order <= 4) return 'moderate';
  return 'severe';
}

/** Union of every station's clueIds (the clues awardStationClues auto-awards). */
export function stationClueUnion(): Set<string> {
  return new Set(STATIONS.flatMap((s) => s.clueIds));
}

let cachedPool: Set<string> | null = null;

/**
 * runSetup.ts's STATION_CLUE_IDS is module-private, so recover it
 * empirically: the union of pickRequiredClueSubset over a large seed corpus.
 * With 5-of-9 draws each id appears with p≈0.56 per seed, so 5,000 seeds
 * recover the whole pool with overwhelming probability (and the corpus is
 * deterministic, so this is not flaky). Replace with a direct import once
 * STATION_CLUE_IDS is exported (see report).
 */
export function empiricalRequiredPool(): Set<string> {
  if (!cachedPool) {
    cachedPool = new Set(seedCorpus(5000).flatMap((s) => pickRequiredClueSubset(s)));
  }
  return cachedPool;
}
