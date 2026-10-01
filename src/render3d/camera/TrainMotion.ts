// The train's body motion, shared by anything that should feel it: the camera
// rig, hanging props, light swing, and later audio (rail-joint clatter is
// exposed as an event counter so a sound can be fired on the same beat).

export interface TrainMotionConfig {
  /** Seconds between rail joints (the "clack" period). */
  clatterPeriod: number;
  /** Gap between the front and rear bogie hitting the same joint. */
  bogieGap: number;
  /** Strength multiplier for every term (0 = perfectly smooth). */
  intensity: number;
}

export const DEFAULT_TRAIN_MOTION: TrainMotionConfig = {
  clatterPeriod: 0.9,
  bogieGap: 0.13,
  intensity: 1,
};

export class TrainMotion {
  readonly config: TrainMotionConfig;
  /** Lateral sway in metres (+x). */
  swayX = 0;
  /** Vertical bounce in metres. */
  bounceY = 0;
  /** Body roll in radians. */
  roll = 0;
  /** Short-lived vertical shake from the latest rail joint (metres). */
  shake = 0;
  /** Increments on every rail-joint hit (both bogies). */
  clatterCount = 0;

  private time = 0;
  private nextHit = 0.4;
  private hitIsRear = false;
  private shakeVel = 0;
  private jitter = 0;

  constructor(config: Partial<TrainMotionConfig> = {}) {
    this.config = { ...DEFAULT_TRAIN_MOTION, ...config };
  }

  update(dt: number): void {
    const t = (this.time += dt);
    const k = this.config.intensity;
    // Slow, layered, never-quite-repeating body motion.
    this.swayX = k * (0.006 * Math.sin(t * 1.13) + 0.0035 * Math.sin(t * 2.71 + 1.3) + 0.002 * Math.sin(t * 0.37));
    this.roll = k * (0.0042 * Math.sin(t * 0.91 + 0.4) + 0.0018 * Math.sin(t * 2.3));
    this.bounceY = k * (0.0025 * Math.sin(t * 3.1) + 0.0015 * Math.sin(t * 5.7 + 2.0));

    // Rail joints: a damped spring kicked twice per period (front, rear bogie).
    if (t >= this.nextHit) {
      this.shakeVel -= (this.hitIsRear ? 0.075 : 0.11) * k;
      this.clatterCount++;
      if (this.hitIsRear) {
        // Deterministic-looking but slightly irregular, like real track.
        this.jitter = (this.jitter * 9301 + 49297) % 233280;
        const wobble = (this.jitter / 233280 - 0.5) * 0.06;
        this.nextHit += this.config.clatterPeriod - this.config.bogieGap + wobble;
      } else {
        this.nextHit += this.config.bogieGap;
      }
      this.hitIsRear = !this.hitIsRear;
    }
    // Critically-ish damped spring towards 0.
    const stiffness = 900;
    const damping = 38;
    this.shakeVel += (-stiffness * this.shake - damping * this.shakeVel) * dt;
    this.shake += this.shakeVel * dt;
  }
}
