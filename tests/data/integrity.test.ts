// Data-integrity rules for src/data/*.ts plus the scene-local content that
// touches clues and flags. Shapes are read from engine/types.ts so these stay
// valid while Phase B2 adds anomalyPool entries / inspectText variants.
import { describe, expect, it } from 'vitest';
import { CLUES } from '../../src/data/clues';
import { ENDINGS } from '../../src/data/endings';
import { PASSENGERS } from '../../src/data/passengers';
import { STATIONS } from '../../src/data/stations';
import type { DialogueChoice, DialogueStage, EndingKey, StationKey, StationObjectDef } from '../../src/engine/types';
import { NEVER_REQUIRED, empiricalRequiredPool, expectedBand, stationClueUnion } from '../helpers/invariants';
import { arrayLiteralValues, callLiteralArgs, flagReads, ids, readSourceFiles } from '../helpers/source';

const CLUE_IDS = new Set(CLUES.map((c) => c.id));

const ALL_STAGES: { passengerId: string; index: number; stage: DialogueStage }[] = PASSENGERS.flatMap((p) =>
  p.dialogueStages.map((stage, index) => ({ passengerId: p.id, index, stage }))
);
const ALL_DATA_CHOICES: { where: string; choice: DialogueChoice }[] = ALL_STAGES.flatMap(({ passengerId, index, stage }) =>
  (stage.choices ?? []).map((choice) => ({ where: `${passengerId}.dialogueStages[${index}]`, choice }))
);

const SRC_ALL = readSourceFiles();
// Scene components are where inline (non-data) choices and direct awards live.
const SRC_SCENES = readSourceFiles('scenes');

/** Every clue id awarded outside station.clueIds, from data and from scene source. */
function nonStationAwardedClues() {
  const passengerStageClues = new Set(ALL_STAGES.flatMap(({ stage }) => stage.awardsClues ?? []));
  const dataChoiceClues = new Set(ALL_DATA_CHOICES.flatMap(({ choice }) => choice.awardsClues ?? []));
  // Scene-local DialogueChoice literals (e.g. Station.tsx VENDING_MACHINE_CHOICES).
  const sceneChoiceClues = ids(arrayLiteralValues(SRC_SCENES, 'awardsClues'));
  // Direct store.awardClue('literal') calls (e.g. Station.tsx followFootsteps -> unseenCompanion).
  const sceneLiteralAwards = ids(callLiteralArgs(SRC_SCENES, 'awardClue'));
  return { passengerStageClues, dataChoiceClues, sceneChoiceClues, sceneLiteralAwards };
}

describe('clues', () => {
  it('clue ids are unique and non-empty', () => {
    const idsList = CLUES.map((c) => c.id);
    expect(new Set(idsList).size).toBe(idsList.length);
    for (const c of CLUES) {
      expect(c.id).toMatch(/^[A-Za-z0-9_]+$/);
      expect(c.title.trim(), c.id).not.toBe('');
      expect(c.description.trim(), c.id).not.toBe('');
    }
  });

  it('every clue in CLUES is awarded somewhere (orphan check)', () => {
    // KNOWN_ORPHANS documents clues that exist in CLUES but that no code path
    // awards today. A NEW orphan fails this test; an existing one that gets
    // wired up also fails it (so the allowlist is removed rather than rotting).
    //  - 'ticket': defined in clues.ts but never referenced by any station,
    //    passenger, choice or scene. Reported as a finding.
    const KNOWN_ORPHANS = ['ticket'];

    const { passengerStageClues, dataChoiceClues, sceneChoiceClues, sceneLiteralAwards } = nonStationAwardedClues();
    const awarded = new Set([
      ...stationClueUnion(),
      ...passengerStageClues,
      ...dataChoiceClues,
      ...sceneChoiceClues,
      ...sceneLiteralAwards,
    ]);
    const orphans = CLUES.map((c) => c.id).filter((id) => !awarded.has(id));
    expect(orphans.sort()).toEqual([...KNOWN_ORPHANS].sort());
  });
});

