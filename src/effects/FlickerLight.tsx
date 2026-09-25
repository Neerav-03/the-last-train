import { useEffect, useRef, useState } from 'react';
import './FlickerLight.css';

/**
 * FlickerLight — a dying-fluorescent-tube style radial glow.
 * Positioned via percentage x/y within a `position: relative` parent.
 */
export default function FlickerLight(props: {
  x: number;
  y: number;
  radius?: number;
  color?: string;
  active?: boolean;
}) {
  const { x, y, radius = 220, color = '#dce8f0', active = true } = props;
  const [brightness, setBrightness] = useState(1);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setBrightness(0);
      return;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      // Steady light, no strobing.
      setBrightness(1);
      return;
    }

    let cancelled = false;

    const scheduleNext = () => {
      if (cancelled) return;

      const roll = Math.random();
      let eventBrightness = 1;
      let eventMs = 0;

      if (roll < 0.08) {
        // full dropout stutter
        eventBrightness = 0;
        eventMs = 40 + Math.random() * 120;
      } else if (roll < 0.22) {
        // dim stutter
        eventBrightness = 0.2 + Math.random() * 0.35;
        eventMs = 80 + Math.random() * 220;
      } else if (roll < 0.3) {
        // brief bright surge, then settle
        eventBrightness = 1;
        eventMs = 100 + Math.random() * 150;
      }

      const holdMs = 700 + Math.random() * 2600;

      if (eventMs > 0) {
        setBrightness(eventBrightness);
        timeoutRef.current = window.setTimeout(() => {
          if (cancelled) return;
          setBrightness(1);
          timeoutRef.current = window.setTimeout(scheduleNext, holdMs);
        }, eventMs);
      } else {
        timeoutRef.current = window.setTimeout(scheduleNext, holdMs);
      }
    };

    timeoutRef.current = window.setTimeout(scheduleNext, 600 + Math.random() * 1500);

    return () => {
      cancelled = true;
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, [active]);

  return (
    <div
      className="flicker-light"
      aria-hidden="true"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
        opacity: active ? brightness : 0,
      }}
    >
      <div
        className="flicker-light__halo"
        style={{
          background: `radial-gradient(circle, ${color}55 0%, ${color}22 35%, transparent 70%)`,
        }}
      />
      <div
        className="flicker-light__core"
        style={{
          background: `radial-gradient(circle, #ffffff 0%, ${color}cc 25%, transparent 65%)`,
        }}
      />
    </div>
  );
}
