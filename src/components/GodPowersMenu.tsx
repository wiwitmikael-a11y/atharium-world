import React, { useState } from 'react';
import type { GodPower, GodPowerCategory } from '../types';
import { GOD_POWERS } from '../constants';
import Icon from './Icon';

interface GodPowersMenuProps {
  activePower: GodPower | null;
  onSelectPower: (power: GodPower | null) => void;
  currentAthar: number;
}

const CATEGORIES: { id: GodPowerCategory; icon: string }[] = [
    { id: 'World', icon: 'mountain' },
    { id: 'Civilization', icon: 'flag' },
    { id: 'Creatures', icon: 'user' },
    { id: 'Destruction', icon: 'fire' },
];

const GodPowersMenu: React.FC<GodPowersMenuProps> = ({ activePower, onSelectPower, currentAthar }) => {
  const [activeCategory, setActiveCategory] = useState<GodPowerCategory>('World');

  const filteredPowers = GOD_POWERS.filter(p => p.category === activeCategory);

  return (
    <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 w-full max-w-2xl px-2 pointer-events-none">
        
        {/* Active Power Indicator (if any) */}
        {activePower && (
            <div className="pointer-events-auto bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-500/50 text-yellow-400 text-sm font-bold shadow-lg animate-pulse mb-2">
                ACTIVE: {activePower.name} (Click map)
            </div>
        )}

        {/* Powers Toolbar */}
        <div className="pointer-events-auto bg-gray-900/95 backdrop-blur-xl p-2 rounded-xl border border-gray-600 shadow-2xl flex flex-col gap-2 w-full sm:w-auto overflow-hidden">
            
            {/* Category Tabs */}
            <div className="flex justify-center space-x-1 border-b border-gray-700 pb-2 overflow-x-auto">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`p-2 rounded-lg transition-all flex-1 flex justify-center min-w-[3rem] ${activeCategory === cat.id ? 'bg-gray-700 text-cyan-400 shadow-inner' : 'text-gray-400 hover:bg-gray-800'}`}
                    >
                        <Icon name={cat.icon} className="w-5 h-5" />
                    </button>
                ))}
            </div>

            {/* Powers List */}
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent sm:justify-center">
                {filteredPowers.map(power => {
                    const isActive = activePower?.id === power.id;
                    const canAfford = currentAthar >= power.cost;
                    return (
                        <button
                            key={power.id}
                            onClick={() => onSelectPower(isActive ? null : power)}
                            disabled={!canAfford}
                            className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-200 flex-shrink-0 touch-manipulation
                                ${isActive ? 'bg-cyan-600 border-cyan-300 shadow-lg shadow-cyan-400/50 scale-105' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}
                                ${!canAfford ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
                            `}
                        >
                            <Icon name={power.icon} className={`w-5 h-5 ${isActive ? 'text-white' : canAfford ? 'text-cyan-400' : 'text-gray-500'}`} />
                            <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-black/90 px-1.5 rounded-full text-yellow-400 border border-gray-700 shadow-sm">
                                {power.cost}
                            </span>
                            
                            {/* Desktop Tooltip */}
                            <div className="absolute bottom-full mb-3 hidden md:group-hover:flex flex-col items-center w-40 bg-gray-900 text-xs text-gray-300 p-2 rounded-lg border border-gray-600 shadow-xl pointer-events-none z-50">
                                <span className="font-bold text-cyan-300 text-sm mb-1">{power.name}</span>
                                <p className="text-center leading-tight">{power.description}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    </div>
  );
};

export default GodPowersMenu;