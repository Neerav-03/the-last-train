// Ending definitions for THE LAST TRAIN. Exactly 3 endings.

import type { EndingDef } from '../engine/types';

export const ENDINGS: EndingDef[] = [
  {
    key: 'getOff',
    title: 'YOU FINALLY REACHED YOUR DESTINATION',
    lines: [
      'You step onto the platform.',
      'The doors close behind you without a sound.',
      'The train pulls away, and the dark folds back in over the tracks.',
      'The platform empties. The lights hold steady for once.',
      'You walk up the stairs, out through the gate, into a street that looks almost right.',
      '...',
      'You finally reached your destination.',
      'You just don’t remember leaving.',
    ],
  },
  {
    key: 'stayOn',
    title: 'THE SIXTH PASSENGER',
    lines: [
      'You stay in your seat.',
      'The doors close. Nobody asks you to move.',
      'The train pulls away from the last platform and doesn’t stop again.',
      'Outside the window, the dark stops pretending to be anything else.',
      'You find your hands folded the way the old man folds his.',
      'You find yourself checking your watch. It reads 2:17.',
      'It will read 2:17 for a very long time.',
      '...',
      'Somewhere, on a platform you don’t remember, it is 2:17 AM.',
      'A train that isn’t on any schedule is pulling in.',
      'Someone is waiting for it, alone.',
      'There are six passengers aboard.',
    ],
  },
  {
    key: 'breakLoop',
    title: 'YOU WEREN’T SUPPOSED TO REMEMBER',
    lines: [
      'The train shudders. For the first time all night, it feels like something is actually wrong.',
      'The lights along the carriage stutter, station by station, all the way down the line.',
      'At the far end of the car, the silent passenger finally stands.',
      'They cross the aisle slowly, the way something moves when it has stopped needing to hurry.',
      'They stop in front of you. For a moment, neither of you moves.',
      '"You weren’t supposed to remember."',
      '...',
      '',
    ],
  },
];