describe('stations', () => {
  const KEYS: StationKey[] = ['kalyanpur', 'madhavNagar', 'sector0', 'unlisted', 'emptyPlatform', 'home', 'lastStop'];

  it('there are exactly 7 stations ordered 1..7 with unique keys', () => {
    expect(STATIONS).toHaveLength(7);
    STATIONS.forEach((s, i) => expect(s.order, s.key).toBe(i + 1));
    expect(new Set(STATIONS.map((s) => s.key)).size).toBe(STATIONS.length);
    expect(new Set(STATIONS.map((s) => s.key))).toEqual(new Set(KEYS));
  });

  it('structural beats stay at fixed positions (Invariant 2)', () => {
    const byKey = Object.fromEntries(STATIONS.map((s) => [s.key, s]));
    expect(byKey.emptyPlatform.order).toBe(5);
    expect(byKey.home.order).toBe(6);
    expect(byKey.lastStop.order).toBe(7);
    // Only the Empty Platform vanishes the train.
    expect(STATIONS.filter((s) => s.trainVanishes).map((s) => s.key)).toEqual(['emptyPlatform']);
  });

  it('severityBand matches order: 1-2 mild, 3-4 moderate, 5-7 severe (Invariant 2)', () => {
    for (const s of STATIONS) expect(s.severityBand, `${s.key} (order ${s.order})`).toBe(expectedBand(s.order));
  });

  it('every station clueIds entry exists in CLUES', () => {
    for (const s of STATIONS) for (const id of s.clueIds) expect(CLUE_IDS.has(id), `${s.key}.clueIds: '${id}'`).toBe(true);
  });

  it('no station clueIds is duplicated across or within stations', () => {
    const all = STATIONS.flatMap((s) => s.clueIds);
    expect(new Set(all).size).toBe(all.length);
  });

  it('no station clueIds contains a choice-gated, bonus, or passenger-tier clue (Invariants 5/6)', () => {
    const { passengerStageClues, dataChoiceClues, sceneChoiceClues, sceneLiteralAwards } = nonStationAwardedClues();
    const forbidden = new Map<string, string>();
    for (const id of NEVER_REQUIRED) forbidden.set(id, 'known choice/bonus/passenger clue (guide §5/§6)');
    for (const id of passengerStageClues) forbidden.set(id, 'awarded by a passenger dialogue stage');
    for (const id of dataChoiceClues) forbidden.set(id, 'awarded by a passenger dialogue choice');
    for (const id of sceneChoiceClues) forbidden.set(id, 'awarded by a scene-local DialogueChoice');
    for (const id of sceneLiteralAwards) forbidden.set(id, 'awarded directly by a scene (bonus/hotspot-gated)');

    const violations = STATIONS.flatMap((s) =>
      s.clueIds.filter((id) => forbidden.has(id)).map((id) => `${s.key}.clueIds contains '${id}' (${forbidden.get(id)})`)
    );
    expect(violations).toEqual([]);
  });

  it("runSetup's station-level clue pool equals the union of all stations' clueIds", () => {
    const pool = [...empiricalRequiredPool()].sort();
    const union = [...stationClueUnion()].sort();
    const inPoolNotStations = pool.filter((id) => !union.includes(id));
    const inStationsNotPool = union.filter((id) => !pool.includes(id));
    expect({ inPoolNotStations, inStationsNotPool }).toEqual({ inPoolNotStations: [], inStationsNotPool: [] });
  });

  it('object ids are unique within each station (interaction ids are `${station}.${object}`)', () => {
    for (const s of STATIONS) {
      const objectIds = [...s.objects, ...(s.anomalyPool ?? [])].map((o) => o.id);
      expect(new Set(objectIds).size, `${s.key}: ${objectIds.join(', ')}`).toBe(objectIds.length);
    }
  });

  it('every non-scripted station has an object inspectable on arrival (so station clues are reachable)', () => {
    for (const s of STATIONS) {
      if (s.key === 'lastStop') continue; // scripted: clues handed over unconditionally
      // sector0.followFootsteps is hidden until an idle timer reveals it.
      const visibleOnArrival = s.objects.filter((o) => !(s.key === 'sector0' && o.id === 'followFootsteps'));
      expect(visibleOnArrival.length, s.key).toBeGreaterThan(0);
    }
  });

  it('inspectText entries are non-empty strings or non-empty string arrays', () => {
    const check = (where: string, obj: StationObjectDef) => {
      expect(obj.inspectText.length, where).toBeGreaterThan(0);
      for (const entry of obj.inspectText) {
        const lines = Array.isArray(entry) ? entry : [entry];
        expect(lines.length, where).toBeGreaterThan(0);
        for (const line of lines) {
          expect(typeof line, where).toBe('string');
          expect(line.trim(), where).not.toBe('');
        }
      }
    };
    for (const s of STATIONS) {
      for (const o of s.objects) check(`${s.key}.objects.${o.id}`, o);
      for (const o of s.anomalyPool ?? []) check(`${s.key}.anomalyPool.${o.id}`, o);
    }
  });

  it('anomalyPool entries carry no clue data (Invariant 4) and match the station band (Invariant 2)', () => {
    for (const s of STATIONS) {
      for (const entry of s.anomalyPool ?? []) {
        const raw = entry as unknown as Record<string, unknown>;
        const where = `${s.key}.anomalyPool.${entry.id}`;
        for (const clueKey of ['clueIds', 'clueId', 'awardsClues', 'awardsClue']) {
          expect(raw[clueKey], `${where} must not carry '${clueKey}'`).toBeUndefined();
        }
        // StationObjectDef has no band field today; if one is ever added, it
        // must equal the station's band.
        if ('severityBand' in raw) expect(raw.severityBand, where).toBe(s.severityBand);
        if ('band' in raw) expect(raw.band, where).toBe(s.severityBand);
      }
    }
  });
});

