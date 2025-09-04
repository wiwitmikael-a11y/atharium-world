




import React, { useMemo } from 'react';
import type { UnitInstance, Faction, FactionEffectType } from '../types';
import { UNITS_MAP, FACTIONS_MAP, STAT_INCREASE_PER_LEVEL } from '../constants';

interface UnitListItemProps {
  unit: UnitInstance;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

const getFactionModifier = (factionInfo: Faction, effectType: FactionEffectType, filter?: any): number => {
    let modifier = 0;
    if (!factionInfo.traits) return 0;
    for (const trait of factionInfo.traits) {
        for (const effect of trait.effects) {
            if (effect.type === effectType) {
                if (filter?.unitRole && effect.unitRole && filter.unitRole !== effect.unitRole) continue;
                if (filter?.stat && effect.stat && filter.stat !== effect.stat) continue;
                modifier += effect.value;
            }
        }
    }
    return modifier;
};

const UnitListItem: React.FC<UnitListItemProps> = ({ unit, isSelected, onClick, onMouseEnter }) => {
  const unitDef = UNITS_MAP.get(unit.unitId);
  const faction = FACTIONS_MAP.get(unit.factionId);

  const maxHp = useMemo(() => {
    if (!unitDef || !faction) return 0;
    
    let baseHp = unitDef.hp;
    const hpMod = getFactionModifier(faction, 'UNIT_STAT_MOD', { unitRole: unitDef.role, stat: 'hp' });
    const totalHpMod = getFactionModifier(faction, 'UNIT_STAT_MOD', { stat: 'hp' });
    baseHp *= (1 + hpMod + totalHpMod);

    const level = unit.level || 1;
    if (level > 1) {
        baseHp *= 1 + (level - 1) * STAT_INCREASE_PER_LEVEL;
    }
    return Math.floor(baseHp);
  }, [unit.factionId, unit.level, unitDef, faction]);

  if (!unitDef || !faction) return null;

  const isHostile = faction.id === 'neutral_hostile';
  const borderColor = isHostile ? 'border-gray-500' : `border-${faction.color}`;
  
  const healthPercentage = maxHp > 0 ? (unit.hp / maxHp) * 100 : 0;
  
  const selectionClasses = isSelected
    ? 'selected-list-item-pulse' // Animation class
    : 'hover:bg-gray-800/60';

  const selectedStyle = isSelected 
    ? { boxShadow: `0 0 0 2px rgba(var(--selection-glow-rgb), 0.5)` } 
    : {};

  return (
    <li
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={selectedStyle}
      className={`p-2.5 rounded-lg bg-black/40 border-l-4 ${borderColor} cursor-pointer ${selectionClasses} transition-all duration-200 transform hover:-translate-y-px hover:shadow-lg`}
    >
      <div className="flex justify-between items-center mb-1.5">
        <p className="font-semibold text-base">{unitDef.name} <span className="text-yellow-400 font-bold">Lvl. {unit.level}</span></p>
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