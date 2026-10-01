// The Old Man: hunched far forward over a cane, rounded back, flat cap, head
// low and turned to the window. Slow, heavy breathing. 3 meshes.

import { FLOOR, addArm, addHead, addLeg, addShoe, addTorso, breathCurve, breathe, makeFigure, HEAD_C } from './kit';
import type { FigureInfo, FigureKit } from './kit';
import { PartList, solveElbow, trs } from './parts';
import type { V3 } from './parts';
import type { PassengerFigure } from './types';

const TORSO_PITCH = 0.56;
const NECK_Y = 0.425;
const NECK_PITCH = -0.27;

export function buildOldMan(kit: FigureKit, info: FigureInfo): PassengerFigure {
  const coat = kit.color(0x4b4339);
  const coatDark = kit.color(0x3e372f);
  const trousers = kit.color(0x34302b);
  const shoes = kit.color(0x1c1a17, 0.5);
  const skin = kit.color(0x8a7466);
  const capC = kit.color(0x3a3732);
  const hair = kit.color(0x8b8984, 0.5);
  const scarf = kit.color(0x343d37);
  const cane = kit.color(0x3b2b1f, 0.5);
  const root = kit.root;

  // ---- lower body + cane (static)
  const lower = new PartList();
  lower.capsule([-0.085, 0.075, -0.03], [0.085, 0.075, -0.03], 0.1, coatDark, 8, 3);
  for (const s of [-1, 1]) {
    const hip: V3 = [s * 0.095, 0.1, 0.0];
    const knee: V3 = [s * 0.135, 0.11, 0.42];
    const ankle: V3 = [s * 0.145, FLOOR + 0.075, 0.455];
    addLeg(lower, hip, knee, ankle, 0.079, 0.05, coat, trousers);
    addShoe(lower, ankle, shoes, [s * 0.18, 0, 1]);
  }
  lower.cylinder([0, FLOOR, 0.6], [0, 0.205, 0.5], 0.012, 0.014, cane, 6);
  lower.capsule([-0.055, 0.215, 0.5], [0.045, 0.215, 0.5], 0.017, cane, 6, 2);
  kit.mesh(lower, root);

  // ---- torso (pitched forward) with arms resting on the cane
  const torso = kit.group(root, [0, 0.1, -0.06], TORSO_PITCH);
  const breath = kit.group(torso);
  const up = new PartList();
  addTorso(up, coat, { height: 0.39, hipR: 0.162, waistR: 0.156, chestR: 0.168, shoulderR: 0.172, neckR: 0.05, depth: 0.7 });
  // Rounded upper back (hump) and slumped shoulders.
  up.ellipsoid([0, 0.29, -0.05], [0.155, 0.13, 0.1], coat);
  up.torus(0.058, 0.03, scarf, trs([0, 0.415, 0.012], Math.PI / 2 - 0.25), Math.PI * 2, 5, 10);
  const lHand = kit.toLocal(torso, [0.012, 0.262, 0.5]);
  const rHand = kit.toLocal(torso, [-0.012, 0.23, 0.5]);
  for (const s of [-1, 1] as const) {
    const sh: V3 = [s * 0.172, 0.355, 0.035];
    const hand = s === 1 ? lHand : rHand;
    const elbow = solveElbow(sh, hand, 0.28, 0.27, [s * 0.55, -0.6, -0.55]);
    const across = kit.toLocal(torso, [-s * 1, -0.3, 0.25]);
    const origin = kit.toLocal(torso, [0, 0, 0]);
    addArm(up, sh, elbow, hand, coat, skin, {
      rU: 0.05,
      rF: 0.044,
      handDir: [across[0] - origin[0], across[1] - origin[1], across[2] - origin[2]],
    });
  }
  kit.mesh(up, breath);

  // ---- head: low, turned toward the window; flat cap
  const neck = kit.group(torso, [0, NECK_Y, 0.035], NECK_PITCH, 0.8 * info.windowX);
  const head = new PartList();
  addHead(head, skin, 0.098);
  const [hx, hy, hz] = HEAD_C;
  head.ellipsoid([hx, hy - 0.004, hz - 0.03], [0.09, 0.074, 0.088], hair, undefined, [0, 1, 0], 8, 6);
  head.ellipsoid([hx, hy - 0.036, hz + 0.088], [0.03, 0.009, 0.014], hair, undefined, [0, 1, 0], 6, 4);
  head.ellipsoid([hx, hy + 0.068, hz - 0.006], [0.097, 0.042, 0.108], capC, undefined, [0, 1, 0], 10, 6);
  head.ellipsoid([hx, hy + 0.052, hz + 0.092], [0.084, 0.012, 0.052], capC, [0, -0.3, 1], [0, 1, 0], 8, 4);
  kit.mesh(head, neck);

  const r = kit.rng;
  const phase = r() * Math.PI * 2;
  const drift = r() * Math.PI * 2;
  const freq = (0.16 + r() * 0.03) * Math.PI * 2;
  const baseYaw = neck.rotation.y;

  const update = (_dt: number, time: number): void => {
    const b = breathCurve(time * freq + phase);
    breathe(breath, b, 0.022);
    torso.rotation.x = TORSO_PITCH - 0.014 * b;
    neck.position.y = NECK_Y + 0.006 * b;
    neck.rotation.x = NECK_PITCH + 0.012 * b + 0.02 * Math.sin(time * 0.31 + drift);
    neck.rotation.y = baseYaw + 0.035 * Math.sin(time * 0.19 + drift * 1.7);
  };

  return makeFigure(kit, info, update, {});
}

