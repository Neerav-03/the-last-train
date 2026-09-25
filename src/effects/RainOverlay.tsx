import { useEffect, useRef } from 'react';
import './RainOverlay.css';

interface Drop {
  x: number;
  y: number;
  len: number;
  speed: number;
  drift: number;
  opacity: number;
  depth: number; // 0 (far/thin) .. 1 (near/heavy) — drives width, tint and splash chance
}

interface Splash {
  x: number;
  y: number;
  life: number; // 1 -> 0
  width: number;
}

/**
 * RainOverlay — canvas-based falling rain streaks.
 * Place inside a `position: relative` scene container; fills it via inset:0.
 */
export default function RainOverlay(props: { intensity?: number; z?: number }) {
  const { intensity = 0.5, z = 5 } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropsRef = useRef<Drop[]>([]);
  const splashesRef = useRef<Splash[]>([]);
  const splashCursorRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clampedIntensity = Math.max(0, Math.min(1, intensity));
    let width = 0;
    let height = 0;

    const makeDrop = (): Drop => {
      const depth = Math.random();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        len: 8 + depth * 22,
        speed: 5 + depth * 12 + clampedIntensity * 6,
        drift: 0.8 + depth * 1.4 + clampedIntensity * 0.8,
        opacity: 0.1 + depth * 0.35,
        depth,
      };
    };

    const SPLASH_POOL = 40;

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
      const count = Math.round(40 + clampedIntensity * 260);
      dropsRef.current = Array.from({ length: count }, makeDrop);
      splashesRef.current = Array.from({ length: SPLASH_POOL }, () => ({
        x: 0,
        y: 0,
        life: 0,
        width: 0,
      }));
      splashCursorRef.current = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const spawnSplash = (x: number, y: number, depth: number) => {
      const pool = splashesRef.current;
      const s = pool[splashCursorRef.current];
      splashCursorRef.current = (splashCursorRef.current + 1) % pool.length;
      s.x = x;
      s.y = y;
      s.life = 1;
      s.width = 3 + depth * 6;
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';
      for (const d of dropsRef.current) {
        // Near drops are thicker and brighter (bluish-white); far drops are thin and dim.
        ctx.strokeStyle = d.depth > 0.6 ? 'rgba(200, 216, 232, 0.55)' : 'rgba(160, 178, 198, 0.4)';
        ctx.globalAlpha = d.opacity;
        ctx.lineWidth = 0.6 + d.depth * 1.1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.drift, d.y + d.len);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(190, 206, 224, 0.5)';
      for (const s of splashesRef.current) {
        if (s.life <= 0) continue;
        ctx.globalAlpha = s.life * 0.4;
        ctx.lineWidth = 1;
        const spread = s.width * (1 - s.life * 0.4);
        ctx.beginPath();
        ctx.moveTo(s.x - spread, s.y);
        ctx.lineTo(s.x - spread * 0.4, s.y - spread * 0.35);
        ctx.moveTo(s.x + spread, s.y);
        ctx.lineTo(s.x + spread * 0.4, s.y - spread * 0.35);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      for (const d of dropsRef.current) {
        d.y += d.speed;
        d.x -= d.drift * 0.6;
        if (d.y > height) {
          // Only the nearer, heavier drops kick up a visible splash.
          if (d.depth > 0.55 && Math.random() < 0.5) {
            spawnSplash(d.x, height - 1, d.depth);
          }
          d.y = -d.len;
          d.x = Math.random() * width;
        }
        if (d.x < -20) {
          d.x = width + 20;
        }
      }
      for (const s of splashesRef.current) {
        if (s.life > 0) s.life -= 0.08;
      }
      drawFrame();
      rafRef.current = requestAnimationFrame(step);
    };

    if (prefersReduced) {
      // Single static-ish frame, no continuous falling animation.
      drawFrame();
    } else {
      rafRef.current = requestAnimationFrame(step);
    }

    return () => {
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity]);

  return (
    <div ref={containerRef} className="rain-overlay" style={{ zIndex: z }} aria-hidden="true">
      <canvas ref={canvasRef} className="rain-overlay__canvas" />
    </div>
  );
}
