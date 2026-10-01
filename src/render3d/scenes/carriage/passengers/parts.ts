// Build-time geometry helpers. A PartList collects primitive pieces (already
// transformed into the space of the pivot they belong to), bakes a per-vertex
// colour into each, and merges them into ONE non-indexed geometry with exactly
// position/normal/color attributes, so every pivot costs a single draw call.
// Allocation here is fine: it only runs once while building a figure.

import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  Euler,
  Float32BufferAttribute,
  LatheGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type V3 = readonly [number, number, number];

const Y_AXIS = new Vector3(0, 1, 0);
const Z_AXIS = new Vector3(0, 0, 1);

export function v3(p: V3): Vector3 {
  return new Vector3(p[0], p[1], p[2]);
}

/** Rotation whose local +Z points along `dir` and local +Y is as close to `up` as possible. */
export function aimQuat(dir: Vector3, up: Vector3, out = new Quaternion()): Quaternion {
  const z = dir.clone().normalize();
  const y = up.clone().addScaledVector(z, -up.dot(z));
  if (y.lengthSq() < 1e-8) y.set(1, 0, 0).addScaledVector(z, -z.x);
  y.normalize();
  const x = new Vector3().crossVectors(y, z).normalize();
  return out.setFromRotationMatrix(new Matrix4().makeBasis(x, y, z));
}

function normalise(src: BufferGeometry, color: Color): BufferGeometry {
  const geo = src.index ? src.toNonIndexed() : src;
  if (geo !== src) src.dispose();
  for (const name of Object.keys(geo.attributes)) {
    if (name !== 'position' && name !== 'normal') geo.deleteAttribute(name);
  }
  geo.morphAttributes = {};
  geo.clearGroups();
  const n = geo.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = color.r;
    arr[i * 3 + 1] = color.g;
    arr[i * 3 + 2] = color.b;
  }
  geo.setAttribute('color', new Float32BufferAttribute(arr, 3));
  return geo;
}

export class PartList {
  private readonly parts: BufferGeometry[] = [];

  /** Add an arbitrary geometry (consumed) transformed by `m`. */
  add(geo: BufferGeometry, color: Color, m?: Matrix4): this {
    if (m) geo.applyMatrix4(m);
    this.parts.push(normalise(geo, color));
    return this;
  }

  /** Capsule from a to b (end-cap centres) with radius r. */
  capsule(a: V3, b: V3, r: number, color: Color, radial = 8, cap = 4): this {
    const va = v3(a);
    const vb = v3(b);
    const d = vb.clone().sub(va);
    const len = Math.max(1e-4, d.length());
    const g = new CapsuleGeometry(r, len, cap, radial);
    const q = new Quaternion().setFromUnitVectors(Y_AXIS, d.normalize());
    const mid = va.add(vb).multiplyScalar(0.5);
    return this.add(g, color, new Matrix4().compose(mid, q, new Vector3(1, 1, 1)));
  }

  /** Tapered cylinder from a (radius ra) to b (radius rb). */
  cylinder(a: V3, b: V3, ra: number, rb: number, color: Color, radial = 8, open = false): this {
    const va = v3(a);
    const vb = v3(b);
    const d = vb.clone().sub(va);
    const len = Math.max(1e-4, d.length());
    // CylinderGeometry: radiusTop at +Y, so align +Y with a->b and put rb on top.
    const g = new CylinderGeometry(rb, ra, len, radial, 1, open);
    const q = new Quaternion().setFromUnitVectors(Y_AXIS, d.normalize());
    const mid = va.add(vb).multiplyScalar(0.5);
    return this.add(g, color, new Matrix4().compose(mid, q, new Vector3(1, 1, 1)));
  }

