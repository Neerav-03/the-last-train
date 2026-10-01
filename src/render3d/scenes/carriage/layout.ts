// Carriage dimensions and layout in metres. Single source of truth for the
// shell, props, lights and passenger placement.
//
// Axes: +Y up, the carriage runs along -Z (near end z=0, far door at
// z=-LENGTH), x=0 is the aisle centre, +x is the right-hand wall.

export const LENGTH = 15;
export const HALF_WIDTH = 1.42;
export const WALL_TOP = 1.98; // where the wall meets the chamfer
export const CEILING = 2.36;
export const CEIL_HALF = 0.82; // half-width of the flat ceiling panel
export const WINDOW_BOTTOM = 0.92;
export const WINDOW_TOP = 1.82;
export const AISLE_HALF = 0.42;

export const SEAT_HEIGHT = 0.46;
export const BENCH_DEPTH = 0.5;
export const BENCH_INNER_X = AISLE_HALF + 0.04; // aisle edge of a bench

/** Bay layout: each bay is a pair of facing benches with a window between. */
export const BAY_COUNT = 5;
export const BAY_LENGTH = 2.25;
export const FIRST_BAY_Z = -0.6 - BAY_LENGTH / 2; // centre of bay 0

export function bayCenterZ(bay: number): number {
  return FIRST_BAY_Z - bay * BAY_LENGTH;
}

/** Bench placement: facing +z (towards the camera start) or -z. */
export interface BenchSlot {
  bay: number;
  side: -1 | 1;
  /** +1: the seated person looks towards +z (back of bench towards -z). */
  facing: -1 | 1;
  /** Bench centre (front edge of cushion is BENCH_DEPTH/2 towards facing). */
  x: number;
  z: number;
}

export const BENCH_GAP = 0.84; // knee-room between facing cushions' front edges

export function benchSlots(): BenchSlot[] {
  const out: BenchSlot[] = [];
  const x = (HALF_WIDTH + BENCH_INNER_X) / 2;
  for (let bay = 0; bay < BAY_COUNT; bay++) {
    const zc = bayCenterZ(bay);
    for (const side of [-1, 1] as const) {
      // Bench facing +z sits on the -z side of the bay and vice versa.
      out.push({ bay, side, facing: 1, x: side * x, z: zc - BENCH_GAP / 2 - BENCH_DEPTH / 2 });
      out.push({ bay, side, facing: -1, x: side * x, z: zc + BENCH_GAP / 2 + BENCH_DEPTH / 2 });
    }
  }
  return out;
}

/** World position of a seat: seatIndex 0 = window seat, 1 = aisle seat. */
export function seatPosition(bay: number, side: -1 | 1, facing: -1 | 1, seatIndex: 0 | 1): { x: number; z: number } {
  const benchW = HALF_WIDTH - BENCH_INNER_X;
  const xWindow = HALF_WIDTH - benchW * 0.27;
  const xAisle = BENCH_INNER_X + benchW * 0.27;
  const zc = bayCenterZ(bay);
  // Hip sits roughly over the cushion centre, slightly back.
  const z = facing === 1 ? zc - BENCH_GAP / 2 - BENCH_DEPTH * 0.55 : zc + BENCH_GAP / 2 + BENCH_DEPTH * 0.55;
  return { x: side * (seatIndex === 0 ? xWindow : xAisle), z };
}

/** Window bays: one window per bay per side, centred on the bay. */
export const WINDOW_WIDTH = 1.68;

/** Ceiling tube positions (z) along the centre line. */
export const TUBE_Z: readonly number[] = [-0.9, -3.1, -5.3, -7.5, -9.7, -11.9, -14.1];
export const TUBE_LENGTH = 1.2;
export const TUBE_Y = CEILING - 0.03;
