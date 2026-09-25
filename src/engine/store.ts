import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EndingKey, GameSettings, SceneId } from './types';
import { pickRequiredClueSubset, pickVanishCandidate } from './runSetup';

const SAVE_KEY = 'last-train-save-v1';

interface GameStore {
  scene: SceneId;
  tripNumber: number; // increments each time the train departs a station (starts at 1 once boarded)
  currentStationIndex: number; // -1 before boarding, then 0..6 for stations 1-7
  interactionCounts: Record<string, number>;
  flags: Record<string, boolean>;
  discoveredClues: string[];
  settings: GameSettings;
  hasSaveData: boolean;
  ending: EndingKey | null;
  runSeed: number; // set once per playthrough in startNewGame()
  vanishingPassengerId: string; // 'businessman' | 'student', resolved once in startNewGame()
  requiredClueIds: string[]; // this run's breakLoop-required subset, resolved once in startNewGame()

  goToScene: (scene: SceneId) => void;
  /** First boarding: scene -> 'train', tripNumber -> 1, station stays -1 (not yet arrived anywhere). */
  boardTrain: () => void;
  /** Train pulls into the next station: currentStationIndex += 1, scene -> 'station'. */
  arriveAtStation: () => void;
  /** Player reboards after a station: tripNumber += 1, scene -> 'train'. */
  departStation: () => void;
  setEnding: (ending: EndingKey) => void;
  interact: (id: string) => number; // increments and returns new count
  getInteractionCount: (id: string) => number;
  setFlag: (flag: string, value?: boolean) => void;
  hasFlag: (flag: string) => boolean;
  awardClue: (clueId: string) => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  startNewGame: () => void;
  resetToTitle: () => void;
}

const defaultSettings: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  reduceFlashing: false,
  screenShake: true,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      scene: 'title',
      tripNumber: 0,
      currentStationIndex: -1,
      interactionCounts: {},
      flags: {},
      discoveredClues: [],
      settings: defaultSettings,
      hasSaveData: false,
      ending: null,
      runSeed: 0,
      vanishingPassengerId: '',
      requiredClueIds: [],

      goToScene: (scene) => set({ scene }),

      boardTrain: () => set({ scene: 'train', tripNumber: 1 }),

      arriveAtStation: () =>
        set((s) => ({ currentStationIndex: s.currentStationIndex + 1, scene: 'station' })),

      departStation: () =>
        set((s) => ({ tripNumber: s.tripNumber + 1, scene: 'train' })),

      setEnding: (ending) => set({ ending, scene: 'ending' }),

      interact: (id) => {
        const next = (get().interactionCounts[id] ?? 0) + 1;
        set((s) => ({ interactionCounts: { ...s.interactionCounts, [id]: next } }));
        return next;
      },

      getInteractionCount: (id) => get().interactionCounts[id] ?? 0,

      setFlag: (flag, value = true) =>
        set((s) => ({ flags: { ...s.flags, [flag]: value } })),

      hasFlag: (flag) => !!get().flags[flag],

      awardClue: (clueId) =>
        set((s) =>
          s.discoveredClues.includes(clueId)
            ? s
            : { discoveredClues: [...s.discoveredClues, clueId] }
        ),

      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),

      startNewGame: () => {
        const runSeed = Math.floor(Math.random() * 2 ** 31);
        const vanishingPassengerId = pickVanishCandidate(runSeed);
        const requiredClueIds = pickRequiredClueSubset(runSeed);
        set({
          scene: 'platform',
          tripNumber: 0,
          currentStationIndex: -1,
          interactionCounts: {},
          flags: {},
          discoveredClues: [],
          ending: null,
          hasSaveData: true,
          runSeed,
          vanishingPassengerId,
          requiredClueIds,
        });
      },

      resetToTitle: () => set({ scene: 'title' }),
    }),
    {
      name: SAVE_KEY,
      partialize: (s) => ({
        scene: s.scene,
        tripNumber: s.tripNumber,
        currentStationIndex: s.currentStationIndex,
        interactionCounts: s.interactionCounts,
        flags: s.flags,
        discoveredClues: s.discoveredClues,
        settings: s.settings,
        hasSaveData: s.hasSaveData,
        ending: s.ending,
        runSeed: s.runSeed,
        vanishingPassengerId: s.vanishingPassengerId,
        requiredClueIds: s.requiredClueIds,
      }),
    }
  )
);

export function hasExistingSave(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!parsed?.state?.hasSaveData;
  } catch {
    return false;
  }
}
