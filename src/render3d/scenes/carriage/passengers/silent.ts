// The Silent Passenger: upright, perfectly symmetric, hands flat on the knees,
// long near-black coat with a turned-up collar. NEVER moves: update() is a
// no-op. The head is an unlit pure-black MeshBasicMaterial (fogged) inside a
// slightly larger transparent black "darkness volume", so the face is a void.
// The rim highlight only ever touches the body material. 3 meshes.

import { MeshBasicMaterial } from 'three';
import { FLOOR, HEAD_C, addArm, addLeg, addShoe, addTorso, makeFigure } from './kit';
import type { FigureInfo, FigureKit } from './kit';
import { PartList, solveElbow, trs } from './parts';
import type { V3 } from './parts';
import type { SilentFigure } from './types';

const TORSO_POS: V3 = [0, 0.1, -0.07];
const NECK_Y = 0.43;

export function buildSilent(kit: FigureKit, info: FigureInfo): SilentFigure {
  // Symmetry is the point: no per-run colour jitter on this one.
  const coat = kit.color(0x17171b, 0);
  const coatEdge = kit.color(0x1d1d22, 0);
  const trousers = kit.color(0x111114, 0);
  const shoes = kit.color(0x0b0b0d, 0);
  const hands = kit.color(0x7a7470, 0);
  const root = kit.root;

  // ---- whole body is one static mesh (lower body + torso merged)
  const body = new PartList();
  body.capsule([-0.088, 0.075, -0.04], [0.088, 0.075, -0.04], 0.1, coat, 8, 3);
  for (const s of [-1, 1]) {
    const hip: V3 = [s * 0.09, 0.1, -0.01];
    const knee: V3 = [s * 0.095, 0.105, 0.43];
    const ankle: V3 = [s * 0.098, FLOOR + 0.075, 0.45];
    addLeg(body, hip, knee, ankle, 0.076, 0.048, coat, trousers);
    addShoe(body, ankle, shoes, [0, 0, 1], FLOOR, [0.095, 0.075, 0.26]);
  }
  // Long coat skirt hanging from the knees.
  body.box([0, -0.085, 0.452], [0.37, 0.37, 0.035], coatEdge);

  const torsoParts = new PartList();
  addTorso(torsoParts, coat, { height: 0.385, hipR: 0.16, waistR: 0.155, chestR: 0.17, shoulderR: 0.18, neckR: 0.05, depth: 0.66 });
  // Tall turned-up collar hiding the neck.
  torsoParts.cylinder([0, 0.355, -0.005], [0, 0.49, -0.01], 0.1, 0.086, coatEdge, 10);
  for (const s of [-1, 1] as const) {
    const sh: V3 = [s * 0.18, 0.36, 0.0];
    const hand: V3 = [s * 0.095 - TORSO_POS[0], 0.2 - TORSO_POS[1], 0.405 - TORSO_POS[2]];
    const elbow = solveElbow(sh, hand, 0.28, 0.3, [s * 0.3, 0, -1]);
    addArm(torsoParts, sh, elbow, hand, coat, hands, { rU: 0.05, rF: 0.044, handDir: [0, -0.08, 1], handUp: [0, 1, 0] });
  }
  body.absorb(torsoParts, trs(TORSO_POS));
  kit.mesh(body, root);

  // ---- the void
  const neck = kit.group(root, [TORSO_POS[0], TORSO_POS[1] + NECK_Y, TORSO_POS[2]]);
  const headMat = kit.track(new MeshBasicMaterial({ color: 0x000000, fog: true }));
  const veilMat = kit.track(
    new MeshBasicMaterial({ color: 0x000000, fog: true, transparent: true, opacity: 0.62, depthWrite: false }),
  );
  const head = new PartList();
  head.ellipsoid(HEAD_C, [0.092, 0.112, 0.1], coat, undefined, [0, 1, 0], 12, 9);
  head.capsule([0, -0.03, 0], [0, 0.07, 0.006], 0.044, coat, 8, 2);
  kit.mesh(head, neck, headMat);
  const veil = new PartList();
  veil.ellipsoid([HEAD_C[0], HEAD_C[1] - 0.005, HEAD_C[2] + 0.005], [0.15, 0.172, 0.158], coat, undefined, [0, 1, 0], 12, 9);
  const veilMesh = kit.mesh(veil, neck, veilMat);
  veilMesh.renderOrder = 2;

  const a = info.aisleX;
  const update = (): void => {
    // Intentionally empty: they never move.
  };

  return makeFigure(kit, info, update, {
    setHeadTilt(amount: number): void {
      const t = amount <= 0 ? 0 : amount >= 1 ? 1 : amount;
      neck.rotation.set(0, a * 0.12 * t, -a * 0.07 * t);
    },
  });
}
