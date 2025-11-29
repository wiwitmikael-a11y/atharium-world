
// FIX: Corrected import path for types. UnitRole and Resource are in ../types.
import type { Faction, FactionEffectType, UnitRole, Resource } from '../types';

/**
 * Calculates a cumulative modifier for a specific faction effect type.
 * It iterates through a faction's traits and sums up the values of effects that match the criteria.
 * @param factionInfo The faction definition object.
 * @param effectType The type of effect to calculate (e.g., 'UNIT_STAT_MOD').
 * @param filter Optional object to filter effects further (e.g., by unitRole or stat).
 * @returns A number representing the total modifier (e.g., 0.1 for +10%).
 */
export const getFactionModifier = (factionInfo: Faction, effectType: FactionEffectType, filter?: { unitRole?: UnitRole, stat?: 'hp' | 'atk', resourceTier?: Resource['tier'] }): number => {
    let modifier = 0;
    if (!factionInfo.traits) return 0;

    for (const trait of factionInfo.traits) {
        for (const effect of trait.effects) {
            if (effect.type === effectType) {
                // Apply filters for specificity
                let match = true;
                if (filter?.unitRole && effect.unitRole && filter.unitRole !== effect.unitRole) match = false;
                if (filter?.stat && effect.stat && filter.stat !== effect.stat) match = false;
                if (filter?.resourceTier && effect.resourceTier && filter.resourceTier !== effect.resourceTier) match = false;

                if (match) {
                    modifier += effect.value;
                }
            }
        }
    }
    return modifier;
};