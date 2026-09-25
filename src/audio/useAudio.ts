// Small React convenience wrappers around AudioEngine.ts.
// Scene components are always free to call the AudioEngine functions
// directly instead - these hooks just cover the two most common patterns.

import { useEffect, useRef } from 'react';
import { initAudio, setAmbience, type AmbienceKind } from './AudioEngine';

/**
 * Declaratively keeps the ambience bed in sync with `kind`.
 * Crossfades whenever `kind` changes; safe to call every render.
 */
export function useAmbience(kind: AmbienceKind): void {
  useEffect(() => {
    setAmbience(kind);
  }, [kind]);
}

/**
 * Attaches one-time pointerdown/keydown listeners to `window` that call
 * initAudio() on the player's first interaction, then remove themselves.
 * This is a convenience for satisfying the browser autoplay policy - it
 * does not replace scenes calling initAudio() directly on their own
 * interactions (e.g. a "start" button click).
 */
export function useInitAudioOnFirstGesture(): void {
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGesture = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      initAudio();
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };

    window.addEventListener('pointerdown', handleGesture);
    window.addEventListener('keydown', handleGesture);

    return () => {
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);
}
