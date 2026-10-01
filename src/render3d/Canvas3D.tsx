// React wrapper: mounts a Renderer3D into a div, installs a scene built by
// `createScene`, and tears everything down on unmount (StrictMode-safe: the
// double mount in dev creates and fully disposes a first instance).

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Renderer3D } from './Renderer3D';
import type { Renderer3DOptions } from './Renderer3D';
import type { SceneModule } from './types';

export interface Canvas3DProps<T extends SceneModule> {
  /** Called once per mount with the live renderer. Return the scene module. */
  createScene: (r3d: Renderer3D) => T;
  options?: Renderer3DOptions;
  /** Receives the renderer + scene after mount and `null` before disposal. */
  onReady?: (handle: { r3d: Renderer3D; scene: T } | null) => void;
  className?: string;
  style?: CSSProperties;
}

export function Canvas3D<T extends SceneModule>({ createScene, options, onReady, className, style }: Canvas3DProps<T>) {
  const hostRef = useRef<HTMLDivElement>(null);
  // Latest callbacks without re-mounting the GL context when they change.
  const createRef = useRef(createScene);
  const readyRef = useRef(onReady);
  const optionsRef = useRef(options);
  useEffect(() => {
    createRef.current = createScene;
    readyRef.current = onReady;
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let r3d: Renderer3D | null = null;
    try {
      r3d = new Renderer3D(host, optionsRef.current);
    } catch (err) {
      console.error('[render3d] WebGL unavailable', err);
      host.textContent = 'WebGL is unavailable in this browser.';
      return;
    }
    const scene = createRef.current(r3d);
    r3d.start();
    readyRef.current?.({ r3d, scene });
    return () => {
      readyRef.current?.(null);
      r3d?.dispose();
    };
  }, []);

  return <div ref={hostRef} className={className} style={{ position: 'absolute', inset: 0, ...style }} />;
}

export default Canvas3D;
