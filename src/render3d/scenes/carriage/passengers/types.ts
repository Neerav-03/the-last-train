// Public contracts for the passenger figures (re-exported from ./index).

import type { Box3, Group } from 'three';

export interface PassengerPlacement {
  /** PassengerDef id. */
  id: string;
  bay: number;
  side: -1 | 1;
  facing: -1 | 1;
  /** 0 = window seat, 1 = aisle seat. */
  seatIndex: 0 | 1;
}

export interface PassengerFigure {
  readonly id: string;
  /** PassengerDef.name, e.g. 'The Old Man'. */
  readonly name: string;
  /** PassengerDef.shortLabel, e.g. 'OLD MAN'. */
  readonly label: string;
  /** Already positioned/rotated in world space. */
  readonly root: Group;
  /** World-space AABB around the whole figure (computed once after build). */
  readonly hitBox: Box3;
  /** 0..1 cold fresnel rim light. */
  setHighlight(amount: number): void;
  /** Idle animation. Zero allocations. */
  update(dt: number, time: number): void;
  /** Free every geometry/material this figure created. */
  dispose(): void;
}

export interface BuildPassengersOptions {
  runSeed: number;
  placements?: readonly PassengerPlacement[];
}

/** The woman's figure: the child vanishes later in the story (flag `childGone`). */
export interface WomanFigure extends PassengerFigure {
  setChildVisible(visible: boolean): void;
}

/** Optional extra hook: the student's foot "has stopped tapping" story beat. */
export interface StudentFigure extends PassengerFigure {
  setTapping(enabled: boolean): void;
}

/** Optional extra hook: the silent passenger's head tilts, almost
 *  imperceptibly, toward the empty seat across the aisle. 0..1, eased by caller. */
export interface SilentFigure extends PassengerFigure {
  setHeadTilt(amount: number): void;
}
