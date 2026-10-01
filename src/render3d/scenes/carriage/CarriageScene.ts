// The carriage interior as a SceneModule: assembles shell, props, lighting,
// windows, passengers, dust and the rail camera, and runs their per-frame
// updates. Isolated from the game store: hover/select are reported through
// callbacks, so the real game can wire dialogue on top later.

import { Color, FogExp2, Mesh, Scene, Vector3 } from 'three';
import type { PerspectiveCamera, WebGLRenderer } from 'three';
import { RailCameraRig } from '../../camera/CameraRig';
import { TrainMotion } from '../../camera/TrainMotion';
import { createStripLightEnvironment } from '../../core/environment';
import type { EnvironmentHandle } from '../../core/environment';
import { InputState } from '../../input/InputState';
import { BoxPicker } from '../../interaction/BoxPicker';
import { createWindowMaterial } from '../../materials/WindowMaterial';
import type { WindowMaterialHandle } from '../../materials/WindowMaterial';
import type { FrameContext, QualityLevel, RenderSettings, SceneModule } from '../../types';
import { buildDust } from './atmosphere';
import type { DustMotes } from './atmosphere';
import { CEILING, HALF_WIDTH, LENGTH, TUBE_Z, WINDOW_BOTTOM, WINDOW_TOP, bayCenterZ, BAY_LENGTH } from './layout';
import { buildCarriageLighting } from './lighting';
import type { CarriageLighting } from './lighting';
import { createCarriageMaterials } from './materials';
import type { CarriageMaterials } from './materials';
import { buildPassengers, DEFAULT_PLACEMENTS } from './passengers';
import type { PassengerFigure, PassengerPlacement } from './passengers';
import { buildCarriageProps } from './props';
import type { CarriageProps } from './props';
import { buildCarriageShell } from './shell';
import type { CarriageShell } from './shell';

export interface HoverInfo {
  id: string;
  label: string;
  name: string;
}

export interface CarriageSceneOptions {
  runSeed: number;
  /** Input source; when omitted the scene creates (and owns) one on the canvas. */
  input?: InputState;
  placements?: readonly PassengerPlacement[];
  onHover?: (info: HoverInfo | null) => void;
  onSelect?: (info: HoverInfo) => void;
}

const FOG_COLOR = 0x07090c;
const FOG_DENSITY = 0.062;
const OUTSIDE_SPEED = 26; // m/s of the world streaming past
const DUST_MAX = 1600;
const DUST_LOW = 500;

export class CarriageScene implements SceneModule {
  readonly scene = new Scene();
  readonly camera: PerspectiveCamera;
  readonly rig: RailCameraRig;
  readonly motion = new TrainMotion();
  readonly input: InputState;
  readonly passengers: readonly PassengerFigure[];
  readonly lighting: CarriageLighting;

  private readonly ownsInput: boolean;
  private readonly options: CarriageSceneOptions;
  private readonly renderer: WebGLRenderer;
  private readonly env: EnvironmentHandle;
  private readonly mats: CarriageMaterials;
  private readonly shell: CarriageShell;
  private readonly props: CarriageProps;
  private readonly windows: WindowMaterialHandle;
  private readonly dust: DustMotes;
  private readonly picker = new BoxPicker();
  private readonly hoverInfo: HoverInfo[];
  private readonly highlight: Float32Array;
  private readonly interiorTint = new Color();
  private hovered = -1;
  private quality: QualityLevel | null = null;

