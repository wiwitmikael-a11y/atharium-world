import React from 'react';
import type { SoundManager } from '../types';

interface SettingsMenuProps {
  soundManager: SoundManager;
  onReset: () => void;
  onExit: () => void;
  // FIX: Added onSaveGame prop to allow saving the game from the menu.
  onSaveGame: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ soundManager, onReset, onExit, onSaveGame }) => {

  const menuItems = [
    // FIX: Added Save Game button to the menu.
    { label: 'Save Game', action: onSaveGame },
    { label: `BGM: ${soundManager.isBgmEnabled ? 'On' : 'Off'}`, action: soundManager.toggleBgm },
    { label: `SFX: ${soundManager.isSfxEnabled ? 'On' : 'Off'}`, action: soundManager.toggleSfx },
    { label: 'Reset World', action: onReset },
    { label: 'Exit to Menu', action: onExit },
  ];

  return (
    <div className="absolute top-14 left-2 w-48 bg-gray-900/70 backdrop-blur-md rounded-lg shadow-2xl border border-cyan-500/50 z-50">
      <ul className="p-2 space-y-1">
        {menuItems.map((item) => (
          <li key={item.label}>
            <button
              onClick={() => {
                item.action();
                soundManager.playSFX('ui_click_subtle');
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-200 rounded hover:bg-cyan-700/50 hover:pl-4 transition-all duration-200"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SettingsMenu;
