import { useState } from 'react';
import { useGameStore } from '../engine/store';
import { CLUES } from '../data/clues';
import SettingsPanel from './SettingsPanel';
import './PauseMenu.css';

interface PauseMenuProps {
  onResume: () => void;
  onMainMenu: () => void;
}

type PauseView = 'menu' | 'clues' | 'settings';

export default function PauseMenu({ onResume, onMainMenu }: PauseMenuProps) {
  const [view, setView] = useState<PauseView>('menu');
  const discoveredClues = useGameStore((s) => s.discoveredClues);

  return (
    <div className="pause-overlay pause-overlay-enter">
      <div className="pause-panel pause-panel-enter">
        {view === 'menu' && (
          <>
            <h2>PAUSED</h2>
            <nav className="pause-nav">
              <button onClick={onResume}>Resume</button>
              <button onClick={() => setView('clues')}>Clues</button>
              <button onClick={() => setView('settings')}>Settings</button>
              <button onClick={onMainMenu}>Main Menu</button>
            </nav>
          </>
        )}

        {view === 'clues' && (
          <>
            <h2>CLUES</h2>
            <div className="clue-list">
              {discoveredClues.length === 0 && (
                <p className="clue-empty">Nothing discovered yet.</p>
              )}
              {discoveredClues.map((id) => {
                const clue = CLUES.find((c) => c.id === id);
                if (!clue) return null;
                return (
                  <div className="clue-item" key={id}>
                    <div className="clue-title">{clue.title}</div>
                    <div className="clue-desc">{clue.description}</div>
                  </div>
                );
              })}
            </div>
            <button className="pause-back" onClick={() => setView('menu')}>
              Back
            </button>
          </>
        )}

        {view === 'settings' && (
          <>
            <h2>SETTINGS</h2>
            <SettingsPanel />
            <button className="pause-back" onClick={() => setView('menu')}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
