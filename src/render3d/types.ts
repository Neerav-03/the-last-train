// Shared contracts for the Three.js renderer. Everything a scene module or the
// host app needs to talk to Renderer3D lives here, so scenes stay swappable.

import type { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export type QualityLevel = 'low' | 'high';

/** Runtime-tweakable settings. Scenes and the post stack both read these. */
export interface RenderSettings {
  quality: QualityLevel;
  /** No strobing: flicker becomes slow, shallow dimming; light sweeps soften. */
  reduceFlashing: boolean;
  /** Master switch for the post-processing stack (tone mapping always stays). */
  postFx: boolean;
}

export const DEFAULT_SETTINGS: RenderSettings = {
  quality: 'high',
  reduceFlashing: false,
  postFx: true,
};

/** Passed to every scene update. Reused every frame: never retain it. */
export interface FrameContext {
  /** Clamped frame delta in seconds. */
  dt: number;
  /** Seconds since the renderer started. */
  time: number;
  settings: Readonly<RenderSettings>;
}

/**
 * A renderable scene. Renderer3D owns the GL context and post stack; a scene
 * module owns its own Three.js objects, camera rig and everything it allocates.
 */
export interface SceneModule {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  update(ctx: FrameContext): void;
  resize(width: number, height: number): void;
  applySettings(settings: Readonly<RenderSettings>): void;
  /** Free every geometry, material, texture and render target it created. */
  dispose(): void;
}

/** Scene factories get the live renderer (for PMREM, capabilities, etc). */
export type SceneFactory<T extends SceneModule = SceneModule> = (renderer: WebGLRenderer) => T;

export interface RenderStats {
  fps: number;
  frameMs: number;
  drawCalls: number;
  triangles: number;
  pixelRatio: number;
}
