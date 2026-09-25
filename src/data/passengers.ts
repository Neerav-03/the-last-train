// Passenger definitions for THE LAST TRAIN.
// Five passengers ride the carriage. Their dialogue trees unlock progressively
// via interaction count, trip number, and flags. See src/engine/types.ts for
// the exact shape each object below must satisfy.

import type { PassengerDef } from '../engine/types';

export const PASSENGERS: PassengerDef[] = [
  // --- OLD MAN ---------------------------------------------------------
  // Chosen NOT to disappear: his arc is the longest (5 stages ramping from
  // "don't miss your stop" to "I've been waiting longer than you") and needs
  // many interactions across multiple trips to land, which an early
  // disappearance would cut short before its payoff.
  {
    id: 'oldMan',
    name: 'The Old Man',
    shortLabel: 'OLD MAN',
    seat: { x: 12, y: 58 },
    dialogueStages: [
      {
        minInteractions: 0,
        lines: [{ speaker: 'OLD MAN', text: "Don't miss your stop." }],
        setFlags: ['metOldMan'],
      },
      {
        minInteractions: 1,
        lines: [
          { speaker: 'OLD MAN', text: 'Sit if you like. Doesn’t matter to me.' },
          { speaker: 'OLD MAN', text: 'This line runs on its own clock. Not yours.' },
        ],
      },
      {
        minInteractions: 2,
        lines: [
          { speaker: 'OLD MAN', text: 'You keep looking out the window like it will change something.' },
          { speaker: 'OLD MAN', text: 'It won’t.' },
        ],
      },
      {
        minInteractions: 3,
        lines: [{ speaker: 'OLD MAN', text: 'You already did.' }],
        // §6.1 Tier 1 branch — memory/flavor only. Both paths still lead to
        // the same minInteractions:4/6 stages below; oldTicketStub is never
        // gated on either choice (Invariant 6/Tier-1 rule: never cut a reward,
        // only reflavor the text around it).
        choices: [
          { text: 'What did I do?', setFlags: ['oldManPressed'] },
          { text: 'Silence', setFlags: ['oldManIgnored'] },
        ],
      },
      {
        minInteractions: 4,
        lines: [
          { speaker: 'OLD MAN', text: 'Time doesn’t pass on this train. It just repeats itself politely.' },
          { speaker: 'OLD MAN', text: 'Ask the conductor, if you ever find him.' },
        ],
      },
      // --- §6.1 branch stages (placed after the base minInteractions:4 stage
      // so array-order-wins resolution picks the reflavored version once a
      // choice has set one of these flags; a player who somehow never passes
      // through the minInteractions:3 choice never has either flag set, so
      // the base stage above still plays unchanged). ---
      {
        minInteractions: 4,
        requiresFlag: 'oldManPressed',
        lines: [
          { speaker: 'OLD MAN', text: 'You asked. I already told you once.' },
          { speaker: 'OLD MAN', text: 'Fine. I’ll say it again, if it helps you keep count.' },
          { speaker: 'OLD MAN', text: 'Time doesn’t pass on this train. It just repeats itself politely.' },
          { speaker: 'OLD MAN', text: 'Ask the conductor, if you ever find him.' },
        ],
      },
      {
        minInteractions: 4,
        requiresFlag: 'oldManIgnored',
        lines: [
          { speaker: 'OLD MAN', text: 'No answer. Fine.' },
          { speaker: 'OLD MAN', text: 'Time doesn’t pass on this train, whether you ask or not.' },
        ],
      },
      // §6.2 payoff — Old Man's callback for the "Step back" branch of the
      // Woman's comfort choice. Uses minInteractions:5, a threshold Old Man
      // never previously used, so it slots between the minInteractions:4
      // stages above and the minInteractions:6 reveal below without ever
      // displacing that reveal or its oldTicketStub award.
      {
        minInteractions: 5,
        requiresFlag: 'avoidedWoman',
        lines: [
          { speaker: 'OLD MAN', text: 'I saw you. With her.' },
          { speaker: 'OLD MAN', text: 'You didn’t go to her. That’s alright. Not everyone can.' },
        ],
      },
      {
        minInteractions: 6,
        lines: [
          { speaker: 'OLD MAN', text: 'I’ve been waiting longer than you.' },
          { speaker: '', text: 'He finally turns his head. His eyes are the same color as the window glass.' },
          { speaker: 'OLD MAN', text: 'Keep this. It won’t get you anywhere. Neither will anything else.' },
        ],
        setFlags: ['oldManRevealed'],
        awardsClues: ['oldTicketStub'],
      },
    ],
  },

  // --- WOMAN WITH CHILD --------------------------------------------------
  // NOTE FOR RENDERER: this passenger never leaves her seat (no
  // disappearsAtTrip on her). It is the CHILD who vanishes. The train
  // interior renderer should hide the child sprite whenever the `childGone`
  // flag is set, while the woman herself remains seated and continues her
  // dialogueStages normally (from minTrip 3 onward she speaks about the
  // empty air she is still holding).
  {
    id: 'womanWithChild',
    name: 'The Woman',
    shortLabel: 'WOMAN',
    seat: { x: 34, y: 62 },
    dialogueStages: [
      {
        minInteractions: 0,
        lines: [{ speaker: 'WOMAN', text: '[She doesn’t look up.]' }],
      },
      {
        minInteractions: 1,
        lines: [{ speaker: 'WOMAN', text: '[She rocks the sleeping child, slow, automatic.]' }],
      },
      {
        minInteractions: 2,
        lines: [
          { speaker: '', text: 'The child’s reflection in the window doesn’t move with him.' },
          { speaker: 'WOMAN', text: '[She hasn’t noticed. Or she has, and stopped minding.]' },
        ],
      },
      {
        minInteractions: 3,
        lines: [{ speaker: 'WOMAN', text: 'He sleeps so well on this train.' }],
      },
      {
        minInteractions: 2,
        minTrip: 3,
        lines: [
          { speaker: '', text: 'Her arms are still curved the same way. There is nothing in them now.' },
          { speaker: 'WOMAN', text: 'He’s just sleeping.' },
          { speaker: 'WOMAN', text: 'He’s just sleeping. He’s just —' },
          { speaker: '', text: 'She stops. Looks down at her own empty hands like she’s never seen them before.' },
        ],
        setFlags: ['childGone'],
      },
      {
        minInteractions: 4,
        minTrip: 3,
        requiresFlag: 'childGone',
        lines: [
          { speaker: 'WOMAN', text: 'Do you have someone waiting for you?' },
          { speaker: 'WOMAN', text: 'Don’t let them wait too long.' },
        ],
        // §6.2 Tier 2 branch — "Say something" awards the bonus, optional
        // sharedGrief clue (never eligible for requiredClueIds — see
        // Invariant 5/6 and clues.ts). "Step back" awards no clue and instead
        // unlocks a unique Old Man callback line (see passengers.ts Old Man
        // entry, minInteractions:5, requiresFlag: 'avoidedWoman'). Neither
        // choice touches the childGone flag chain, this stage's own
        // completion, or any ending threshold.
        choices: [
          { text: 'Say something', setFlags: ['comfortedWoman'], awardsClues: ['sharedGrief'] },
          { text: 'Step back', setFlags: ['avoidedWoman'] },
        ],
      },
    ],
  },

  // --- BUSINESSMAN --------------------------------------------------------
  // One of the two candidates in the vanish pool (Invariant 1: exactly
  // {businessman, student}) — this run he disappears at trip 2 only if
  // store.vanishingPassengerId === 'businessman'. His arc is a single
  // self-contained escalation (watch check -> "how many times" -> "seven" ->
  // "for you") gated only by minInteractions, no minTrip, so it comfortably
  // resolves within trip 1 regardless of whether his seat ends up emptying
  // this run. His vanishing (when it happens) doubles as his own reveal
  // rather than orphaning unseen content.
  {
    id: 'businessman',
    name: 'The Businessman',
    shortLabel: 'BUSINESSMAN',
    seat: { x: 58, y: 55 },
    // Vanish state is resolved per-run on the store (vanishingPassengerId,
    // picked from the fixed {businessman, student} pool via rngFor) rather
    // than read off static data here — see TrainInterior.tsx and
    // STORY_REFINEMENT_GUIDE.md Invariant 1.
    dialogueStages: [
      {
        minInteractions: 0,
        lines: [
          { speaker: '', text: 'He checks his watch. Frowns. Checks it again.' },
          { speaker: 'BUSINESSMAN', text: 'Running late. Always running late.' },
        ],
      },
      {
        minInteractions: 1,
        lines: [
          { speaker: 'BUSINESSMAN', text: 'This is the 6:40, isn’t it? No — no, that’s not right.' },
          { speaker: 'BUSINESSMAN', text: 'I had somewhere to be.' },
        ],
      },
      {
        minInteractions: 2,
        lines: [
          { speaker: '', text: 'He taps the watch face like it might be broken.' },
          { speaker: 'BUSINESSMAN', text: 'Still 2:17. It’s been 2:17 for a while now.' },
        ],
      },
      {
        minInteractions: 3,
        lines: [
          { speaker: 'BUSINESSMAN', text: 'Funny thing. I don’t remember getting on.' },
          { speaker: 'BUSINESSMAN', text: 'Do you?' },
        ],
      },
      {
        minInteractions: 4,
        lines: [
          { speaker: 'BUSINESSMAN', text: 'How many times has this train stopped?' },
          { speaker: 'BUSINESSMAN', text: '...Seven.' },
          { speaker: 'BUSINESSMAN', text: 'For you.' },
        ],
        setFlags: ['businessmanRevealed'],
        awardsClues: ['businessmanWatch'],
      },
    ],
  },

  // --- STUDENT -------------------------------------------------------------
  {
    id: 'student',
    name: 'The Student',
    shortLabel: 'STUDENT',
    seat: { x: 76, y: 60 },
    dialogueStages: [
      {
        minInteractions: 0,
        lines: [{ speaker: '', text: 'She doesn’t look up. Headphones on, eyes closed, foot tapping to nothing.' }],
      },
      {
        minInteractions: 1,
        lines: [{ speaker: 'STUDENT', text: '[She doesn’t hear you.]' }],
      },
      {
        minInteractions: 2,
        lines: [
          { speaker: '', text: 'The foot has stopped tapping. The song, if it was ever a song, has gone still.' },
        ],
      },
      {
        minInteractions: 3,
        lines: [
          { speaker: 'STUDENT', text: 'Can you hear that?' },
          { speaker: 'STUDENT', text: '...No. I guess not.' },
          { speaker: '', text: 'She removes one headphone. Holds it out toward you, just slightly.' },
        ],
      },
      {
        minInteractions: 4,
        lines: [
          { speaker: 'STUDENT', text: 'It’s under the static. Has been the whole ride.' },
          { speaker: 'STUDENT', text: 'I keep telling myself it’s just static.' },
        ],
      },
      {
        minInteractions: 6,
        lines: [
          { speaker: '', text: 'She finally takes both headphones off and sets them in your hand.' },
          { speaker: 'STUDENT', text: 'Listen close. Right at the end.' },
          { speaker: '', text: 'Under the hiss, a voice, thin and looping. ...it says your name.' },
        ],
        setFlags: ['studentHeadphoneOff'],
        awardsClues: ['staticRecording'],
      },
    ],
  },

  // --- SILENT PASSENGER ------------------------------------------------
  // Deliberately kept minimal and eerie. Their identity is never resolved
  // here — the full reveal happens later in the scripted Station 7 scene.
  {
    id: 'silentPassenger',
    name: 'The Silent Passenger',
    shortLabel: '?',
    seat: { x: 92, y: 65 },
    dialogueStages: [
      {
        minInteractions: 0,
        lines: [{ speaker: '', text: '[They do not move.]' }],
      },
      {
        minInteractions: 2,
        lines: [{ speaker: '', text: '[They do not move. You’re almost certain they blinked.]' }],
      },
      {
        minInteractions: 4,
        lines: [{ speaker: '', text: '[Still. Silent. Facing forward. You can’t remember which direction that was last time.]' }],
      },
      // §6.6 payoff — consumed only after the player has acknowledged the
      // vanished passenger's empty seat in TrainInterior.tsx (sets
      // acknowledgedVanishing plus vanishLookedAway/vanishHeldGaze). Uses
      // minInteractions:5, a threshold Silent Passenger never previously
      // used, so it slots ahead of the minInteractions:6/minTrip:6 reveal
      // below without ever displacing or gating it — that stage (and its
      // setFlags) still fires unconditionally once its own thresholds are met.
      {
        minInteractions: 5,
        requiresFlag: 'vanishLookedAway',
        lines: [
          { speaker: '', text: 'The silent passenger’s head tilts, almost imperceptibly, toward the empty seat across the aisle.' },
          { speaker: '?', text: 'You looked away. Most do.' },
        ],
      },
      {
        minInteractions: 5,
        requiresFlag: 'vanishHeldGaze',
        lines: [
          { speaker: '', text: 'The silent passenger’s head tilts, almost imperceptibly, toward the empty seat across the aisle.' },
          { speaker: '?', text: 'You held it. That’s rarer.' },
        ],
      },
      {
        minInteractions: 6,
        minTrip: 6,
        lines: [
          { speaker: '', text: 'For the first time, they turn to look at you directly.' },
          { speaker: '?', text: 'You weren’t on the list.' },
        ],
        setFlags: ['silentPassengerSpoke'],
      },
    ],
  },
];
