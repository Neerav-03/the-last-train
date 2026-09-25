import { useState } from 'react';
import { useGameStore } from './engine/store';
import type { SceneId } from './engine/types';
import GrainOverlay from './effects/GrainOverlay';
import PauseMenu from './components/PauseMenu';
import SceneTransition from './components/SceneTransition';
import TitleScreen from './scenes/TitleScreen';
import Platform from './scenes/Platform';
import TrainArrival from './scenes/TrainArrival';
import TrainInterior from './scenes/TrainInterior';
import StationScene from './scenes/Station';
import EndingScreen from './scenes/Endings';
import { initAudio } from './audio/AudioEngine';

function renderScene(scene: SceneId) {
  switch (scene) {
    case 'title':
      return <TitleScreen />;
    case 'platform':
      return <Platform />;
    case 'trainArrival':
      return <TrainArrival />;
    case 'train':
      return <TrainInterior />;
    case 'station':
      return <StationScene />;
    case 'ending':
      return <EndingScreen />;
    default:
      return null;
  }
}

export default function App() {
  const scene = useGameStore((s) => s.scene);
  const settings = useGameStore((s) => s.settings);
  const resetToTitle = useGameStore((s) => s.resetToTitle);
  const [paused, setPaused] = useState(false);

  const allowPause = scene !== 'title' && scene !== 'ending';

  return (
    <div
      className="game-root"
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && allowPause) setPaused((p) => !p);
      }}
      tabIndex={-1}
      onClick={(e) => {
        // Ensure keyboard focus stays on the game root so ESC/WASD work immediately.
        (e.currentTarget as HTMLDivElement).focus();
        initAudio();
      }}
      onKeyDownCapture={() => initAudio()}
      ref={(el) => el?.focus()}
    >
      <SceneTransition sceneKey={scene}>{renderScene(scene)}</SceneTransition>

      <GrainOverlay reduceFlashing={settings.reduceFlashing} />

      {paused && allowPause && (
        <PauseMenu
          onResume={() => setPaused(false)}
          onMainMenu={() => {
            setPaused(false);
            resetToTitle();
          }}
        />
      )}
    </div>
  );
}
