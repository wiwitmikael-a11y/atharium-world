
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

  // This hook is now at the top level of a component, which is correct.
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
  const selectionClasses = isSelected ? 'bg-cyan-500/30 ring-2 ring-cyan-400' : 'hover:bg-black/50';

  return (
    <li
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`p-2 rounded bg-black/30 border-l-4 ${borderColor} cursor-pointer ${selectionClasses} transition-all duration-200`}
    >
      <p className="font-semibold">{unitDef.name}</p>
      <p className="text-sm text-gray-400">HP: {Math.ceil(unit.hp)}/{maxHp} | ATK: {unitDef.atk}</p>
    </li>
  );
};

export default UnitListItem;
