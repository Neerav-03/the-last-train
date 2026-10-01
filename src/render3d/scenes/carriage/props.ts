// Carriage furniture: instanced benches (upholstery, frames, grab handles),
// instanced grab poles, merged rails + luggage racks, the route-map panel,
// hanging straps that swing with the train, and seeded clutter.

import {
  BoxGeometry,
  CanvasTexture,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  SRGBColorSpace,
  TorusGeometry,
} from 'three';
import type { BufferGeometry, Material } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GeometryBatch, mix, smoothstep } from '../../core/geometry';
import { pick, rngFor } from '../../../engine/rng';
import { STATIONS } from '../../../data/stations';
import type { CarriageMaterials } from './materials';
/** Minimal seat reference (structurally compatible with PassengerPlacement). */
export interface OccupiedSeat {
  bay: number;
  side: -1 | 1;
  facing: -1 | 1;
  seatIndex: 0 | 1;
}
import {
  BAY_COUNT,
  BAY_LENGTH,
  BENCH_DEPTH,
  BENCH_INNER_X,
  CEILING,
  FIRST_BAY_Z,
  HALF_WIDTH as HW,
  LENGTH,
  SEAT_HEIGHT,
  WINDOW_WIDTH,
  bayCenterZ,
  benchSlots,
  seatPosition,
} from './layout';
import { SIDE_DOOR_Z0, SIDE_DOOR_Z1 } from './shell';

const BENCH_W = HW - BENCH_INNER_X;
const RAIL_Y = 1.93;
const POLE_X = BENCH_INNER_X + 0.035;
const STRAP_COUNT_PER_SIDE = 8;

export interface CarriageProps {
  readonly group: Group;
  /** Swing straps with the train: lateral sway (m) and clatter shake. */
  update(time: number, sway: number, shake: number): void;
  dispose(): void;
}

// ------------------------------------------------------------ benches ----

function benchUpholsteryGeometry(): BufferGeometry {
  const b = new GeometryBatch();
  for (const sx of [-1, 1]) {
    const x = sx * (BENCH_W / 4);
    b.add(new RoundedBoxGeometry(BENCH_W / 2 - 0.012, 0.13, BENCH_DEPTH - 0.02, 3, 0.045), { position: [x, SEAT_HEIGHT - 0.065, 0.0] });
    b.add(new RoundedBoxGeometry(BENCH_W / 2 - 0.012, 0.58, 0.12, 3, 0.045), {
      position: [x, SEAT_HEIGHT + 0.33, -BENCH_DEPTH / 2 + 0.03],
      rotation: [-0.16, 0, 0],
    });
    b.add(new RoundedBoxGeometry(BENCH_W / 2 - 0.03, 0.12, 0.15, 3, 0.05), {
      position: [x, SEAT_HEIGHT + 0.68, -BENCH_DEPTH / 2 - 0.03],
      rotation: [-0.16, 0, 0],
    });
  }
  return b.build((x, y, z) => {
    let ao = 1;
    // Underside and sides of the cushion fall into shadow.
    ao *= mix(0.45, 1, smoothstep(SEAT_HEIGHT - 0.13, SEAT_HEIGHT - 0.01, y));
    // Crease where seat meets back.
    const crease = Math.hypot(Math.max(0, z + BENCH_DEPTH / 2 - 0.06) * 1.0, y - SEAT_HEIGHT);
    ao *= mix(0.5, 1, smoothstep(0.0, 0.14, crease));
    // Gap between the two seats.
    ao *= mix(0.7, 1, smoothstep(0.0, 0.05, Math.abs(x)));
    // Polished wear on the front edge of the cushions (lighter).
    if (y > SEAT_HEIGHT - 0.02 && z > 0.1) ao *= 1.12;
    return ao;
  });
}

