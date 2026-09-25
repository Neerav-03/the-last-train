import { useEffect, useRef, useState } from 'react';
import type { DialogueChoice, DialogueLine } from '../engine/types';
import './DialogueBox.css';

interface DialogueBoxProps {
  lines: DialogueLine[];
  onComplete: () => void;
  /** ms per character for the typewriter effect */
  speed?: number;
  /**
   * If provided (non-empty), rendered as buttons once the final line has
   * fully typed out, in place of the usual click/space/enter "continue"
   * advance — the player must pick one. See STORY_REFINEMENT_GUIDE.md §6.
   */
  choices?: DialogueChoice[];
  /** Called when the player picks a choice; DialogueBox does not call onComplete itself in that case — the caller's onChoice handler is responsible for applying the choice's effects and closing the box. */
  onChoice?: (choice: DialogueChoice) => void;
}

export default function DialogueBox({ lines, onComplete, speed = 28, choices, onChoice }: DialogueBoxProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<number | null>(null);

  const current = lines[lineIndex];
  const onFinalLine = lineIndex === lines.length - 1;
  const showChoices = done && onFinalLine && !!choices && choices.length > 0;

  useEffect(() => {
    setCharIndex(0);
    setDone(false);
  }, [lineIndex, lines]);

  useEffect(() => {
    if (!current) return;
    if (charIndex >= current.text.length) {
      setDone(true);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setCharIndex((c) => c + 1);
    }, speed);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [charIndex, current, speed]);

  const advance = () => {
    if (!current) return;
    if (showChoices) return; // must pick a choice, not click/space past it
    if (!done) {
      setCharIndex(current.text.length);
      setDone(true);
      return;
    }
    if (lineIndex + 1 < lines.length) {
      setLineIndex((i) => i + 1);
    } else {
      onComplete();
    }
  };

  const pickChoice = (choice: DialogueChoice) => {
    onChoice?.(choice);
  };

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
  });

  if (!current) return null;

  return (
    <div className="dialogue-overlay dialogue-overlay-enter" onClick={advance}>
      <div className="dialogue-box dialogue-box-enter" key={lineIndex}>
        <div className="dialogue-speaker">{current.speaker}</div>
        <div className="dialogue-text">
          {current.text.slice(0, charIndex)}
          {!done && <span className="dialogue-cursor">_</span>}
        </div>
        {showChoices ? (
          <div className="dialogue-choices" onClick={(e) => e.stopPropagation()}>
            {choices!.map((choice, i) => (
              <button
                key={i}
                type="button"
                className="dialogue-choice-button"
                onClick={() => pickChoice(choice)}
              >
                {choice.text}
              </button>
            ))}
          </div>
        ) : (
          done && <div className="dialogue-continue">▾</div>
        )}
      </div>
    </div>
  );
}
