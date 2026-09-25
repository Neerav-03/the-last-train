import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../engine/store';
import { initAudio, setAmbience, playDoorSound } from '../audio/AudioEngine';
import RainOverlay from '../effects/RainOverlay';
import FogOverlay from '../effects/FogOverlay';
import LightningFlash from '../effects/LightningFlash';
import InteractionPrompt from '../components/InteractionPrompt';
import './TrainArrival.css';

type ArrivalStage = 'distant' | 'approaching' | 'entering' | 'stopped' | 'boardable';

const RAIN_INTENSITY: Record<ArrivalStage, number> = {
  distant: 0.35,
  approaching: 0.55,
  entering: 0.75,
  stopped: 0.6,
  boardable: 0.5,
};

const ARRIVAL_WINDOWS = Array.from({ length: 9 }, (_, i) => 110 + i * 96);

export default function TrainArrival() {
  const [stage, setStage] = useState<ArrivalStage>('distant');
  const [flashTrigger, setFlashTrigger] = useState(0);
  const screenShakeEnabled = useGameStore((s) => s.settings.screenShake);
  const boardedRef = useRef(false);

  useEffect(() => {
    setAmbience('trainMoving');

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStage('approaching'), 4000));
    timers.push(window.setTimeout(() => setStage('entering'), 8000));
    timers.push(
      window.setTimeout(() => {
        setStage('stopped');
        playDoorSound();
        setFlashTrigger((t) => t + 1);
      }, 9600)
    );
    timers.push(window.setTimeout(() => setStage('boardable'), 10800));

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  const board = () => {
    if (stage !== 'boardable' || boardedRef.current) return;
    boardedRef.current = true;
    initAudio();
    playDoorSound();
    useGameStore.getState().boardTrain();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') board();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const shakeClass =
    screenShakeEnabled && (stage === 'approaching' || stage === 'entering')
      ? stage === 'entering'
        ? ' arrival-shake-strong'
        : ' arrival-shake'
      : '';

  return (
    <div className="train-arrival-scene screen-fade-enter" onClick={board}>
      <div className={`arrival-shake-wrap${shakeClass}`}>
        <FogOverlay opacity={0.4} />
        <RainOverlay intensity={RAIN_INTENSITY[stage]} z={2} />

        <div className="arrival-sky" />

        <svg className="arrival-rails" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="100" x2="100" y2="74" stroke="rgba(127,168,201,0.22)" strokeWidth="0.3" />
          <line x1="0" y1="100" x2="100" y2="86" stroke="rgba(127,168,201,0.22)" strokeWidth="0.3" />
        </svg>

        <div className={`arrival-headlight arrival-headlight-${stage}`} />

        <div className={`arrival-train arrival-train-${stage}`}>
          <svg className="arrival-train-body" viewBox="0 0 1000 240" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="arrivalTrainBodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14151a" />
                <stop offset="55%" stopColor="#0a0a0d" />
                <stop offset="100%" stopColor="#040405" />
              </linearGradient>
              <linearGradient id="arrivalWindowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(127,168,201,0.18)" />
                <stop offset="100%" stopColor="rgba(10,10,14,0.9)" />
              </linearGradient>
            </defs>

            <rect x="60" y="20" width="940" height="200" fill="url(#arrivalTrainBodyGrad)" stroke="var(--color-line)" strokeWidth="1.5" />
            <rect x="60" y="20" width="940" height="3" fill="var(--color-line)" opacity="0.5" />

            <path
              d="M0,220 L0,110 Q10,60 60,40 L60,220 Z"
              fill="url(#arrivalTrainBodyGrad)"
              stroke="var(--color-line)"
              strokeWidth="1.5"
            />
            <circle cx="26" cy="115" r="14" fill="#050505" stroke="var(--color-line)" strokeWidth="1" />
            <circle cx="26" cy="115" r="7" fill="rgba(255,244,214,0.5)" />

            {ARRIVAL_WINDOWS.map((x, i) => (
              <rect
                key={x}
                x={x}
                y="58"
                width="58"
                height="52"
                className={i === 2 || i === 6 ? 'arrival-window arrival-window-lit' : 'arrival-window'}
                stroke="var(--color-line)"
                strokeWidth="1"
              />
            ))}

            {ARRIVAL_WINDOWS.map((x) => (
              <line key={x} x1={x - 10} y1="20" x2={x - 10} y2="220" stroke="var(--color-line)" strokeWidth="0.5" opacity="0.25" />
            ))}

            <rect x="60" y="200" width="940" height="20" fill="#020203" />
            {[150, 290, 430, 570, 710, 850].map((cx) => (
              <circle key={cx} cx={cx} cy="215" r="10" fill="#050505" stroke="var(--color-line)" strokeWidth="1" opacity="0.7" />
            ))}
          </svg>
          <div className={`arrival-train-door arrival-train-door-${stage}`} />
        </div>

        <div className={`arrival-wind-lines${stage === 'approaching' || stage === 'entering' ? ' is-active' : ''}`} />
        <div className="arrival-platform-floor" />
      </div>

      <LightningFlash trigger={flashTrigger} />

      {stage === 'boardable' && (
        <>
          <InteractionPrompt label="Board the train" x={50} y={52} />
          <div className="arrival-board-hint">PRESS E TO BOARD</div>
        </>
      )}

      <div className="arrival-vignette" />
    </div>
  );
}
