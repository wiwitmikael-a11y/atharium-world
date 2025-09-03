import React from 'react';
import { ASSET_PATHS } from '../assets';

interface StartMenuProps {
  onStart: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onStart }) => {
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
      
      <div className="relative w-full h-full flex flex-col items-center justify-end text-center p-4 pb-24">
        <button
          onClick={onStart}
          className="text-2xl font-cinzel px-8 py-4 bg-gray-800/80 border-2 border-cyan-400 rounded-lg shadow-lg text-cyan-300 hover:bg-cyan-900 hover:shadow-cyan-400/50 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
        >
          Start Simulation
        </button>
      </div>
    </div>
  );
};

export default StartMenu;