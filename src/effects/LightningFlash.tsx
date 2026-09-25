import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../engine/store';
import './LightningFlash.css';

/**
 * LightningFlash — renders nothing until `trigger` changes, then plays one
 * brief full-parent white flash that fades out. Parent should be
 * `position: relative` and sized to the area that should flash.
 *
 * Internally reads settings.reduceFlashing (read-only) in addition to the
 * OS-level prefers-reduced-motion query; either one trims this down to a
 * single short, dim pulse with no double-strike and no afterglow tail.
 */
export default function LightningFlash(props: { trigger: number }) {
  const { trigger } = props;
  const reduceFlashing = useGameStore((s) => s.settings.reduceFlashing);
  const prevTrigger = useRef(trigger);
  const [flash, setFlash] = useState<{ id: number; duration: number; safe: boolean } | null>(
    null
  );

  useEffect(() => {
    if (trigger !== prevTrigger.current) {
      prevTrigger.current = trigger;

      const prefersReduced =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const safe = reduceFlashing || prefersReduced;
      const duration = safe ? 120 : 380 + Math.random() * 320;
      setFlash({ id: Date.now(), duration, safe });
    }
  }, [trigger, reduceFlashing]);

  if (!flash) return null;

  return (
    <>
      <div
        key={flash.id}
        className={`lightning-flash${flash.safe ? ' lightning-flash--safe' : ''}`}
        aria-hidden="true"
        style={{ animationDuration: `${flash.duration}ms` }}
        onAnimationEnd={() => setFlash(null)}
      />
      {!flash.safe && (
        <div
          key={`${flash.id}-afterglow`}
          className="lightning-flash-afterglow"
          aria-hidden="true"
          style={{ animationDuration: `${flash.duration * 1.6}ms` }}
        />
      )}
    </>
  );
}
