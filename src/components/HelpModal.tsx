import React, { useEffect, useRef } from 'react';

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
        className="bg-gray-900/90 backdrop-blur-md border-2 border-cyan-500/50 rounded-lg shadow-2xl shadow-cyan-400/20 text-gray-200 w-full max-w-3xl max-h-[80vh] flex flex-col"
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
                    <strong className="font-semibold">Goal:</strong> The primary objective is to become the dominant faction by accumulating the most <strong className="text-yellow-400">Athar</strong>. Athar is generated passively based on your population.
                </li>
                <li>
                    <strong className="font-semibold">Factions & Biomes:</strong> Each faction has unique traits and prefers certain biomes. Units fighting in favorable terrain (or against factions with a terrain disadvantage) gain significant combat bonuses. Check the "Terrain Effects" in the sidebar when selecting a tile.
                </li>
                <li>
                    <strong className="font-semibold">Resources are Key:</strong> Expand your territory to claim resource deposits. Build extractors on them, then construct buildings like Forges and Workshops to process raw materials into advanced components needed for powerful units and infrastructure.
                </li>
                <li>
                    <strong className="font-semibold">Diplomacy Matters:</strong> Factions will form alliances and declare war based on their personality traits and their opinion of you. A powerful military might deter aggressors, while friendly relations can secure a valuable ally.
                </li>
                 <li>
                    <strong className="font-semibold">Population & Infrastructure:</strong> Your population is your main source of Athar and allows you to train more units. Build and upgrade settlements to increase your population capacity and unlock higher-tier units and buildings.
                </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HelpModal;
