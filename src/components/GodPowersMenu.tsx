
import React from 'react';
import type { GodPower, GodPowerType } from '../types';
import Icon from './Icon';

interface GodPowersMenuProps {
  activePower: GodPowerType | null;
  onSelectPower: (power: GodPowerType | null) => void;
  currentAthar: number;
}

const GOD_POWERS: GodPower[] = [
    { id: 'Smite', name: 'Divine Smite', cost: 50, icon: 'bolt', description: 'Deals 50 damage to a unit or building.' },
    { id: 'Heal', name: 'Nature\'s Blessing', cost: 30, icon: 'heart', description: 'Heals a unit or repairs a building by 50 HP.' },
    { id: 'Enrich', name: 'Enrich Soil', cost: 100, icon: 'sun', description: 'Instantly spawns resources on a valid tile.' },
];

const GodPowersMenu: React.FC<GodPowersMenuProps> = ({ activePower, onSelectPower, currentAthar }) => {
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex space-x-4 bg-gray-900/90 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/50 shadow-xl shadow-cyan-500/20 transform transition-transform hover:scale-105">
        {GOD_POWERS.map(power => {
            const isActive = activePower === power.id;
            const canAfford = currentAthar >= power.cost;
            return (
                <button
                    key={power.id}
                    onClick={() => onSelectPower(isActive ? null : power.id)}
                    disabled={!canAfford}
                    className={`relative group flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 transition-all duration-200 
                        ${isActive ? 'bg-cyan-600 border-cyan-300 shadow-lg shadow-cyan-400/50 scale-110' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}
                        ${!canAfford ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
                    `}
                    title={`${power.name} (${power.cost} Athar)`}
                >
                    <Icon name={power.icon} className={`w-8 h-8 ${isActive ? 'text-white' : canAfford ? 'text-cyan-400' : 'text-gray-500'}`} />
                    <span className="absolute -bottom-2 text-[10px] font-bold bg-black/80 px-1.5 rounded-full text-white border border-gray-600">
                        {power.cost}
                    </span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center w-40 bg-gray-900 text-xs text-gray-300 p-2 rounded-lg border border-gray-600 shadow-xl pointer-events-none">
                        <span className="font-bold text-cyan-300 text-sm mb-1">{power.name}</span>
                        <p className="text-center leading-tight">{power.description}</p>
                    </div>
                </button>
            )
        })}
    </div>
  );
};

export default GodPowersMenu;
