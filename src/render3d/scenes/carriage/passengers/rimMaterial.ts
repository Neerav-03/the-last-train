// Passenger material: vertex-coloured MeshStandardMaterial patched with a cold
// fresnel rim term driven by a per-figure uniform. All passenger materials share
// one compiled program (customProgramCacheKey); the uniform objects are
// per-figure so setHighlight() only writes `.value`.

import { Color, MeshStandardMaterial } from 'three';

export interface RimUniforms {
  readonly uRim: { value: number };
  readonly uRimColor: { value: Color };
}

/** Linear-space rim colour (#9fc4e8) pre-scaled so amount=1 peaks around ~1.0. */
const RIM_COLOR = new Color(0x9fc4e8).multiplyScalar(1.35);

export function createRimUniforms(): RimUniforms {
  return { uRim: { value: 0 }, uRimColor: { value: RIM_COLOR.clone() } };
}

const RIM_DECL = 'uniform float uRim;\nuniform vec3 uRimColor;\n';
const RIM_TERM = [
  '#include <emissivemap_fragment>',
  '{',
  '  float lt_rimF = 1.0 - saturate( dot( normal, normalize( vViewPosition ) ) );',
  '  totalEmissiveRadiance += uRimColor * ( uRim * pow( lt_rimF, 2.75 ) );',
  '}',
].join('\n');

export interface RimMaterialOptions {
  roughness?: number;
  metalness?: number;
  flatShading?: boolean;
}

export function createRimMaterial(uniforms: RimUniforms, opts: RimMaterialOptions = {}): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: opts.roughness ?? 0.86,
    metalness: opts.metalness ?? 0,
    flatShading: opts.flatShading ?? false,
    fog: true,
  });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRim = uniforms.uRim;
    shader.uniforms.uRimColor = uniforms.uRimColor;
    shader.fragmentShader = RIM_DECL + shader.fragmentShader.replace('#include <emissivemap_fragment>', RIM_TERM);
  };
  mat.customProgramCacheKey = () => 'lt-passenger-rim-v1';
  return mat;
}
