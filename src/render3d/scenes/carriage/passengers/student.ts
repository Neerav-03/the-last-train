// The Student: slouched, hips slid forward, back reclined against the seat,
// head bowed, headphones on, hands in the hoodie pocket, legs sprawled with the
// aisle-side foot drifting into the aisle. That foot taps irregularly (heel
// pivot), with bursts that occasionally stop. 4 meshes.

import { FLOOR, HEAD_C, addArm, addHead, addLeg, addShoe, addTorso, breathCurve, breathe, makeFigure } from './kit';
import type { FigureInfo, FigureKit } from './kit';
import { PartList, trs } from './parts';
import type { V3 } from './parts';
import type { StudentFigure } from './types';

const TORSO_PITCH = -0.48;
const NECK_Y = 0.415;
const NECK_PITCH = 0.78;

export function buildStudent(kit: FigureKit, info: FigureInfo): StudentFigure {
  const hoodie = kit.color(0x5f5a34);
  const hoodieDark = kit.color(0x4d4a2c);
  const jeans = kit.color(0x3a4150);
  const shoes = kit.color(0x8e8c87, 0.5);
  const skin = kit.color(0x86705f);
  const hair = kit.color(0x2a221d);
  const phones = kit.color(0xb5b8be, 0.4);
  const root = kit.root;
  const a = info.aisleX;

  // ---- lower body (static leg + the shin of the tapping leg)
  const lower = new PartList();
  lower.capsule([-0.085, 0.045, 0.06], [0.085, 0.045, 0.06], 0.095, jeans, 8, 3);
  const tapAnkle: V3 = [a * 0.3, FLOOR + 0.08, 0.74];
  addLeg(lower, [a * 0.095, 0.08, 0.1], [a * 0.2, 0.13, 0.5], tapAnkle, 0.07, 0.047, jeans, jeans);
  const restAnkle: V3 = [-a * 0.14, FLOOR + 0.08, 0.82];
  addLeg(lower, [-a * 0.095, 0.08, 0.1], [-a * 0.12, 0.12, 0.53], restAnkle, 0.07, 0.047, jeans, jeans);
  addShoe(lower, restAnkle, shoes, [-a * 0.25, 0, 1], FLOOR, [0.1, 0.085, 0.27]);
  kit.mesh(lower, root);

  // ---- tapping foot: pivot at the heel contact point, built along +Z
  const yaw = Math.atan2(a * 0.35, 1);
  const heel = kit.group(root, [tapAnkle[0] - Math.sin(yaw) * 0.07, FLOOR, tapAnkle[2] - Math.cos(yaw) * 0.07], 0, yaw);
  heel.rotation.order = 'YXZ';
  const foot = new PartList();
  addShoe(foot, [0, 0.08, 0.07], shoes, [0, 0, 1], 0, [0.1, 0.085, 0.27]);
  kit.mesh(foot, heel);

  // ---- torso reclined against the seat back, hands in the pocket
  const torso = kit.group(root, [0, 0.09, 0.08], TORSO_PITCH);
  const breath = kit.group(torso);
  const up = new PartList();
  addTorso(up, hoodie, { height: 0.36, hipR: 0.158, waistR: 0.15, chestR: 0.158, shoulderR: 0.166, neckR: 0.05, depth: 0.7 });
  up.ellipsoid([0, 0.385, -0.085], [0.13, 0.075, 0.07], hoodieDark);
  up.torus(0.07, 0.03, hoodieDark, trs([0, 0.405, -0.01], Math.PI / 2 + 0.25), Math.PI * 2, 5, 10);
  up.aimedBox([0, 0.13, 0.108], [0.2, 0.11, 0.03], hoodieDark, [0, 0, 1]);
  for (const s of [-1, 1]) {
    addArm(up, [s * 0.172, 0.34, 0.0], [s * 0.215, 0.11, -0.01], [s * 0.06, 0.125, 0.1], hoodie, skin, { rU: 0.052, rF: 0.047 });
  }
  kit.mesh(up, breath);

  // ---- head bowed, longer hair, headphones
  const neck = kit.group(torso, [0, NECK_Y, 0.0], NECK_PITCH);
  const head = new PartList();
  addHead(head, skin, 0.094);
  const [hx, hy, hz] = HEAD_C;
  head.ellipsoid([hx, hy + 0.02, hz - 0.025], [0.1, 0.1, 0.095], hair, undefined, [0, 1, 0], 10, 7);
  head.ellipsoid([hx, hy - 0.07, hz - 0.045], [0.1, 0.12, 0.065], hair, undefined, [0, 1, 0], 8, 6);
  for (const s of [-1, 1]) {
    head.ellipsoid([s * 0.077, hy - 0.06, hz + 0.02], [0.025, 0.08, 0.04], hair, undefined, [0, 1, 0], 6, 5);
    head.cylinder([s * 0.098, hy - 0.004, hz - 0.006], [s * 0.134, hy - 0.004, hz - 0.006], 0.044, 0.04, phones, 10);
  }
  head.torus(0.124, 0.012, phones, trs([hx, hy - 0.004, hz - 0.006], -0.12), Math.PI, 4, 12);
  kit.mesh(head, neck);

  // ---- animation
  const r = kit.rng;
  const breathPhase = r() * Math.PI * 2;
  const breathW = (0.21 + r() * 0.03) * Math.PI * 2;
  const beatPhase = r();
  let rate = 1.9 + r() * 0.5;
  let enabled = true;
  let on = true;
  let switchAt = -1;
  let env = 0;
  let beatPos = beatPhase;

  const update = (dt: number, time: number): void => {
    const b = breathCurve(time * breathW + breathPhase);
    breathe(breath, b, 0.016);
    torso.rotation.x = TORSO_PITCH - 0.008 * b;

    if (switchAt < 0) switchAt = time + 3 + r() * 5;
    if (time >= switchAt) {
      on = !on;
      switchAt = time + (on ? 3 + r() * 6 : 1 + r() * 2.5);
      if (on) rate = 1.8 + r() * 0.6;
    }
    const target = enabled && on ? 1 : 0;
    env += (target - env) * Math.min(1, dt * 3.5);
    beatPos += dt * rate;
    if (beatPos > 1) beatPos -= Math.floor(beatPos);
    const c = 0.5 - 0.5 * Math.cos(beatPos * Math.PI * 2);
    const lift = c * c * env;
    heel.rotation.x = -0.3 * lift;
    neck.rotation.x = NECK_PITCH + 0.006 * b + 0.022 * lift;
  };

  return makeFigure(kit, info, update, {
    setTapping(value: boolean): void {
      enabled = value;
    },
  });
}
