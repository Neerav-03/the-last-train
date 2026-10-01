// "Test the floor, not the average" (STORY_REFINEMENT_GUIDE.md §0 rule 3).
//
// Simulates the minimum critical-path playthrough — board, visit every
// station, inspect exactly ONE object at each (the first one visible on
// arrival), take no dialogue choices, talk to nobody — and asserts that for
// every seed the run's requiredClueIds is a subset of what that playthrough
// collects, i.e. breakLoop is always reachable.
//
// The station clue-award rules are modelled on Station.tsx (not exported):
//  - GenericStation.handleInspect -> awardStationClues(): first inspect of
//    ANY object awards every id in station.clueIds (once, via a
//    station.<key>.cluesAwarded flag).
//  - LastStopStation: no hotspots; station.clueIds are handed over
//    unconditionally at the 'signReveal' phase, before the ending choice.
// A source-contract test at the bottom pins those two call sites so the model
// can't silently drift from the scene code. See report: moving the award
// logic into a pure engine module would let this test call it directly.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STATIONS } from '../../src/data/stations';
import { useGameStore } from '../../src/engine/store';
import type { StationDef } from '../../src/engine/types';
import { REQUIRED_CLUE_COUNT, stationClueUnion } from '../helpers/invariants';
import { MAX_SEED, seedCorpus } from '../helpers/seeds';
import { readSource, stripComments } from '../helpers/source';

const initialState = useGameStore.getState();

/** Mirror of Station.tsx awardStationClues(). */
function awardStationClues(station: StationDef): void {
  const store = useGameStore.getState();
  const visitedFlag = `station.${station.key}.cluesAwarded`;
  if (store.hasFlag(visitedFlag)) return;
  store.setFlag(visitedFlag, true);
  station.clueIds.forEach((id) => store.awardClue(id));
}

/** First object a player can see on arrival (sector0.followFootsteps is idle-timer gated). */
function firstVisibleObject(station: StationDef) {
  return station.objects.find((o) => !(station.key === 'sector0' && o.id === 'followFootsteps'));
}

/** Critical-path, no-choices playthrough. Returns the clues collected. */
function playCriticalPath(): string[] {
  const store = useGameStore.getState();
  store.boardTrain();
  for (const station of STATIONS) {
    useGameStore.getState().arriveAtStation();
    const current = STATIONS[useGameStore.getState().currentStationIndex];
    expect(current.key).toBe(station.key);

    if (station.key === 'lastStop') {
      // Scripted scene: clues handed over at signReveal, before the choice.
      station.clueIds.forEach((id) => useGameStore.getState().awardClue(id));
      break;
    }
    const obj = firstVisibleObject(station);
    if (!obj) throw new Error(`${station.key}: no object visible on arrival — station clues unreachable`);
    useGameStore.getState().interact(`${station.key}.${obj.id}`);
    awardStationClues(station);
    useGameStore.getState().departStation();
  }
  return [...useGameStore.getState().discoveredClues];
}

beforeEach(() => {
  vi.restoreAllMocks();
  useGameStore.setState(initialState, true);
  localStorage.clear();
});

describe('breakLoop reachability floor', () => {
  it('a critical-path playthrough collects every station-level clue', () => {
    useGameStore.getState().startNewGame();
    const collected = new Set(playCriticalPath());
    for (const id of stationClueUnion()) expect(collected.has(id), id).toBe(true);
  });

  it('guaranteed clue count clears the breakLoop requirement (and legacy flat threshold of 5)', () => {
    expect(stationClueUnion().size).toBeGreaterThanOrEqual(REQUIRED_CLUE_COUNT);
  });

  it('for every seed, requiredClueIds is a subset of the no-choices critical-path haul', () => {
    const seeds = seedCorpus(3000);
    const failures: string[] = [];
    for (const seed of seeds) {
      useGameStore.setState(initialState, true);
      // startNewGame() draws runSeed = floor(Math.random() * 2**31); drive it to `seed`.
      vi.spyOn(Math, 'random').mockReturnValueOnce((seed + 0.5) / 2 ** 31);
      useGameStore.getState().startNewGame();
      const { runSeed, requiredClueIds } = useGameStore.getState();
      expect(runSeed).toBe(seed);

      const collected = new Set(playCriticalPath());
      const missing = requiredClueIds.filter((id) => !collected.has(id));
      if (requiredClueIds.length !== REQUIRED_CLUE_COUNT || missing.length > 0) {
        failures.push(`seed=${seed} required=${JSON.stringify(requiredClueIds)} missing=${JSON.stringify(missing)}`);
      }
      // Same gate the Last Stop uses (Station.tsx canBreakLoop).
      expect(requiredClueIds.every((id) => collected.has(id))).toBe(true);
    }
    expect(failures.slice(0, 10)).toEqual([]);
    expect(seeds).toContain(MAX_SEED);
  });
});

describe('Station.tsx source contract for the model above', () => {
  const text = stripComments(readSource('scenes/Station.tsx'));

  it('awards station.clueIds in both the generic inspect path and the Last Stop hand-over', () => {
    const awardSites = text.match(/station\.clueIds\.forEach\(\s*\(?\s*\w+\s*\)?\s*=>\s*store\.awardClue\(/g) ?? [];
    expect(awardSites.length).toBeGreaterThanOrEqual(2);
  });

  it('handleInspect calls awardStationClues() unconditionally before any per-object branching', () => {
    const inspect = text.match(/const handleInspect = \([\s\S]*?\n {2}};/);
    expect(inspect, 'handleInspect not found in Station.tsx').not.toBeNull();
    const body = inspect![0];
    const awardAt = body.indexOf('awardStationClues()');
    expect(awardAt, 'handleInspect no longer calls awardStationClues()').toBeGreaterThan(-1);
    // Must precede the first `if (` so no branch can skip it.
    const firstIf = body.indexOf('if (', body.indexOf('interact('));
    expect(awardAt).toBeLessThan(firstIf);
  });
});
