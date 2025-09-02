import React, { useState, useEffect, useRef } from 'react';
import type { GameState, FactionState, SoundManager } from '../types';
import { EPOCHS, TICK_PER_YEAR, FACTIONS_MAP } from '../constants';
import Icon from './Icon';
import SettingsMenu from './SettingsMenu';

interface HeaderProps {
  gameTime: GameState['gameTime'];
  factions: Record<string, FactionState>;
  gameSpeed: number;
  onSetSpeed: (speed: number) => void;
  soundManager: SoundManager;
  onResetWorld: () => void;
  onExitToMenu: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SPEEDS = [0, 1, 2, 4];

const formatAthar = (num: number) => {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'k';
    return (num / 1000000).toFixed(1) + 'M';
}

const Header: React.FC<HeaderProps> = ({ gameTime, factions, gameSpeed, onSetSpeed, soundManager, onResetWorld, onExitToMenu }) => {
  const epochInfo = EPOCHS.find(e => e.id === gameTime.epoch);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const ticksPerMonth = TICK_PER_YEAR / 12;
  const currentMonthIndex = Math.floor((gameTime.tick % TICK_PER_YEAR) / ticksPerMonth);
  const currentMonthName = MONTHS[currentMonthIndex];

  const topFaction = React.useMemo(() => {
    return Object.values(factions).reduce((top, current) => current.athar > top.athar ? current : top, Object.values(factions)[0] || null);
  }, [factions]);
  
  const topFactionInfo = topFaction ? FACTIONS_MAP.get(topFaction.id) : null;
  const displayAthar = topFaction ? Math.max(1, topFaction.athar) : 1;
  const atharProgress = (Math.log10(displayAthar) % 1) * 100;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
            setIsSettingsOpen(false);
        }
    };
    if (isSettingsOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);
  
  return (
    <header className="absolute top-0 left-0 right-0 bg-gray-900/80 p-2 shadow-lg z-20 backdrop-blur-lg border-b-2 border-cyan-400 shadow-cyan-400/30">
      <div className="container mx-auto flex justify-between items-center text-white">
        
        <div className="flex items-center space-x-2 sm:space-x-6">
            <div className="flex items-center space-x-2 sm:space-x-6 bg-gray-800 px-2 sm:px-4 py-2 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-2" title="Date">
                    <Icon name="time" className="w-5 h-5 text-cyan-400" />
                    <span className="font-mono text-base sm:text-lg w-24 sm:w-28 text-center">{currentMonthName} {gameTime.year}</span>
                </div>
                <div className="w-px h-6 bg-gray-600 hidden sm:block"></div>
                <div className="hidden sm:flex items-center space-x-2" title="Epoch">
                    <Icon name="epoch" className="w-5 h-5 text-purple-400" />
                    <span className="text-lg">{epochInfo?.name || 'Unknown Epoch'}</span>
                </div>
            </div>
             {topFactionInfo && (
                <div className="hidden lg:flex items-center space-x-3 w-64" title={`Dominant Faction: ${topFactionInfo.name}`}>
                    <Icon name="athar" className={`w-6 h-6 text-${topFactionInfo.color}`} />
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className={`bg-${topFactionInfo.color} h-2.5 rounded-full`} style={{ width: `${atharProgress}%` }}></div>
                    </div>
                    <span className="font-mono text-lg font-bold">{formatAthar(topFaction.athar)}</span>
                </div>
             )}
        </div>

        <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-full p-1">
              {SPEEDS.map(speed => {
                const isPaused = speed === 0;
                const isActive = speed === gameSpeed;
                return (
                  <button
                    key={speed}
                    onClick={() => onSetSpeed(speed)}
                    onMouseEnter={() => soundManager?.playUIHoverSFX()}
                    className={`w-10 h-8 sm:w-12 sm:h-10 flex items-center justify-center rounded-full transition-colors duration-200 ${
                      isActive ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                    title={isPaused ? 'Pause' : `Speed ${speed}x`}
                    aria-pressed={isActive}
                  >
                    {isPaused ? <Icon name="pause" className="w-5 h-5" /> : <span className="text-lg font-bold">{speed}x</span>}
                  </button>
                );
              })}
            </div>

            <div ref={settingsRef} className="relative">
                <button
                    onClick={() => {
                        setIsSettingsOpen(prev => !prev);
                        soundManager.playSFX('ui_click_subtle');
                    }}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-full hover:bg-gray-700 transition-colors"
                    aria-label="Settings"
                >
                    <Icon name="gear" className="w-6 h-6 text-cyan-400" />
                </button>
                {isSettingsOpen && (
                    <SettingsMenu 
                        soundManager={soundManager}
                        onReset={() => {
                            onResetWorld();
                            setIsSettingsOpen(false);
                        }}
                        onExit={() => {
                            onExitToMenu();
                            setIsSettingsOpen(false);
                        }}
                    />
                )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;