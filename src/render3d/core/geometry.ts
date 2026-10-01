// Geometry utilities for building merged, vertex-baked static meshes.
//
// GeometryBatch collects primitives with transforms and per-part tint, then
// merges them into ONE BufferGeometry (one draw call per material). Vertex
// colours carry tint x baked ambient occlusion, a cheap stand-in for shadow
// maps and SSAO.

import { BufferAttribute, BufferGeometry, Color, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const _m = new Matrix4();
const _q = new Quaternion();
const _e = new Euler();
const _s = new Vector3();
const _p = new Vector3();

export interface PartTransform {
  position?: readonly [number, number, number];
  rotation?: readonly [number, number, number];
  scale?: readonly [number, number, number];
}

/** Normalises a geometry to non-indexed position/normal/uv so any mix merges. */
export function normaliseForMerge(geo: BufferGeometry): BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo;
  if (g !== geo) geo.dispose();
  for (const name of Object.keys(g.attributes)) {
    if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
  }
  if (!g.attributes.normal) g.computeVertexNormals();
  if (!g.attributes.uv) {
    g.setAttribute('uv', new BufferAttribute(new Float32Array((g.attributes.position.count) * 2), 2));
  }
  g.morphAttributes = {};
  return g;
}

export function applyTransform(geo: BufferGeometry, t: PartTransform): BufferGeometry {
  const r = t.rotation ?? [0, 0, 0];
  _e.set(r[0], r[1], r[2], 'YXZ');
  _q.setFromEuler(_e);
  const s = t.scale ?? [1, 1, 1];
  _s.set(s[0], s[1], s[2]);
  const p = t.position ?? [0, 0, 0];
  _p.set(p[0], p[1], p[2]);
  _m.compose(_p, _q, _s);
  geo.applyMatrix4(_m);
  return geo;
}

/** Writes a vec3 `color` attribute: tint (per part) x ao(world position, normal). */
export type AOFunction = (x: number, y: number, z: number, nx: number, ny: number, nz: number) => number;

export class GeometryBatch {
  private readonly parts: BufferGeometry[] = [];

  /** Adds a primitive. The geometry is consumed (transformed + normalised). */
  add(geo: BufferGeometry, t: PartTransform = {}, tint: Color | number = 0xffffff): this {
    const g = normaliseForMerge(applyTransform(geo, t));
    const c = typeof tint === 'number' ? new Color(tint) : tint;
    const count = g.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new BufferAttribute(colors, 3));
    this.parts.push(g);
    return this;
  }

  get isEmpty(): boolean {
    return this.parts.length === 0;
  }

  /** Merges every part; optional AO bake multiplies into the tint colours. */
  build(ao?: AOFunction): BufferGeometry {
    const merged = mergeGeometries(this.parts, false);
    for (const p of this.parts) p.dispose();
    this.parts.length = 0;
    if (!merged) throw new Error('GeometryBatch: merge failed (attribute mismatch)');
    if (ao) bakeAO(merged, ao);
    merged.computeBoundingSphere();
    merged.computeBoundingBox();
    return merged;
  }
}

export function bakeAO(geo: BufferGeometry, ao: AOFunction): void {
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  let col = geo.attributes.color as BufferAttribute | undefined;
  if (!col) {
    col = new BufferAttribute(new Float32Array(pos.count * 3).fill(1), 3);
    geo.setAttribute('color', col);
  }
  for (let i = 0; i < pos.count; i++) {
    const k = ao(pos.getX(i), pos.getY(i), pos.getZ(i), nor.getX(i), nor.getY(i), nor.getZ(i));
    col.setXYZ(i, col.getX(i) * k, col.getY(i) * k, col.getZ(i) * k);
  }
  col.needsUpdate = true;
}

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Box-projected UVs from (world) positions: picks the dominant normal axis per
 * vertex, so tiled textures keep a constant texel density across a merged
 * shell with no seams worth noticing at this scale.
 */
export function boxProjectUV(geo: BufferGeometry, metresPerTile: number): BufferGeometry {
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = geo.attributes.uv;
  const k = 1 / metresPerTile;
  for (let i = 0; i < pos.count; i++) {
    const ax = Math.abs(nor.getX(i));
    const ay = Math.abs(nor.getY(i));
    const az = Math.abs(nor.getZ(i));
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (ay >= ax && ay >= az) uv.setXY(i, x * k, z * k);
    else if (ax >= az) uv.setXY(i, z * k, y * k);
    else uv.setXY(i, x * k, y * k);
  }
  uv.needsUpdate = true;
  return geo;
}

/** Remaps uv of a geometry by a world-ish scale (for tiling textures on boxes). */
export function scaleUV(geo: BufferGeometry, su: number, sv: number): BufferGeometry {
  const uv = geo.attributes.uv;
  if (!uv) return geo;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  uv.needsUpdate = true;
  return geo;
}
