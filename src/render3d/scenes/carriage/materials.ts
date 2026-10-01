// The carriage material palette. Shared by shell, props and lights; built once
// per scene and disposed with it. Colours follow the game's palette: cold
// steel greys and teal-blue moquette under fluorescent light, warm accents
// only from the door and passing sodium lamps.

import { Color, MeshBasicMaterial, MeshStandardMaterial, Vector2 } from 'three';
import {
  createFloorTextures,
  createPaintTextures,
  createUpholsteryTextures,
} from '../../materials/proceduralTextures';
import type { PbrTextureSet } from '../../materials/proceduralTextures';

export interface CarriageMaterials {
  /** Painted panels (walls, ceiling, end walls). Vertex colours = tint x AO. */
  paint: MeshStandardMaterial;
  floor: MeshStandardMaterial;
  /** Brushed stainless: poles, rails, racks, trims. */
  metal: MeshStandardMaterial;
  /** Dark painted steel / rubber: seat plinths, gaskets, vents, door seals. */
  dark: MeshStandardMaterial;
  upholstery: MeshStandardMaterial;
  /** Emissive tubes: white base, per-instance HDR colour drives brightness. */
  tube: MeshBasicMaterial;
  dispose(): void;
}

export function createCarriageMaterials(seed: number, highQuality: boolean): CarriageMaterials {
  const size = highQuality ? 256 : 128;
  const sets: PbrTextureSet[] = [];
  const paintTex = createPaintTextures(seed + 1, size);
  const floorTex = createFloorTextures(seed + 2, size);
  const upTex = createUpholsteryTextures(seed + 3, size);
  sets.push(paintTex, floorTex, upTex);

  const paint = new MeshStandardMaterial({
    name: 'CarriagePaint',
    color: 0xffffff,
    vertexColors: true,
    map: paintTex.map,
    roughnessMap: paintTex.roughnessMap,
    normalMap: paintTex.normalMap,
    normalScale: new Vector2(0.35, 0.35),
    roughness: 0.85,
    metalness: 0.05,
    envMapIntensity: 0.35,
  });

  const floor = new MeshStandardMaterial({
    name: 'CarriageFloor',
    color: 0xffffff,
    vertexColors: true,
    map: floorTex.map,
    roughnessMap: floorTex.roughnessMap,
    normalMap: floorTex.normalMap,
    normalScale: new Vector2(0.9, 0.9),
    roughness: 1,
    metalness: 0,
    envMapIntensity: 0.6,
  });

  const metal = new MeshStandardMaterial({
    name: 'Stainless',
    color: new Color(0.62, 0.64, 0.66),
    vertexColors: true,
    roughness: 0.32,
    metalness: 0.9,
    envMapIntensity: 1.0,
  });

  const dark = new MeshStandardMaterial({
    name: 'DarkSteel',
    color: new Color(0.05, 0.055, 0.06),
    vertexColors: true,
    roughness: 0.7,
    metalness: 0.3,
    envMapIntensity: 0.5,
  });

  const upholstery = new MeshStandardMaterial({
    name: 'Moquette',
    color: 0xffffff,
    vertexColors: true,
    map: upTex.map,
    roughnessMap: upTex.roughnessMap,
    normalMap: upTex.normalMap,
    normalScale: new Vector2(0.8, 0.8),
    roughness: 1,
    metalness: 0,
    envMapIntensity: 0.2,
  });

  const tube = new MeshBasicMaterial({ name: 'TubeEmissive', color: 0xffffff });

  return {
    paint,
    floor,
    metal,
    dark,
    upholstery,
    tube,
    dispose() {
      for (const s of sets) s.dispose();
      paint.dispose();
      floor.dispose();
      metal.dispose();
      dark.dispose();
      upholstery.dispose();
      tube.dispose();
    },
  };
}
