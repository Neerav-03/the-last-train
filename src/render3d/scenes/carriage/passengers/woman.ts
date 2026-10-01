// The Woman: curled slightly forward, arms forming a cradle around a small
// swaddled child, head tilted down toward it. Slow rocking; the child makes
// small irregular, eased shifts. setChildVisible(false) hides only the child:
// the arms stay curved around empty air. 4 meshes.

import { FLOOR, HEAD_C, addArm, addHead, addLeg, addShoe, addTorso, breathCurve, breathe, makeFigure, smooth01 } from './kit';
import type { FigureInfo, FigureKit } from './kit';
import { PartList, trs } from './parts';
import type { V3 } from './parts';
import type { WomanFigure } from './types';

const TORSO_PITCH = 0.24;
const NECK_Y = 0.415;
const NECK_PITCH = 0.44;
const CHILD_RZ = 0.2;

export function buildWoman(kit: FigureKit, info: FigureInfo): WomanFigure {
  const coat = kit.color(0x4f2f3b);
  const coatDark = kit.color(0x40262f);
  const tights = kit.color(0x29242a);
  const shoes = kit.color(0x191618, 0.5);
  const skin = kit.color(0x9a8273);
  const hair = kit.color(0x2b221f);
  const blanket = kit.color(0xb9b3a7, 0.6);
  const childSkin = kit.color(0x9e8576, 0.6);
  const root = kit.root;

  // ---- lower body: knees together, coat over the thighs
  const lower = new PartList();
  lower.capsule([-0.08, 0.075, -0.03], [0.08, 0.075, -0.03], 0.098, coatDark, 8, 3);
  for (const s of [-1, 1]) {
    const hip: V3 = [s * 0.085, 0.1, 0.0];
    const knee: V3 = [s * 0.066, 0.105, 0.41];
    const ankle: V3 = [s * 0.072, FLOOR + 0.07, 0.44];
    addLeg(lower, hip, knee, ankle, 0.074, 0.042, coat, tights);
    addShoe(lower, ankle, shoes, [s * 0.05, 0, 1], FLOOR, [0.08, 0.065, 0.22]);
  }
  kit.mesh(lower, root);

  // ---- torso + cradling arms
  const torso = kit.group(root, [0, 0.1, -0.055], TORSO_PITCH);
  const breath = kit.group(torso);
  const up = new PartList();
  addTorso(up, coat, { height: 0.37, hipR: 0.158, waistR: 0.136, chestR: 0.152, shoulderR: 0.158, neckR: 0.046, depth: 0.66 });
  up.torus(0.056, 0.024, coatDark, trs([0, 0.4, 0.008], Math.PI / 2 - 0.2), Math.PI * 2, 5, 10);
  // Left arm (+x) holds the child's head in the crook; right arm wraps over.
  addArm(up, [0.165, 0.345, 0.01], [0.168, 0.13, 0.125], [-0.085, 0.152, 0.215], coat, skin, { rU: 0.045, rF: 0.039 });
  addArm(up, [-0.165, 0.345, 0.01], [-0.178, 0.15, 0.1], [0.05, 0.25, 0.272], coat, skin, { rU: 0.045, rF: 0.039, handUp: [0, 0.4, 1] });
  kit.mesh(up, breath);

  // ---- the child (own pivot so it can shift and vanish)
  const child = kit.group(torso, [0, 0.205, 0.19], 0, 0, CHILD_RZ);
  const kid = new PartList();
  kid.capsule([-0.1, 0, 0], [0.065, 0, 0.0], 0.068, blanket, 8, 3);
  kid.sphere([0.112, 0.012, -0.008], 0.07, blanket, 9, 6);
  kid.sphere([0.124, 0.02, 0.03], 0.05, childSkin, 9, 6);
  kit.mesh(kid, child);

  // ---- head tilted down toward the child
  const neck = kit.group(torso, [0, NECK_Y, 0.02], NECK_PITCH, 0.16, -0.08);
  const head = new PartList();
  addHead(head, skin, 0.095);
  const [hx, hy, hz] = HEAD_C;
  head.ellipsoid([hx, hy + 0.02, hz - 0.03], [0.097, 0.1, 0.092], hair, undefined, [0, 1, 0], 10, 7);
  head.ellipsoid([hx, hy - 0.08, hz - 0.065], [0.085, 0.11, 0.05], hair, undefined, [0, 1, 0], 8, 5);
  kit.mesh(head, neck);

  // ---- animation state (plain numbers; no allocation in update)
  const r = kit.rng;
  const rockPhase = r() * Math.PI * 2;
  const breathPhase = r() * Math.PI * 2;
  const rockW = (0.25 + r() * 0.04) * Math.PI * 2;
  const breathW = (0.23 + r() * 0.04) * Math.PI * 2;
  let next = -1;
  let start = 0;
  let dur = 1;
  let fx = 0, fy = 0, fz = CHILD_RZ, fp = 0;
  let tx = 0, ty = 0, tz = CHILD_RZ, tp = 0;

  const update = (_dt: number, time: number): void => {
    const rock = Math.sin(time * rockW + rockPhase);
    const sway = Math.sin(time * rockW * 0.5 + rockPhase * 0.7);
    const b = breathCurve(time * breathW + breathPhase);
    breathe(breath, b, 0.014);
    torso.rotation.x = TORSO_PITCH + 0.045 * rock;
    torso.rotation.z = 0.016 * sway;
    neck.position.y = NECK_Y + 0.004 * b;
    neck.rotation.x = NECK_PITCH - 0.02 * rock;

    if (next < 0) next = time + 1.5 + r() * 3;
    if (time >= next) {
      fx = tx; fy = ty; fz = tz; fp = tp;
      if (r() < 0.35) {
        tx = 0; ty = 0; tz = CHILD_RZ; tp = 0;
      } else {
        tx = (r() - 0.5) * 0.14;
        ty = (r() - 0.5) * 0.16;
        tz = CHILD_RZ + (r() - 0.5) * 0.16;
        tp = (r() - 0.5) * 0.012;
      }
      start = time;
      dur = 0.45 + r() * 0.5;
      next = time + dur + 2 + r() * 4;
    }
    const k = smooth01((time - start) / dur);
    child.rotation.set(fx + (tx - fx) * k, fy + (ty - fy) * k, fz + (tz - fz) * k);
    child.position.y = 0.205 + fp + (tp - fp) * k;
  };

  return makeFigure(kit, info, update, {
    setChildVisible(visible: boolean): void {
      child.visible = visible;
    },
  });
}
