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
        // Leaf flavor variants (System 3) — one full progressive sequence per
        // variant, chosen once per run and locked in flags. Nothing reads this.
        inspectText: [
          [
            'An advertisement, rain-bleached past reading, peeling at one corner.',
            'Underneath the top layer, an older poster shows through — for a train line you’ve never heard of.',
          ],
          [
            'An advertisement, rain-bleached past reading, peeling at one corner.',
            'Underneath, an older poster: a timetable for a line that closed before you were born. The ink is still glossy.',
          ],
          [
            'An advertisement, rain-bleached past reading, peeling at one corner.',
            'Underneath are three older posters, each one for this same train, each a little more faded. The newest is on the bottom.',
          ],
        ],
      },
    ],
    // Station anomaly pool (System 2) — mild band: deniable, almost-normal.
    // At most one is chosen per run. Never carries clueIds (Invariant 4).
    anomalyPool: [
      {
        id: 'anomaly_umbrella',
        label: 'Folded Umbrella',
        position: { x: 36, y: 74 },
        inspectText: [
          'A black umbrella leans against a pillar, furled tight.',
          'It has been raining all night. There is not a drop on it.',
          'The handle is still warm. Someone set it down a moment ago, and meant to come back.',
        ],
      },
      {
        id: 'anomaly_puddle',
        label: 'Puddle',
        position: { x: 88, y: 78 },
        inspectText: [
          'Rainwater pooled in a dip in the concrete, rippling under the drip from the canopy.',
          'You lean over it. Your reflection takes a moment to lean over too.',
          'The ripples, probably. You don’t lean over it again.',
        ],
      },
      {
        id: 'anomaly_teaCup',
        label: 'Paper Cup',
        position: { x: 44, y: 50 },
        inspectText: [
          'A paper cup of tea balanced on the railing, still steaming in the cold.',
          'There is no one else on the platform. There is no tea stall either.',
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
          [
            'A long steel bench, empty, still faintly warm in one spot as if someone just stood up.',
            'You sit. The warmth fades faster than it should.',
          ],
          [
            'A long steel bench, empty. Someone has left a folded newspaper on the end seat.',
            'The crossword is half finished. Seven across is the word you were just trying to think of.',
          ],
          [
            'A long steel bench, empty, beaded with condensation.',
            'One seat has been wiped dry with a sleeve. The streaks are still wet at the edges.',
          ],
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
          [
            'A cork board thick with layers of old notices, none of them legible anymore.',
            'Pinned on top, a single blank index card. Nothing written on either side.',
          ],
          [
            'A cork board thick with layers of old notices, none of them legible anymore.',
            'One pin holds nothing at all, only a clean pale square where a notice hung until very recently.',
          ],
          [
            'A cork board thick with layers of old notices, none of them legible anymore.',
            'On top, a lost-property card: ONE SCARF, GREY. ASK AT THE OFFICE. There is no office.',
          ],
        ],
      },
    ],
    // Station anomaly pool (System 2) — mild band. Never carries clueIds.
    anomalyPool: [
      {
        id: 'anomaly_footprints',
        label: 'Wet Footprints',
        position: { x: 88, y: 70 },
        inspectText: [
          'Wet shoe prints lead from the open train doors to the platform edge, and back again.',
          'Someone got off to look at something, then got back on. You didn’t see anyone.',
        ],
      },
      {
        id: 'anomaly_tube',
        label: 'Flickering Tube',
        position: { x: 42, y: 28 },
        inspectText: [
          'One fluorescent tube stutters overhead, the way they all do eventually.',
          'It flickers in a rhythm. Long, short, short. Long, short, short.',
          'It steadies the moment you start counting.',
        ],
      },
      {
        id: 'anomaly_glove',
        label: 'Lost Glove',
        position: { x: 14, y: 50 },
        inspectText: [
          'A single leather glove, pushed onto a railing post so its owner might find it.',
          'It is exactly the size of your hand. Plenty of people have hands your size.',
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
          [
            'Another arrow, also marked EXIT, pointing the opposite direction from the first.',
            'Both signs were bolted by the same hand. You can tell from the screws.',
          ],
          [
            'Another arrow, also marked EXIT, pointing the opposite direction from the first.',
            'Someone has scratched a second word under EXIT, then scratched it out again. The gouges are fresh.',
          ],
          [
            'Another arrow, also marked EXIT, pointing the opposite direction from the first.',
            'The paint is still wet. It comes away on your fingertip, and now the arrow points somewhere else.',
          ],
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
    // Station anomaly pool (System 2) — moderate band: clearly wrong.
    // Never carries clueIds; positions stay clear of the followFootsteps
    // hotspot and its dust marker (lower left).
    anomalyPool: [
      {
        id: 'anomaly_stairwell',
        label: 'Stairwell',
        position: { x: 86, y: 66 },
        inspectText: [
          'A concrete stairwell leading up, stencilled EXIT in flaking paint.',
          'You climb twelve steps. The landing opens back onto this platform, from the far end.',
        ],
      },
      {
        id: 'anomaly_secondBulb',
        label: 'Caged Bulb',
        position: { x: 84, y: 28 },
        inspectText: [
          'A second caged bulb, identical to the first, bolted to the rebar.',
          'It isn’t lit. It isn’t wired to anything. It is warm to the touch.',
        ],
      },
      {
        id: 'anomaly_intercom',
        label: 'Intercom Panel',
        position: { x: 62, y: 76 },
        inspectText: [
          'A dented intercom box with a single call button.',
          'You press it. The line opens. On the other end, someone presses a button too, and waits.',
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
          [
            'A shopfront you’d recognize anywhere — same awning, same window display.',
            'The sign above the door reads a name you’ve never once seen on it before tonight.',
          ],
          [
            'A shopfront you’d recognize anywhere — same awning, same window display.',
            'The display is exactly as it was when you were small. The same sweets, the same sun-faded box. Nothing has moved in years.',
          ],
          [
            'A shopfront you’d recognize anywhere — same awning, same window display.',
            'The bell above the door rings as you look at it. The door has not opened.',
          ],
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
    // Station anomaly pool (System 2) — moderate band. Never carries clueIds.
    anomalyPool: [
      {
        id: 'anomaly_phoneBox',
        label: 'Phone Box',
        position: { x: 40, y: 72 },
        inspectText: [
          'A red phone box, the same one that stood outside the station you grew up near.',
          'It is ringing. You lift the receiver and hear this platform — the hum, your own breathing — a second late.',
        ],
      },
      {
        id: 'anomaly_memorialBench',
        label: 'Memorial Bench',
        position: { x: 88, y: 72 },
        inspectText: [
          'A bench with a small brass plaque: IN MEMORY OF, and then a date.',
          'The date is tomorrow’s.',
        ],
      },
      {
        id: 'anomaly_archTile',
        label: 'Tiled Arch',
        position: { x: 36, y: 40 },
        inspectText: [
          'The tiles in the arch are the pattern you remember, green and cream.',
          'One tile is missing, the one you chipped as a child. Here it is missing too, on the wrong side of the arch.',
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
          [
            'The edge drops into absolute black. No tracks. No far wall. Just distance that doesn’t end.',
            'You throw a coin over the edge. You never hear it land.',
          ],
          [
            'The edge drops into absolute black. No tracks. No far wall. Just distance that doesn’t end.',
            'You lean out to look. Somewhere very far below, something leans up to look back.',
          ],
          [
            'The edge drops into absolute black. No tracks. No far wall. Just distance that doesn’t end.',
            'You call out. Your voice comes back a long time later, from behind you.',
          ],
        ],
      },
    ],
    // Station anomaly pool (System 2) — severe band: hostile or personal.
    // Never carries clueIds and never touches the train-vanish reveal (§7).
    // Kept to the left half, clear of the reveal silhouette.
    anomalyPool: [
      {
        id: 'anomaly_coat',
        label: 'Folded Coat',
        position: { x: 18, y: 56 },
        inspectText: [
          'Your coat lies folded on the platform floor. You are wearing your coat.',
          'It is folded the way you fold it. The lining is still warm. Something has been sleeping on it.',
        ],
      },
      {
        id: 'anomaly_handprints',
        label: 'Handprints',
        position: { x: 26, y: 32 },
        inspectText: [
          'Handprints on a tiled pillar, pressed into the grime at the height of your shoulders.',
          'They keep going up. Higher than anyone could reach. All the way into the dark.',
        ],
      },
      {
        id: 'anomaly_speaker',
        label: 'Speaker Grille',
        position: { x: 22, y: 82 },
        inspectText: [
          'A speaker grille set into the floor, silent. No PA has run here in a long time.',
          'You kneel. Very quietly, it is saying your name. It was saying it before you got off.',
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
          [
            'A plain wooden door at the platform’s far end, warm light bleeding out from underneath.',
            'It is unlocked. It is waiting. You have never wanted anything to be simple this badly.',
          ],
          [
            'A plain wooden door at the platform’s far end, warm light bleeding out from underneath.',
            'Someone calls your name on the other side, the way it was called for dinner. You touch the handle. The voice stops.',
          ],
          [
            'A plain wooden door at the platform’s far end, warm light bleeding out from underneath.',
            'You knock. From the other side, very softly, someone knocks back — the same rhythm, a beat late.',
          ],
        ],
      },
    ],
    // Station anomaly pool (System 2) — severe band, personal. Never carries
    // clueIds and never triggers the void / RedEmergencyOverlay beat (§7).
    anomalyPool: [
      {
        id: 'anomaly_coatHooks',
        label: 'Coat Hooks',
        position: { x: 88, y: 34 },
        inspectText: [
          'A row of coat hooks by the door, a coat on each. You know every one of them.',
          'The last hook is empty. Above it, in your mother’s handwriting, is your name.',
        ],
      },
      {
        id: 'anomaly_placeSetting',
        label: 'Place Setting',
        position: { x: 36, y: 68 },
        inspectText: [
          'A small table by the bench, laid for one. The food is still hot.',
          'The chair has been pulled out for you. From the dust on the seat, it has been pulled out for a very long time.',
        ],
      },
      {
        id: 'anomaly_shoes',
        label: 'Shoes on the Mat',
        position: { x: 64, y: 72 },
        inspectText: [
          'A pair of shoes on the mat, toes to the wall, the way you always leave yours.',
          'They are your shoes. You look down at your feet, then back at the mat. Only one of those can be right.',
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
