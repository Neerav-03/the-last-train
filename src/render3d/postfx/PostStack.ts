// Configurable post-processing stack:
//   RenderPass -> UnrealBloom (optional) -> OutputPass (tone map + sRGB)
//   -> FinalFx (barrel, edge chromatic aberration, vignette, grain)
// When postFx is disabled entirely, Renderer3D bypasses the composer and
// renders straight to the canvas (tone mapping still applies).

import {
  ACESFilmicToneMapping,
  AgXToneMapping,
  HalfFloatType,
  NeutralToneMapping,
  Vector2,
  WebGLRenderTarget,
} from 'three';
import type { Camera, Scene, ToneMapping, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { createFinalFxShader } from './FinalFxShader';

export type ToneMapperName = 'aces' | 'agx' | 'neutral';

export interface PostStackConfig {
  bloom: boolean;
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  /** Resolution scale of the bloom chain relative to the canvas. */
  bloomScale: number;
  finalFx: boolean;
  grain: number;
  vignette: number;
  chromatic: number;
  barrel: number;
  toneMapping: ToneMapperName;
  exposure: number;
}

export const POST_HIGH: PostStackConfig = {
  bloom: true,
  bloomStrength: 0.7,
  bloomRadius: 0.55,
  bloomThreshold: 0.82,
  bloomScale: 0.5,
  finalFx: true,
  grain: 0.055,
  vignette: 0.6,
  chromatic: 0.0035,
  barrel: 0.07,
  toneMapping: 'aces',
  exposure: 1.0,
};

/** Low: no bloom, no distortion/aberration; keeps the cheap grain + vignette. */
export const POST_LOW: PostStackConfig = {
  ...POST_HIGH,
  bloom: false,
  chromatic: 0,
  barrel: 0,
};

const TONE_MAPPERS: Record<ToneMapperName, ToneMapping> = {
  aces: ACESFilmicToneMapping,
  agx: AgXToneMapping,
  neutral: NeutralToneMapping,
};

export class PostStack {
  readonly composer: EffectComposer;
  private readonly renderPass: RenderPass;
  private readonly bloomPass: UnrealBloomPass;
  private readonly outputPass: OutputPass;
  private readonly finalPass: ShaderPass;
  private readonly renderer: WebGLRenderer;
  private readonly target: WebGLRenderTarget;
  private config: PostStackConfig;
  private readonly size = new Vector2(1, 1);

  constructor(renderer: WebGLRenderer, scene: Scene, camera: Camera, config: PostStackConfig = POST_HIGH) {
    this.renderer = renderer;
    this.config = { ...config };
    renderer.getDrawingBufferSize(this.size);
    // HalfFloat keeps the HDR tube highlights for bloom; no MSAA (cost) since
    // the grain + slight barrel hide aliasing well enough at this scale.
    this.target = new WebGLRenderTarget(this.size.x, this.size.y, { type: HalfFloatType });
    this.composer = new EffectComposer(renderer, this.target);
    this.renderPass = new RenderPass(scene, camera);
    this.bloomPass = new UnrealBloomPass(
      new Vector2(this.size.x * config.bloomScale, this.size.y * config.bloomScale),
      config.bloomStrength,
      config.bloomRadius,
      config.bloomThreshold,
    );
    this.outputPass = new OutputPass();
    this.finalPass = new ShaderPass(createFinalFxShader());
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(this.outputPass);
    this.composer.addPass(this.finalPass);
    this.setConfig(config);
  }

  setScene(scene: Scene, camera: Camera): void {
    this.renderPass.scene = scene;
    this.renderPass.camera = camera;
  }

  getConfig(): Readonly<PostStackConfig> {
    return this.config;
  }

  setConfig(partial: Partial<PostStackConfig>): void {
    const c = (this.config = { ...this.config, ...partial });
    this.renderer.toneMapping = TONE_MAPPERS[c.toneMapping];
    this.renderer.toneMappingExposure = c.exposure;
    this.bloomPass.enabled = c.bloom;
    this.bloomPass.strength = c.bloomStrength;
    this.bloomPass.radius = c.bloomRadius;
    this.bloomPass.threshold = c.bloomThreshold;
    this.finalPass.enabled = c.finalFx;
    const u = this.finalPass.uniforms;
    u.uGrain.value = c.grain;
    u.uVignette.value = c.vignette;
    u.uChromatic.value = c.chromatic;
    u.uBarrel.value = c.barrel;
  }

  setSize(width: number, height: number, pixelRatio: number): void {
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    const s = this.config.bloomScale;
    this.bloomPass.setSize(Math.max(1, width * pixelRatio * s), Math.max(1, height * pixelRatio * s));
    (this.finalPass.uniforms.uResolution.value as Vector2).set(width * pixelRatio, height * pixelRatio);
  }

  render(dt: number, time: number): void {
    this.finalPass.uniforms.uTime.value = time;
    this.composer.render(dt);
  }

  dispose(): void {
    this.bloomPass.dispose();
    this.outputPass.dispose();
    this.finalPass.dispose();
    this.renderPass.dispose();
    this.composer.dispose();
    this.target.dispose();
  }
}
