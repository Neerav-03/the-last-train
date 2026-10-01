// Carriage window glass: one ShaderMaterial for every pane (one draw call).
//
// Layers, back to front:
//  1. The void outside: two parallax planes of passing lights (tunnel lamps
//     close by, sparse sodium/white lights far away) found by intersecting
//     the real view ray with virtual planes beyond the glass, so parallax is
//     correct as the camera moves. Lights are stretched along the direction
//     of travel (motion blur).
//  2. An occasional sodium lamp sweeping past (driven by the scene).
//  3. Rain: static beads + diagonal running drops with trails; drops refract
//     the outside (offset the ray) and catch a cold specular glint.
//  4. Condensation fogging the bottom edge, with drip channels cut through.
//  5. A faint fresnel reflection of the interior, including the ceiling tube
//     strip found by reflecting the view ray onto the ceiling plane.

import { Color, ShaderMaterial, UniformsLib, UniformsUtils, Vector4 } from 'three';
import type { IUniform } from 'three';

export const MAX_REFLECTED_TUBES = 8;

export interface WindowMaterialOptions {
  /** Ceiling height and half-width of the carriage (for the fake reflection). */
  ceilingY: number;
  halfWidth: number;
  /** Tube z positions reflected in the glass (<= MAX_REFLECTED_TUBES). */
  tubeZ: readonly number[];
  /** Window pane grid: pane index = floor((z - paneOriginZ) / paneSpacing). */
  paneOriginZ: number;
  paneSpacing: number;
  /** Bottom/top of the glass in world y, for condensation and bead density. */
  glassBottom: number;
  glassTop: number;
}

export interface WindowMaterialHandle {
  readonly material: ShaderMaterial;
  /** Per-frame: time (s), outside scroll speed (m/s). */
  setTime(time: number, speed: number): void;
  /** Sodium lamp: world z, intensity 0..1, side (-1 | 1). */
  setSodium(z: number, intensity: number, side: number): void;
  /** Live tube brightness (0..~1.2) for the reflected strip, same order as tubeZ. */
  setTubeIntensity(index: number, value: number): void;
  setInteriorTint(color: Color): void;
  /** Detail level: 1 = all rain layers, 0 = beads only. */
  setDetail(level: number): void;
  dispose(): void;
}

interface WindowUniforms {
  [name: string]: IUniform;
  uTime: IUniform<number>;
  uSpeed: IUniform<number>;
  uSodium: IUniform<Vector4>;
  uTubeZ: IUniform<number[]>;
  uTubeI: IUniform<number[]>;
  uInterior: IUniform<Color>;
  uGeom: IUniform<Vector4>;
  uPane: IUniform<Vector4>;
  uDetail: IUniform<number>;
}

