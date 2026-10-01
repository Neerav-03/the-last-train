// Shared figure-building kit: owns every geometry/material a figure creates,
// provides seeded colour jitter, pivot/mesh helpers and common body parts.
//
// Figure-local space (before placement): origin at the cushion top under the
// hip, +Y up, +Z = the direction the person faces, +X = the person's LEFT.

import { Box3, Color, Group, Mesh } from 'three';
import type { BufferGeometry, Material, MeshStandardMaterial, Object3D } from 'three';
import { SEAT_HEIGHT, seatPosition } from '../layout';
import { PartList, trs, v3 } from './parts';
import type { V3 } from './parts';
import { createRimMaterial, createRimUniforms } from './rimMaterial';
import type { RimUniforms } from './rimMaterial';
import type { PassengerFigure, PassengerPlacement } from './types';

/** Floor height in figure-local space. */
export const FLOOR = -SEAT_HEIGHT;

export interface FigureInfo {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly placement: PassengerPlacement;
  /** Local X sign pointing at the window wall. */
  readonly windowX: 1 | -1;
  /** Local X sign pointing at the aisle. */
  readonly aisleX: 1 | -1;
}

export function figureInfo(id: string, name: string, label: string, placement: PassengerPlacement): FigureInfo {
  const w = (placement.side * placement.facing) as 1 | -1;
  return { id, name, label, placement, windowX: w, aisleX: (-w) as 1 | -1 };
}

export class FigureKit {
  readonly root = new Group();
  readonly rim: RimUniforms = createRimUniforms();
  readonly body: MeshStandardMaterial;
  readonly rng: () => number;
  private readonly geometries: BufferGeometry[] = [];
  private readonly materials: Material[] = [];

  constructor(rng: () => number) {
    this.rng = rng;
    this.body = createRimMaterial(this.rim);
    this.materials.push(this.body);
  }

  /** sRGB hex -> linear Color with a small seeded HSL jitter. */
  color(hex: number, jitter = 1): Color {
    const r = this.rng;
    return new Color(hex).offsetHSL(
      (r() - 0.5) * 0.014 * jitter,
      (r() - 0.5) * 0.05 * jitter,
      (r() - 0.5) * 0.025 * jitter,
    );
  }

  group(parent: Object3D, p: V3 = [0, 0, 0], rx = 0, ry = 0, rz = 0): Group {
    const g = new Group();
    g.position.set(p[0], p[1], p[2]);
    g.rotation.set(rx, ry, rz);
    parent.add(g);
    return g;
  }

  mesh(parts: PartList, parent: Object3D, material: Material = this.body): Mesh {
    const geo = parts.build();
    this.geometries.push(geo);
    const m = new Mesh(geo, material);
    m.castShadow = false;
    m.receiveShadow = false;
    m.matrixAutoUpdate = false;
    parent.add(m);
    return m;
  }

  track<T extends Material>(m: T): T {
    this.materials.push(m);
    return m;
  }

  /** Root-space point -> local space of `node`. Only valid during build (root at identity). */
  toLocal(node: Object3D, p: V3): V3 {
    this.root.updateMatrixWorld(true);
    const v = node.worldToLocal(v3(p));
    return [v.x, v.y, v.z];
  }

  setHighlight(amount: number): void {
    this.rim.uRim.value = amount <= 0 ? 0 : amount >= 1 ? 1 : amount;
  }

  /** Move the finished figure into world space and compute its picking box. */
  place(p: PassengerPlacement): Box3 {
    const pos = seatPosition(p.bay, p.side, p.facing, p.seatIndex);
    this.root.position.set(pos.x, SEAT_HEIGHT, pos.z);
    this.root.rotation.set(0, p.facing === 1 ? 0 : Math.PI, 0);
    this.root.updateMatrixWorld(true);
    return new Box3().setFromObject(this.root).expandByScalar(0.03);
  }

  dispose(): void {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
    this.geometries.length = 0;
    this.materials.length = 0;
    this.root.removeFromParent();
    this.root.clear();
  }
}

/** Assemble the public figure object. */
export function makeFigure<E extends object>(
  kit: FigureKit,
  info: FigureInfo,
  update: (dt: number, time: number) => void,
  extras: E,
): PassengerFigure & E {
  const hitBox = kit.place(info.placement);
  const base: PassengerFigure = {
    id: info.id,
    name: info.name,
    label: info.label,
    root: kit.root,
    hitBox,
    setHighlight: (a: number) => kit.setHighlight(a),
    update,
    dispose: () => kit.dispose(),
  };
  return Object.assign(base, extras);
}

// ---------------------------------------------------------------- body parts

export interface TorsoShape {
  /** Shoulder line height above the torso pivot (hip joint). */
  height: number;
  hipR: number;
  waistR: number;
  chestR: number;
  shoulderR: number;
  neckR: number;
  /** Z squash of the lathe (torso is shallower than wide). */
  depth: number;
  /** How far the lathe reaches below the pivot (down to the cushion). */
  bottom?: number;
}

