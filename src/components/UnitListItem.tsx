
import React, { useMemo } from 'react';
import type { UnitInstance } from '../types';
import { UNITS_MAP, FACTIONS_MAP } from '../constants';

interface UnitListItemProps {
  unit: UnitInstance;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

const UnitListItem: React.FC<UnitListItemProps> = ({ unit, isSelected, onClick, onMouseEnter }) => {
  const unitDef = UNITS_MAP.get(unit.unitId);
  const faction = FACTIONS_MAP.get(unit.factionId);

  const maxHp = useMemo(() => {
    if (!unitDef || !faction) return 0;
    
    let hpMod = 0;
    faction.traits.forEach(trait => {
        trait.effects.forEach(effect => {
            if (effect.type === 'UNIT_STAT_MOD' && effect.stat === 'hp') {
                if (!effect.unitRole || effect.unitRole === unitDef.role) {
                    hpMod += effect.value;
                }
            }
        });
    });
    return Math.floor(unitDef.hp * (1 + hpMod));
  }, [unit.factionId, unitDef, faction]);

  if (!unitDef || !faction) return null;

  const isHostile = faction.id === 'neutral_hostile';
  const borderColor = isHostile ? 'border-gray-500' : `border-${faction.color}`;
  
  const healthPercentage = maxHp > 0 ? (unit.hp / maxHp) * 100 : 0;
  const selectionClasses = isSelected
    ? 'selected-list-item-pulse ring-2 ring-cyan-400/50'
    : 'hover:bg-gray-800/60';

  return (
    <li
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`p-2.5 rounded-lg bg-black/40 border-l-4 ${borderColor} cursor-pointer ${selectionClasses} transition-all duration-200 transform hover:-translate-y-px hover:shadow-lg`}
    >
      <div className="flex justify-between items-center mb-1.5">
        <p className="font-semibold text-base">{unitDef.name}</p>
        <p className="text-sm text-gray-400 font-mono">ATK: {unitDef.atk}</p>
      </div>
      <div className="w-full bg-black/30 rounded-full h-2 border border-black/20 overflow-hidden">
        <div
          className={`h-full rounded-full bg-green-500 transition-all duration-500 ease-out ${
            isSelected ? 'selected-health-bar' : ''
          }`}
          style={{ width: `${healthPercentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-right text-gray-300 mt-1 font-mono">
        {Math.ceil(unit.hp)} / {maxHp}
      </div>
    </li>
  );
};

export default UnitListItem;
