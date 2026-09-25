// Clue definitions for THE LAST TRAIN.
// Every clue id referenced by passengers.ts (awardsClues) or stations.ts
// (clueIds) must have a matching entry here.

import type { ClueDef } from '../engine/types';

export const CLUES: ClueDef[] = [
  {
    id: 'ticket',
    title: 'Your Ticket',
    description:
      'A single paper ticket, damp at the corners. The departure time is printed clearly: 2:17 AM. There is no return portion.',
  },
  {
    id: 'tornRailwayMap',
    title: 'Torn Railway Map',
    description:
      'Every station name on this map has been scratched out with the same tired hand — except one. Near the bottom, still legible, a single word: HOME.',
  },
  {
    id: 'oldPhotograph',
    title: 'Old Photograph',
    description:
      'A family stands on a platform, smiling for whoever held the camera. The faces are almost right. You cannot decide what is missing, only that something is.',
  },
  {
    id: 'newspaperClipping',
    title: 'Newspaper Clipping',
    description:
      'The print has faded to the color of weak tea. A headline about a train, a date you don’t recognize, and a paragraph that stops mid-sentence where the paper has torn.',
  },
  {
    id: 'passengerList',
    title: 'Passenger List',
    description:
      'A clipboard page listing names, seat numbers, and a column marked STATUS. Every entry in that column reads the same word, over and over.',
  },
  {
    id: 'oldTicketStub',
    title: 'The Old Man’s Ticket Stub',
    description:
      'Torn along a perforated edge, soft as cloth from handling. The date has been rubbed away entirely, but the time survives: 2:17.',
  },
  {
    id: 'businessmanWatch',
    title: 'The Businessman’s Watch',
    description:
      'A wristwatch, still warm, its hands frozen at 2:17. You wind it. The hands do not move. You wind it again anyway.',
  },
  {
    id: 'staticRecording',
    title: 'Static Recording',
    description:
      'A few seconds of hiss caught on a dead phone speaker. Beneath the static, if you listen with the volume all the way up, something that might be a voice, and might be your name.',
  },
  {
    id: 'timetable',
    title: 'Station Timetable',
    description:
      'A printed board behind cracked glass. Every column but one has been left blank. ARRIVAL — 2:17 AM. DEPARTURE — NEVER.',
  },
  {
    id: 'billboard',
    title: 'Faded Billboard',
    description:
      'An advertisement for something you can no longer make out, the product long since bleached away by weather. Underneath, in smaller letters, a name. Your name.',
  },
  {
    id: 'incompleteStationMap',
    title: 'Incomplete Station Map',
    description:
      'A transit map bolted to the wall, glass yellowed with age. You trace the line with your finger and find every stop except the one you are currently standing in.',
  },
  {
    id: 'vendingMachineReceipt',
    title: 'Vending Machine Receipt',
    description:
      'A curl of thermal paper, spat out by a machine that took no coin. The item purchased is listed only as “ONE (1) MORE STOP.” The price field is blank.',
  },
  {
    id: 'platformFigureSketch',
    title: 'Charcoal Sketch',
    description:
      'A hurried drawing left on the platform floor, half-erased by weather that shouldn’t reach this far underground. It is a figure, standing exactly where you are standing now.',
  },
  {
    id: 'conductorsLedger',
    title: 'Conductor’s Ledger',
    description:
      'A logbook of departures with no corresponding arrivals. The final entry is dated tonight, timed at 2:17, and signed with a name you almost recognize as your own.',
  },

  // --- Bonus / choice-gated clues (STORY_REFINEMENT_GUIDE.md §6, Tier 2) ---
  // Both are structurally excluded from requiredClueIds (Invariant 5/6) —
  // see src/engine/runSetup.ts's STATION_CLUE_IDS, which never references
  // either of these ids.
  {
    id: 'sharedGrief',
    title: 'A Shared Grief',
    description:
      'Nothing you can hold. Only the memory of sitting with someone in the worst moment of their night, and staying anyway.',
  },
  {
    id: 'unseenCompanion',
    title: 'Unseen Companion',
    description:
      'You never saw what was following. Only the rhythm of it — a half-beat behind your own footsteps, stopping exactly when you stopped.',
  },
];