describe('passenger dialogue', () => {
  it('passenger ids are unique', () => {
    const idsList = PASSENGERS.map((p) => p.id);
    expect(new Set(idsList).size).toBe(idsList.length);
  });

  it('every stage and choice awardsClues entry exists in CLUES', () => {
    for (const { passengerId, index, stage } of ALL_STAGES) {
      for (const id of stage.awardsClues ?? []) {
        expect(CLUE_IDS.has(id), `${passengerId}.dialogueStages[${index}].awardsClues: '${id}'`).toBe(true);
      }
    }
    for (const { where, choice } of ALL_DATA_CHOICES) {
      for (const id of choice.awardsClues ?? []) expect(CLUE_IDS.has(id), `${where} choice '${choice.text}': '${id}'`).toBe(true);
    }
  });

  it('every scene-local awarded clue (choices and direct awardClue calls) exists in CLUES', () => {
    for (const occ of [...arrayLiteralValues(SRC_SCENES, 'awardsClues'), ...callLiteralArgs(SRC_SCENES, 'awardClue')]) {
      expect(CLUE_IDS.has(occ.id), `${occ.file}: '${occ.id}'`).toBe(true);
    }
  });

  it('stages are well-formed', () => {
    for (const { passengerId, index, stage } of ALL_STAGES) {
      const where = `${passengerId}.dialogueStages[${index}]`;
      expect(Number.isInteger(stage.minInteractions) && stage.minInteractions >= 0, where).toBe(true);
      if (stage.minTrip !== undefined) expect(stage.minTrip >= 1 && stage.minTrip <= 7, where).toBe(true);
      expect(stage.lines.length, where).toBeGreaterThan(0);
      if (stage.choices) expect(stage.choices.length, where).toBeGreaterThanOrEqual(2);
    }
  });

  it('every passenger has an unconditional minInteractions:0 opening stage (resolver fallback)', () => {
    for (const p of PASSENGERS) {
      const opener = p.dialogueStages.find(
        (s) => s.minInteractions === 0 && s.minTrip === undefined && !s.requiresFlag && !s.blockedByFlag
      );
      expect(opener, p.id).toBeDefined();
    }
  });
});

describe('flags', () => {
  // Flags set by scene code rather than by passenger data. Each entry is
  // verified below to still be discoverable in source, so this list can't go
  // stale silently.
  //  - acknowledgedVanishing, vanishLookedAway, vanishHeldGaze:
  //      TrainInterior.tsx handleVanishSeatInteract() inline choices (§6.6)
  //  - tookReceipt: Station.tsx VENDING_MACHINE_CHOICES "Take it" (§6.4)
  //  - followedFootsteps: Station.tsx handleInspect(), store.setFlag(...) (§6.3)
  //  - station.<key>.cluesAwarded: Station.tsx awardStationClues(), built
  //      from a template literal (not greppable as a literal; pattern only)
  const DOCUMENTED_DYNAMIC_FLAGS = [
    'acknowledgedVanishing',
    'vanishLookedAway',
    'vanishHeldGaze',
    'tookReceipt',
    'followedFootsteps',
  ];
  const DYNAMIC_FLAG_PATTERNS = [/^station\.[A-Za-z0-9]+\.cluesAwarded$/];

  const dataSetFlags = new Set([
    ...ALL_STAGES.flatMap(({ stage }) => stage.setFlags ?? []),
    ...ALL_DATA_CHOICES.flatMap(({ choice }) => choice.setFlags ?? []),
  ]);
  const sourceSetFlags = new Set([
    ...ids(arrayLiteralValues(SRC_ALL, 'setFlags')),
    ...ids(callLiteralArgs(SRC_ALL, 'setFlag')),
  ]);
  const allSetFlags = new Set([...dataSetFlags, ...sourceSetFlags]);
  const isSet = (flag: string) => allSetFlags.has(flag) || DYNAMIC_FLAG_PATTERNS.some((re) => re.test(flag));

  it('documented dynamic flags are actually set somewhere in src/', () => {
    for (const flag of DOCUMENTED_DYNAMIC_FLAGS) expect(sourceSetFlags.has(flag), flag).toBe(true);
  });

  it('every requiresFlag / blockedByFlag in passenger dialogue is set somewhere', () => {
    const missing: string[] = [];
    for (const { passengerId, index, stage } of ALL_STAGES) {
      for (const [kind, flag] of [
        ['requiresFlag', stage.requiresFlag],
        ['blockedByFlag', stage.blockedByFlag],
      ] as const) {
        if (flag && !isSet(flag)) missing.push(`${passengerId}.dialogueStages[${index}].${kind} = '${flag}'`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every literal flag read in scene code is set somewhere', () => {
    const reads = [
      ...flagReads(SRC_SCENES),
      ...callLiteralArgs(SRC_SCENES, 'hasFlag'),
    ];
    const missing = reads.filter((r) => !isSet(r.id)).map((r) => `${r.file}: '${r.id}'`);
    expect([...new Set(missing)]).toEqual([]);
  });
});

describe('endings', () => {
  it('all 3 endings exist exactly once with content', () => {
    const keys: EndingKey[] = ['getOff', 'stayOn', 'breakLoop'];
    expect(ENDINGS.map((e) => e.key).sort()).toEqual([...keys].sort());
    for (const e of ENDINGS) {
      expect(e.title.trim(), e.key).not.toBe('');
      expect(e.lines.length, e.key).toBeGreaterThan(0);
    }
  });
});
