import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-gray-900/70 backdrop-blur-md border-2 border-cyan-500/50 rounded-lg shadow-2xl shadow-cyan-400/20 text-gray-200 w-full max-w-3xl max-h-[80vh] flex flex-col"
      >
        <header className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <h2 className="text-2xl font-cinzel text-cyan-300">Help & Instructions</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </header>
        <main className="p-6 overflow-y-auto space-y-6">
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">Controls</h3>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="font-semibold">Pan Map:</strong> Use <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">W</kbd> <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">A</kbd> <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">S</kbd> <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">D</kbd> keys, or click and drag with the mouse. On touch devices, drag with one finger.</li>
              <li><strong className="font-semibold">Zoom Map:</strong> Use the mouse scroll wheel. On touch devices, use a two-finger pinch gesture.</li>
              <li><strong className="font-semibold">Inspect:</strong> Click on any tile to view its details in the sidebar.</li>
              <li><strong className="font-semibold">Game Speed:</strong> Use the speed controls in the top right to pause, or play at 1x, 2x, or 4x speed.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-bold text-cyan-400 mb-3">Gameplay Tips</h3>
            <ul className="space-y-3 list-disc list-inside">
                <li>
                    <strong className="font-semibold">$ATHAR Minted - A Global Metric:</strong> The bar at the top of the screen tracks `$ATHAR Minted`, a measure of the world's collective technological and magical advancement. It increases when any faction refines <strong className="text-purple-300">Raw Chrono-Crystals</strong>. Higher levels may trigger world-changing events.
                </li>
                <li>
                    <strong className="font-semibold">Faction Athar:</strong> Each faction also has its own <strong className="text-yellow-400">Athar</strong> score, generated passively from its population. This represents the faction's influence and power. The faction with the highest Athar is shown in the header.
                </li>
                <li>
                    <strong className="font-semibold">Factions & Biomes:</strong> Each faction has unique traits and prefers certain biomes. Units fighting in favorable terrain gain significant combat bonuses. Check the "Terrain Effects" in the sidebar when selecting a tile.
                </li>
                <li>
                    <strong className="font-semibold">Resources are Key:</strong> Expand your territory to claim resource deposits. Build extractors on them, then construct buildings like Forges to process raw materials into advanced components needed for powerful units and infrastructure.
                </li>
                <li>
                    <strong className="font-semibold">Diplomacy Matters:</strong> Factions will form alliances and declare war based on their personality traits and their opinion of each other. A powerful military might deter aggressors, while friendly relations can secure a valuable ally.
                </li>
                 <li>
                    <strong className="font-semibold">Saving Your Simulation:</strong> You can save the current state of the world via the <strong className="font-semibold">Settings</strong> menu (<Icon name="crystal" className="w-4 h-4 inline-block -mt-1" /> icon). When you log in next time, you'll have the option to load this saved state.
                </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HelpModal;
