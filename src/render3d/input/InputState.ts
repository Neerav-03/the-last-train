// Polled input state (keyboard + pointer) shared by camera rigs and pickers.
// Event handlers only flip fields; consumers read them inside the frame loop,
// so nothing allocates per frame.

import { Vector2 } from 'three';

export type KeyListener = (code: string, event: KeyboardEvent) => void;

export class InputState {
  /** Pointer in normalised device coordinates (-1..1, y up). */
  readonly pointer = new Vector2(0, 0);
  pointerInside = false;
  private readonly keys = new Set<string>();
  private clickPending = false;
  private readonly keyListeners = new Set<KeyListener>();
  private readonly element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    element.addEventListener('pointermove', this.onPointerMove);
    element.addEventListener('pointerleave', this.onPointerLeave);
    element.addEventListener('pointerdown', this.onPointerDown);
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  /** -1..1 from two key groups, e.g. axis(['KeyA','ArrowLeft'], ['KeyD','ArrowRight']). */
  axis(negative: readonly string[], positive: readonly string[]): number {
    let v = 0;
    for (let i = 0; i < negative.length; i++) if (this.keys.has(negative[i])) { v -= 1; break; }
    for (let i = 0; i < positive.length; i++) if (this.keys.has(positive[i])) { v += 1; break; }
    return v;
  }

  /** True once per click. */
  consumeClick(): boolean {
    const c = this.clickPending;
    this.clickPending = false;
    return c;
  }

  /** Discrete key presses (toggles); returns an unsubscribe function. */
  onKey(listener: KeyListener): () => void {
    this.keyListeners.add(listener);
    return () => this.keyListeners.delete(listener);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.element.removeEventListener('pointermove', this.onPointerMove);
    this.element.removeEventListener('pointerleave', this.onPointerLeave);
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    this.keyListeners.clear();
    this.keys.clear();
  }

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
    if (!e.repeat) for (const l of this.keyListeners) l(e.code, e);
    this.keys.add(e.code);
    if (e.code.startsWith('Arrow')) e.preventDefault();
  };

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };

  private readonly onBlur = (): void => {
    this.keys.clear();
  };

  private readonly onPointerMove = (e: PointerEvent): void => {
    const r = this.element.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    this.pointerInside = true;
  };

  private readonly onPointerLeave = (): void => {
    this.pointerInside = false;
  };

  private readonly onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    this.onPointerMove(e);
    this.clickPending = true;
  };
}