  /** Ellipsoid with radii (rx, ry, rz); optionally aimed (local +Z along dir, +Y towards up). */
  ellipsoid(c: V3, radii: V3, color: Color, dir?: V3, up: V3 = [0, 1, 0], w = 10, h = 7): this {
    const g = new SphereGeometry(1, w, h);
    const q = dir ? aimQuat(v3(dir), v3(up)) : new Quaternion();
    return this.add(g, color, new Matrix4().compose(v3(c), q, v3(radii)));
  }

  sphere(c: V3, r: number, color: Color, w = 10, h = 7): this {
    return this.ellipsoid(c, [r, r, r], color, undefined, [0, 1, 0], w, h);
  }

  /** Box centred at c; euler rotation (XYZ) optional. */
  box(c: V3, size: V3, color: Color, rot?: V3): this {
    const g = new BoxGeometry(size[0], size[1], size[2]);
    const q = rot ? new Quaternion().setFromEuler(new Euler(rot[0], rot[1], rot[2])) : new Quaternion();
    return this.add(g, color, new Matrix4().compose(v3(c), q, new Vector3(1, 1, 1)));
  }

  /** Box centred at c, local +Z aimed along dir with +Y towards up. */
  aimedBox(c: V3, size: V3, color: Color, dir: V3, up: V3 = [0, 1, 0]): this {
    const g = new BoxGeometry(size[0], size[1], size[2]);
    const q = aimQuat(v3(dir), v3(up));
    return this.add(g, color, new Matrix4().compose(v3(c), q, new Vector3(1, 1, 1)));
  }

  /** Lathe around +Y from (radius, y) profile points (bottom to top), then scaled/placed. */
  lathe(profile: readonly (readonly [number, number])[], color: Color, segments: number, m?: Matrix4): this {
    const pts = profile.map(([r, y]) => new Vector2(r, y));
    return this.add(new LatheGeometry(pts, segments), color, m);
  }

  /** Torus in its local XY plane (arc from +X through +Y), placed by matrix. */
  torus(radius: number, tube: number, color: Color, m: Matrix4, arc = Math.PI * 2, radial = 5, tubular = 12): this {
    return this.add(new TorusGeometry(radius, tube, radial, tubular, arc), color, m);
  }

  /** Move every part of `other` into this list, transformed by `m`. */
  absorb(other: PartList, m?: Matrix4): this {
    for (const g of other.parts) {
      if (m) g.applyMatrix4(m);
      this.parts.push(g);
    }
    other.parts.length = 0;
    return this;
  }

  get empty(): boolean {
    return this.parts.length === 0;
  }

  /** Merge everything into one geometry; the source parts are disposed. */
  build(): BufferGeometry {
    const merged = mergeGeometries(this.parts, false);
    for (const p of this.parts) p.dispose();
    this.parts.length = 0;
    if (!merged) throw new Error('passengers: mergeGeometries failed');
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    return merged;
  }
}

/** Matrix helper: translate + euler(XYZ) + scale. */
export function trs(p: V3, rx = 0, ry = 0, rz = 0, s: V3 = [1, 1, 1]): Matrix4 {
  const q = new Quaternion().setFromEuler(new Euler(rx, ry, rz));
  return new Matrix4().compose(v3(p), q, v3(s));
}

/** Simple 2-bone solve: elbow position for shoulder s, hand h, segment lengths, bend hint. */
export function solveElbow(s: V3, h: V3, l1: number, l2: number, hint: V3): V3 {
  const S = v3(s);
  const H = v3(h);
  const d = H.clone().sub(S);
  let dist = d.length();
  const dir = d.normalize();
  dist = Math.min(dist, (l1 + l2) * 0.999);
  const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist);
  const hgt = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const hv = v3(hint);
  const perp = hv.addScaledVector(dir, -hv.dot(dir));
  if (perp.lengthSq() < 1e-8) perp.copy(Z_AXIS).addScaledVector(dir, -dir.z);
  perp.normalize();
  const e = S.addScaledVector(dir, a).addScaledVector(perp, hgt);
  return [e.x, e.y, e.z];
}

export function lerp3(a: V3, b: V3, t: number): V3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
