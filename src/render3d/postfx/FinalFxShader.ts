// Display-space "lens + film" pass. Runs after OutputPass (tone mapping and
// sRGB encode), so grain and vignette behave like they would on a print and
// never lift the linear blacks.

import type { IUniform } from 'three';
import { Vector2 } from 'three';

export interface FinalFxUniforms {
  [uniform: string]: IUniform;
  tDiffuse: IUniform<null>;
  uTime: IUniform<number>;
  uResolution: IUniform<Vector2>;
  uGrain: IUniform<number>;
  uVignette: IUniform<number>;
  uChromatic: IUniform<number>;
  uBarrel: IUniform<number>;
  uLift: IUniform<number>;
}

export function createFinalFxShader(): {
  uniforms: FinalFxUniforms;
  vertexShader: string;
  fragmentShader: string;
} {
  return {
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uResolution: { value: new Vector2(1280, 720) },
      uGrain: { value: 0.06 },
      uVignette: { value: 0.55 },
      uChromatic: { value: 0.0035 },
      uBarrel: { value: 0.06 },
      uLift: { value: 0.012 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform float uGrain;
      uniform float uVignette;
      uniform float uChromatic;
      uniform float uBarrel;
      uniform float uLift;
      varying vec2 vUv;

      float hash12(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      void main() {
        // Barrel distortion, normalised so the corners stay on the corners
        // (no black borders): the centre is slightly magnified instead.
        vec2 c = vUv - 0.5;
        float aspect = uResolution.x / uResolution.y;
        vec2 ca = vec2(c.x * aspect, c.y);
        float r2 = dot(ca, ca);
        float cornerR2 = 0.25 * aspect * aspect + 0.25;
        vec2 uv = 0.5 + c * (1.0 + uBarrel * r2) / (1.0 + uBarrel * cornerR2);

        // Chromatic aberration grows towards the frame edge only.
        float edge = smoothstep(0.08, cornerR2, r2);
        vec2 dir = c * uChromatic * edge * 6.0;
        vec3 col;
        col.r = texture2D(tDiffuse, uv + dir).r;
        col.g = texture2D(tDiffuse, uv).g;
        col.b = texture2D(tDiffuse, uv - dir).b;

        // Vignette: oval, heavy, slightly cold in the falloff.
        float v = smoothstep(0.95, 0.15, length(c * vec2(aspect * 0.85, 1.0)) * 1.15);
        vec3 tint = mix(vec3(0.55, 0.6, 0.72), vec3(1.0), v);
        col *= mix(1.0, v, uVignette) * mix(vec3(1.0), tint, uVignette * 0.6);

        // Film grain: animated, luminance-weighted (strongest in mid-tones).
        float t = floor(uTime * 24.0);
        float n = hash12(gl_FragCoord.xy + vec2(t * 13.17, t * 7.31)) +
                  hash12(gl_FragCoord.xy * 0.5 + t) - 1.0;
        float lum = dot(col, vec3(0.299, 0.587, 0.114));
        float w = 0.35 + 0.65 * (1.0 - abs(lum * 2.0 - 1.0));
        col += n * uGrain * w;

        // Crushed-but-not-dead blacks: a hint of blue-grey lift.
        col = max(col, vec3(0.0)) + uLift * vec3(0.6, 0.7, 0.9);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  };
}
