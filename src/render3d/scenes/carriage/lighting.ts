// Carriage lighting: fluorescent tubes (emissive instanced mesh + point
// lights), one flickering irregularly, one dead (both seeded), additive light
// pools on the floor, faint light shafts, warm spill from the door window and
// an occasional sodium lamp sweeping past outside.
//
// Light count is fixed per quality level (lights are never toggled visible
// per frame, which would force shader recompiles); intensities animate.

import {
  AdditiveBlending,
  Color,
  CylinderGeometry,
  DynamicDrawUsage,
  Group,
  HemisphereLight,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  PointLight,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
} from 'three';
import { rngFor } from '../../../engine/rng';
import { createRadialTexture } from '../../materials/proceduralTextures';
import type { QualityLevel } from '../../types';
import { CEILING, HALF_WIDTH, LENGTH, TUBE_LENGTH, TUBE_Z } from './layout';

export type TubeState = 'on' | 'flicker' | 'dead';

const TUBE_COLOR = new Color(0.84, 0.93, 1.0);
const TUBE_EMISSIVE = 5.5;
const TUBE_LIGHT = 3.2;
const SODIUM_COLOR = new Color(1.0, 0.5, 0.14);

export interface SodiumState {
  z: number;
  intensity: number;
  side: -1 | 1;
}

export interface CarriageLighting {
  readonly group: Group;
  readonly states: readonly TubeState[];
  /** Live brightness of every tube, 0..~1.05 (same order as TUBE_Z). */
  readonly levels: Float32Array;
  readonly sodium: Readonly<SodiumState>;
  /** Average interior light level, for things like window reflections. */
  readonly ambientLevel: number;
  update(dt: number, time: number, reduceFlashing: boolean): void;
  setQuality(q: QualityLevel): void;
  dispose(): void;
}

// --------------------------------------------------------- flicker ----

/** Irregular fluorescent misbehaviour; a tiny state machine, no allocation. */
class Flicker {
  private mode: 'stable' | 'burst' | 'dropout' | 'strike' = 'stable';
  private modeLeft = 2;
  private stepLeft = 0;
  private stepValue = 1;
  private strikes = 0;
  private readonly rng: () => number;
  value = 1;

  constructor(rng: () => number) {
    this.rng = rng;
    this.modeLeft = 1.5 + rng() * 3;
  }

  update(dt: number, time: number, reduceFlashing: boolean): number {
    if (reduceFlashing) {
      // Slow, shallow breathing of the tube: no strobing at all.
      this.value = 0.72 + 0.16 * Math.sin(time * 0.9) + 0.08 * Math.sin(time * 0.37 + 1.2);
      return this.value;
    }
    const r = this.rng;
    this.modeLeft -= dt;
    this.stepLeft -= dt;
    switch (this.mode) {
      case 'stable':
        this.value = 0.96 + 0.04 * Math.sin(time * 47.0) * Math.sin(time * 3.1);
        if (this.modeLeft <= 0) {
          const roll = r();
          if (roll < 0.62) this.enter('burst', 0.25 + r() * 1.3);
          else if (roll < 0.85) this.enter('dropout', 0.4 + r() * 1.8);
          else this.enter('stable', 1 + r() * 3);
        }
        break;
      case 'burst':
        if (this.stepLeft <= 0) {
          this.stepLeft = 0.02 + r() * (r() < 0.3 ? 0.18 : 0.07);
          this.stepValue = r() < 0.5 ? r() * 0.08 : 0.55 + r() * 0.5;
        }
        this.value = this.stepValue;
        if (this.modeLeft <= 0) this.enter('stable', 2 + r() * 6);
        break;
      case 'dropout':
        this.value = 0.02;
        if (this.modeLeft <= 0) {
          this.strikes = 2 + Math.floor(r() * 4);
          this.enter('strike', 10);
        }
        break;
      case 'strike':
        // Starter trying to strike the arc: short blinks, then catch.
        if (this.stepLeft <= 0) {
          this.strikes--;
          this.stepLeft = 0.05 + r() * 0.16;
          this.stepValue = this.stepValue > 0.3 ? 0.03 : 0.75 + r() * 0.3;
        }
        this.value = this.stepValue;
        if (this.strikes <= 0) this.enter('stable', 3 + r() * 6);
        break;
    }
    return this.value;
  }

