// Allocation-free pointer picking against world-space AABBs. Far cheaper than
// mesh raycasts and good enough for "which passenger is under the cursor".

import { Raycaster, Vector2, Vector3 } from 'three';
import type { Box3, Camera } from 'three';

export interface PickTarget {
  readonly hitBox: Box3;
}

export class BoxPicker {
  private readonly raycaster = new Raycaster();
  private readonly hit = new Vector3();
  private readonly ndc = new Vector2();

  /** Index of the nearest box under `pointerNdc`, or -1. */
  pick(camera: Camera, pointerNdc: Vector2, targets: readonly PickTarget[], maxDistance = 30): number {
    this.ndc.copy(pointerNdc);
    this.raycaster.setFromCamera(this.ndc, camera);
    const ray = this.raycaster.ray;
    let best = -1;
    let bestD = maxDistance;
    for (let i = 0; i < targets.length; i++) {
      if (ray.intersectBox(targets[i].hitBox, this.hit) === null) continue;
      const d = this.hit.distanceTo(ray.origin);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }
}
