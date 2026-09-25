import { useEffect, useRef } from 'react';
import './GrainOverlay.css';

/**
 * GrainOverlay — full-viewport CRT scanlines + animated film grain + vignette.
 * Mounted once in App.tsx, sits above every scene. Purely decorative texture;
 * keep subtle so it never fights for the player's attention.
 */
export default function GrainOverlay(props: { reduceFlashing?: boolean }) {
  const { reduceFlashing = false } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = 200;
    canvas.width = SIZE;
    canvas.height = SIZE;

    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const drawNoise = () => {
      const imageData = ctx.createImageData(SIZE, SIZE);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 20;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    // Always draw one static frame immediately.
    drawNoise();

    if (reduceFlashing || prefersReduced) {
      // Static grain only — no strobing/animated redraw.
      return;
    }

    let last = 0;
    const FRAME_INTERVAL = 90; // ~11fps — gritty, not smooth

    const loop = (t: number) => {
      if (t - last >= FRAME_INTERVAL) {
        drawNoise();
        last = t;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reduceFlashing]);

  return (
    <div className="grain-overlay" aria-hidden="true">
      <canvas ref={canvasRef} className="grain-overlay__canvas" />
      <div className="grain-overlay__scanlines" />
      <div className="grain-overlay__vignette" />
    </div>
  );
}
