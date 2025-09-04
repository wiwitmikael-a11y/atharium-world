
import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

interface HelpModalProps {
  onClose: () => void;
  isFirstTime?: boolean;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose, isFirstTime = false }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 pop-in">
      <div 
        ref={modalRef}
        className="bg-gray-900/70 backdrop-blur-md border-2 border-cyan-500/50 rounded-lg shadow-2xl shadow-cyan-400/20 text-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        <header className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <h2 className="text-2xl font-cinzel text-cyan-300">Welcome to the World of Atharium</h2>
          <button 
            onClick={onClose} 
            className={`p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors ${isFirstTime ? 'selection-glow' : ''}`}
            aria-label="Close help"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="p-6 overflow-y-auto space-y-6 text-gray-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <h3 className="text-xl font-bold text-cyan-400 mb-3">Controls</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="font-semibold text-white">Pan Map:</strong> Use <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">W/A/S/D</kbd>, or click and drag.</li>
                <li><strong className="font-semibold text-white">Zoom Map:</strong> Use the mouse scroll wheel or pinch to zoom.</li>
                <li><strong className="font-semibold text-white">Inspect:</strong> Click any tile to see details in the sidebar.</li>
                <li><strong className="font-semibold text-white">Follow Unit:</strong> Select a unit to follow it. Panning manually will disable follow.</li>
                <li><strong className="font-semibold text-white">Event Log:</strong> Click any event in the bottom ticker to jump to its location.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-cyan-400 mb-3">Core Concepts</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="font-semibold text-white">$ATHAR Minted:</strong> A global score tracking the world's progress. It rises as factions refine <strong className="text-purple-300">Chrono-Crystals</strong>.</li>
                <li><strong className="font-semibold text-white">Settlements:</strong> The heart of an empire. These 2x2 structures increase population capacity and resource storage. They can be upgraded into mighty, culture-specific cities.</li>
                <li><strong className="font-semibold text-white">Economy:</strong> Factions must build a full production chain: harvest <strong className="text-yellow-400">Raw</strong> resources, refine them into <strong className="text-blue-300">Processed</strong> goods, and craft those into <strong className="text-green-300">Components</strong> for advanced units and buildings.</li>
              </ul>
            </section>
          </div>

          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">Units & Combat</h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-lg text-white mb-1">Progression: XP & Leveling</h4>
                <p>Units gain XP by performing actions: workers from building, combat units from fighting. When a unit levels up, its HP and Attack increase, and it is fully healed. Watch for level-up announcements in the event log!</p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-lg text-white mb-1">Equipment & Loot</h4>
                <p className="mb-2">Units have three equipment slots: <strong className="text-white">Weapon</strong>, <strong className="text-white">Armor</strong>, and <strong className="text-white">Accessory</strong>. Gear provides powerful stat bonuses and comes in 5 rarities, shown by color:</p>
                <div className="flex space-x-4 text-sm mb-2">
                    <span className="text-gray-300">Common</span>
                    <span className="text-green-400">Uncommon</span>
                    <span className="text-blue-400">Rare</span>
                    <span className="text-purple-500">Epic</span>
                    <span className="text-orange-400">Legendary</span>
                </div>
                <p>When a unit is defeated, it drops a <strong className="text-yellow-300">Loot Container</strong> on the map containing its items. Any unit can move onto the tile to claim the gear for their faction. The AI will automatically equip the best items.</p>
              </div>
               <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-lg text-white mb-1">Infrastructure Combat</h4>
                <p>Buildings are no longer safe! Enemy units can attack and destroy your infrastructure. When a building is destroyed, it drops a <strong className="text-yellow-300">Loot Container</strong> with a portion of its construction resources, which can be claimed by any faction.</p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default HelpModal;
