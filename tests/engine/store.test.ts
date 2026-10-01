import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hasExistingSave, useGameStore } from '../../src/engine/store';
import { pickRequiredClueSubset, pickVanishCandidate } from '../../src/engine/runSetup';

// Mirrors store.ts's private SAVE_KEY. If the save key is ever versioned
// (e.g. -v2 migrations in Wave D), update here — see report.
const SAVE_KEY = 'last-train-save-v1';

function persisted(): Record<string, unknown> {
  const raw = localStorage.getItem(SAVE_KEY);
  expect(raw, 'persist middleware wrote nothing to localStorage').not.toBeNull();
  const parsed = JSON.parse(raw as string) as { state: Record<string, unknown> };
  return parsed.state;
}

const initialState = useGameStore.getState();

beforeEach(() => {
  localStorage.clear();
  useGameStore.setState(initialState, true);
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('startNewGame()', () => {
  const randoms = [0, 1e-9, 0.123456789, 0.5, 0.987654321, 1 - 2 ** -40];

  it.each(randoms)('resolves runSeed/vanish/requiredClueIds consistently with runSetup (Math.random=%s)', (r) => {
    vi.spyOn(Math, 'random').mockReturnValue(r);
    useGameStore.getState().startNewGame();
    const s = useGameStore.getState();

    const expectedSeed = Math.floor(r * 2 ** 31);
    expect(s.runSeed).toBe(expectedSeed);
    expect(Number.isInteger(s.runSeed)).toBe(true);
    expect(s.runSeed).toBeGreaterThanOrEqual(0);
    expect(s.runSeed).toBeLessThan(2 ** 31);
    expect(s.vanishingPassengerId).toBe(pickVanishCandidate(s.runSeed));
    expect(s.requiredClueIds).toEqual(pickRequiredClueSubset(s.runSeed));
  });

  it('resets per-run progress and marks a save', () => {
    const store = useGameStore.getState();
    store.setFlag('childGone');
    store.awardClue('timetable');
    store.interact('oldMan');
    store.setEnding('getOff');

    vi.spyOn(Math, 'random').mockReturnValue(0.42);
    useGameStore.getState().startNewGame();
    const s = useGameStore.getState();
    expect(s.scene).toBe('platform');
    expect(s.tripNumber).toBe(0);
    expect(s.currentStationIndex).toBe(-1);
    expect(s.flags).toEqual({});
    expect(s.discoveredClues).toEqual([]);
    expect(s.interactionCounts).toEqual({});
    expect(s.ending).toBeNull();
    expect(s.hasSaveData).toBe(true);
  });

  it('keeps settings across a new game', () => {
    useGameStore.getState().updateSettings({ reduceFlashing: true });
    useGameStore.getState().startNewGame();
    expect(useGameStore.getState().settings.reduceFlashing).toBe(true);
  });

  it('writes runSeed, vanishingPassengerId and requiredClueIds into the persisted slice', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.31415);
    useGameStore.getState().startNewGame();
    const s = useGameStore.getState();
    const saved = persisted();
    expect(saved.runSeed).toBe(s.runSeed);
    expect(saved.vanishingPassengerId).toBe(s.vanishingPassengerId);
    expect(saved.requiredClueIds).toEqual(s.requiredClueIds);
    expect(saved.hasSaveData).toBe(true);
    expect(hasExistingSave()).toBe(true);
  });

  it('persisted slice contains no functions and survives a JSON round-trip', () => {
    useGameStore.getState().startNewGame();
    const saved = persisted();
    for (const [k, v] of Object.entries(saved)) expect(typeof v, k).not.toBe('function');
  });

  it('a mid-run reload restores the same run facts instead of re-rolling', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.777);
    useGameStore.getState().startNewGame();
    const before = useGameStore.getState();
    const snapshot = {
      runSeed: before.runSeed,
      vanishingPassengerId: before.vanishingPassengerId,
      requiredClueIds: [...before.requiredClueIds],
    };
    const raw = localStorage.getItem(SAVE_KEY) as string;

    // Simulate a fresh page: wipe in-memory state, restore storage, rehydrate.
    useGameStore.setState(initialState, true);
    localStorage.setItem(SAVE_KEY, raw);
    vi.spyOn(Math, 'random').mockReturnValue(0.111); // a re-roll would produce different values
    await useGameStore.persist.rehydrate();

    const after = useGameStore.getState();
    expect({
      runSeed: after.runSeed,
      vanishingPassengerId: after.vanishingPassengerId,
      requiredClueIds: after.requiredClueIds,
    }).toEqual(snapshot);
  });
});

describe('store actions', () => {
  it('awardClue is idempotent', () => {
    const store = useGameStore.getState();
    store.awardClue('timetable');
    store.awardClue('timetable');
    expect(useGameStore.getState().discoveredClues).toEqual(['timetable']);
  });

  it('interact increments and returns the new count', () => {
    const store = useGameStore.getState();
    expect(store.interact('oldMan')).toBe(1);
    expect(useGameStore.getState().interact('oldMan')).toBe(2);
    expect(useGameStore.getState().getInteractionCount('oldMan')).toBe(2);
    expect(useGameStore.getState().getInteractionCount('student')).toBe(0);
  });

  it('boardTrain / arriveAtStation / departStation advance trip and station', () => {
    const s = useGameStore.getState();
    s.startNewGame();
    s.boardTrain();
    expect(useGameStore.getState()).toMatchObject({ scene: 'train', tripNumber: 1, currentStationIndex: -1 });
    useGameStore.getState().arriveAtStation();
    expect(useGameStore.getState()).toMatchObject({ scene: 'station', currentStationIndex: 0 });
    useGameStore.getState().departStation();
    expect(useGameStore.getState()).toMatchObject({ scene: 'train', tripNumber: 2 });
  });

  it('hasExistingSave is false with no save', () => {
    expect(hasExistingSave()).toBe(false);
  });
});