  private enter(mode: Flicker['mode'], duration: number): void {
    this.mode = mode;
    this.modeLeft = duration;
    this.stepLeft = 0;
  }
}

// ---------------------------------------------------- light shafts ----

const shaftVertex = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  varying float vFacing;
  varying float vH;
  varying vec3 vTint;
  void main() {
    vec4 local = vec4(position, 1.0);
    vec4 wp = modelMatrix * instanceMatrix * local;
    vec4 mvPosition = viewMatrix * wp;
    vec3 n = normalize(mat3(viewMatrix) * mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vFacing = abs(dot(n, normalize(-mvPosition.xyz)));
    vH = uv.y;
    vTint = vec3(1.0);
    #ifdef USE_INSTANCING_COLOR
      vTint = instanceColor;
    #endif
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

const shaftFragment = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>
  uniform float uStrength;
  varying float vFacing;
  varying float vH;
  varying vec3 vTint;
  void main() {
    float edge = pow(vFacing, 2.2);
    float fall = smoothstep(0.0, 0.85, vH) * (0.35 + 0.65 * vH);
    vec3 col = vTint * edge * fall * uStrength;
    gl_FragColor = vec4(col, 1.0);
    #include <fog_fragment>
  }
`;

// --------------------------------------------------------- builder ----

export function buildCarriageLighting(runSeed: number, quality: QualityLevel): CarriageLighting {
  const group = new Group();
  group.name = 'CarriageLighting';
  const owned: { dispose(): void }[] = [];
  const rng = rngFor(runSeed, 'render3d:carriage:tubes');
  const n = TUBE_Z.length;

  // Seeded tube states: never the very first tube (the opening shot needs
  // light) and never the same tube for both.
  const deadIndex = 1 + Math.floor(rng() * (n - 2));
  let flickerIndex = 1 + Math.floor(rng() * (n - 1));
  if (flickerIndex === deadIndex) flickerIndex = (flickerIndex % (n - 1)) + 1;
  const states: TubeState[] = TUBE_Z.map((_, i) => (i === deadIndex ? 'dead' : i === flickerIndex ? 'flicker' : 'on'));
  // Slight per-tube colour ageing.
  const tint = TUBE_Z.map(() => {
    const age = rng();
    return new Color(TUBE_COLOR.r * (0.95 + age * 0.05), TUBE_COLOR.g * (0.97 + rng() * 0.04), TUBE_COLOR.b * (0.9 + (1 - age) * 0.1));
  });
  const base = TUBE_Z.map((_, i) => (states[i] === 'dead' ? 0 : 0.85 + rng() * 0.15));
  const levels = new Float32Array(n);
  const flicker = new Flicker(rngFor(runSeed, 'render3d:carriage:flicker'));

  // Emissive tubes ---------------------------------------------------------
  const tubeGeo = new CylinderGeometry(0.017, 0.017, TUBE_LENGTH, 8, 1);
  tubeGeo.rotateX(Math.PI / 2);
  const tubeMat = new MeshBasicMaterial({ color: 0xffffff });
  const tubes = new InstancedMesh(tubeGeo, tubeMat, n);
  tubes.name = 'Tubes';
  tubes.instanceColor = new InstancedBufferAttribute(new Float32Array(n * 3), 3);
  tubes.instanceColor.setUsage(DynamicDrawUsage);
  const dummy = new Object3D();
  TUBE_Z.forEach((z, i) => {
    dummy.position.set(0, CEILING - 0.085, z);
    dummy.updateMatrix();
    tubes.setMatrixAt(i, dummy.matrix);
  });
  group.add(tubes);
  owned.push(tubeGeo, tubeMat, { dispose: () => tubes.dispose() });

  // Floor light pools --------------------------------------------------------
  const poolTex = createRadialTexture(128);
  const poolGeo = new PlaneGeometry(HALF_WIDTH * 1.5, 2.6);
  poolGeo.rotateX(-Math.PI / 2);
  const poolMat = new MeshBasicMaterial({
    map: poolTex,
    color: 0xffffff,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    fog: true,
  });
  const pools = new InstancedMesh(poolGeo, poolMat, n);
  pools.name = 'LightPools';
  pools.instanceColor = new InstancedBufferAttribute(new Float32Array(n * 3), 3);
  pools.instanceColor.setUsage(DynamicDrawUsage);
  pools.renderOrder = 1;
  TUBE_Z.forEach((z, i) => {
    dummy.position.set(0, 0.006, z);
    dummy.updateMatrix();
    pools.setMatrixAt(i, dummy.matrix);
  });
  group.add(pools);
  owned.push(poolTex, poolGeo, poolMat, { dispose: () => pools.dispose() });

  // Light shafts -------------------------------------------------------------
  const shaftGeo = new CylinderGeometry(0.12, 0.85, CEILING - 0.1, 18, 1, true);
  // CylinderGeometry uv.y runs 0 (bottom) -> 1 (top).
  shaftGeo.translate(0, (CEILING - 0.1) / 2, 0);
  shaftGeo.scale(1, 1, 1.8);
  const shaftMat = new ShaderMaterial({
    uniforms: UniformsUtils.merge([UniformsLib.fog, { uStrength: { value: 0.035 } }]),
    vertexShader: shaftVertex,
    fragmentShader: shaftFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    fog: true,
  });
  const shafts = new InstancedMesh(shaftGeo, shaftMat, n);
  shafts.name = 'LightShafts';
  shafts.instanceColor = new InstancedBufferAttribute(new Float32Array(n * 3), 3);
  shafts.instanceColor.setUsage(DynamicDrawUsage);
  shafts.renderOrder = 2;
  TUBE_Z.forEach((z, i) => {
    dummy.position.set(0, 0, z);
    dummy.updateMatrix();
    shafts.setMatrixAt(i, dummy.matrix);
  });
  group.add(shafts);
  owned.push(shaftGeo, shaftMat, { dispose: () => shafts.dispose() });

  // Real lights ---------------------------------------------------------------
  const hemi = new HemisphereLight(0x2a3442, 0x0a0908, 0.35);
  group.add(hemi);

  const tubeLights: { light: PointLight; tubes: number[]; gain: number }[] = [];
  const buildTubeLights = (q: QualityLevel) => {
    for (const t of tubeLights) {
      group.remove(t.light);
      t.light.dispose();
    }
    tubeLights.length = 0;
    const live = TUBE_Z.map((_, i) => i).filter((i) => states[i] !== 'dead');
    if (q === 'high') {
      for (const i of live) tubeLights.push({ light: new PointLight(tint[i], TUBE_LIGHT, 7.5, 2), tubes: [i], gain: 1 });
    } else {
      // Low: the flickering tube keeps its own light; the others pair up.
      tubeLights.push({ light: new PointLight(tint[flickerIndex], TUBE_LIGHT, 7.5, 2), tubes: [flickerIndex], gain: 1 });
      const rest = live.filter((i) => i !== flickerIndex);
      for (let k = 0; k < rest.length; k += 2) {
        const pair = rest.slice(k, k + 2);
        tubeLights.push({ light: new PointLight(tint[pair[0]], TUBE_LIGHT, 9.5, 2), tubes: pair, gain: pair.length === 2 ? 1.7 : 1 });
      }
    }
    for (const t of tubeLights) {
      let z = 0;
      for (const i of t.tubes) z += TUBE_Z[i];
      t.light.position.set(0, CEILING - 0.18, z / t.tubes.length);
      group.add(t.light);
    }
  };
  buildTubeLights(quality);

  // Warm spill from the door window (steady: warmth is the only safe thing).
  const doorLight = new PointLight(0xff9a50, 1.3, 5.5, 2);
  doorLight.position.set(0, 1.55, -LENGTH + 0.35);
  group.add(doorLight);

  // Passing sodium lamp outside.
  const sodiumLight = new PointLight(SODIUM_COLOR, 0, 9, 2);
  group.add(sodiumLight);
  const sodiumRng = rngFor(runSeed, 'render3d:carriage:sodium');
  const sodium: SodiumState = { z: 0, intensity: 0, side: 1 };
  let sodiumNext = 3 + sodiumRng() * 5;
  let sodiumT = -1; // <0 idle, else progress 0..1
  let sodiumDur = 1.4;

  const tmp = new Color();
  let ambientLevel = 1;

  const update = (dt: number, time: number, reduceFlashing: boolean) => {
    // Tube levels.
    let sum = 0;
    for (let i = 0; i < n; i++) {
      let v = base[i];
      if (states[i] === 'flicker') v *= flicker.update(dt, time, reduceFlashing);
      levels[i] = v;
      sum += v;
      const e = states[i] === 'dead' ? 0.035 : v * TUBE_EMISSIVE;
      tmp.copy(tint[i]).multiplyScalar(e);
      if (states[i] === 'dead') tmp.setRGB(0.05, 0.05, 0.048);
      tubes.setColorAt(i, tmp);
      tmp.copy(tint[i]).multiplyScalar(v * 0.085);
      pools.setColorAt(i, tmp);
      tmp.copy(tint[i]).multiplyScalar(v);
      shafts.setColorAt(i, tmp);
    }
    ambientLevel = sum / n;
    tubes.instanceColor!.needsUpdate = true;
    pools.instanceColor!.needsUpdate = true;
    shafts.instanceColor!.needsUpdate = true;
    for (let k = 0; k < tubeLights.length; k++) {
      const t = tubeLights[k];
      let v = 0;
      for (let j = 0; j < t.tubes.length; j++) v += levels[t.tubes[j]];
      t.light.intensity = TUBE_LIGHT * (v / t.tubes.length) * t.gain;
    }

    // Sodium sweep scheduling.
    if (sodiumT < 0) {
      sodiumNext -= dt;
      if (sodiumNext <= 0) {
        sodiumT = 0;
        sodium.side = sodiumRng() < 0.5 ? -1 : 1;
        sodiumDur = reduceFlashing ? 3.2 : 1.1 + sodiumRng() * 0.6;
      }
    }
    if (sodiumT >= 0) {
      sodiumT += dt / sodiumDur;
      const u = Math.min(1, sodiumT);
      // Outside the world streams towards +z (we travel towards -z).
      sodium.z = -LENGTH - 4 + u * (LENGTH + 8);
      const env = Math.sin(Math.PI * u);
      sodium.intensity = env * (reduceFlashing ? 0.45 : 1);
      sodiumLight.position.set(sodium.side * (HALF_WIDTH + 0.7), 2.05, sodium.z);
      sodiumLight.intensity = 30 * sodium.intensity;
      if (sodiumT >= 1) {
        sodiumT = -1;
        sodium.intensity = 0;
        sodiumLight.intensity = 0;
        sodiumNext = 6 + sodiumRng() * 9;
      }
    }
  };
  update(0, 0, false);

  return {
    group,
    states,
    levels,
    sodium,
    get ambientLevel() {
      return ambientLevel;
    },
    update,
    setQuality(q) {
      buildTubeLights(q);
      shafts.visible = q === 'high';
    },
    dispose() {
      for (const t of tubeLights) t.light.dispose();
      doorLight.dispose();
      sodiumLight.dispose();
      hemi.dispose();
      for (const o of owned) o.dispose();
      owned.length = 0;
    },
  };
}
