// The carriage body: walls with window bays, chamfered ceiling, light channel,
// vents, floor, end walls with the connecting door, vestibule side doors.
// Everything static is merged per material (paint, floor, metal, dark) and
// vertex-baked with ambient occlusion. Window glass is one merged mesh.

import {
  BoxGeometry,
  CanvasTexture,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';
import type { BufferGeometry, Material } from 'three';
import { boxProjectUV, GeometryBatch, mix, smoothstep } from '../../core/geometry';
import type { CarriageMaterials } from './materials';
import {
  BAY_COUNT,
  BENCH_INNER_X,
  CEIL_HALF,
  CEILING,
  HALF_WIDTH as HW,
  LENGTH,
  TUBE_LENGTH,
  TUBE_Z,
  WALL_TOP,
  WINDOW_BOTTOM as WB,
  WINDOW_TOP as WT,
  WINDOW_WIDTH,
  bayCenterZ,
  benchSlots,
  BENCH_DEPTH,
} from './layout';

/** Vestibule side doors (both walls), z range. */
export const SIDE_DOOR_Z0 = -12.55;
export const SIDE_DOOR_Z1 = -13.75;
/** Far connecting door. */
export const END_DOOR_HALF = 0.42;
export const END_DOOR_TOP = 1.95;
export const DOOR_WINDOW = { x0: -0.16, x1: 0.16, y0: 1.24, y1: 1.74 } as const;

const TINT = {
  lowerWall: new Color(0x47515b),
  upperWall: new Color(0xa7afab),
  ceiling: new Color(0xbfc3b8),
  channel: new Color(0xd6d9d4),
  door: new Color(0x34404c),
  endWall: new Color(0x9aa29f),
  duct: new Color(0x2a3036),
  floor: new Color(0x8a8378),
};

export interface CarriageShell {
  readonly group: Group;
  /** Merged window glass geometry; the scene assigns the window material. */
  readonly glassGeometry: BufferGeometry;
  /** World-space z intervals of every window opening (for light/sodium logic). */
  readonly windows: readonly { side: -1 | 1; z0: number; z1: number }[];
  dispose(): void;
}

const SLOTS = benchSlots();

/** Bench footprints on the floor, for AO under seats. */
function underBench(x: number, z: number): number {
  const ax = Math.abs(x);
  if (ax < BENCH_INNER_X + 0.02) return 0;
  let best = 0;
  for (const s of SLOTS) {
    const dz = Math.abs(z - s.z);
    if (dz < BENCH_DEPTH / 2 + 0.06) best = Math.max(best, 1 - smoothstep(BENCH_DEPTH / 2 - 0.1, BENCH_DEPTH / 2 + 0.06, dz));
  }
  return best * smoothstep(BENCH_INNER_X, BENCH_INNER_X + 0.12, ax);
}

function shellAO(x: number, y: number, z: number, _nx: number, ny: number, _nz: number): number {
  const ax = Math.abs(x);
  let ao = 1;
  // Contact darkening near the floor on every vertical surface.
  if (Math.abs(ny) < 0.5) ao *= mix(0.5, 1, smoothstep(0.0, 0.55, y));
  // Room ends are darker (no tube right at the walls).
  const dz = Math.min(-z, z + LENGTH);
  ao *= mix(0.62, 1, smoothstep(0, 1.2, dz));
  if (ny > 0.5 && y < 0.05) {
    // Floor: wall corners and under the benches.
    ao *= mix(0.45, 1, smoothstep(0, 0.55, HW - ax));
    ao *= 1 - 0.6 * underBench(x, z);
  }
  // Wall/chamfer/ceiling creases.
  if (y > WALL_TOP - 0.1) ao *= mix(0.78, 1, smoothstep(0.0, 0.18, Math.abs(y - WALL_TOP)));
  if (y > CEILING - 0.05) ao *= mix(0.72, 1, smoothstep(0.0, 0.25, CEIL_HALF - ax));
  return ao;
}

function floorWear(x: number, z: number): number {
  // Lighter, polished path down the aisle, irregular along z.
  const ax = Math.abs(x + 0.04 * Math.sin(z * 1.3));
  const wobble = 0.5 + 0.5 * Math.sin(z * 2.1) * Math.sin(z * 0.73 + 1.7);
  return smoothstep(0.5, 0.05, ax) * (0.6 + 0.4 * wobble);
}

/** Wall pillar z-intervals (complement of windows and the side door). */
function pillarIntervals(windows: { z0: number; z1: number }[]): [number, number][] {
  const cuts = [...windows.map((w) => [w.z0, w.z1] as [number, number]), [SIDE_DOOR_Z1, SIDE_DOOR_Z0] as [number, number]];
  cuts.sort((a, b) => b[1] - a[1]);
  const out: [number, number][] = [];
  let cursor = 0;
  for (const [lo, hi] of cuts) {
    if (cursor > hi + 1e-4) out.push([hi, cursor]);
    cursor = lo;
  }
  if (cursor > -LENGTH) out.push([-LENGTH, cursor]);
  return out;
}

function zBox(batch: GeometryBatch, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, tint: Color, seg: [number, number, number] = [1, 1, 1]) {
  const w = Math.abs(x1 - x0);
  const h = Math.abs(y1 - y0);
  const d = Math.abs(z1 - z0);
  if (w < 1e-4 || h < 1e-4 || d < 1e-4) return;
  batch.add(new BoxGeometry(w, h, d, seg[0], seg[1], seg[2]), { position: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] }, tint);
}

function createDoorGlowTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#ffd9a0');
  grad.addColorStop(0.35, '#e8a050');
  grad.addColorStop(1, '#5a2a0c');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 128);
  // The next carriage, seen through two panes of dirty glass: a pole, a
  // ceiling light, a dark shape that could be a seat back. Or someone.
  g.fillStyle = 'rgba(40, 18, 6, 0.75)';
  g.fillRect(41, 0, 4, 128);
  g.fillStyle = 'rgba(30, 12, 4, 0.55)';
  g.beginPath();
  g.ellipse(20, 86, 9, 30, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(255, 240, 210, 0.9)';
  g.fillRect(10, 6, 44, 5);
  // Grime.
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(30, 14, 4, ${Math.random() * 0.25})`;
    g.fillRect(Math.random() * 64, Math.random() * 128, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function buildCarriageShell(mats: CarriageMaterials): CarriageShell {
  const paint = new GeometryBatch();
  const floor = new GeometryBatch();
  const metal = new GeometryBatch();
  const dark = new GeometryBatch();
  const glass = new GeometryBatch();
  const owned: { dispose(): void }[] = [];

  const windows: { side: -1 | 1; z0: number; z1: number }[] = [];
  for (const side of [-1, 1] as const) {
    for (let b = 0; b < BAY_COUNT; b++) {
      const zc = bayCenterZ(b);
      windows.push({ side, z0: zc - WINDOW_WIDTH / 2, z1: zc + WINDOW_WIDTH / 2 });
    }
  }

  const T = 0.05; // wall slab thickness
  for (const side of [-1, 1] as const) {
    const xi = side * HW; // inner face
    const xo = side * (HW + T);
    const sideWins = windows.filter((w) => w.side === side);

    // Lower wall (below the windows), interrupted by the side door.
    zBox(paint, xi, xo, 0, WB, SIDE_DOOR_Z0, 0, TINT.lowerWall, [1, 5, 28]);
    zBox(paint, xi, xo, 0, WB, -LENGTH, SIDE_DOOR_Z1, TINT.lowerWall, [1, 5, 2]);
    // A rubbing strip / dado rail where the lower panel meets the windows.
    zBox(metal, xi, xi - side * 0.025, WB - 0.03, WB, SIDE_DOOR_Z0, 0, TINT.upperWall);
    zBox(metal, xi, xi - side * 0.025, WB - 0.03, WB, -LENGTH, SIDE_DOOR_Z1, TINT.upperWall);
    // Heater duct along the floor.
    zBox(dark, xi, xi - side * 0.09, 0, 0.2, SIDE_DOOR_Z0, 0, TINT.duct, [1, 1, 12]);
    // Upper band (above windows and doors).
    zBox(paint, xi, xo, WT, WALL_TOP + 0.02, -LENGTH, 0, TINT.upperWall, [1, 1, 24]);
    // Pillars between openings.
    for (const [z0, z1] of pillarIntervals(sideWins)) zBox(paint, xi, xo, WB, WT, z0, z1, TINT.upperWall, [1, 3, 2]);

    for (const w of sideWins) {
      // Glass, recessed into the wall.
      const pane = new PlaneGeometry(w.z1 - w.z0, WT - WB, 1, 1);
      glass.add(pane, { position: [side * (HW + T * 0.6), (WB + WT) / 2, (w.z0 + w.z1) / 2], rotation: [0, -side * Math.PI / 2, 0] });
      // Rubber gasket frame + reveal.
      const gx0 = side * (HW + T * 0.6);
      const gx1 = side * (HW - 0.01);
      zBox(dark, gx0, gx1, WB, WB + 0.035, w.z0, w.z1, TINT.duct);
      zBox(dark, gx0, gx1, WT - 0.035, WT, w.z0, w.z1, TINT.duct);
      zBox(dark, gx0, gx1, WB, WT, w.z0, w.z0 + 0.035, TINT.duct);
      zBox(dark, gx0, gx1, WB, WT, w.z1 - 0.035, w.z1, TINT.duct);
      // Centre mullion: two-pane windows read as train windows.
      const zm = (w.z0 + w.z1) / 2;
      zBox(dark, gx0, gx1, WB, WT, zm - 0.02, zm + 0.02, TINT.duct);
      // Metal sill.
      zBox(metal, side * (HW + 0.01), side * (HW - 0.06), WB - 0.012, WB + 0.012, w.z0, w.z1, TINT.upperWall);
    }

    // Vestibule side doors: two leaves with tall windows, slightly recessed.
    const dz0 = SIDE_DOOR_Z1;
    const dz1 = SIDE_DOOR_Z0;
    const dx0 = side * (HW + 0.02);
    const dx1 = side * (HW + 0.06);
    const mid = (dz0 + dz1) / 2;
    for (const [a, b] of [[dz0, mid - 0.006], [mid + 0.006, dz1]] as [number, number][]) {
      zBox(paint, dx0, dx1, 0, 0.95, a, b, TINT.door);
      zBox(paint, dx0, dx1, 1.75, WT, a, b, TINT.door);
      zBox(paint, dx0, dx1, 0.95, 1.75, a, a + 0.07, TINT.door);
      zBox(paint, dx0, dx1, 0.95, 1.75, b - 0.07, b, TINT.door);
      const pane = new PlaneGeometry(b - a - 0.14, 0.8);
      glass.add(pane, { position: [side * (HW + 0.045), 1.35, (a + b) / 2], rotation: [0, -side * Math.PI / 2, 0] });
    }
    // Door rubber edges + frame.
    zBox(dark, dx0, side * (HW - 0.005), 0, WT, mid - 0.012, mid + 0.012, TINT.duct);
    zBox(metal, side * HW, side * (HW - 0.04), 0, WT, dz0 - 0.05, dz0, TINT.upperWall);
    zBox(metal, side * HW, side * (HW - 0.04), 0, WT, dz1, dz1 + 0.05, TINT.upperWall);
    zBox(metal, side * (HW + 0.06), side * (HW - 0.3), 0, 0.012, dz0, dz1, TINT.upperWall); // threshold

    // Chamfer: slab from the wall top up to the ceiling edge.
    const ax0 = HW;
    const ay0 = WALL_TOP;
    const ax1 = CEIL_HALF;
    const ay1 = CEILING;
    const len = Math.hypot(ax1 - ax0, ay1 - ay0);
    const ang = side === 1 ? Math.atan2(ay1 - ay0, ax1 - ax0) : Math.atan2(ay1 - ay0, ax0 - ax1);
    paint.add(new BoxGeometry(len, 0.03, LENGTH, 3, 1, 32), {
      position: [side * (ax0 + ax1) / 2 + side * 0.012, (ay0 + ay1) / 2 + 0.012, -LENGTH / 2],
      rotation: [0, 0, ang],
    }, TINT.ceiling);
    // Advertising card frames along the chamfer, every bay (dark inset cards).
    for (let b = 0; b < BAY_COUNT; b++) {
      const zc = bayCenterZ(b);
      const cx = side * (ax0 + ax1) / 2 - side * 0.004;
      paint.add(new BoxGeometry(len * 0.62, 0.012, 0.95), {
        position: [cx, (ay0 + ay1) / 2 - 0.004, zc],
        rotation: [0, 0, ang],
      }, b % 2 === 0 ? new Color(0x5d6670) : new Color(0x6b5f55));
    }
  }

  // Ceiling panel + central light channel + housings.
  zBox(paint, -CEIL_HALF - 0.02, CEIL_HALF + 0.02, CEILING, CEILING + 0.03, -LENGTH, 0, TINT.ceiling, [6, 1, 32]);
  zBox(paint, -0.12, 0.12, CEILING - 0.025, CEILING, -LENGTH, 0, TINT.channel, [1, 1, 16]);
  for (const z of TUBE_Z) {
    zBox(paint, -0.09, 0.09, CEILING - 0.06, CEILING - 0.025, z - TUBE_LENGTH / 2 - 0.06, z + TUBE_LENGTH / 2 + 0.06, TINT.channel);
    // Tube end caps (dark).
    for (const e of [-1, 1]) zBox(dark, -0.03, 0.03, CEILING - 0.11, CEILING - 0.06, z + e * (TUBE_LENGTH / 2 + 0.02) - 0.02, z + e * (TUBE_LENGTH / 2 + 0.02) + 0.02, TINT.duct);
  }
  // Ceiling vents between tubes: dark recess + metal slats.
  for (let i = 0; i < TUBE_Z.length - 1; i++) {
    const zc = (TUBE_Z[i] + TUBE_Z[i + 1]) / 2;
    for (const side of [-1, 1]) {
      const xc = side * 0.48;
      zBox(dark, xc - 0.14, xc + 0.14, CEILING - 0.005, CEILING + 0.001, zc - 0.32, zc + 0.32, TINT.duct);
      for (let s = 0; s < 7; s++) {
        const sz = zc - 0.27 + s * 0.09;
        zBox(metal, xc - 0.13, xc + 0.13, CEILING - 0.02, CEILING - 0.006, sz - 0.012, sz + 0.012, TINT.channel);
      }
    }
  }

  // Near end wall (behind the camera start).
  zBox(paint, -HW - T, HW + T, 0, CEILING + 0.03, 0, T, TINT.endWall, [6, 6, 1]);

  // Far end wall with the connecting door opening.
  const ez0 = -LENGTH - T;
  const ez1 = -LENGTH;
  zBox(paint, -HW - T, -END_DOOR_HALF, 0, CEILING + 0.03, ez0, ez1, TINT.endWall, [3, 6, 1]);
  zBox(paint, END_DOOR_HALF, HW + T, 0, CEILING + 0.03, ez0, ez1, TINT.endWall, [3, 6, 1]);
  zBox(paint, -END_DOOR_HALF, END_DOOR_HALF, END_DOOR_TOP, CEILING + 0.03, ez0, ez1, TINT.endWall);
  // The door leaf, recessed, built around its small window.
  const dzA = -LENGTH - 0.08;
  const dzB = -LENGTH - 0.04;
  const dw = DOOR_WINDOW;
  zBox(paint, -END_DOOR_HALF, END_DOOR_HALF, 0, dw.y0, dzA, dzB, TINT.door, [2, 4, 1]);
  zBox(paint, -END_DOOR_HALF, END_DOOR_HALF, dw.y1, END_DOOR_TOP, dzA, dzB, TINT.door);
  zBox(paint, -END_DOOR_HALF, dw.x0, dw.y0, dw.y1, dzA, dzB, TINT.door);
  zBox(paint, dw.x1, END_DOOR_HALF, dw.y0, dw.y1, dzA, dzB, TINT.door);
  // Door window gasket, kick plate, handle, frame.
  zBox(dark, dw.x0 - 0.02, dw.x1 + 0.02, dw.y0 - 0.02, dw.y0, dzB, dzB + 0.012, TINT.duct);
  zBox(dark, dw.x0 - 0.02, dw.x1 + 0.02, dw.y1, dw.y1 + 0.02, dzB, dzB + 0.012, TINT.duct);
  zBox(dark, dw.x0 - 0.02, dw.x0, dw.y0, dw.y1, dzB, dzB + 0.012, TINT.duct);
  zBox(dark, dw.x1, dw.x1 + 0.02, dw.y0, dw.y1, dzB, dzB + 0.012, TINT.duct);
  zBox(metal, -END_DOOR_HALF + 0.04, END_DOOR_HALF - 0.04, 0.02, 0.26, dzB, dzB + 0.006, TINT.upperWall);
  zBox(metal, 0.26, 0.29, 0.95, 1.12, dzB, dzB + 0.05, TINT.upperWall);
  zBox(metal, -END_DOOR_HALF - 0.05, -END_DOOR_HALF, 0, END_DOOR_TOP + 0.05, ez1, ez1 + 0.03, TINT.upperWall);
  zBox(metal, END_DOOR_HALF, END_DOOR_HALF + 0.05, 0, END_DOOR_TOP + 0.05, ez1, ez1 + 0.03, TINT.upperWall);
  zBox(metal, -END_DOOR_HALF - 0.05, END_DOOR_HALF + 0.05, END_DOOR_TOP, END_DOOR_TOP + 0.05, ez1, ez1 + 0.03, TINT.upperWall);
  // Sign box above the door (dark, unlit: the destination display is dead).
  zBox(dark, -0.36, 0.36, 2.02, 2.18, ez1, ez1 + 0.08, TINT.duct);

  // Floor.
  const floorGeo = new PlaneGeometry(HW * 2, LENGTH, 18, 80);
  floor.add(floorGeo, { position: [0, 0, -LENGTH / 2], rotation: [-Math.PI / 2, 0, 0] }, TINT.floor);

  // ------------------------------------------------------- build ----
  const group = new Group();
  group.name = 'CarriageShell';
  const addMesh = (geo: BufferGeometry, mat: Material, name: string) => {
    const m = new Mesh(geo, mat);
    m.name = name;
    m.matrixAutoUpdate = false;
    m.updateMatrix();
    group.add(m);
    owned.push(geo);
    return m;
  };

  const paintGeo = paint.build(shellAO);
  boxProjectUV(paintGeo, 1.3);
  addMesh(paintGeo, mats.paint, 'ShellPaint');

  const floorBuilt = floor.build((x, y, z, nx, ny, nz) => shellAO(x, y, z, nx, ny, nz) * mix(0.75, 1.25, floorWear(x, z)));
  boxProjectUV(floorBuilt, 1.0);
  addMesh(floorBuilt, mats.floor, 'ShellFloor');

  const metalGeo = metal.build(shellAO);
  addMesh(metalGeo, mats.metal, 'ShellMetal');
  const darkGeo = dark.build(shellAO);
  addMesh(darkGeo, mats.dark, 'ShellDark');

  // Door window: warm glow from the next carriage (HDR so it blooms softly).
  const glowTex = createDoorGlowTexture();
  const glowMat = new MeshBasicMaterial({ map: glowTex, color: new Color(2.4, 2.0, 1.6) });
  const glowGeo = new PlaneGeometry(dw.x1 - dw.x0, dw.y1 - dw.y0);
  const glow = new Mesh(glowGeo, glowMat);
  glow.position.set((dw.x0 + dw.x1) / 2, (dw.y0 + dw.y1) / 2, dzA + 0.02);
  glow.name = 'DoorWindowGlow';
  group.add(glow);
  owned.push(glowTex, glowMat, glowGeo);

  const glassGeometry = glass.build();
  owned.push(glassGeometry);

  return {
    group,
    glassGeometry,
    windows,
    dispose() {
      for (const o of owned) o.dispose();
      owned.length = 0;
    },
  };
}
