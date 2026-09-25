// Station definitions for THE LAST TRAIN.
// Exactly 7 stations, order 1-7, visited in sequence. `ambience` fields are
// written as concrete art-direction notes (color, light, mood) for whoever
// builds the visuals, independent of the rest of this file's context.

import type { StationDef } from '../engine/types';

export const STATIONS: StationDef[] = [
  {
    key: 'kalyanpur',
    order: 1,
    severityBand: 'mild',
    displayName: 'KALYANPUR',
    signText: 'KALYANPUR',
    ambience:
      'A small suburban platform under steady rain, sodium lights burning a dull orange through the haze. It looks almost exactly like every other night you’ve taken this train — almost.',
    objects: [
      {
        id: 'vendingMachine',
        label: 'Vending Machine',
        position: { x: 20, y: 55 },
        inspectText: [
          'A snack machine, humming. The glass is fogged with condensation.',
          'Every slot is empty except one. The coin slot has no coin return.',
          'You press the button anyway. Somewhere inside, a curl of paper prints out.',
        ],
      },
      {
        id: 'stationMap',
        label: 'Station Map',
        position: { x: 62, y: 40 },
        inspectText: [
          'A transit map behind cracked glass, its route line looping through a dozen named stops.',
          'You look for KALYANPUR on the map. It isn’t there.',
          'You look again, closer this time. It still isn’t there.',
        ],
      },
      {
        id: 'benchPoster',
        label: 'Torn Poster',
        position: { x: 80, y: 60 },
        inspectText: [
          'An advertisement, rain-bleached past reading, peeling at one corner.',
          'Underneath the top layer, an older poster shows through — for a train line you’ve never heard of.',
        ],
      },
    ],
    announcements: [
      'The train now arriving on Platform 1 is not in service.',
      'Please stand behind the yellow line.',
    ],
    clueIds: ['incompleteStationMap'],
  },
  {
    key: 'madhavNagar',
    order: 2,
    severityBand: 'mild',
    displayName: 'MADHAV NAGAR',
    signText: 'MADHAV NAGAR',
    ambience:
      'A wide concrete platform, utterly deserted, lit by a handful of flickering fluorescent tubes. The train sits at the platform with its doors open, engine idling, going nowhere.',
    objects: [
      {
        id: 'emptyBench',
        label: 'Row of Benches',
        position: { x: 30, y: 65 },
        inspectText: [
          'A long steel bench, empty, still faintly warm in one spot as if someone just stood up.',
          'You sit. The warmth fades faster than it should.',
        ],
      },
      {
        id: 'idleTrain',
        label: 'The Train',
        position: { x: 55, y: 45 },
        inspectText: [
          'It hasn’t moved. Doors open, lights on, entirely still.',
          'You can hear it breathing — the low electrical hum of something waiting, not broken.',
        ],
      },
      {
        id: 'noticeBoard',
        label: 'Notice Board',
        position: { x: 75, y: 50 },
        inspectText: [
          'A cork board thick with layers of old notices, none of them legible anymore.',
          'Pinned on top, a single blank index card. Nothing written on either side.',
        ],
      },
    ],
    announcements: [
      'The next train will arrive shortly.',
      'The next train will arrive shortly.',
    ],
    clueIds: ['newspaperClipping'],
  },
  {
    key: 'sector0',
    order: 3,
    severityBand: 'moderate',
    displayName: 'SECTOR 0',
    signText: 'SECTOR 0',
    ambience:
      'An unfinished-looking platform of raw concrete and exposed rebar, lit by a single caged bulb. Directional signs point in contradictory circles, and the air carries the unmistakable feeling of being one step behind something that is always just out of sight — footsteps that stop the instant you turn.',
    objects: [
      {
        id: 'directionalSignA',
        label: 'Directional Sign',
        position: { x: 25, y: 38 },
        inspectText: [
          'An arrow marked EXIT, pointing down the platform.',
          'You follow it with your eyes. It curves back around to where you’re standing.',
        ],
      },
      {
        id: 'directionalSignB',
        label: 'Directional Sign',
        position: { x: 68, y: 42 },
        inspectText: [
          'Another arrow, also marked EXIT, pointing the opposite direction from the first.',
          'Both signs were bolted by the same hand. You can tell from the screws.',
        ],
      },
      {
        id: 'scratchedMap',
        label: 'Railway Map',
        position: { x: 46, y: 60 },
        inspectText: [
          'A framed railway map, every station name scored out with the same deep, furious scratch.',
          'Every name but one. Near the center of the line, untouched: HOME.',
        ],
      },
      // Optional risk/reward hotspot (STORY_REFINEMENT_GUIDE.md §6.3). Hidden
      // until the idle footstep beat reveals it in Station.tsx; ignoring it
      // costs nothing, inspecting it raises this station's reboard threshold
      // in exchange for a bonus clue. Deliberately carries no clueIds here —
      // the bonus clue is awarded directly by Station.tsx, never auto-awarded.
      {
        id: 'followFootsteps',
        label: 'Something Following',
        position: { x: 14, y: 76 },
        inspectText: [
          'Footsteps, behind you and to the left, matching your pace exactly. You stop walking. They stop half a beat later, as if surprised to be caught.',
          'You turn. There is nothing there — only the platform, empty as it was a moment ago. But the sound was close enough to feel on your neck, and it has not left.',
        ],
      },
    ],
    announcements: ['Sector 0. All passengers remain seated until instructed.'],
    clueIds: ['tornRailwayMap'],
  },
  {
    key: 'unlisted',
    order: 4,
    severityBand: 'moderate',
    displayName: '[UNLISTED]',
    signText: '[UNLISTED]',
    ambience:
      'Architecture that resembles your hometown station almost perfectly — same tiled arches, same clock tower silhouette — lit in a flat, shadowless grey that makes the familiarity feel like a trap rather than a comfort.',
    objects: [
      {
        id: 'wrongShop',
        label: 'Corner Shop',
        position: { x: 22, y: 55 },
        inspectText: [
          'A shopfront you’d recognize anywhere — same awning, same window display.',
          'The sign above the door reads a name you’ve never once seen on it before tonight.',
        ],
      },
      {
        id: 'billboard',
        label: 'Billboard',
        position: { x: 55, y: 30 },
        inspectText: [
          'A tall advertising board, mostly bleached blank by weather that shouldn’t reach this far in.',
          'What’s left of the copy resolves into a name. Your name.',
        ],
      },
      {
        id: 'timetable',
        label: 'Timetable Board',
        position: { x: 78, y: 50 },
        inspectText: [
          'A departures board behind scratched plexiglass, every row blank but one.',
          'ARRIVAL — 2:17 AM',
          'DEPARTURE — NEVER',
        ],
      },
    ],
    announcements: ['Welcome. Please proceed to your platform.'],
    clueIds: ['billboard', 'timetable'],
  },
  {
    key: 'emptyPlatform',
    order: 5,
    severityBand: 'severe',
    displayName: 'THE EMPTY PLATFORM',
    signText: '',
    ambience:
      'An impossibly vast platform swallowed in near-total darkness, its far edges lost past the reach of the few working lights. Footsteps echo for far longer than they should, and by the time you notice the train is gone, it feels like it never existed at all.',
    trainVanishes: true,
    objects: [
      {
        id: 'figure',
        label: '···',
        position: { x: 70, y: 50 },
        inspectText: [
          'Something stands far down the platform, at the very edge of the light.',
          'It hasn’t moved since you first saw it. You’re no longer sure it’s a person.',
          'It is closer now. You didn’t see it move.',
          'A voice, flat and close, though the shape hasn’t come any nearer: "You shouldn’t have gotten off."',
        ],
      },
      {
        id: 'platformEdge',
        label: 'Platform Edge',
        position: { x: 40, y: 70 },
        inspectText: [
          'The edge drops into absolute black. No tracks. No far wall. Just distance that doesn’t end.',
          'You throw a coin over the edge. You never hear it land.',
        ],
      },
    ],
    announcements: [],
    clueIds: ['platformFigureSketch'],
  },
  {
    key: 'home',
    order: 6,
    severityBand: 'severe',
    displayName: 'HOME',
    signText: 'HOME',
    ambience:
      'Warm amber light, wood paneling, the smell of something cooking somewhere close. It is, at first glance, exactly the platform you’ve pictured every night of this ride — right up until you notice the tracks simply stop a few feet past the platform’s edge, swallowed by darkness with nothing beyond.',
    objects: [
      {
        id: 'clock',
        label: 'Platform Clock',
        position: { x: 50, y: 25 },
        inspectText: [
          'A brass clock, hands gleaming, ticking away happily.',
          'It reads 2:17. You check your watch. Also 2:17.',
          'You wait a full minute and check again. Still 2:17. The ticking never stopped.',
        ],
      },
      {
        id: 'familyPhoto',
        label: 'Photograph on the Wall',
        position: { x: 25, y: 45 },
        inspectText: [
          'A framed photo hangs by the bench, a family smiling in front of this very platform.',
          'You lean in. The faces are warm, familiar, almost yours.',
        ],
      },
      {
        id: 'frontDoor',
        label: 'The Door Home',
        position: { x: 78, y: 50 },
        inspectText: [
          'A plain wooden door at the platform’s far end, warm light bleeding out from underneath.',
          'It is unlocked. It is waiting. You have never wanted anything to be simple this badly.',
        ],
      },
    ],
    announcements: [
      'Welcome home.',
      'Dinner’s almost ready.',
    ],
    clueIds: ['oldPhotograph'],
  },
  {
    key: 'lastStop',
    order: 7,
    severityBand: 'severe',
    displayName: 'THE LAST STOP',
    signText: 'THE LAST STOP',
    ambience:
      'The carriage itself, emptied of every other passenger, lit only by the last working bulb overhead. The conductor waits in the aisle, unhurried, as if he has always been standing exactly there.',
    objects: [
      {
        id: 'conductor',
        label: 'The Conductor',
        position: { x: 50, y: 55 },
        inspectText: [
          'He says nothing. He only extends one open hand, palm up.',
          'He is still waiting. He will wait as long as it takes.',
        ],
      },
      {
        id: 'emptySeats',
        label: 'The Empty Carriage',
        position: { x: 25, y: 65 },
        inspectText: [
          'Every seat is empty now. Some still hold the shape of whoever sat there.',
          'Yours is the only seat left with anyone in it.',
        ],
      },
    ],
    announcements: ['This is the last stop.'],
    clueIds: ['passengerList', 'conductorsLedger'],
  },
];