  constructor(renderer: WebGLRenderer, options: CarriageSceneOptions) {
    this.renderer = renderer;
    this.options = options;
    this.ownsInput = !options.input;
    this.input = options.input ?? new InputState(renderer.domElement);
    const seed = options.runSeed | 0;

    const scene = this.scene;
    scene.background = new Color(FOG_COLOR);
    scene.fog = new FogExp2(FOG_COLOR, FOG_DENSITY);
    this.env = createStripLightEnvironment(renderer);
    scene.environment = this.env.texture;
    scene.environmentIntensity = 0.55;

    this.mats = createCarriageMaterials(seed, true);
    this.shell = buildCarriageShell(this.mats);
    scene.add(this.shell.group);

    this.windows = createWindowMaterial({
      ceilingY: CEILING,
      halfWidth: HALF_WIDTH,
      tubeZ: TUBE_Z,
      paneOriginZ: bayCenterZ(0) + BAY_LENGTH / 2,
      paneSpacing: BAY_LENGTH,
      glassBottom: WINDOW_BOTTOM,
      glassTop: WINDOW_TOP,
    });
    const glass = new Mesh(this.shell.glassGeometry, this.windows.material);
    glass.name = 'WindowGlass';
    glass.matrixAutoUpdate = false;
    scene.add(glass);

    const placements = options.placements ?? DEFAULT_PLACEMENTS;
    this.props = buildCarriageProps(this.mats, seed, placements);
    scene.add(this.props.group);

    this.lighting = buildCarriageLighting(seed, 'high');
    scene.add(this.lighting.group);

    this.passengers = buildPassengers({ runSeed: seed, placements });
    for (const p of this.passengers) scene.add(p.root);
    this.hoverInfo = this.passengers.map((p) => ({ id: p.id, label: p.label, name: p.name }));
    this.highlight = new Float32Array(this.passengers.length);

    this.dust = buildDust(seed, DUST_MAX);
    scene.add(this.dust.points);

    this.rig = new RailCameraRig({
      railStart: new Vector3(-0.1, 1.56, -0.35),
      railEnd: new Vector3(-0.1, 1.56, -LENGTH * 0.68),
      baseYaw: -0.24,
      basePitch: -0.07,
      endYawBias: 0.1,
    });
    this.camera = this.rig.camera;
  }

  update(ctx: FrameContext): void {
    const { dt, time, settings } = ctx;
    this.motion.update(dt);
    this.rig.update(dt, time, this.input, this.motion);

    const lighting = this.lighting;
    lighting.update(dt, time, settings.reduceFlashing);

    const w = this.windows;
    w.setTime(time, OUTSIDE_SPEED);
    const s = lighting.sodium;
    w.setSodium(s.z, s.intensity, s.side);
    for (let i = 0; i < lighting.levels.length; i++) w.setTubeIntensity(i, lighting.levels[i]);
    this.interiorTint.setRGB(0.55, 0.62, 0.66).multiplyScalar(0.4 + 0.6 * lighting.ambientLevel);
    w.setInteriorTint(this.interiorTint);

    this.dust.update(time, lighting.levels, this.renderer.getPixelRatio());
    this.props.update(time, this.motion.swayX, this.motion.shake);

    // Picking + highlight easing.
    const figures = this.passengers;
    const hit = this.input.pointerInside ? this.picker.pick(this.camera, this.input.pointer, figures) : -1;
    if (hit !== this.hovered) {
      this.hovered = hit;
      this.options.onHover?.(hit >= 0 ? this.hoverInfo[hit] : null);
    }
    if (this.input.consumeClick() && hit >= 0) this.options.onSelect?.(this.hoverInfo[hit]);
    const k = Math.min(1, dt * 7);
    for (let i = 0; i < figures.length; i++) {
      const target = i === hit ? 1 : 0;
      this.highlight[i] += (target - this.highlight[i]) * k;
      figures[i].setHighlight(this.highlight[i]);
      figures[i].update(dt, time);
    }
  }

  resize(width: number, height: number): void {
    this.rig.resize(width, height);
  }

  applySettings(settings: Readonly<RenderSettings>): void {
    if (settings.quality === this.quality) return;
    this.quality = settings.quality;
    const high = settings.quality === 'high';
    this.lighting.setQuality(settings.quality);
    this.dust.setCount(high ? DUST_MAX : DUST_LOW);
    this.windows.setDetail(high ? 1 : 0);
  }

  dispose(): void {
    if (this.ownsInput) this.input.dispose();
    for (const p of this.passengers) p.dispose();
    this.dust.dispose();
    this.lighting.dispose();
    this.props.dispose();
    this.windows.dispose();
    this.shell.dispose();
    this.mats.dispose();
    this.env.dispose();
    this.scene.environment = null;
    this.scene.clear();
  }
}

export function createCarriageScene(options: CarriageSceneOptions) {
  return (renderer: WebGLRenderer) => new CarriageScene(renderer, options);
}