/** Torso lathe in torso-pivot space (pivot at hip-joint height). */
export function addTorso(p: PartList, c: Color, s: TorsoShape, segments = 10, zOffset = 0): void {
  const b = s.bottom ?? 0.1;
  const h = s.height;
  p.lathe(
    [
      [0, -b],
      [s.hipR * 0.82, -b + 0.006],
      [s.hipR, -b * 0.35],
      [s.waistR, h * 0.34],
      [s.chestR, h * 0.66],
      [s.shoulderR, h - 0.035],
      [s.shoulderR * 0.8, h + 0.02],
      [s.neckR * 1.2, h + 0.055],
      [s.neckR, h + 0.07],
      [0, h + 0.072],
    ],
    c,
    segments,
    trs([0, 0, zOffset], 0, 0, 0, [1, 1, s.depth]),
  );
}

/** Head centre relative to the neck pivot. */
export const HEAD_C: V3 = [0, 0.135, 0.012];
export const HEAD_R = 0.1;

/** Neck + skull + nose + ears in neck-pivot space. */
export function addHead(p: PartList, skin: Color, r = HEAD_R): void {
  p.capsule([0, -0.03, -0.005], [0, 0.07, 0.008], 0.042, skin, 8, 2);
  p.ellipsoid(HEAD_C, [r * 0.88, r * 1.1, r * 0.98], skin, undefined, [0, 1, 0], 12, 9);
  // Jaw: slightly narrower, pushes the face forward so the facing reads.
  p.ellipsoid([0, HEAD_C[1] - 0.045, HEAD_C[2] + 0.025], [r * 0.66, r * 0.55, r * 0.72], skin, undefined, [0, 1, 0], 8, 6);
  p.ellipsoid([0, HEAD_C[1] - 0.005, HEAD_C[2] + r * 0.97], [0.015, 0.026, 0.02], skin, undefined, [0, 1, 0], 6, 4);
  p.ellipsoid([r * 0.86, HEAD_C[1] - 0.005, HEAD_C[2] - 0.01], [0.012, 0.028, 0.02], skin, undefined, [0, 1, 0], 6, 4);
  p.ellipsoid([-r * 0.86, HEAD_C[1] - 0.005, HEAD_C[2] - 0.01], [0.012, 0.028, 0.02], skin, undefined, [0, 1, 0], 6, 4);
}

export function addLeg(p: PartList, hip: V3, knee: V3, ankle: V3, thighR: number, shinR: number, thighC: Color, shinC: Color): void {
  p.capsule(hip, knee, thighR, thighC, 8, 3);
  p.capsule(knee, ankle, shinR, shinC, 8, 3);
}

/** Shoe on the floor under `ankle`, toes along dir (xz). Coordinates in the space `p` is built in. */
export function addShoe(p: PartList, ankle: V3, c: Color, dir: V3 = [0, 0, 1], floorY = FLOOR, size: V3 = [0.095, 0.075, 0.25]): void {
  const len = Math.hypot(dir[0], dir[2]) || 1;
  const dx = dir[0] / len;
  const dz = dir[2] / len;
  const fwd = 0.065;
  p.aimedBox([ankle[0] + dx * fwd, floorY + size[1] / 2, ankle[2] + dz * fwd], size, c, [dx, 0, dz]);
}

/** Static arm: shoulder cap, upper arm, forearm, flattened hand. */
export function addArm(
  p: PartList,
  shoulder: V3,
  elbow: V3,
  hand: V3,
  sleeve: Color,
  skin: Color,
  opts: { rU?: number; rF?: number; handUp?: V3; handDir?: V3; capR?: number } = {},
): void {
  const rU = opts.rU ?? 0.047;
  const rF = opts.rF ?? 0.041;
  p.sphere(shoulder, opts.capR ?? rU * 1.3, sleeve, 8, 6);
  p.capsule(shoulder, elbow, rU, sleeve, 8, 3);
  const dx = hand[0] - elbow[0];
  const dy = hand[1] - elbow[1];
  const dz = hand[2] - elbow[2];
  const l = Math.hypot(dx, dy, dz) || 1;
  const wrist: V3 = [hand[0] - (dx / l) * 0.06, hand[1] - (dy / l) * 0.06, hand[2] - (dz / l) * 0.06];
  p.capsule(elbow, wrist, rF, sleeve, 8, 3);
  addHand(p, hand, skin, opts.handDir ?? [dx, dy, dz], opts.handUp ?? [0, 1, 0]);
}

export function addHand(p: PartList, c: V3, skin: Color, dir: V3, up: V3 = [0, 1, 0]): void {
  p.ellipsoid(c, [0.037, 0.019, 0.055], skin, dir, up, 8, 5);
}

// ---------------------------------------------------------------- animation

export function smooth01(x: number): number {
  const t = x <= 0 ? 0 : x >= 1 ? 1 : x;
  return t * t * (3 - 2 * t);
}

/** 0 -> 1 over `rise`, hold, 1 -> 0 over `fall`, all smoothstepped. */
export function envelope(t: number, rise: number, hold: number, fall: number): number {
  if (t <= 0) return 0;
  if (t < rise) return smooth01(t / rise);
  if (t < rise + hold) return 1;
  return 1 - smooth01((t - rise - hold) / fall);
}

/** Breathing via torso-group scale (mostly chest depth + shoulder rise). */
export function breathe(g: Object3D, b: number, amp: number): void {
  g.scale.set(1 + amp * 0.6 * b, 1 + amp * b, 1 + amp * 1.3 * b);
}

/** Asymmetric breath curve in [-1, 1]: slower exhale than inhale. */
export function breathCurve(phase: number): number {
  const s = Math.sin(phase);
  return s + 0.18 * Math.sin(phase * 2 + 0.6);
}
