
import type { UnitInstance, Faction, UnitDefinition, ItemDefinition } from '../types';
import { UNITS_MAP, FACTIONS_MAP, STAT_INCREASE_PER_LEVEL } from '../constants';
import { getFactionModifier } from './faction';

/**
 * Calculates the final combat stats for a given unit instance.
 * This function is the single source of truth for unit power, combining:
 * 1. Base stats from the unit's definition.
 * 2. Faction-wide and role-specific bonuses.
 * 3. Stat increases from leveling up.
 * 4. Bonuses from all equipped items.
 * @param unit The UnitInstance to calculate stats for.
 * @returns An object containing the unit's final maxHp, attack, defense, and the bonus amounts from equipment and levels.
 */
export const getUnitStats = (unit: UnitInstance): { maxHp: number, attack: number, defense: number, bonusHp: number, bonusAtk: number, bonusDef: number } => {
    const unitDef = UNITS_MAP.get(unit.unitId);
    const factionInfo = FACTIONS_MAP.get(unit.factionId);

    if (!unitDef || !factionInfo) {
        console.error(`Could not find UnitDefinition or FactionInfo for unit ${unit.id}`);
        return { maxHp: 0, attack: 0, defense: 0, bonusHp: 0, bonusAtk: 0, bonusDef: 0 };
    }

    // 1. Start with base stats from definition
    let baseHp = unitDef.hp;
    let baseAtk = unitDef.atk;
    let baseDef = unitDef.defense;

    // 2. Apply Faction-wide and role-specific trait bonuses
    const hpFactionMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { unitRole: unitDef.role, stat: 'hp' });
    const totalHpFactionMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { stat: 'hp' });
    baseHp *= (1 + hpFactionMod + totalHpFactionMod);

    const atkFactionMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { unitRole: unitDef.role, stat: 'atk' });
    const totalAtkFactionMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { stat: 'atk' });
    baseAtk *= (1 + atkFactionMod + totalAtkFactionMod);
    
    // 3. Apply Level Bonus
    const level = unit.level || 1;
    if (level > 1) {
        const levelBonusMultiplier = 1 + (level - 1) * STAT_INCREASE_PER_LEVEL;
        baseHp *= levelBonusMultiplier;
        baseAtk *= levelBonusMultiplier;
    }
    
    // This is the unit's "un-equipped" stats
    const statsAfterMods = {
        hp: Math.floor(baseHp),
        atk: Math.floor(baseAtk),
        def: Math.floor(baseDef)
    };

    // 4. Aggregate Equipment Bonuses
    const equipmentBonuses = {
        flatHp: 0, flatAtk: 0, flatDef: 0,
        percentHp: 0, percentAtk: 0, percentDef: 0,
        // Non-stat bonuses could be aggregated here too if needed
    };

    const allEquipment = Object.values(unit.equipment).filter(Boolean) as ItemDefinition[];
    for (const item of allEquipment) {
        for (const effect of item.effects) {
            switch(effect.type) {
                case 'HP_FLAT': equipmentBonuses.flatHp += effect.value; break;
                case 'ATTACK_FLAT': equipmentBonuses.flatAtk += effect.value; break;
                case 'DEFENSE_FLAT': equipmentBonuses.flatDef += effect.value; break;
                case 'HP_PERCENT': equipmentBonuses.percentHp += effect.value; break;
                case 'ATTACK_PERCENT': equipmentBonuses.percentAtk += effect.value; break;
                case 'DEFENSE_PERCENT': equipmentBonuses.percentDef += effect.value; break;
            }
        }
    }

    // 5. Calculate Final Stats by applying equipment bonuses
    const finalMaxHp = Math.floor((statsAfterMods.hp + equipmentBonuses.flatHp) * (1 + equipmentBonuses.percentHp));
    const finalAttack = Math.floor((statsAfterMods.atk + equipmentBonuses.flatAtk) * (1 + equipmentBonuses.percentAtk));
    const finalDefense = Math.floor((statsAfterMods.def + equipmentBonuses.flatDef) * (1 + equipmentBonuses.percentDef));

    return {
        maxHp: finalMaxHp,
        attack: finalAttack,
        defense: finalDefense,
        bonusHp: finalMaxHp - statsAfterMods.hp,
        bonusAtk: finalAttack - statsAfterMods.atk,
        bonusDef: finalDefense - statsAfterMods.def,
    };
};