const vertexShader = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mvPosition = viewMatrix * wp;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>

  uniform float uTime;
  uniform float uSpeed;
  uniform vec4 uSodium;      // z, intensity, side, unused
  uniform float uTubeZ[${MAX_REFLECTED_TUBES}];
  uniform float uTubeI[${MAX_REFLECTED_TUBES}];
  uniform vec3 uInterior;
  uniform vec4 uGeom;        // ceilingY, halfWidth, glassBottom, glassTop
  uniform vec4 uPane;        // originZ, spacing, unused, unused
  uniform float uDetail;

  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  float h11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
  float h21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  vec2 h22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }

  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  // One layer of passing lights on a virtual plane at distance 'dist' beyond the glass.
  // Returns radiance. 'side' is the wall side (+1 right, -1 left).
  vec3 lightLayer(vec3 ro, vec3 rd, float side, float dist, float cell, float density,
                  float yMin, float yMax, float speedK, float blur, float seed) {
    float planeX = side * (uGeom.y + dist);
    if (rd.x * side <= 0.0001) return vec3(0.0);
    float t = (planeX - ro.x) / rd.x;
    vec3 hit = ro + rd * t;
    float z = hit.z + uTime * uSpeed * speedK; // world scrolls towards +z relative to us
    float id = floor(z / cell);
    float local = z - id * cell;
    vec3 col = vec3(0.0);
    for (int k = 0; k < 2; k++) {
      float cid = id + float(k) - 0.5;
      float cz = local - (float(k) - 0.5) * cell;
      float r = h11(cid * 1.37 + seed);
      if (r > density) continue;
      float ly = mix(yMin, yMax, h11(cid * 7.13 + seed * 3.1));
      float lz = cell * (0.2 + 0.6 * h11(cid * 3.71 + seed));
      float dz = cz - lz;
      float dy = hit.y - ly;
      // Motion-blurred streak: long along z, thin in y.
      float streak = exp(-dy * dy / (0.0016 + 0.0002 * dist)) * exp(-dz * dz / (blur * blur));
      float core = exp(-dy * dy / 0.0004) * exp(-dz * dz / (blur * blur * 0.15));
      float kind = h11(cid * 11.7 + seed);
      vec3 c = kind < 0.55 ? vec3(1.0, 0.52, 0.16) : (kind < 0.9 ? vec3(0.75, 0.86, 1.0) : vec3(1.0, 0.12, 0.08));
      col += c * (streak * 0.9 + core * 2.5);
    }
    return col * exp(-dist * 0.035);
  }

  void main() {
    vec3 ro = cameraPosition;
    vec3 toFrag = vWorldPos - ro;
    float viewDist = length(toFrag);
    vec3 rd = toFrag / viewDist;
    float side = vWorldPos.x > 0.0 ? 1.0 : -1.0;
    vec3 N = normalize(vWorldNormal);
    if (dot(N, rd) > 0.0) N = -N;

    // Pane-local coordinates (metres): along-z and height.
    float paneId = floor((vWorldPos.z - uPane.x) / uPane.y);
    float paneSeed = h11(paneId * 3.17 + side * 11.0);
    vec2 p = vec2(vWorldPos.z, vWorldPos.y);
    float hNorm = clamp((vWorldPos.y - uGeom.z) / (uGeom.w - uGeom.z), 0.0, 1.0);

    // ---------------------------------------------------------- rain ----
    vec2 refr = vec2(0.0);
    float wet = 0.0;
    float glint = 0.0;
    // Static beads.
    {
      vec2 g = p * vec2(34.0, 34.0) + paneSeed * 17.0;
      vec2 id = floor(g);
      vec2 f = fract(g) - 0.5;
      vec2 rnd = h22(id);
      float present = step(0.48, h21(id + 7.0));
      vec2 o = (rnd - 0.5) * 0.55;
      float r = mix(0.1, 0.3, h21(id + 3.0)) * present;
      vec2 d = f - o;
      float dl = length(d * vec2(1.0, 1.15));
      float drop = smoothstep(r, r * 0.55, dl);
      refr += d / max(r, 0.001) * drop * 0.05;
      wet = max(wet, drop);
      glint += smoothstep(r * 0.35, 0.0, length(d - vec2(-0.25, 0.3) * r)) * present;
    }
    // Running drops: blown diagonally backwards (+z) and down.
    if (uDetail > 0.5) {
      vec2 q = vec2(p.x - p.y * 0.9, p.y);       // skew: columns lean with the wind
      float colW = 0.045;
      float cIdx = floor(q.x / colW);
      float cx = (fract(q.x / colW) - 0.5) * colW;
      float cr = h11(cIdx * 1.91 + paneSeed * 9.0);
      if (cr < 0.45) {
        float spd = mix(0.35, 0.9, h11(cIdx * 5.3));
        float period = mix(1.1, 2.2, h11(cIdx * 2.7));
        float head = uGeom.w - mod(uTime * spd + cr * 13.0, period) * 1.0;
        float wob = sin(q.y * 40.0 + cIdx) * 0.004;
        float dx = cx - wob;
        float above = q.y - head;
        // Head bead.
        float hb = smoothstep(0.012, 0.006, length(vec2(dx, above * 0.8)));
        // Trail: thin, fading, broken into tiny beads.
        float trail = smoothstep(0.004, 0.0015, abs(dx)) * step(0.0, above) * exp(-above * 3.5);
        trail *= 0.55 + 0.45 * step(0.5, fract(above * 55.0 + cIdx));
        float m = max(hb, trail * 0.8);
        refr += vec2(dx * 6.0, -0.04) * m;
        wet = max(wet, m);
        glint += hb * 0.8;
      }
    }

    // ------------------------------------------------------ outside ----
    vec3 rdr = normalize(rd + vec3(0.0, refr.y, refr.x) * 0.6);
    vec3 outside = vec3(0.004, 0.005, 0.008);
    // Tunnel wall: fast, faint horizontal smear to sell speed.
    {
      float planeX = side * (uGeom.y + 1.6);
      if (rdr.x * side > 0.0001) {
        float t = (planeX - ro.x) / rdr.x;
        vec3 hit = ro + rdr * t;
        float z = hit.z + uTime * uSpeed;
        float smear = vnoise(vec2(z * 0.35, hit.y * 9.0)) * vnoise(vec2(z * 0.05, hit.y * 2.0));
        outside += vec3(0.012, 0.014, 0.018) * smear;
        // Cable runs on the wall catching faint light.
        outside += vec3(0.02, 0.022, 0.026) * smoothstep(0.012, 0.0, abs(hit.y - 1.05)) * (0.6 + 0.4 * vnoise(vec2(z * 2.0, 0.0)));
      }
    }
    outside += lightLayer(ro, rdr, side, 1.4, 9.0, 0.55, 1.0, 2.1, 1.0, 1.7, 1.0) * 0.9;
    outside += lightLayer(ro, rdr, side, 26.0, 7.0, 0.35, 0.3, 2.6, 0.12, 0.35, 5.0) * 1.4;

    // Sodium lamp sweeping past on this side.
    float sodiumOn = uSodium.y * step(0.0, uSodium.z * side);
    if (sodiumOn > 0.001 && rdr.x * side > 0.0001) {
      float planeX = side * (uGeom.y + 0.9);
      float t = (planeX - ro.x) / rdr.x;
      vec3 hit = ro + rdr * t;
      float dz = hit.z - uSodium.x;
      float dy = hit.y - 2.05;
      float lamp = exp(-(dz * dz) / 0.9 - (dy * dy) / 0.02) * 6.0 + exp(-(dz * dz) / 6.0 - dy * dy / 0.6) * 0.6;
      outside += vec3(1.0, 0.45, 0.1) * lamp * sodiumOn;
    }

    // ------------------------------------------------- condensation ----
    float fogN = vnoise(p * vec2(9.0, 14.0) + paneSeed * 5.0) * 0.6 + vnoise(p * 40.0) * 0.4;
    float cond = smoothstep(0.32, 0.0, hNorm + (fogN - 0.5) * 0.18);
    // Drip channels cut through the fog.
    float channel = smoothstep(0.35, 0.5, vnoise(vec2(p.x * 24.0, 0.5))) * smoothstep(0.0, 0.05, hNorm);
    cond *= 1.0 - channel * 0.85;
    cond *= 1.0 - wet * 0.7;
    // Fog diffuses the outside and scatters interior light.
    vec3 condCol = uInterior * 0.12 + outside * 0.25;
    vec3 col = mix(outside, condCol, cond * 0.92);

    // --------------------------------------------------- reflection ----
    float cosT = clamp(abs(dot(N, rd)), 0.0, 1.0);
    float fres = 0.04 + 0.96 * pow(1.0 - cosT, 5.0);
    fres = clamp(fres * 1.6 + 0.05, 0.0, 0.6);
    vec3 R = reflect(rd, N);
    vec3 refl = uInterior * (0.05 + 0.08 * smoothstep(-0.2, 0.6, R.y));
    // Ceiling tube strip reflected in the glass.
    if (R.y > 0.0) {
      float tc = (uGeom.x - vWorldPos.y) / R.y;
      vec3 c = vWorldPos + R * tc;
      float strip = smoothstep(0.07, 0.02, abs(c.x));
      float tubes = 0.0;
      for (int i = 0; i < ${MAX_REFLECTED_TUBES}; i++) {
        float dz = abs(c.z - uTubeZ[i]);
        tubes += smoothstep(0.65, 0.5, dz) * uTubeI[i];
      }
      refl += vec3(0.75, 0.88, 1.0) * strip * tubes * 0.9 / (1.0 + tc * 0.25);
      // Opposite windows: dark bands in the reflection.
      float oppositeX = -side * uGeom.y;
      float to = (oppositeX - vWorldPos.x) / (abs(R.x) > 0.0001 ? R.x : 0.0001);
      if (to > 0.0) {
        vec3 o = vWorldPos + R * to;
        float inWin = step(uGeom.z, o.y) * step(o.y, uGeom.w);
        refl *= 1.0 - inWin * 0.5;
      }
    }
    refl *= 1.0 - wet * 0.5;
    col = mix(col, col + refl, fres * 2.0);

    // Droplets catch the cold interior light.
    col += vec3(0.6, 0.72, 0.85) * glint * 0.18;
    col += uInterior * wet * 0.03;

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export function createWindowMaterial(options: WindowMaterialOptions): WindowMaterialHandle {
  const tubeZ = new Array<number>(MAX_REFLECTED_TUBES).fill(-999);
  const tubeI = new Array<number>(MAX_REFLECTED_TUBES).fill(0);
  options.tubeZ.slice(0, MAX_REFLECTED_TUBES).forEach((z, i) => {
    tubeZ[i] = z;
    tubeI[i] = 1;
  });
  const uniforms: WindowUniforms = UniformsUtils.merge([
    UniformsLib.fog,
    {
      uTime: { value: 0 },
      uSpeed: { value: 24 },
      uSodium: { value: new Vector4(0, 0, 1, 0) },
      uTubeZ: { value: tubeZ },
      uTubeI: { value: tubeI },
      uInterior: { value: new Color(0.55, 0.62, 0.66) },
      uGeom: { value: new Vector4(options.ceilingY, options.halfWidth, options.glassBottom, options.glassTop) },
      uPane: { value: new Vector4(options.paneOriginZ, options.paneSpacing, 0, 0) },
      uDetail: { value: 1 },
    },
  ]) as WindowUniforms;
  // UniformsUtils.merge clones arrays; keep references to the live ones.
  const liveTubeI = uniforms.uTubeI.value;

  const material = new ShaderMaterial({
    name: 'WindowGlass',
    uniforms,
    vertexShader,
    fragmentShader,
    fog: true,
  });

  return {
    material,
    setTime(time, speed) {
      uniforms.uTime.value = time;
      uniforms.uSpeed.value = speed;
    },
    setSodium(z, intensity, side) {
      uniforms.uSodium.value.set(z, intensity, side, 0);
    },
    setTubeIntensity(index, value) {
      if (index >= 0 && index < MAX_REFLECTED_TUBES) liveTubeI[index] = value;
    },
    setInteriorTint(color) {
      uniforms.uInterior.value.copy(color);
    },
    setDetail(level) {
      uniforms.uDetail.value = level;
    },
    dispose() {
      material.dispose();
    },
  };
}
