import React from 'react';
import { ASSET_PATHS } from '../assets';

interface StartMenuProps {
  username: string;
  onNewGame: () => void;
  onLoadGame: () => void;
  saveExists: boolean;
}

const StartMenu: React.FC<StartMenuProps> = ({ username, onNewGame, onLoadGame, saveExists }) => {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <video
        src={ASSET_PATHS.ui_menu_background_video}
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black/40" />
      
      <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-cinzel text-white mb-4" style={{ textShadow: '0 0 10px rgba(0,0,0,0.7)' }}>
          Welcome, {username}
        </h1>
        <div className="space-y-4">
            <button
              onClick={onNewGame}
              className="text-2xl font-cinzel px-8 py-4 bg-gray-800/80 border-2 border-cyan-400 rounded-lg shadow-lg text-cyan-300 hover:bg-cyan-900 hover:shadow-cyan-400/50 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
            >
              New Simulation
            </button>
            <button
              onClick={onLoadGame}
              disabled={!saveExists}
              className="text-2xl font-cinzel px-8 py-4 bg-gray-800/80 border-2 border-cyan-400 rounded-lg shadow-lg text-cyan-300 hover:bg-cyan-900 hover:shadow-cyan-400/50 transition-all duration-300 backdrop-blur-sm transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-gray-800/80 disabled:hover:shadow-lg"
              title={saveExists ? "Load your saved game" : "No save data found for this user"}
            >
              Load Simulation
            </button>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;