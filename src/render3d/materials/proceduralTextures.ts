// CPU-generated, tileable procedural textures (no image files). Each builder
// returns DataTextures ready for MeshStandardMaterial. Generated once at scene
// build; a 256² set costs a few milliseconds.

import {
  ClampToEdgeWrapping,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NoColorSpace,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
} from 'three';
import type { ColorSpace } from 'three';

// ---------------------------------------------------------------- noise ----

/** Seeded hash -> [0,1). Integer lattice, period `p` for tiling. */
function lattice(ix: number, iy: number, p: number, seed: number): number {
  const x = ((ix % p) + p) % p;
  const y = ((iy % p) + p) % p;
  let h = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Tileable value noise; u,v in [0,1), `freq` integer cells across the tile. */
export function valueNoise(u: number, v: number, freq: number, seed: number): number {
  const x = u * freq;
  const y = v * freq;
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = lattice(ix, iy, freq, seed);
  const b = lattice(ix + 1, iy, freq, seed);
  const c = lattice(ix, iy + 1, freq, seed);
  const d = lattice(ix + 1, iy + 1, freq, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

export function fbm(u: number, v: number, baseFreq: number, octaves: number, seed: number): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let f = baseFreq;
  for (let o = 0; o < octaves; o++) {
    sum += valueNoise(u, v, f, seed + o * 17) * amp;
    norm += amp;
    amp *= 0.5;
    f *= 2;
  }
  return sum / norm;
}

// ------------------------------------------------------------- helpers ----

function makeTexture(data: Uint8Array, size: number, colorSpace: ColorSpace): DataTexture {
  const tex = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 4;
  tex.colorSpace = colorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Height field (0..1) -> tangent-space normal map, wrapping at the edges. */
function heightToNormal(height: Float32Array, size: number, strength: number): Uint8Array {
  const out = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const l = height[y * size + ((x - 1 + size) % size)];
      const r = height[y * size + ((x + 1) % size)];
      const d = height[((y - 1 + size) % size) * size + x];
      const u = height[((y + 1) % size) * size + x];
      let nx = (l - r) * strength;
      let ny = (d - u) * strength;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len;
      ny /= len;
      nz /= len;
      const i = (y * size + x) * 4;
      out[i] = (nx * 0.5 + 0.5) * 255;
      out[i + 1] = (ny * 0.5 + 0.5) * 255;
      out[i + 2] = (nz * 0.5 + 0.5) * 255;
      out[i + 3] = 255;
    }
  }
  return out;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export interface PbrTextureSet {
  map: DataTexture;
  normalMap: DataTexture;
  roughnessMap: DataTexture;
  dispose(): void;
}

function pbrSet(map: Uint8Array, height: Float32Array, rough: Uint8Array, size: number, normalStrength: number): PbrTextureSet {
  const set = {
    map: makeTexture(map, size, SRGBColorSpace),
    normalMap: makeTexture(heightToNormal(height, size, normalStrength), size, NoColorSpace),
    roughnessMap: makeTexture(rough, size, NoColorSpace),
    dispose() {
      set.map.dispose();
      set.normalMap.dispose();
      set.roughnessMap.dispose();
    },
  };
  return set;
}

// ---------------------------------------------------------- upholstery ----

/**
 * Transit moquette: deep teal-blue wool with a faded ochre/oxblood dash
 * pattern, a fine twill weave in the normal map and fuzzy pile roughness.
 * One tile covers roughly one seat (UV 0..1 across the cushion).
 */
export function createUpholsteryTextures(seed: number, size = 256): PbrTextureSet {
  const map = new Uint8Array(size * size * 4);
  const rough = new Uint8Array(size * size * 4);
  const height = new Float32Array(size * size);
  const motifs = 4; // motif repeats across the tile
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      // Twill weave: diagonal ribs + fine thread noise.
      const rib = 0.5 + 0.5 * Math.sin((x + y) * Math.PI * 0.5);
      const thread = valueNoise(u, v, 128, seed);
      const pile = fbm(u, v, 16, 3, seed + 3);
      // Motif: staggered short dashes and small diamonds.
      const mu = (u * motifs) % 1;
      const mvRow = v * motifs * 2;
      const row = Math.floor(mvRow);
      const mv = mvRow % 1;
      const su = (mu + (row % 2) * 0.5) % 1;
      const dash = Math.abs(su - 0.5) < 0.22 && Math.abs(mv - 0.5) < 0.09 ? 1 : 0;
      const dx = Math.abs(((u * motifs + 0.25) % 1) - 0.5);
      const dy = Math.abs(((v * motifs * 2 + 0.5) % 1) - 0.5);
      const diamond = dx + dy * 0.5 < 0.07 ? 1 : 0;
      const fade = 0.55 + 0.45 * fbm(u, v, 4, 3, seed + 9);
      const wear = fbm(u, v, 3, 4, seed + 21);

      // Base: deep blue-teal.
      let r = 0.07 + 0.03 * pile;
      let g = 0.14 + 0.05 * pile;
      let b = 0.18 + 0.05 * pile;
      if (dash) {
        r = r * (1 - fade) + 0.42 * fade;
        g = g * (1 - fade) + 0.3 * fade;
        b = b * (1 - fade) + 0.12 * fade;
      } else if (diamond) {
        r = r * (1 - fade) + 0.34 * fade;
        g = g * (1 - fade) + 0.09 * fade;
        b = b * (1 - fade) + 0.09 * fade;
      }
      // Shiny-worn patches (polished pile) lighten and flatten.
      const shine = clamp01((wear - 0.55) * 3);
      const tone = (0.86 + 0.14 * thread) * (0.92 + 0.08 * rib) * (1 + shine * 0.25);
      const i = (y * size + x) * 4;
      map[i] = clamp01(r * tone) * 255;
      map[i + 1] = clamp01(g * tone) * 255;
      map[i + 2] = clamp01(b * tone) * 255;
      map[i + 3] = 255;
      height[y * size + x] = rib * 0.35 + thread * 0.35 + pile * 0.3 - (dash || diamond ? 0.08 : 0) - shine * 0.2;
      const rr = clamp01(0.92 - shine * 0.3 - thread * 0.05) * 255;
      rough[i] = rr;
      rough[i + 1] = rr;
      rough[i + 2] = rr;
      rough[i + 3] = 255;
    }
  }
  return pbrSet(map, height, rough, size, 2.2);
}

