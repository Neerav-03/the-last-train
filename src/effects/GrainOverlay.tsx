import { useEffect, useRef } from 'react';
import './GrainOverlay.css';

const TILE = 256;
const GRAIN_BLOCK = 2; // px per noise sample, gives gritty grain without blockiness

/**
 * GrainOverlay — full-viewport CRT scanlines + film grain + vignette.
 * Mounted once in App.tsx, above every scene.
 *
 * The noise tile is generated once; the grain "animates" by jumping an
 * oversized layer between offsets with transform + steps(), so nothing repaints
 * per frame (redrawing a full-screen blended canvas caused periodic hitches).
 */
export default function GrainOverlay(props: { reduceFlashing?: boolean }) {
  const { reduceFlashing = false } = props;
  const noiseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = noiseRef.current;
    if (!el) return;
    const canvas = document.createElement('canvas');
    canvas.width = TILE;
    canvas.height = TILE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    for (let y = 0; y < TILE; y += GRAIN_BLOCK) {
      for (let x = 0; x < TILE; x += GRAIN_BLOCK) {
        const v = Math.floor(Math.random() * 255);
        ctx.fillStyle = `rgba(${v},${v},${v},0.11)`;
        ctx.fillRect(x, y, GRAIN_BLOCK, GRAIN_BLOCK);
      }
    }
    el.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`;
  }, []);

  return (
    <div className="grain-overlay" aria-hidden="true">
      <div ref={noiseRef} className={`grain-overlay__noise${reduceFlashing ? '' : ' is-animated'}`} />
      <div className="grain-overlay__scanlines" />
      <div className="grain-overlay__vignette" />
    </div>
  );
}
