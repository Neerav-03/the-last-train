import { useEffect, useRef } from 'react';
import './DustParticles.css';

interface Mote {
  x: number;
  y: number;
  r: number;
  speedY: number;
  speedX: number;
  opacity: number;
  phase: number;
  warm: boolean;
}

/**
 * DustParticles — canvas-based floating dust motes drifting slowly
 * upward/sideways. Place inside a `position: relative` scene container.
 */
export default function DustParticles(props: { density?: number }) {
  const { density = 0.5 } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const motesRef = useRef<Mote[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clampedDensity = Math.max(0, Math.min(1, density));
    let width = 0;
    let height = 0;

    const makeMote = (): Mote => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.5 + Math.random() * 1.5,
      speedY: -(0.1 + Math.random() * 0.3),
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: 0.1 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      // A minority of motes catch warm light-shaft color; most stay neutral dust.
      warm: Math.random() < 0.18,
    });

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
      const count = Math.round(15 + clampedDensity * 70);
      motesRef.current = Array.from({ length: count }, makeMote);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let t = 0;

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);
      for (const m of motesRef.current) {
        const wobble = Math.sin(t * 0.02 + m.phase) * 0.4;
        // Gentle twinkle: opacity breathes slowly per-mote so the field never
        // feels static, without any single mote flashing abruptly.
        const twinkle = 0.75 + 0.25 * Math.sin(t * 0.015 + m.phase * 1.7);
        ctx.globalAlpha = m.opacity * twinkle;
        ctx.fillStyle = m.warm ? '#d8b874' : '#c9cdd6';
        ctx.beginPath();
        ctx.arc(m.x + wobble, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      t += 1;
      for (const m of motesRef.current) {
        m.y += m.speedY;
        m.x += m.speedX;
        if (m.y < -5) {
          m.y = height + 5;
          m.x = Math.random() * width;
        }
        if (m.x < -5) m.x = width + 5;
        if (m.x > width + 5) m.x = -5;
      }
      drawFrame();
      rafRef.current = requestAnimationFrame(step);
    };

    if (prefersReduced) {
      drawFrame();
    } else {
      rafRef.current = requestAnimationFrame(step);
    }

    return () => {
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [density]);

  return (
    <div ref={containerRef} className="dust-particles" aria-hidden="true">
      <canvas ref={canvasRef} className="dust-particles__canvas" />
    </div>
  );
}
