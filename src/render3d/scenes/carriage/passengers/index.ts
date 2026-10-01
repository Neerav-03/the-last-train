// Passenger figures for the carriage scene: stylised low-poly people built
// from primitives, read by silhouette and posture. Public entry point.
//
// Each figure: one vertex-coloured, rim-patched MeshStandardMaterial (shared
// program across figures) and one merged mesh per animated pivot.

import { PASSENGERS } from '../../../../data/passengers';
import { rngFor } from '../../../../engine/rng';
import { buildBusinessman } from './businessman';
import { FigureKit, figureInfo } from './kit';
import type { FigureInfo } from './kit';
import { buildOldMan } from './oldMan';
import { buildSilent } from './silent';
import { buildStudent } from './student';
import type {
  BuildPassengersOptions,
  PassengerFigure,
  PassengerPlacement,
  SilentFigure,
  StudentFigure,
  WomanFigure,
} from './types';
import { buildWoman } from './woman';

export type {
  BuildPassengersOptions,
  PassengerFigure,
  PassengerPlacement,
  SilentFigure,
  StudentFigure,
  WomanFigure,
} from './types';

export const DEFAULT_PLACEMENTS: readonly PassengerPlacement[] = [
  { id: 'oldMan', bay: 0, side: 1, facing: 1, seatIndex: 0 },
  { id: 'womanWithChild', bay: 1, side: -1, facing: 1, seatIndex: 0 },
  { id: 'businessman', bay: 2, side: 1, facing: 1, seatIndex: 1 },
  { id: 'student', bay: 3, side: -1, facing: 1, seatIndex: 1 },
  { id: 'silentPassenger', bay: 4, side: 1, facing: 1, seatIndex: 1 },
];

type Builder = (kit: FigureKit, info: FigureInfo) => PassengerFigure;

const BUILDERS: Readonly<Record<string, Builder>> = {
  oldMan: buildOldMan,
  womanWithChild: buildWoman,
  businessman: buildBusinessman,
  student: buildStudent,
  silentPassenger: buildSilent,
};

export function buildPassengers(options: BuildPassengersOptions): PassengerFigure[] {
  const placements = options.placements ?? DEFAULT_PLACEMENTS;
  const out: PassengerFigure[] = [];
  for (const p of placements) {
    const build = BUILDERS[p.id];
    if (!build) {
      console.warn(`[passengers] no figure builder for id "${p.id}"`);
      continue;
    }
    const def = PASSENGERS.find((d) => d.id === p.id);
    const kit = new FigureKit(rngFor(options.runSeed, `render3d:passenger:${p.id}`));
    kit.root.name = `passenger:${p.id}`;
    out.push(build(kit, figureInfo(p.id, def?.name ?? p.id, def?.shortLabel ?? p.id, p)));
  }
  return out;
}

export function isWomanFigure(f: PassengerFigure): f is WomanFigure {
  return typeof (f as Partial<WomanFigure>).setChildVisible === 'function';
}

export function isStudentFigure(f: PassengerFigure): f is StudentFigure {
  return typeof (f as Partial<StudentFigure>).setTapping === 'function';
}

export function isSilentFigure(f: PassengerFigure): f is SilentFigure {
  return typeof (f as Partial<SilentFigure>).setHeadTilt === 'function';
}
