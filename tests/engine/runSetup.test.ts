import { describe, expect, it } from 'vitest';
import { pickRequiredClueSubset, pickVanishCandidate } from '../../src/engine/runSetup';
import { CLUES } from '../../src/data/clues';
import { PASSENGERS } from '../../src/data/passengers';
import { seedCorpus } from '../helpers/seeds';
import {
  NEVER_REQUIRED,
  NEVER_VANISH,
  REQUIRED_CLUE_COUNT,
  VANISH_POOL,
  empiricalRequiredPool,
  stationClueUnion,
} from '../helpers/invariants';

const SEEDS = seedCorpus(10_000);
const CLUE_IDS = new Set(CLUES.map((c) => c.id));

describe('pickVanishCandidate (Invariant 1)', () => {
  it(`always returns 'businessman' or 'student' over ${SEEDS.length} seeds`, () => {
    for (const seed of SEEDS) {
      const id = pickVanishCandidate(seed);
      if (!(VANISH_POOL as readonly string[]).includes(id)) {
        expect.fail(`seed=${seed}: pickVanishCandidate returned '${id}', outside {businessman, student}`);
      }
    }
  });

  it('never returns an excluded passenger', () => {
    const seen = new Set(SEEDS.map(pickVanishCandidate));
    for (const id of NEVER_VANISH) expect(seen.has(id)).toBe(false);
  });

  it('both candidates exist as passengers', () => {
    const passengerIds = new Set(PASSENGERS.map((p) => p.id));
    for (const id of VANISH_POOL) expect(passengerIds.has(id)).toBe(true);
    for (const id of NEVER_VANISH) expect(passengerIds.has(id)).toBe(true);
  });

  it('both candidates appear with a reasonable (roughly 50/50) distribution', () => {
    const counts: Record<string, number> = { businessman: 0, student: 0 };
    for (const seed of SEEDS) counts[pickVanishCandidate(seed)]++;
    const share = counts.businessman / SEEDS.length;
    expect(share, JSON.stringify(counts)).toBeGreaterThan(0.45);
    expect(share, JSON.stringify(counts)).toBeLessThan(0.55);
  });

  it('is deterministic per seed', () => {
    for (const seed of SEEDS.slice(0, 500)) expect(pickVanishCandidate(seed)).toBe(pickVanishCandidate(seed));
  });
});

describe('pickRequiredClueSubset (Invariants 5/6)', () => {
  const stationPool = stationClueUnion();

  it(`returns exactly ${REQUIRED_CLUE_COUNT} unique, valid, station-level ids for every seed`, () => {
    for (const seed of SEEDS) {
      const subset = pickRequiredClueSubset(seed);
      const ctx = `seed=${seed} subset=${JSON.stringify(subset)}`;
      if (subset.length !== REQUIRED_CLUE_COUNT) expect.fail(`${ctx}: length ${subset.length} !== ${REQUIRED_CLUE_COUNT}`);
      if (new Set(subset).size !== subset.length) expect.fail(`${ctx}: duplicate ids`);
      for (const id of subset) {
        if (!CLUE_IDS.has(id)) expect.fail(`${ctx}: '${id}' is not defined in CLUES`);
        if (!stationPool.has(id)) expect.fail(`${ctx}: '${id}' is not in any station's clueIds (not a station-level clue)`);
        if ((NEVER_REQUIRED as readonly string[]).includes(id)) {
          expect.fail(`${ctx}: '${id}' is passenger/choice-gated and must never be required`);
        }
      }
    }
  });

  it('never draws an excluded clue', () => {
    const pool = empiricalRequiredPool();
    for (const id of NEVER_REQUIRED) expect(pool.has(id), id).toBe(false);
  });

  it('is deterministic per seed', () => {
    for (const seed of SEEDS.slice(0, 500)) {
      expect(pickRequiredClueSubset(seed)).toEqual(pickRequiredClueSubset(seed));
    }
  });

  it('actually varies across runs and every pool id can be required', () => {
    const distinct = new Set(SEEDS.map((s) => [...pickRequiredClueSubset(s)].sort().join(',')));
    // 9 choose 5 = 126 combinations; a working shuffle hits nearly all of them.
    expect(distinct.size).toBeGreaterThan(100);

    const pool = empiricalRequiredPool();
    const counts = new Map<string, number>();
    for (const seed of SEEDS) for (const id of pickRequiredClueSubset(seed)) counts.set(id, (counts.get(id) ?? 0) + 1);
    const expectedShare = REQUIRED_CLUE_COUNT / pool.size;
    for (const id of pool) {
      const share = (counts.get(id) ?? 0) / SEEDS.length;
      expect(share, `${id} share`).toBeGreaterThan(expectedShare - 0.08);
      expect(share, `${id} share`).toBeLessThan(expectedShare + 0.08);
    }
  });

  it('draws from a pool large enough to satisfy the subset size', () => {
    expect(empiricalRequiredPool().size).toBeGreaterThanOrEqual(REQUIRED_CLUE_COUNT);
  });
});
