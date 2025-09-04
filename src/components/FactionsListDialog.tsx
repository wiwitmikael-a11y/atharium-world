import React, { useRef, useEffect } from 'react';
import type { FactionState } from '../types';
import { FACTIONS_MAP } from '../constants';

interface FactionsListDialogProps {
  factions: Record<string, FactionState>;
  onSelectFaction: (factionId: string) => void;
  onClose: () => void;
}

const FactionsListDialog: React.FC<FactionsListDialogProps> = ({ factions, onSelectFaction, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const sortedFactionIds = Object.keys(factions)
    .sort((a, b) => {
        const factionA = FACTIONS_MAP.get(a);
        const factionB = FACTIONS_MAP.get(b);
        if (!factionA || !factionB) return 0;
        return factionA.name.localeCompare(factionB.name);
    });

  return (
    <div
      ref={dialogRef}
      className="absolute top-full right-0 mt-2 w-64 bg-gray-900/80 backdrop-blur-md rounded-lg shadow-2xl border border-cyan-500/50 z-50 pop-in"
    >
      <div className="p-2">
        <h3 className="text-lg font-cinzel text-cyan-300 px-2 pb-2 border-b border-cyan-500/30">Factions</h3>
        <ul className="mt-2 space-y-1 max-h-96 overflow-y-auto">
          {sortedFactionIds.map((factionId) => {
            const factionInfo = FACTIONS_MAP.get(factionId);
            if (!factionInfo || factionInfo.id === 'neutral_hostile') return null;

            return (
              <li key={factionId}>
                <button
                  onClick={() => onSelectFaction(factionId)}
                  className={`w-full text-left px-3 py-2 text-sm text-gray-200 rounded hover:bg-cyan-700/50 hover:pl-4 transition-all duration-200 flex items-center group`}
                >
                  <div className={`w-3 h-3 rounded-full bg-${factionInfo.color} mr-3 flex-shrink-0`}></div>
                  <span className={`group-hover:text-white text-${factionInfo.color}`}>{factionInfo.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default FactionsListDialog;