function benchFrameGeometry(): BufferGeometry {
  const b = new GeometryBatch();
  // Plinth under the cushions.
  b.add(new BoxGeometry(BENCH_W - 0.04, SEAT_HEIGHT - 0.16, BENCH_DEPTH - 0.1, 1, 2, 1), {
    position: [0, (SEAT_HEIGHT - 0.12) / 2 + 0.02, -0.04],
  });
  // Moulded back shell behind the seat back.
  b.add(new BoxGeometry(BENCH_W, 0.82, 0.035, 1, 3, 1), {
    position: [0, SEAT_HEIGHT + 0.35, -BENCH_DEPTH / 2 - 0.06],
    rotation: [-0.16, 0, 0],
  });
  // Aisle-end armrest panel (both ends; the wall end is hidden).
  for (const sx of [-1, 1]) {
    b.add(new BoxGeometry(0.03, 0.2, BENCH_DEPTH - 0.06), { position: [sx * (BENCH_W / 2 - 0.005), SEAT_HEIGHT + 0.06, -0.01] });
  }
  return b.build((_x, y) => mix(0.35, 1, smoothstep(0.0, SEAT_HEIGHT + 0.2, y)));
}

// ------------------------------------------------------- route map ----

function createRouteMapTexture(): CanvasTexture {
  const W = 512;
  const H = 256;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#e9e6dc';
  g.fillRect(0, 0, W, H);
  g.fillStyle = '#1d2a3a';
  g.fillRect(0, 0, W, 40);
  g.fillStyle = '#e9e6dc';
  g.font = 'bold 22px "Courier New", monospace';
  g.fillText('LINE 0 · NIGHT SERVICE', 16, 28);
  const names = STATIONS.map((s) => s.displayName);
  const x0 = 50;
  const x1 = W - 50;
  const y = 140;
  g.strokeStyle = '#a3262a';
  g.lineWidth = 9;
  g.beginPath();
  g.moveTo(x0, y);
  g.lineTo(x1, y);
  // The line does not end: it curls back on itself.
  g.arc(x1, y + 40, 40, -Math.PI / 2, Math.PI / 2);
  g.lineTo(x0 + 80, y + 80);
  g.stroke();
  g.font = '15px "Courier New", monospace';
  names.forEach((name, i) => {
    const sx = x0 + ((x1 - x0) * i) / Math.max(1, names.length - 1);
    g.fillStyle = '#f5f2ea';
    g.strokeStyle = '#1d2a3a';
    g.lineWidth = 4;
    g.beginPath();
    g.arc(sx, y, 9, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.save();
    g.translate(sx - 4, y - 18);
    g.rotate(-Math.PI / 4);
    g.fillStyle = '#1d2a3a';
    g.fillText(name, 0, 0);
    g.restore();
  });
  // Someone scratched out the last stop.
  const lx = x1;
  g.strokeStyle = 'rgba(30, 30, 30, 0.85)';
  g.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    g.beginPath();
    g.moveTo(lx - 30 + Math.random() * 10, y - 70 + Math.random() * 50);
    g.lineTo(lx + 40 + Math.random() * 10, y - 90 + Math.random() * 50);
    g.stroke();
  }
  // Grime, fading, finger smudges.
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(60, 50, 30, ${Math.random() * 0.08})`;
    const r = 2 + Math.random() * 14;
    g.beginPath();
    g.arc(Math.random() * W, Math.random() * H, r, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ------------------------------------------------------------- props ----

export function buildCarriageProps(
  mats: CarriageMaterials,
  runSeed: number,
  occupied: readonly OccupiedSeat[],
): CarriageProps {
  const group = new Group();
  group.name = 'CarriageProps';
  const owned: { dispose(): void }[] = [];
  const dummy = new Object3D();
  const rng = rngFor(runSeed, 'render3d:carriage:props');

  const addStatic = (geo: BufferGeometry, mat: Material, name: string) => {
    const m = new Mesh(geo, mat);
    m.name = name;
    m.matrixAutoUpdate = false;
    m.updateMatrix();
    group.add(m);
    owned.push(geo);
    return m;
  };

  // Benches ---------------------------------------------------------------
  const slots = benchSlots();
  const upGeo = benchUpholsteryGeometry();
  const frameGeo = benchFrameGeometry();
  owned.push(upGeo, frameGeo);
  const benches = new InstancedMesh(upGeo, mats.upholstery, slots.length);
  const frames = new InstancedMesh(frameGeo, mats.dark, slots.length);
  benches.name = 'Benches';
  frames.name = 'BenchFrames';
  const wear = new Color();
  slots.forEach((s, i) => {
    dummy.position.set(s.x, 0, s.z);
    dummy.rotation.set(0, s.facing === 1 ? 0 : Math.PI, 0);
    dummy.updateMatrix();
    benches.setMatrixAt(i, dummy.matrix);
    frames.setMatrixAt(i, dummy.matrix);
    // Per-bench fade / grime.
    const k = 0.78 + rng() * 0.3;
    wear.setRGB(k * (0.97 + rng() * 0.06), k, k * (0.95 + rng() * 0.08));
    benches.setColorAt(i, wear);
    frames.setColorAt(i, wear.setScalar(1));
  });
  benches.computeBoundingSphere();
  frames.computeBoundingSphere();
  group.add(benches, frames);

  // Grab handles on the aisle corner of every seat back.
  const handleGeo = new GeometryBatch()
    .add(new TorusGeometry(0.055, 0.011, 6, 12, Math.PI), { position: [0, 0, 0] })
    .build();
  owned.push(handleGeo);
  const handles = new InstancedMesh(handleGeo, mats.metal, slots.length);
  handles.name = 'GrabHandles';
  slots.forEach((s, i) => {
    dummy.position.set(Math.sign(s.x) * (BENCH_INNER_X + 0.09), SEAT_HEIGHT + 0.77, s.z - s.facing * (BENCH_DEPTH / 2 + 0.02));
    dummy.rotation.set(-0.16 * s.facing, 0, 0);
    dummy.updateMatrix();
    handles.setMatrixAt(i, dummy.matrix);
  });
  handles.computeBoundingSphere();
  group.add(handles);

  // Poles -------------------------------------------------------------------
  const polePositions: [number, number][] = [];
  for (let b = 0; b < BAY_COUNT - 1; b++) {
    const z = FIRST_BAY_Z - (b + 0.5) * BAY_LENGTH;
    polePositions.push([-POLE_X, z], [POLE_X, z]);
  }
  // Vestibule: one centre pole and one either side of the side doors.
  polePositions.push([0, (SIDE_DOOR_Z0 + SIDE_DOOR_Z1) / 2]);
  for (const sx of [-1, 1]) {
    polePositions.push([sx * (HW - 0.14), SIDE_DOOR_Z0 + 0.12], [sx * (HW - 0.14), SIDE_DOOR_Z1 - 0.12]);
  }
  const poleGeo = new GeometryBatch()
    .add(new CylinderGeometry(0.019, 0.019, CEILING, 10, 6, true), { position: [0, CEILING / 2, 0] })
    // Floor/ceiling flanges.
    .add(new CylinderGeometry(0.04, 0.045, 0.02, 10), { position: [0, 0.01, 0] })
    .add(new CylinderGeometry(0.045, 0.04, 0.02, 10), { position: [0, CEILING - 0.01, 0] })
    .build((_x, y) => mix(0.55, 1, smoothstep(0, 0.6, y)));
  owned.push(poleGeo);
  const poles = new InstancedMesh(poleGeo, mats.metal, polePositions.length);
  poles.name = 'Poles';
  polePositions.forEach(([x, z], i) => {
    dummy.position.set(x, 0, z);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    poles.setMatrixAt(i, dummy.matrix);
  });
  poles.computeBoundingSphere();
  group.add(poles);

  // Rails + luggage racks (static, merged) --------------------------------
  const metal = new GeometryBatch();
  const railZ0 = -0.6;
  const railZ1 = FIRST_BAY_Z - (BAY_COUNT - 0.5) * BAY_LENGTH;
  const railLen = railZ0 - railZ1;
  for (const sx of [-1, 1]) {
    metal.add(new CylinderGeometry(0.016, 0.016, railLen, 8, 1, true), {
      position: [sx * POLE_X, RAIL_Y, (railZ0 + railZ1) / 2],
      rotation: [Math.PI / 2, 0, 0],
    });
    // Ceiling hangers.
    for (let z = railZ0 - 0.55; z > railZ1; z -= BAY_LENGTH) {
      metal.add(new CylinderGeometry(0.009, 0.009, CEILING - RAIL_Y, 6, 1, true), {
        position: [sx * POLE_X, (CEILING + RAIL_Y) / 2, z],
      });
    }
    // Luggage racks above each window.
    for (let b = 0; b < BAY_COUNT; b++) {
      const zc = bayCenterZ(b);
      const len = WINDOW_WIDTH + 0.2;
      for (let r = 0; r < 4; r++) {
        metal.add(new CylinderGeometry(0.008, 0.008, len, 6, 1, true), {
          position: [sx * (HW - 0.05 - r * 0.075), 1.92, zc],
          rotation: [Math.PI / 2, 0, 0],
        });
      }
      metal.add(new CylinderGeometry(0.012, 0.012, len, 8, 1, true), {
        position: [sx * (HW - 0.3), 1.96, zc],
        rotation: [Math.PI / 2, 0, 0],
      });
      for (const e of [-1, 1]) {
        // Brackets: wall plate + arm.
        metal.add(new BoxGeometry(0.31, 0.02, 0.025), { position: [sx * (HW - 0.155), 1.915, zc + e * (len / 2 - 0.05)] });
        metal.add(new BoxGeometry(0.02, 0.07, 0.025), { position: [sx * (HW - 0.3), 1.94, zc + e * (len / 2 - 0.05)] });
        metal.add(new BoxGeometry(0.015, 0.16, 0.03), { position: [sx * (HW - 0.008), 1.86, zc + e * (len / 2 - 0.05)] });
      }
    }
  }
  // Route map frame.
  const mapW = 0.62;
  const mapH = 0.31;
  const mapX = 0.86;
  const mapY = 1.52;
  const mapZ = -LENGTH + 0.012;
  metal.add(new BoxGeometry(mapW + 0.04, mapH + 0.04, 0.012), { position: [mapX, mapY, mapZ - 0.003] });
  addStatic(metal.build(), mats.metal, 'RailsRacks');

  // Route map panel (lightly backlit so it reads in the dark).
  const mapTex = createRouteMapTexture();
  const mapMat = new MeshStandardMaterial({
    map: mapTex,
    emissiveMap: mapTex,
    emissive: new Color(0.16, 0.15, 0.13),
    roughness: 0.35,
    metalness: 0,
  });
  const mapGeo = new PlaneGeometry(mapW, mapH);
  const mapMesh = new Mesh(mapGeo, mapMat);
  mapMesh.position.set(mapX, mapY, mapZ + 0.004);
  mapMesh.name = 'RouteMap';
  group.add(mapMesh);
  owned.push(mapTex, mapMat, mapGeo);

  // Hanging straps (instanced, swing with the train) ----------------------
  const strapGeo = new GeometryBatch()
    .add(new BoxGeometry(0.025, 0.2, 0.006), { position: [0, -0.1, 0] })
    .add(new TorusGeometry(0.045, 0.009, 6, 14), { position: [0, -0.245, 0] })
    .build();
  owned.push(strapGeo);
  const strapMat = new MeshStandardMaterial({ color: 0x1b1d20, roughness: 0.6, metalness: 0.1, vertexColors: true });
  owned.push(strapMat);
  const strapCount = STRAP_COUNT_PER_SIDE * 2;
  const straps = new InstancedMesh(strapGeo, strapMat, strapCount);
  straps.name = 'Straps';
  straps.instanceMatrix.setUsage(DynamicDrawUsage);
  const strapBase: { x: number; z: number; phase: number; len: number }[] = [];
  for (const sx of [-1, 1]) {
    for (let i = 0; i < STRAP_COUNT_PER_SIDE; i++) {
      const z = railZ0 - 0.45 - i * (railLen - 0.6) / (STRAP_COUNT_PER_SIDE - 1);
      strapBase.push({ x: sx * POLE_X, z, phase: rng() * Math.PI * 2, len: 0.93 + rng() * 0.14 });
    }
  }
  straps.frustumCulled = false;
  group.add(straps);
  const strapMatrix = new Matrix4();

  // Seeded clutter -------------------------------------------------------
  const clutterMat = new MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.8, metalness: 0.05 });
  owned.push(clutterMat);
  const clutter = new GeometryBatch();
  const isTaken = (bay: number, side: number, facing: number, seat: number) =>
    occupied.some((p) => p.bay === bay && p.side === side && p.facing === facing && p.seatIndex === seat);
  const freeSeats: { bay: number; side: -1 | 1; facing: -1 | 1; seat: 0 | 1 }[] = [];
  for (let bay = 0; bay < BAY_COUNT; bay++)
    for (const side of [-1, 1] as const)
      for (const facing of [-1, 1] as const)
        for (const seat of [0, 1] as const) if (!isTaken(bay, side, facing, seat)) freeSeats.push({ bay, side, facing, seat });

  // A folded newspaper left on a seat.
  {
    const s = pick(rng, freeSeats);
    const p = seatPosition(s.bay, s.side, s.facing, s.seat);
    clutter.add(new BoxGeometry(0.3, 0.012, 0.22), { position: [p.x, SEAT_HEIGHT + 0.006, p.z + s.facing * 0.06], rotation: [0, rng() * 0.8 - 0.4, 0] }, 0xc9c3b0);
    clutter.add(new BoxGeometry(0.28, 0.004, 0.2), { position: [p.x + 0.02, SEAT_HEIGHT + 0.015, p.z + s.facing * 0.07], rotation: [0, rng() * 0.6, 0.05] }, 0xb5ae98);
  }
  // A crushed can rolling around the floor of some bay.
  {
    const bay = Math.floor(rng() * BAY_COUNT);
    const z = bayCenterZ(bay) + (rng() - 0.5) * 0.5;
    const x = (rng() - 0.5) * 0.5;
    clutter.add(new CylinderGeometry(0.033, 0.03, 0.115, 10), { position: [x, 0.033, z], rotation: [0, rng() * 6, Math.PI / 2] }, 0x7a1d1d);
  }
  // A forgotten bag on a luggage rack.
  {
    const bay = Math.floor(rng() * BAY_COUNT);
    const sx = rng() < 0.5 ? -1 : 1;
    clutter.add(new RoundedBoxGeometry(0.5, 0.2, 0.28, 2, 0.06), { position: [sx * (HW - 0.18), 2.03, bayCenterZ(bay) + (rng() - 0.5) * 0.8], rotation: [0, Math.PI / 2 + (rng() - 0.5) * 0.3, 0] }, 0x2e2621);
  }
  // An umbrella leaning against a seat front.
  {
    const s = pick(rng, freeSeats);
    const p = seatPosition(s.bay, s.side, s.facing, s.seat);
    const lean: [number, number, number] = [s.facing * 0.25, 0, 0.12 * -s.side];
    clutter.add(new CylinderGeometry(0.006, 0.006, 0.75, 6), { position: [p.x, 0.4, p.z + s.facing * 0.32], rotation: lean }, 0x111111);
    clutter.add(new ConeGeometry(0.045, 0.5, 8, 1, true), { position: [p.x, 0.3, p.z + s.facing * 0.31], rotation: lean }, 0x15171c);
  }
  // Sometimes: a single small shoe in the aisle. Nobody claims it.
  if (rng() < 0.45) {
    const z = FIRST_BAY_Z - (1 + rng() * 3) * BAY_LENGTH;
    clutter.add(new RoundedBoxGeometry(0.07, 0.05, 0.14, 2, 0.02), { position: [(rng() - 0.5) * 0.4, 0.025, z], rotation: [0, rng() * 3, 0] }, 0x8a2e3a);
  }
  addStatic(clutter.build(), clutterMat, 'Clutter');

  owned.push({ dispose: () => { benches.dispose(); frames.dispose(); handles.dispose(); poles.dispose(); straps.dispose(); } });

  // Initial strap pose.
  const update = (time: number, sway: number, shake: number) => {
    for (let i = 0; i < strapBase.length; i++) {
      const s = strapBase[i];
      // Pendulum driven by train sway, damped look via phase-shifted sines.
      const swing = sway * 22 + Math.sin(time * 1.6 + s.phase) * 0.04 + shake * 6;
      const along = Math.sin(time * 1.1 + s.phase * 1.7) * 0.05;
      dummy.position.set(s.x, RAIL_Y - 0.015, s.z);
      dummy.rotation.set(along, 0, swing);
      dummy.scale.set(1, s.len, 1);
      dummy.updateMatrix();
      strapMatrix.copy(dummy.matrix);
      straps.setMatrixAt(i, strapMatrix);
    }
    straps.instanceMatrix.needsUpdate = true;
  };
  update(0, 0, 0);

  return {
    group,
    update,
    dispose() {
      for (const o of owned) o.dispose();
      owned.length = 0;
    },
  };
}
