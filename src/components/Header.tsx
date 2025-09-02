import React, { useState, useEffect, useRef } from 'react';
import type { GameState, SoundManager } from '../types';
import { EPOCHS, TICK_PER_YEAR, STARTING_YEAR } from '../constants';
import Icon from './Icon';
import SettingsMenu from './SettingsMenu';
import HelpModal from './HelpModal';
import InfoTooltip from './InfoTooltip';

interface HeaderProps {
  gameState: GameState;
  gameSpeed: number;
  onSetSpeed: (speed: number) => void;
  soundManager: SoundManager;
  onResetWorld: () => void;
  onExitToMenu: () => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SPEEDS = [0, 1, 2, 4];

const formatMintedAthar = (num: number) => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2
    }).format(num);
}

const Header: React.FC<HeaderProps> = ({ gameState, gameSpeed, onSetSpeed, soundManager, onResetWorld, onExitToMenu }) => {
  const { gameTime, totalMintedAthar } = gameState;
  const epochInfo = EPOCHS.find(e => e.id === gameTime.epoch);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const settingsRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const epochRef = useRef<HTMLDivElement>(null);
  const atharMintedRef = useRef<HTMLDivElement>(null);


  // Time calculations
  const ticksPerMonth = TICK_PER_YEAR / 12;
  const totalMonthsSinceStart = Math.floor(gameTime.tick / ticksPerMonth);
  const yearNumber = 1 + Math.floor(totalMonthsSinceStart / 12);
  const monthNumber = 1 + (totalMonthsSinceStart % 12);
  const currentMonthName = MONTHS[monthNumber - 1];
  const fullYear = STARTING_YEAR + yearNumber -1;
  const nextEpochIndex = EPOCHS.findIndex(e => e.id === gameTime.epoch) + 1;
  const nextEpoch = nextEpochIndex < EPOCHS.length ? EPOCHS[nextEpochIndex] : null;

  // $ATHAR Minted calculations
  const atharNextMilestone = 10 ** Math.ceil(Math.log10(Math.max(1, totalMintedAthar)));
  const atharPrevMilestone = totalMintedAthar > 0 ? atharNextMilestone / 10 : 0;
  const atharProgress = atharNextMilestone === atharPrevMilestone ? 100 : ((totalMintedAthar - atharPrevMilestone) / (atharNextMilestone - atharPrevMilestone)) * 100;


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
    <>
      <header className="absolute top-0 left-0 right-0 bg-gray-900/80 p-2 shadow-lg z-20 backdrop-blur-lg border-b-2 border-cyan-400 shadow-cyan-400/30">
        <div className="container mx-auto flex justify-between items-center text-white">
          
          <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="flex items-center space-x-2 sm:space-x-6 bg-gray-800 px-2 sm:px-4 py-2 rounded-lg border border-gray-700">
                  <div ref={timeRef} onClick={() => setActiveTooltip(activeTooltip === 'time' ? null : 'time')} className="flex items-center space-x-2 cursor-pointer" title="Game Date">
                      <Icon name="time" className="w-5 h-5 text-cyan-400" />
                      <span className="font-mono text-base sm:text-lg w-24 sm:w-28 text-center">M {monthNumber} Y {yearNumber}</span>
                  </div>
                  <div className="w-px h-6 bg-gray-600 hidden sm:block"></div>
                  <div ref={epochRef} onClick={() => setActiveTooltip(activeTooltip === 'epoch' ? null : 'epoch')} className="hidden sm:flex items-center space-x-2 cursor-pointer" title="Current Epoch">
                      <Icon name="epoch" className="w-5 h-5 text-purple-400" />
                      <span className="text-lg">{epochInfo?.name || 'Unknown Epoch'}</span>
                  </div>
              </div>
              <div ref={atharMintedRef} onClick={() => setActiveTooltip(activeTooltip === 'athar' ? null : 'athar')} className="hidden lg:flex items-center space-x-3 w-64 cursor-pointer" title="$ATHAR Minted">
                    <span className="text-sm font-semibold text-red-400">$ATHAR Minted</span>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${atharProgress}%` }}></div>
                    </div>
                    <span className="font-mono text-lg font-bold">{formatMintedAthar(totalMintedAthar)}</span>
                </div>
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

              <button
                  onClick={() => {
                      setIsHelpOpen(true);
                      soundManager.playSFX('ui_click_subtle');
                  }}
                  className="p-2 bg-gray-800 border border-gray-700 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Help"
              >
                  <Icon name="help" className="w-6 h-6 text-cyan-400" />
              </button>

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
      
      {/* Tooltips */}
      {activeTooltip === 'time' && (
        <InfoTooltip targetRef={timeRef} onClose={() => setActiveTooltip(null)}>
          <h4 className="font-bold text-cyan-400 mb-2">Timeline Details</h4>
          <p><strong className="font-semibold">Current Date:</strong> {currentMonthName}, {fullYear}</p>
          <p><strong className="font-semibold">World Time:</strong> Month {monthNumber}, Year {yearNumber}</p>
          {nextEpoch && <p className="mt-2">The <strong className="text-purple-400">{nextEpoch.name}</strong> looms on the horizon, a new chapter waiting to be written...</p>}
        </InfoTooltip>
      )}

      {activeTooltip === 'epoch' && epochInfo && (
        <InfoTooltip targetRef={epochRef} onClose={() => setActiveTooltip(null)}>
          <h4 className="font-bold text-purple-400 mb-2">{epochInfo.name}</h4>
          <p>{epochInfo.synopsis}</p>
          <p className="mt-2 text-xs text-gray-400">Epochs define the overarching challenges and opportunities of the era, influencing global events and faction behavior.</p>
        </InfoTooltip>
      )}

      {activeTooltip === 'athar' && (
        <InfoTooltip targetRef={atharMintedRef} onClose={() => setActiveTooltip(null)}>
          <h4 className="font-bold text-red-400 mb-2">$ATHAR Minted</h4>
          <p>This is a global measure of the world's collective magical and technological progress.</p>
          <p className="mt-2">It increases as factions across the world purify raw <strong className="text-purple-300">Chrono-Crystals</strong> into their refined state using <strong className="text-cyan-300">Arcane Enchanters</strong>.</p>
          <p className="mt-2 text-xs text-gray-400">Higher levels of minted $ATHAR may trigger world-changing events or unlock new possibilities.</p>
        </InfoTooltip>
      )}

      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
    </>
  );
};

export default Header;