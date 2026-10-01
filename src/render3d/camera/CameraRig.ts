// Camera rigs. The game talks to the CameraRig interface only, so the current
// 2.5D rail rig can later be swapped for a free first-person rig (same
// update/resize contract, same InputState) without touching scenes.

import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import type { InputState } from '../input/InputState';
import type { TrainMotion } from './TrainMotion';

export interface CameraRig {
  readonly camera: PerspectiveCamera;
  update(dt: number, time: number, input: InputState, motion: TrainMotion | null): void;
  resize(width: number, height: number): void;
}

export interface RailRigConfig {
  /** Rail end points in world space; t=0 at railStart. */
  railStart: Vector3;
  railEnd: Vector3;
  startT: number;
  /** Base heading (radians, 0 looks down -Z) and pitch. */
  baseYaw: number;
  basePitch: number;
  /** Mouse look-around range in radians (a few degrees, not free look). */
  lookYaw: number;
  lookPitch: number;
  /** Metres per second at full input. */
  speed: number;
  /** Handheld noise amplitude in radians. */
  handheld: number;
  fov: number;
  /** Extra yaw blended in as the camera reaches the far end (looks at the door). */
  endYawBias: number;
}

export const DEFAULT_RAIL_RIG: RailRigConfig = {
  railStart: new Vector3(0, 1.55, -1),
  railEnd: new Vector3(0, 1.55, -12),
  startT: 0,
  baseYaw: 0,
  basePitch: -0.06,
  lookYaw: MathUtils.degToRad(6),
  lookPitch: MathUtils.degToRad(3.5),
  speed: 1.4,
  handheld: MathUtils.degToRad(0.22),
  fov: 50,
  endYawBias: 0,
};

const BACK_KEYS = ['KeyA', 'ArrowLeft', 'KeyS', 'ArrowDown'] as const;
const FORWARD_KEYS = ['KeyD', 'ArrowRight', 'KeyW', 'ArrowUp'] as const;

/** A dolly on a straight rail down the aisle, with eased input and lens life. */
export class RailCameraRig implements CameraRig {
  readonly camera: PerspectiveCamera;
  readonly config: RailRigConfig;
  /** Current rail parameter, 0..1. */
  t: number;
  private velocity = 0;
  private lookX = 0;
  private lookY = 0;
  private readonly base = new Vector3();

  constructor(config: Partial<RailRigConfig> = {}) {
    this.config = { ...DEFAULT_RAIL_RIG, ...config };
    this.t = this.config.startT;
    this.camera = new PerspectiveCamera(this.config.fov, 16 / 9, 0.05, 60);
    this.camera.rotation.order = 'YXZ';
    this.update(0, 0, null, null);
  }

  resize(width: number, height: number): void {
    const aspect = width / height;
    this.camera.aspect = aspect;
    // Keep horizontal coverage on narrow (portrait) screens.
    this.camera.fov = aspect < 1.2 ? this.config.fov * Math.min(1.6, 1.2 / aspect) : this.config.fov;
    this.camera.updateProjectionMatrix();
  }

  update(dt: number, time: number, input: InputState | null, motion: TrainMotion | null): void {
    const c = this.config;
    const length = c.railStart.distanceTo(c.railEnd) || 1;
    if (input) {
      const axis = input.axis(BACK_KEYS, FORWARD_KEYS);
      // Critically damped-ish acceleration so starts/stops feel like a dolly.
      const target = (axis * c.speed) / length;
      this.velocity += (target - this.velocity) * Math.min(1, dt * 4);
      const px = input.pointerInside ? input.pointer.x : 0;
      const py = input.pointerInside ? input.pointer.y : 0;
      const k = Math.min(1, dt * 3);
      this.lookX += (px - this.lookX) * k;
      this.lookY += (py - this.lookY) * k;
    }
    this.t = MathUtils.clamp(this.t + this.velocity * dt, 0, 1);
    if ((this.t === 0 && this.velocity < 0) || (this.t === 1 && this.velocity > 0)) this.velocity = 0;

    const ease = MathUtils.smootherstep(this.t, 0, 1);
    this.base.lerpVectors(c.railStart, c.railEnd, this.t);
    const cam = this.camera;
    cam.position.copy(this.base);

    // Handheld: layered incommensurate sines (cheap, smooth, no allocation).
    const h = c.handheld;
    const nYaw = h * (Math.sin(time * 0.71) * 0.6 + Math.sin(time * 1.37 + 1.1) * 0.3 + Math.sin(time * 3.1) * 0.1);
    const nPitch = h * (Math.sin(time * 0.53 + 2.0) * 0.6 + Math.sin(time * 1.91) * 0.4);

    let roll = 0;
    if (motion) {
      cam.position.x += motion.swayX;
      cam.position.y += motion.bounceY + motion.shake;
      roll = motion.roll;
    }
    cam.rotation.set(
      c.basePitch + this.lookY * c.lookPitch + nPitch,
      c.baseYaw + c.endYawBias * ease - this.lookX * c.lookYaw + nYaw,
      roll,
    );
  }
}
