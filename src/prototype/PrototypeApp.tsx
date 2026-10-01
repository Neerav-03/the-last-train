// Isolated shell for the Three.js carriage prototype. Not wired to the game
// store or dialogue: it only proves rendering, camera, picking and settings.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas3D } from '../render3d/Canvas3D';
import type { Renderer3D } from '../render3d/Renderer3D';
import { CarriageScene } from '../render3d/scenes/carriage/CarriageScene';
import type { HoverInfo } from '../render3d/scenes/carriage/CarriageScene';
import type { RenderSettings } from '../render3d/types';

interface UrlConfig {
  seed: number;
  settings: Partial<RenderSettings>;
}

function readUrlConfig(): UrlConfig {
  const q = new URLSearchParams(window.location.search);
  const rawSeed = q.get('seed');
  const parsed = rawSeed !== null ? Number.parseInt(rawSeed, 10) : Number.NaN;
  const seed = Number.isFinite(parsed) ? parsed : Math.floor(Math.random() * 0x7fffffff);
  const settings: Partial<RenderSettings> = {};
  if (q.get('quality') === 'low') settings.quality = 'low';
  if (q.get('reduceFlashing') === '1') settings.reduceFlashing = true;
  if (q.get('postfx') === '0') settings.postFx = false;
  return { seed, settings };
}

interface HudStats {
  fps: number;
  calls: number;
  tris: number;
  pr: number;
}

export default function PrototypeApp() {
  const config = useMemo(readUrlConfig, []);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [talk, setTalk] = useState<HoverInfo | null>(null);
  const [settings, setSettings] = useState<RenderSettings | null>(null);
  const [stats, setStats] = useState<HudStats>({ fps: 0, calls: 0, tris: 0, pr: 1 });
  const [showHelp, setShowHelp] = useState(true);
  const handleRef = useRef<{ r3d: Renderer3D; scene: CarriageScene } | null>(null);
  const talkTimer = useRef<number | undefined>(undefined);

  const createScene = useCallback(
    (r3d: Renderer3D) =>
      r3d.setScene(
        (renderer) =>
          new CarriageScene(renderer, {
            runSeed: config.seed,
            onHover: (info) => setHover(info),
            onSelect: (info) => {
              setTalk(info);
              window.clearTimeout(talkTimer.current);
              talkTimer.current = window.setTimeout(() => setTalk(null), 3200);
            },
          }),
      ),
    [config.seed],
  );

  const onReady = useCallback(
    (handle: { r3d: Renderer3D; scene: CarriageScene } | null) => {
      handleRef.current = handle;
      if (!handle) return;
      setSettings({ ...handle.r3d.setSettings(config.settings) });
    },
    [config.settings],
  );

  // Stats poll at 4 Hz: React never re-renders per frame.
  useEffect(() => {
    const id = window.setInterval(() => {
      const h = handleRef.current;
      if (!h) return;
      const s = h.r3d.stats;
      setStats({ fps: Math.round(s.fps), calls: s.drawCalls, tris: s.triangles, pr: s.pixelRatio });
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  // Discrete toggles.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const h = handleRef.current;
      if (!h) return;
      const cur = h.r3d.getSettings();
      let next: Partial<RenderSettings> | null = null;
      if (e.code === 'KeyQ') next = { quality: cur.quality === 'high' ? 'low' : 'high' };
      else if (e.code === 'KeyF') next = { reduceFlashing: !cur.reduceFlashing };
      else if (e.code === 'KeyP') next = { postFx: !cur.postFx };
      else if (e.code === 'KeyH') setShowHelp((v) => !v);
      if (next) setSettings({ ...h.r3d.setSettings(next) });
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(talkTimer.current);
    };
  }, []);

  const fpsClass = stats.fps >= 55 ? 'ok' : stats.fps >= 40 ? 'warn' : 'bad';

  return (
    <div className={`proto-root${hover ? ' is-hovering' : ''}`}>
      <Canvas3D createScene={createScene} onReady={onReady} />

      <div className="proto-hud proto-hud--stats" aria-live="off">
        <span className={`proto-fps proto-fps--${fpsClass}`}>{stats.fps} fps</span>
        <span>{stats.calls} calls</span>
        <span>{(stats.tris / 1000).toFixed(1)}k tris</span>
        <span>dpr {stats.pr.toFixed(2)}</span>
        {settings && (
          <>
            <span className="proto-tag">{settings.quality.toUpperCase()}</span>
            {!settings.postFx && <span className="proto-tag">NO POST</span>}
            {settings.reduceFlashing && <span className="proto-tag">REDUCED FLASHING</span>}
          </>
        )}
        <span className="proto-dim">seed {config.seed}</span>
      </div>

      {showHelp && (
        <div className="proto-hud proto-hud--help">
          <div className="proto-title">THE LAST TRAIN · carriage prototype</div>
          <div>
            <kbd>A</kbd>/<kbd>D</kbd> or <kbd>←</kbd>/<kbd>→</kbd> move along the aisle
          </div>
          <div>mouse: look · hover a passenger · click to talk</div>
          <div>
            <kbd>Q</kbd> quality · <kbd>F</kbd> reduce flashing · <kbd>P</kbd> post-fx · <kbd>H</kbd> hide
          </div>
          <div className="proto-dim">?seed=123 · ?quality=low · ?reduceFlashing=1</div>
        </div>
      )}

      <div className={`proto-label${hover ? ' is-visible' : ''}`}>{hover?.label ?? ''}</div>

      {talk && (
        <div className="proto-talk" role="status">
          <div className="proto-talk__who">{talk.name}</div>
          <div className="proto-talk__line">[ TALK ]</div>
          <div className="proto-dim">dialogue is not wired up in the prototype</div>
        </div>
      )}
    </div>
  );
}
