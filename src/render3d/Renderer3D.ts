// Owns the WebGL context: renderer creation, pixel-ratio clamp, resize,
// the render loop, the post stack and full teardown. Scenes plug in through
// the SceneModule contract (types.ts), so the real game can swap scenes
// (carriage, platform, stations) without touching this file.

import { SRGBColorSpace, Timer, WebGLRenderer } from 'three';
import { POST_HIGH, POST_LOW, PostStack } from './postfx/PostStack';
import type { PostStackConfig } from './postfx/PostStack';
import { DEFAULT_SETTINGS } from './types';
import type { FrameContext, RenderSettings, RenderStats, SceneFactory, SceneModule } from './types';

export interface Renderer3DOptions {
  /** Hard cap on devicePixelRatio (perf). Default 1.5. */
  maxPixelRatio?: number;
  /** Pixel-ratio cap used in low quality. Default 1. */
  lowPixelRatio?: number;
  settings?: Partial<RenderSettings>;
  /** Overrides applied on top of the quality preset. */
  post?: Partial<PostStackConfig>;
  /** Called after every frame with live stats. Keep it cheap. */
  onFrame?: (stats: Readonly<RenderStats>) => void;
}

export class Renderer3D {
  readonly renderer: WebGLRenderer;
  readonly stats: RenderStats = { fps: 0, frameMs: 0, drawCalls: 0, triangles: 0, pixelRatio: 1 };

  private readonly container: HTMLElement;
  private readonly options: Renderer3DOptions;
  private readonly timer = new Timer();
  private readonly ctx: FrameContext;
  private settings: RenderSettings;
  private post: PostStack | null = null;
  private module: SceneModule | null = null;
  private raf = 0;
  private running = false;
  private disposed = false;
  private resizeObserver: ResizeObserver | null = null;
  private width = 1;
  private height = 1;
  private fpsFrames = 0;
  private fpsAccum = 0;

  constructor(container: HTMLElement, options: Renderer3DOptions = {}) {
    this.container = container;
    this.options = options;
    this.settings = { ...DEFAULT_SETTINGS, ...options.settings };
    this.ctx = { dt: 0, time: 0, settings: this.settings };

    this.renderer = new WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      alpha: false,
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setClearColor(0x050507, 1);
    // Count every pass of the composer, not just the last one.
    this.renderer.info.autoReset = false;
    const canvas = this.renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.outline = 'none';
    canvas.tabIndex = 0;
    container.appendChild(canvas);

    this.timer.connect(document);
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(container);
    this.handleResize();
  }

  get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  getSettings(): Readonly<RenderSettings> {
    return this.settings;
  }

  /** Builds and installs a scene, disposing the previous one. */
  setScene<T extends SceneModule>(factory: SceneFactory<T>): T {
    if (this.module) this.module.dispose();
    const module = factory(this.renderer);
    this.module = module;
    if (this.post) this.post.setScene(module.scene, module.camera);
    else this.post = new PostStack(this.renderer, module.scene, module.camera, this.postConfigFor(this.settings));
    module.applySettings(this.settings);
    this.handleResize();
    return module;
  }

  setSettings(partial: Partial<RenderSettings>): Readonly<RenderSettings> {
    const prevQuality = this.settings.quality;
    Object.assign(this.settings, partial);
    if (this.post) this.post.setConfig(this.postConfigFor(this.settings));
    if (this.module) this.module.applySettings(this.settings);
    if (prevQuality !== this.settings.quality) this.handleResize();
    return this.settings;
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.timer.reset();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  dispose(): void {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.timer.dispose();
    this.module?.dispose();
    this.module = null;
    this.post?.dispose();
    this.post = null;
    this.renderer.renderLists.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }

  private postConfigFor(s: RenderSettings): PostStackConfig {
    const base = s.quality === 'high' ? POST_HIGH : POST_LOW;
    return { ...base, ...this.options.post };
  }

  private pixelRatio(): number {
    const cap = this.settings.quality === 'high' ? (this.options.maxPixelRatio ?? 1.5) : (this.options.lowPixelRatio ?? 1);
    return Math.min(window.devicePixelRatio || 1, cap);
  }

  private readonly handleResize = (): void => {
    if (this.disposed) return;
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    this.width = w;
    this.height = h;
    const pr = this.pixelRatio();
    this.stats.pixelRatio = pr;
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.post?.setSize(w, h, pr);
    this.module?.resize(w, h);
  };

  private readonly frame = (timestamp: number): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    this.timer.update(timestamp);
    const rawDt = this.timer.getDelta();
    const dt = Math.min(rawDt, 1 / 20);
    this.ctx.dt = dt;
    this.ctx.time += dt;

    const module = this.module;
    if (!module) return;
    module.update(this.ctx);

    const info = this.renderer.info;
    info.reset();
    if (this.settings.postFx && this.post) this.post.render(dt, this.ctx.time);
    else this.renderer.render(module.scene, module.camera);

    const st = this.stats;
    st.drawCalls = info.render.calls;
    st.triangles = info.render.triangles;
    st.frameMs = rawDt * 1000;
    this.fpsFrames++;
    this.fpsAccum += rawDt;
    if (this.fpsAccum >= 0.5) {
      st.fps = this.fpsFrames / this.fpsAccum;
      this.fpsFrames = 0;
      this.fpsAccum = 0;
    }
    this.options.onFrame?.(st);
  };

  /** Current CSS-pixel size of the canvas. */
  get size(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }
}
