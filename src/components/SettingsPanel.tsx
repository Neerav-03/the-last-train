import { useGameStore } from '../engine/store';
import './SettingsPanel.css';

export default function SettingsPanel() {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);

  return (
    <div className="settings-panel">
      <label className="settings-row">
        <span>Master Volume</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.masterVolume}
          onChange={(e) => updateSettings({ masterVolume: Number(e.target.value) })}
        />
      </label>
      <label className="settings-row">
        <span>Music Volume</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.musicVolume}
          onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
        />
      </label>
      <label className="settings-row">
        <span>SFX Volume</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.sfxVolume}
          onChange={(e) => updateSettings({ sfxVolume: Number(e.target.value) })}
        />
      </label>
      <label className="settings-row settings-row-toggle">
        <span>Reduce Flashing</span>
        <input
          type="checkbox"
          checked={settings.reduceFlashing}
          onChange={(e) => updateSettings({ reduceFlashing: e.target.checked })}
        />
      </label>
      <label className="settings-row settings-row-toggle">
        <span>Screen Shake</span>
        <input
          type="checkbox"
          checked={settings.screenShake}
          onChange={(e) => updateSettings({ screenShake: e.target.checked })}
        />
      </label>
    </div>
  );
}
