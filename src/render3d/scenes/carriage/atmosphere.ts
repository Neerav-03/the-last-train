// Dust motes: one GPU point cloud, animated entirely in the vertex shader
// (drift, slow fall, wrap-around inside the carriage), lit by proximity to
// the live tube levels so motes glitter only inside the light shafts.

import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial, UniformsLib, UniformsUtils, Vector3 } from 'three';
import type { IUniform } from 'three';
import { rngFor } from '../../../engine/rng';
import { CEILING, HALF_WIDTH, LENGTH, TUBE_Z } from './layout';

const TUBE_N = TUBE_Z.length;

const vertexShader = /* glsl */ `
  #include <common>
  #include <fog_pars_vertex>
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec3 uBoxMin;
  uniform vec3 uBoxSize;
  uniform float uTubeZ[${TUBE_N}];
  uniform float uTubeI[${TUBE_N}];
  uniform float uCeiling;
  attribute vec4 aSeed;
  varying float vLight;
  varying float vTwinkle;
  void main() {
    vec3 p = position;
    float t = uTime;
    // Brownian-ish drift + slow settling; air pushed along by the train.
    p.x += sin(t * (0.11 + aSeed.x * 0.2) + aSeed.y * 6.28) * 0.18;
    p.y += sin(t * (0.07 + aSeed.z * 0.15) + aSeed.w * 6.28) * 0.12 - t * (0.006 + aSeed.x * 0.01);
    p.z += t * (0.03 + aSeed.y * 0.04) + sin(t * 0.13 + aSeed.z * 6.28) * 0.25;
    p = uBoxMin + mod(p - uBoxMin, uBoxSize);

    float light = 0.0;
    for (int i = 0; i < ${TUBE_N}; i++) {
      float dz = p.z - uTubeZ[i];
      // Shaft shape: wide at the bottom, narrow at the top.
      float h = clamp((uCeiling - p.y) / uCeiling, 0.0, 1.0);
      float radius = 0.15 + h * 0.75;
      float r = length(vec2(p.x, dz * 0.55)) / radius;
      light += uTubeI[i] * exp(-r * r * 2.0);
    }
    vLight = light;
    vTwinkle = 0.6 + 0.4 * sin(t * (1.5 + aSeed.w * 3.0) + aSeed.x * 40.0);

    vec4 mvPosition = viewMatrix * modelMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize * uPixelRatio * (0.6 + aSeed.z) / max(0.2, -mvPosition.z);
    #include <fog_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  #include <common>
  #include <fog_pars_fragment>
  uniform float uIntensity;
  varying float vLight;
  varying float vTwinkle;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c) * 4.0;
    float a = exp(-d * 3.0);
    if (a < 0.02) discard;
    vec3 col = vec3(0.85, 0.92, 1.0) * a * (0.02 + vLight) * vTwinkle * uIntensity;
    gl_FragColor = vec4(col, 1.0);
    #include <fog_fragment>
  }
`;

export interface DustMotes {
  readonly points: Points;
  update(time: number, tubeLevels: Float32Array, pixelRatio: number): void;
  setCount(count: number): void;
  dispose(): void;
}

export function buildDust(runSeed: number, maxCount: number): DustMotes {
  const rng = rngFor(runSeed, 'render3d:carriage:dust');
  const positions = new Float32Array(maxCount * 3);
  const seeds = new Float32Array(maxCount * 4);
  const min = [-HALF_WIDTH + 0.05, 0.1, -LENGTH + 0.1];
  const size = [HALF_WIDTH * 2 - 0.1, CEILING - 0.15, LENGTH - 0.2];
  for (let i = 0; i < maxCount; i++) {
    positions[i * 3] = min[0] + rng() * size[0];
    positions[i * 3 + 1] = min[1] + rng() * size[1];
    positions[i * 3 + 2] = min[2] + rng() * size[2];
    for (let k = 0; k < 4; k++) seeds[i * 4 + k] = rng();
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  geo.setAttribute('aSeed', new BufferAttribute(seeds, 4));
  geo.boundingSphere = null;

  const tubeZ = Array.from(TUBE_Z);
  const uniforms = UniformsUtils.merge([
    UniformsLib.fog,
    {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uSize: { value: 9 },
      uIntensity: { value: 1.6 },
      uBoxMin: { value: new Vector3(min[0], min[1], min[2]) },
      uBoxSize: { value: new Vector3(size[0], size[1], size[2]) },
      uTubeZ: { value: tubeZ },
      uTubeI: { value: new Array<number>(TUBE_N).fill(1) },
      uCeiling: { value: CEILING },
    },
  ]) as Record<string, IUniform>;
  const tubeI = uniforms.uTubeI.value as number[];

  const material = new ShaderMaterial({
    name: 'DustMotes',
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    fog: true,
  });
  const points = new Points(geo, material);
  points.name = 'Dust';
  points.frustumCulled = false;
  points.renderOrder = 3;

  return {
    points,
    update(time, levels, pixelRatio) {
      uniforms.uTime.value = time;
      uniforms.uPixelRatio.value = pixelRatio;
      for (let i = 0; i < TUBE_N; i++) tubeI[i] = levels[i];
    },
    setCount(count) {
      geo.setDrawRange(0, Math.min(maxCount, count));
    },
    dispose() {
      geo.dispose();
      material.dispose();
    },
  };
}