// --------------------------------------------------------------- floor ----

/**
 * Studded rubber floor, scuffed and grimy. Tile = 1 m², studs every 12.5 cm.
 * The aisle wear path is done with vertex colours (it is not tileable).
 */
export function createFloorTextures(seed: number, size = 256): PbrTextureSet {
  const map = new Uint8Array(size * size * 4);
  const rough = new Uint8Array(size * size * 4);
  const height = new Float32Array(size * size);
  const studs = 8;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const cu = (u * studs) % 1 - 0.5;
      const cv = (v * studs) % 1 - 0.5;
      const d = Math.sqrt(cu * cu + cv * cv);
      const stud = clamp01((0.24 - d) * 18);
      const grime = fbm(u, v, 4, 5, seed);
      const scuff = valueNoise(u * 3.0, v * 0.6, 64, seed + 5);
      const stain = clamp01((fbm(u, v, 2, 4, seed + 11) - 0.58) * 4);
      const base = 0.075 + 0.04 * grime - stain * 0.035;
      const studTop = stud * 0.02 * (0.6 + scuff);
      const i = (y * size + x) * 4;
      map[i] = clamp01(base + studTop + 0.008) * 255;
      map[i + 1] = clamp01(base + studTop + 0.004) * 255;
      map[i + 2] = clamp01(base + studTop) * 255;
      map[i + 3] = 255;
      height[y * size + x] = stud * 0.8 + grime * 0.15;
      const r = clamp01(0.82 - stud * 0.22 * scuff - stain * 0.35 + grime * 0.1) * 255;
      rough[i] = r;
      rough[i + 1] = r;
      rough[i + 2] = r;
      rough[i + 3] = 255;
    }
  }
  return pbrSet(map, height, rough, size, 3.0);
}

// ---------------------------------------------------------- wall grime ----

/** Painted metal panel grime: soft vertical drips, speckle, fingerprints. */
export function createPaintTextures(seed: number, size = 256): PbrTextureSet {
  const map = new Uint8Array(size * size * 4);
  const rough = new Uint8Array(size * size * 4);
  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const drip = valueNoise(u, v * 0.08, 48, seed) * fbm(u, v, 3, 3, seed + 2);
      const speck = valueNoise(u, v, 128, seed + 7);
      const mottle = fbm(u, v, 6, 4, seed + 13);
      const g = clamp01(0.78 + mottle * 0.18 - drip * 0.22 - (speck > 0.93 ? 0.2 : 0));
      const i = (y * size + x) * 4;
      map[i] = g * 255;
      map[i + 1] = g * 255;
      map[i + 2] = g * 255;
      map[i + 3] = 255;
      height[y * size + x] = mottle * 0.3 + speck * 0.05;
      const r = clamp01(0.55 + mottle * 0.25 + drip * 0.2) * 255;
      rough[i] = r;
      rough[i + 1] = r;
      rough[i + 2] = r;
      rough[i + 3] = 255;
    }
  }
  return pbrSet(map, height, rough, size, 0.6);
}

// ------------------------------------------------------- light pool ----

/** Soft radial falloff (white on black) for additive light-pool decals. */
export function createRadialTexture(size = 128): DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5) / size - 0.5;
      const dy = (y + 0.5) / size - 0.5;
      // Elongated along v: tubes are long, so pools are oval.
      const d = Math.sqrt(dx * dx * 4 + dy * dy * 4);
      const f = clamp01(1 - d);
      const val = f * f * (3 - 2 * f);
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = val * 255;
      data[i + 3] = 255;
    }
  }
  const tex = makeTexture(data, size, NoColorSpace);
  tex.wrapS = tex.wrapT = ClampToEdgeWrapping;
  return tex;
}
