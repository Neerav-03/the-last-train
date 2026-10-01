// A tiny procedural environment map for metal/glossy reflections: a dark box
// with bright strips where the ceiling tubes are and a warm patch at one end,
// pre-filtered once with PMREM. Without it, metals render black.

import {
  BackSide,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
} from 'three';
import type { Texture, WebGLRenderer, WebGLRenderTarget } from 'three';

export interface EnvironmentHandle {
  texture: Texture;
  dispose(): void;
}

export function createStripLightEnvironment(renderer: WebGLRenderer): EnvironmentHandle {
  const scene = new Scene();
  const geos: { dispose(): void }[] = [];
  const mats: { dispose(): void }[] = [];

  const roomGeo = new BoxGeometry(3, 2.4, 16);
  const roomMat = new MeshBasicMaterial({ color: 0x0c0e12, side: BackSide });
  scene.add(new Mesh(roomGeo, roomMat));
  geos.push(roomGeo);
  mats.push(roomMat);

  // Ceiling tube strips (HDR white-blue).
  const stripGeo = new PlaneGeometry(0.12, 1.2);
  const stripMat = new MeshBasicMaterial({ color: 0xffffff });
  stripMat.color.setRGB(5, 5.6, 6);
  geos.push(stripGeo);
  mats.push(stripMat);
  for (let i = 0; i < 6; i++) {
    const m = new Mesh(stripGeo, stripMat);
    m.rotation.x = Math.PI / 2;
    m.position.set(0, 1.18, -6 + i * 2.4);
    scene.add(m);
  }
  // Window bands (cold, dim) on both walls.
  const bandGeo = new PlaneGeometry(16, 0.8);
  const bandMat = new MeshBasicMaterial({ color: 0x05070a });
  geos.push(bandGeo);
  mats.push(bandMat);
  for (const side of [-1, 1]) {
    const m = new Mesh(bandGeo, bandMat);
    m.rotation.y = -side * Math.PI / 2;
    m.position.set(side * 1.49, 0.2, 0);
    scene.add(m);
  }
  // Warm door glow at the far end.
  const warmGeo = new PlaneGeometry(0.5, 0.7);
  const warmMat = new MeshBasicMaterial({ color: 0xffffff });
  warmMat.color.setRGB(3, 1.6, 0.6);
  geos.push(warmGeo);
  mats.push(warmMat);
  const warm = new Mesh(warmGeo, warmMat);
  warm.position.set(0, 0.3, -7.95);
  scene.add(warm);

  const pmrem = new PMREMGenerator(renderer);
  const rt: WebGLRenderTarget = pmrem.fromScene(scene, 0.02, 0.1, 30);
  pmrem.dispose();
  for (const g of geos) g.dispose();
  for (const m of mats) m.dispose();

  return {
    texture: rt.texture,
    dispose: () => rt.dispose(),
  };
}
