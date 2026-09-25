import { useEffect, useState } from 'react';
import { useGameStore } from '../engine/store';
import { ENDINGS } from '../data/endings';
import type { EndingDef, EndingKey } from '../engine/types';
import { setAmbience } from '../audio/AudioEngine';
import FogOverlay from '../effects/FogOverlay';
import DustParticles from '../effects/DustParticles';
import './Endings.css';

const LINE_HOLD_MS = 3400;

// §6.2 — the Woman comfort branch swaps exactly one existing reflection line
// per ending (never adds/removes lines, never changes which ending fires).
// Each ending's own '...' beat was picked as the swap point since it already
// reads as a pause for reflection. Whichever flag is set (comfortedWoman /
// avoidedWoman) selects the variant; if neither is set (the player never
// reached the childGone + comfort-choice stage) the original line plays
// unchanged, which doubles as the "calmer/neutral" third variant.
const WOMAN_LINE_SWAP: Record<EndingKey, { index: number; comforted: string; avoided: string }> = {
  getOff: {
    index: 5,
    comforted: 'For a moment, on a platform you barely remember, you weren’t the only one who stayed.',
    avoided: 'You think, once, of a woman with her arms still curved around nothing, and how quiet you let it stay.',
  },
  stayOn: {
    index: 7,
    comforted: 'Somewhere in what’s left of you, you remember sitting with someone else’s grief instead of running from it.',
    avoided: 'Somewhere in what’s left of you, you remember a woman’s empty arms, and the seat you didn’t take beside her.',
  },
  breakLoop: {
    index: 6,
    comforted: 'You think, just once, of the woman with the empty arms — and the moment you didn’t look away.',
    avoided: 'You think, just once, of the woman with the empty arms — and the moment you did.',
  },
};

// §6.5 — seat loyalty closing line, keyed to whichever passenger received
// the most player attention (interactionCounts, derived — no new store
// state). Ties resolve to the first id in this fixed order.
const PASSENGER_ORDER = ['oldMan', 'womanWithChild', 'businessman', 'student', 'silentPassenger'] as const;

const SEAT_LOYALTY_LINES: Record<(typeof PASSENGER_ORDER)[number], string> = {
  oldMan: 'You think of the old man, and the ticket stub he pressed into your hand like it mattered.',
  womanWithChild: 'You think of the woman, and arms that never stopped curving around something that wasn’t there anymore.',
  businessman: 'You think of the businessman, and a watch that was always right about the wrong thing.',
  student: 'You think of the student, and a voice under the static that somehow knew your name.',
  silentPassenger: 'You think of the one who never spoke, until the one time it mattered.',
};

function resolveEndingLine(
  def: EndingDef,
  index: number,
  comfortedWoman: boolean,
  avoidedWoman: boolean
): string {
  const swap = WOMAN_LINE_SWAP[def.key];
  if (swap && index === swap.index) {
    if (comfortedWoman) return swap.comforted;
    if (avoidedWoman) return swap.avoided;
  }
  return def.lines[index];
}

function seatLoyaltyLine(interactionCounts: Record<string, number>): string | null {
  let bestId: (typeof PASSENGER_ORDER)[number] | null = null;
  let bestCount = 0;
  for (const id of PASSENGER_ORDER) {
    const count = interactionCounts[id] ?? 0;
    if (count > bestCount) {
      bestCount = count;
      bestId = id;
    }
  }
  return bestId ? SEAT_LOYALTY_LINES[bestId] : null;
}

export default function Endings() {
  const ending = useGameStore((s) => s.ending);
  const flags = useGameStore((s) => s.flags);
  const interactionCounts = useGameStore((s) => s.interactionCounts);
  const def = ENDINGS.find((e) => e.key === ending);

  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    setAmbience('silence');
  }, []);

  const comfortedWoman = !!flags['comfortedWoman'];
  const avoidedWoman = !!flags['avoidedWoman'];

  // Combined display lines: the ending's authored lines (with the §6.2
  // swap applied at their one designated index) plus, at the very end
  // before the ending menu appears, the §6.5 seat-loyalty coda — appended
  // here rather than in data/endings.ts so ENDINGS' lines arrays, lengths,
  // and firing conditions stay untouched.
  const displayLines = def
    ? [
        ...def.lines.map((_, i) => resolveEndingLine(def, i, comfortedWoman, avoidedWoman)),
        ...(() => {
          const coda = seatLoyaltyLine(interactionCounts);
          return coda ? [coda] : [];
        })(),
      ]
    : [];

  const lineCount = displayLines.length;
  const atMenu = lineIndex >= lineCount;

  const advance = () => {
    setLineIndex((i) => Math.min(i + 1, lineCount));
  };

  useEffect(() => {
    if (!def || atMenu) return;
    const timer = window.setTimeout(advance, LINE_HOLD_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIndex, def, atMenu]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineCount]);

  if (!def) return null;

  const handlePlayAgain = () => {
    useGameStore.getState().startNewGame();
  };

  const handleMainMenu = () => {
    useGameStore.getState().resetToTitle();
  };

  const progress = lineCount > 0 ? Math.min(lineIndex, lineCount) / lineCount : 0;

  return (
    <div className={`ending-scene ending-scene--${def.key}`} onClick={advance}>
      <FogOverlay opacity={def.key === 'getOff' ? 0.22 : def.key === 'breakLoop' ? 0.4 : 0.3} />
      {def.key !== 'getOff' && (
        <DustParticles density={def.key === 'breakLoop' ? 0.22 : 0.14} />
      )}

      <div className="ending-vignette" aria-hidden="true" />
      <div className="ending-progress" aria-hidden="true">
        <div className="ending-progress-fill" style={{ width: `${(atMenu ? 1 : progress) * 100}%` }} />
      </div>

      <div className="ending-content">
        {!atMenu && (
          <p key={lineIndex} className="ending-line screen-fade-enter">
            {displayLines[lineIndex]}
          </p>
        )}

        {atMenu && (
          <div className="ending-menu screen-fade-enter">
            <div className="ending-title-frame">
              <h1 className="ending-title">{def.title}</h1>
            </div>
            <div className="ending-menu-actions">
              <button
                className="ending-menu-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAgain();
                }}
              >
                Play Again
              </button>
              <button
                className="ending-menu-button ending-menu-button--ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMainMenu();
                }}
              >
                Main Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {!atMenu && <p className="ending-hint">press space, or click, to continue</p>}
    </div>
  );
}
