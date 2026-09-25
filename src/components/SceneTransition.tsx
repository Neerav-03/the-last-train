import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useGameStore } from '../engine/store';
import type { SceneId } from '../engine/types';
import './SceneTransition.css';

type Phase = 'idle' | 'out' | 'in';

interface SceneTransitionProps {
  /** The id of the scene whose content is currently being passed as `children`. */
  sceneKey: SceneId;
  children: ReactNode;
}

/**
 * SceneTransition — wraps the active scene and turns hard React-conditional
 * cuts into a brief cinematic "hold to black" beat whenever `sceneKey` changes:
 * the outgoing scene is held/faded behind a veil, swapped out while the veil
 * is opaque, then revealed. Content updates within the *same* scene (e.g. a
 * scene's own internal re-renders) pass straight through with no veil at all.
 *
 * Respects settings.reduceFlashing and prefers-reduced-motion: both collapse
 * the effect to a short, gentle opacity crossfade with no static/noise texture.
 */
export default function SceneTransition({ sceneKey, children }: SceneTransitionProps) {
  const reduceFlashing = useGameStore((s) => s.settings.reduceFlashing);

  const [prefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const gentle = reduceFlashing || prefersReducedMotion;

  const [activeKey, setActiveKey] = useState<SceneId>(sceneKey);
  const [phase, setPhase] = useState<Phase>('idle');

  // Snapshot of the content currently on screen — kept fresh while idle so a
  // transition always freezes the latest frame of the outgoing scene.
  const frozenRef = useRef<ReactNode>(children);
  const pendingKeyRef = useRef<SceneId | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (sceneKey === activeKey) {
      frozenRef.current = children;
    }
  }, [sceneKey, activeKey, children]);

  useEffect(() => {
    if (sceneKey === activeKey) return; // already showing the requested scene
    if (pendingKeyRef.current === sceneKey) return; // already mid-transition to this target

    pendingKeyRef.current = sceneKey;
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];

    const leg = gentle ? 220 : 340;

    setPhase('out');
    const outTimer = window.setTimeout(() => {
      frozenRef.current = children;
      setActiveKey(sceneKey);
      setPhase('in');
      pendingKeyRef.current = null;

      const inTimer = window.setTimeout(() => {
        setPhase('idle');
      }, leg);
      timersRef.current.push(inTimer);
    }, leg);
    timersRef.current.push(outTimer);
  }, [sceneKey, activeKey, children, gentle]);

  // Clean up any in-flight timers on unmount.
  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    },
    []
  );

  const nodeToRender = phase === 'out' ? frozenRef.current : children;

  const veilClass = [
    'scene-transition__veil',
    phase !== 'idle' ? 'scene-transition__veil--visible' : '',
    phase === 'out' ? 'scene-transition__veil--out' : '',
    phase === 'in' ? 'scene-transition__veil--in' : '',
    gentle ? 'scene-transition__veil--gentle' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="scene-transition">
      <div className="scene-transition__stage">{nodeToRender}</div>
      <div className={veilClass} aria-hidden="true">
        {!gentle && phase !== 'idle' && <div className="scene-transition__static" />}
      </div>
    </div>
  );
}
