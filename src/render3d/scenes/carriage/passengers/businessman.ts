// The Businessman: stiff, perfectly upright, knees together, briefcase at his
// feet. Every few seconds (seeded, irregular) he lifts his left forearm, turns
// the wrist and looks down at his watch, holds, then lowers. Pose blending is
// quaternion slerp between precomputed rest/check frames. 5 meshes.

import { Quaternion, Vector3 } from 'three';
import { FLOOR, HEAD_C, addArm, addHead, addLeg, addShoe, addTorso, breathCurve, breathe, envelope, makeFigure } from './kit';
import type { FigureInfo, FigureKit } from './kit';
import { PartList, aimQuat, solveElbow, trs } from './parts';
import type { V3 } from './parts';
import type { PassengerFigure } from './types';

const NECK_Y = 0.43;
const SHOULDER: V3 = [0.19, 0.365, 0.0];
const L1 = 0.27;
const RAISE = 0.85;
const HOLD = 1.2;
const LOWER = 0.9;

export function buildBusinessman(kit: FigureKit, info: FigureInfo): PassengerFigure {
  const suit = kit.color(0x323338);
  const suitDark = kit.color(0x26272b);
  const shirt = kit.color(0xb4b3ad, 0.5);
  const tie = kit.color(0x1c1f29, 0.5);
  const skin = kit.color(0x8d7869);
  const hair = kit.color(0x1e1b19, 0.4);
  const shoes = kit.color(0x111113, 0.3);
  const leather = kit.color(0x2f2620);
  const metal = kit.color(0xb9b5a9, 0.3);
  const strap = kit.color(0x161616, 0.3);
  const root = kit.root;
  const wx = info.windowX;

  // ---- lower body + briefcase
  const lower = new PartList();
  lower.capsule([-0.085, 0.075, -0.04], [0.085, 0.075, -0.04], 0.098, suitDark, 8, 3);
  for (const s of [-1, 1]) {
    const hip: V3 = [s * 0.09, 0.1, -0.01];
    const knee: V3 = [s * 0.07, 0.102, 0.44];
    const ankle: V3 = [s * 0.075, FLOOR + 0.075, 0.455];
    addLeg(lower, hip, knee, ankle, 0.072, 0.046, suit, suit);
    addShoe(lower, ankle, shoes, [0, 0, 1], FLOOR, [0.092, 0.07, 0.26]);
  }
  lower.box([wx * 0.34, FLOOR + 0.15, 0.36], [0.4, 0.3, 0.1], leather);
  lower.box([wx * 0.34, FLOOR + 0.312, 0.36], [0.1, 0.022, 0.02], strap);
  kit.mesh(lower, root);

  // ---- torso (upright) with the static right arm
  const torso = kit.group(root, [0, 0.1, -0.07]);
  const breath = kit.group(torso);
  const up = new PartList();
  addTorso(up, suit, { height: 0.375, hipR: 0.155, waistR: 0.148, chestR: 0.168, shoulderR: 0.186, neckR: 0.047, depth: 0.62 });
  const tieN: V3 = [0, -0.104, 0.995];
  up.aimedBox([0, 0.345, 0.114], [0.08, 0.1, 0.012], shirt, tieN);
  up.aimedBox([0, 0.25, 0.112], [0.042, 0.22, 0.012], tie, tieN);
  up.aimedBox([0, 0.372, 0.124], [0.034, 0.03, 0.016], tie, tieN);
  up.torus(0.05, 0.016, shirt, trs([0, 0.43, 0.008], Math.PI / 2 - 0.15), Math.PI * 2, 5, 10);
  {
    const sh: V3 = [-SHOULDER[0], SHOULDER[1], SHOULDER[2]];
    const hand = kit.toLocal(torso, [-0.1, 0.2, 0.3]);
    const elbow = solveElbow(sh, hand, L1, 0.3, [-0.4, 0, -1]);
    addArm(up, sh, elbow, hand, suit, skin, { rU: 0.05, rF: 0.044, capR: 0.062 });
  }
  kit.mesh(up, breath);

  // ---- animated left arm: shoulder pivot -> elbow pivot; limbs along local +Z
  const shoulder = kit.group(torso, SHOULDER);
  const upperArm = new PartList();
  upperArm.sphere([0, 0, 0], 0.062, suit, 8, 6);
  upperArm.capsule([0, 0, 0], [0, 0, L1], 0.05, suit, 8, 3);
  kit.mesh(upperArm, shoulder);

  const elbow = kit.group(shoulder, [0, 0, L1]);
  const fore = new PartList();
  fore.sphere([0, 0, 0], 0.046, suit, 8, 5);
  fore.cylinder([0, 0, 0], [0, 0, 0.2], 0.045, 0.043, suit, 8);
  fore.cylinder([0, 0, 0.2], [0, 0, 0.216], 0.04, 0.04, shirt, 8);
  fore.cylinder([0, 0, 0.21], [0, 0, 0.262], 0.031, 0.029, skin, 7);
  fore.cylinder([0, 0, 0.226], [0, 0, 0.244], 0.034, 0.034, strap, 8);
  fore.cylinder([0, 0.031, 0.235], [0, 0.041, 0.235], 0.018, 0.018, metal, 10);
  fore.ellipsoid([0, -0.004, 0.305], [0.037, 0.02, 0.056], skin, [0, 0, 1], [0, 1, 0], 8, 5);
  kit.mesh(fore, elbow);

  // Rest and check frames, solved in torso space then made local.
  const S = new Vector3(SHOULDER[0], SHOULDER[1], SHOULDER[2]);
  const frames = (upperDir: Vector3, handTorso: Vector3 | null, foreDir: Vector3 | null, foreUp: Vector3) => {
    const qU = aimQuat(upperDir, new Vector3(0, 0, 1));
    const e = S.clone().addScaledVector(upperDir.clone().normalize(), L1);
    const fd = foreDir ?? handTorso!.clone().sub(e);
    const qF = aimQuat(fd, foreUp);
    const qE = qU.clone().invert().multiply(qF);
    return { qU, qE };
  };
  const restHand = kit.toLocal(torso, [0.1, 0.2, 0.3]);
  const rest = frames(new Vector3(0.02, -0.95, 0.3), new Vector3(restHand[0], restHand[1], restHand[2]), null, new Vector3(0, 1, 0));
  const check = frames(new Vector3(-0.15, -0.45, 0.88), null, new Vector3(-0.85, 0.35, 0.2), new Vector3(0.13, 0.65, -0.75));
  const qURest: Quaternion = rest.qU;
  const qERest: Quaternion = rest.qE;
  const qUCheck: Quaternion = check.qU;
  const qECheck: Quaternion = check.qE;
  shoulder.quaternion.copy(qURest);
  elbow.quaternion.copy(qERest);

  // ---- head
  const neck = kit.group(torso, [0, NECK_Y, 0.0]);
  const head = new PartList();
  addHead(head, skin, 0.098);
  const [hx, hy, hz] = HEAD_C;
  head.ellipsoid([hx, hy + 0.03, hz - 0.016], [0.091, 0.083, 0.097], hair, undefined, [0, 1, 0], 10, 6);
  kit.mesh(head, neck);

  // ---- animation
  const r = kit.rng;
  const breathPhase = r() * Math.PI * 2;
  const breathW = (0.25 + r() * 0.03) * Math.PI * 2;
  let next = -1;
  let start = -100;
  let active = false;

  const update = (_dt: number, time: number): void => {
    const b = breathCurve(time * breathW + breathPhase);
    breathe(breath, b, 0.01);
    shoulder.position.y = SHOULDER[1] + 0.003 * b;
    neck.position.y = NECK_Y + 0.003 * b;

    if (next < 0) next = time + 1.5 + r() * 3.5;
    if (!active && time >= next) {
      active = true;
      start = time;
    }
    let a = 0;
    let h = 0;
    if (active) {
      const t = time - start;
      a = envelope(t, RAISE, HOLD, LOWER);
      h = envelope(t - 0.22, 0.6, RAISE + HOLD - 0.65, 0.7);
      const end = RAISE + HOLD + LOWER + 0.25;
      if (t > end) {
        active = false;
        // Mostly every 4-7 s; sometimes he checks it again almost at once.
        next = r() < 0.18 ? time + 0.9 + r() * 0.6 : start + 4 + r() * 3;
        if (next < time + 0.5) next = time + 0.5;
      }
    }
    shoulder.quaternion.slerpQuaternions(qURest, qUCheck, a);
    elbow.quaternion.slerpQuaternions(qERest, qECheck, a);
    neck.rotation.set(0.42 * h, -0.1 * h, 0);
  };

  return makeFigure(kit, info, update, {});
}
