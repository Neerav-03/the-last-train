import { useEffect, useState } from 'react';
import { useGameStore, hasExistingSave } from '../engine/store';
import { initAudio, setAmbience } from '../audio/AudioEngine';
import RainOverlay from '../effects/RainOverlay';
import FogOverlay from '../effects/FogOverlay';
import DustParticles from '../effects/DustParticles';
import SettingsPanel from '../components/SettingsPanel';
import './TitleScreen.css';

type TitleView = 'main' | 'settings';

export default function TitleScreen() {
  const [view, setView] = useState<TitleView>('main');
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    setAmbience('platform');
    setCanContinue(hasExistingSave());
  }, []);

  const handleNewGame = () => {
    initAudio();
    useGameStore.getState().startNewGame();
  };

  const handleContinue = () => {
    if (!canContinue) return;
    initAudio();
    useGameStore.getState().goToScene(useGameStore.getState().scene);
  };

  return (
    <div className="title-screen screen-fade-enter">
      <div className="title-parallax" aria-hidden="true">
        <svg
          className="title-layer title-layer-yard"
          viewBox="0 0 1200 400"
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            d="M0,400 L0,260 Q600,150 1200,260 L1200,400 Z"
            fill="var(--color-void)"
            opacity="0.9"
          />
          <g stroke="var(--color-line)" strokeWidth="1.5" opacity="0.45">
            <line x1="80" y1="400" x2="80" y2="240" />
            <line x1="260" y1="400" x2="260" y2="220" />
            <line x1="480" y1="400" x2="480" y2="205" />
            <line x1="720" y1="400" x2="720" y2="205" />
            <line x1="940" y1="400" x2="940" y2="220" />
            <line x1="1140" y1="400" x2="1140" y2="240" />
          </g>
          <path
            d="M80,240 Q170,225 260,220 Q370,210 480,205 Q600,200 720,205 Q830,210 940,220 Q1040,228 1140,240"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="1"
            opacity="0.35"
          />
        </svg>

        <div className="title-headlight-glow" />

        <svg
          className="title-layer title-layer-platform"
          viewBox="0 0 1200 300"
          preserveAspectRatio="xMidYMax slice"
        >
          <rect x="0" y="230" width="1200" height="70" fill="var(--color-bg)" />
          <rect x="0" y="225" width="1200" height="4" fill="var(--color-line)" opacity="0.4" />
          <g fill="var(--color-void)">
            <rect x="140" y="118" width="16" height="182" />
            <rect x="520" y="96" width="18" height="204" />
            <rect x="980" y="128" width="16" height="172" />
          </g>
        </svg>
      </div>

      <FogOverlay opacity={0.32} />
      <RainOverlay intensity={0.15} z={6} />
      <DustParticles density={0.2} />

      <div className="title-content">
        <h1 className="title-heading flicker-text">THE LAST TRAIN</h1>
        <p className="title-subtitle">2:17 AM</p>

        {view === 'main' && (
          <nav className="title-nav">
            <button className="title-button" onClick={handleNewGame}>
              New Game
            </button>
            <button
              className="title-button"
              disabled={!canContinue}
              onClick={handleContinue}
            >
              Continue
            </button>
            <button className="title-button" onClick={() => setView('settings')}>
              Settings
            </button>
          </nav>
        )}

        {view === 'settings' && (
          <div className="title-settings">
            <SettingsPanel />
            <button className="title-button title-settings-back" onClick={() => setView('main')}>
              Back
            </button>
          </div>
        )}
      </div>

      <p className="title-footnote">a platform. a train that shouldn't be here.</p>

      <div className="title-scanlines" aria-hidden="true" />
      <div className="title-vignette" aria-hidden="true" />
    </div>
  );
}
