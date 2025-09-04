

import { useEffect, useRef } from 'react';
import { GameState, TileData, Infrastructure as InfraType, FactionState, UnitInstance, UnitTrait, GameEvent, Faction, FactionEffectType, UnitDefinition, SoundManager, Biome, ResourceTier, FactionArchetype, TechNode } from '../types';
import { TICK_PER_YEAR, INFRASTRUCTURE_MAP, UNITS_MAP, INFRASTRUCTURE, WORLD_EVENTS, FACTIONS_MAP, UNITS, BIOMES_MAP, UNIT_TRAITS_MAP, RESOURCES_MAP, TECH_TREES } from '../constants';

const FACTION_POWER_CACHE: Record<string, { power: number, tick: number }> = {};

const getFactionOwnedTiles = (world: TileData[][], factionId: string) => world.flat().filter(t => t.ownerFactionId === factionId);

const addGameEvent = (newState: GameState, message: string, location: { x: number, y: number }) => {
    const newEvent: GameEvent = {
        id: newState.nextEventId,
        tick: newState.gameTime.tick,
        message,
        location,
    };
    newState.nextEventId++;
    newState.eventLog.unshift(newEvent); // Add to the beginning
    if (newState.eventLog.length > 20) { // Keep log size manageable
        newState.eventLog.pop();
    }
};

const getFactionModifier = (factionInfo: Faction, effectType: FactionEffectType, filter?: any): number => {
    let modifier = 0;
    if (!factionInfo.traits) return 0;
    for (const trait of factionInfo.traits) {
        for (const effect of trait.effects) {
            if (effect.type === effectType) {
                // Apply filters for specificity
                if (filter?.resourceTier && effect.resourceTier && filter.resourceTier !== effect.resourceTier) continue;
                if (filter?.unitRole && effect.unitRole && filter.unitRole !== effect.unitRole) continue;
                if (filter?.stat && effect.stat && filter.stat !== effect.stat) continue;
                modifier += effect.value;
            }
        }
    }
    return modifier;
};

const getModifiedCost = (cost: Record<string, number>, modifier: number): Record<string, number> => {
    const modifiedCost: Record<string, number> = {};
    for (const resId in cost) {
        modifiedCost[resId] = Math.max(1, Math.floor(cost[resId] * (1 + modifier)));
    }
    return modifiedCost;
};

const getInitialHp = (unitDef: UnitDefinition, factionInfo: Faction): number => {
    const hpMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { unitRole: unitDef.role, stat: 'hp' });
    const totalHpMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { stat: 'hp' });
    return Math.floor(unitDef.hp * (1 + hpMod + totalHpMod));
};

const calculateTerrainBonus = (unit: UnitInstance, biome: Biome): { atkBonus: number, defBonus: number } => {
    const factionInfo = FACTIONS_MAP.get(unit.factionId);
    const unitDef = UNITS_MAP.get(unit.unitId);
    if (!factionInfo || !unitDef || !biome.terrainEffects) {
        return { atkBonus: 0, defBonus: 0 };
    }

    let atkBonus = 0;
    let defBonus = 0;

    for (const effect of biome.terrainEffects) {
        const appliesByArchetype = effect.appliesTo.factionArchetype && effect.appliesTo.factionArchetype === factionInfo.archetype;
        const appliesByRole = effect.appliesTo.unitRole && effect.appliesTo.unitRole === unitDef.role;

        if (appliesByArchetype || appliesByRole) {
            for (const eff of effect.effects) {
                if (eff.stat === 'atk') {
                    atkBonus += eff.modifier;
                } else if (eff.stat === 'def') {
                    defBonus += eff.modifier;
                }
            }
        }
    }
    return { atkBonus, defBonus };
};


const recalculateStorage = (factionState: FactionState, ownedTiles: TileData[]) => {
    // Reset capacity
    for (const tier in factionState.storage) {
        factionState.storage[tier as ResourceTier].capacity = 0;
    }

    // Recalculate capacity from all infrastructure
    const infraTiles = ownedTiles.filter(t => t.infrastructureId);
    for (const tile of infraTiles) {
        const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId!);
        if (infra?.addsStorage) {
            for (const [tier, amount] of Object.entries(infra.addsStorage)) {
                factionState.storage[tier as ResourceTier].capacity += amount;
            }
        }
    }

    // Recalculate current usage
    for (const tier in factionState.storage) {
        factionState.storage[tier as ResourceTier].current = 0;
    }
    for (const [resId, amount] of Object.entries(factionState.resources)) {
        const resDef = RESOURCES_MAP.get(resId);
        if (resDef) {
            factionState.storage[resDef.tier].current += amount;
        }
    }
};

const runResearchAI = (faction: FactionState, tick: number) => {
    if (tick % 251 !== 0) return; // Run periodically

    const factionInfo = FACTIONS_MAP.get(faction.id);
    if (!factionInfo) return;
    
    const techTree = TECH_TREES[factionInfo.techTreeId];
    if (!techTree) return;

    const availableTechs = techTree.filter(tech => 
        !faction.unlockedTechs.includes(tech.id) &&
        tech.prerequisites.every(prereq => faction.unlockedTechs.includes(prereq))
    );

    if (availableTechs.length === 0) return;

    // Simple AI: Prioritize techs that unlock units, then the cheapest available.
    let techToResearch: TechNode | undefined;
    
    const unitUnlockingTechs = availableTechs.filter(t => t.effect.toLowerCase().includes('unlocks'));
    if (unitUnlockingTechs.length > 0) {
        techToResearch = unitUnlockingTechs.sort((a,b) => a.cost - b.cost)[0];
    } else {
        techToResearch = availableTechs.sort((a, b) => a.cost - b.cost)[0];
    }

    if (techToResearch && faction.researchPoints >= techToResearch.cost) {
        faction.researchPoints -= techToResearch.cost;
        faction.unlockedTechs.push(techToResearch.id);
    }
};

const findBuildSite = (ownedTiles: TileData[], world: TileData[][], infraToBuild: InfraType): TileData | null => {
    const buildSites = ownedTiles.map(t => {
        const neighbors: TileData[] = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = t.x + dx;
                const ny = t.y + dy;
                if (nx >= 0 && nx < world[0].length && ny >= 0 && ny < world.length) {
                    neighbors.push(world[ny][nx]);
                }
            }
        }
        return neighbors;
    }).flat().filter(t => !t.ownerFactionId && !t.infrastructureId && !t.partOfInfrastructure);
    
    if (infraToBuild.requiresResourceId) {
        return buildSites.find(s => s.resourceId === infraToBuild.requiresResourceId) || null;
    }
    
    return buildSites.find(s => !s.resourceId && !s.worldEventId) || null;
};

const runManagementAI = (faction: FactionState, ownedTiles: TileData[], world: TileData[][], tick: number, nextUnitId: number, soundManager: SoundManager): number => {
    if (tick % 101 !== 0) return nextUnitId;

    const factionInfo = FACTIONS_MAP.get(faction.id)!;
    
    const canProduce = (resourceId: string): boolean => {
        return ownedTiles.some(tile => {
            if (!tile.infrastructureId) return false;
            const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId);
            return infra?.produces?.resourceId === resourceId;
        });
    };
    const hasBuilding = (infraId: string): boolean => ownedTiles.some(tile => tile.infrastructureId === infraId);
    const canAfford = (cost: Record<string, number>): boolean => Object.entries(cost).every(([resId, amount]) => (faction.resources[resId] || 0) >= amount);

    // Goal-Oriented Logic
    const goals: (UnitDefinition | InfraType)[] = UNITS
        .filter(u => u.factionId === faction.id && u.tier > 1 && u.role !== 'Worker')
        .sort((a, b) => b.tier - a.tier);

    for (const goal of goals) {
        if ('role' in goal) { // Is a Unit
            const unitToTrain = goal;
            let buildAction: { infra: InfraType, tile: TileData } | null = null;
            let canBuildUnit = true;

            for (const [resId, amount] of Object.entries(unitToTrain.cost)) {
                if (!canProduce(resId) && (faction.resources[resId] || 0) < amount * 5) {
                    const producerInfra = INFRASTRUCTURE.find(i => i.produces?.resourceId === resId);
                    if (producerInfra && !hasBuilding(producerInfra.id)) {
                        const infraCostMod = getFactionModifier(factionInfo, 'INFRASTRUCTURE_COST_MOD');
                        const modifiedCost = getModifiedCost(producerInfra.cost, infraCostMod);
                        if (canAfford(modifiedCost)) {
                            const buildSite = findBuildSite(ownedTiles, world, producerInfra);
                            if (buildSite) {
                                buildAction = { infra: producerInfra, tile: buildSite };
                            }
                        }
                    }
                    canBuildUnit = false;
                    break;
                }
            }
            
            if (buildAction) {
                 const { infra, tile } = buildAction;
                 const infraCostMod = getFactionModifier(factionInfo, 'INFRASTRUCTURE_COST_MOD');
                 const modifiedCost = getModifiedCost(infra.cost, infraCostMod);
                 Object.entries(modifiedCost).forEach(([res, amt]) => { faction.resources[res] -= amt; });
                 world[tile.y][tile.x].infrastructureId = infra.id;
                 world[tile.y][tile.x].ownerFactionId = faction.id;
                 soundManager.playSFX('sfx_build_start');
                 return nextUnitId;
            }

            if (canBuildUnit) {
                const techTree = TECH_TREES[factionInfo.techTreeId];
                const unlockingTech = techTree?.find(t => t.effect.includes(unitToTrain.name));
                if (unlockingTech && !faction.unlockedTechs.includes(unlockingTech.id)) {
                    continue; // Let research AI handle it
                }
                
                const unitCostMod = getFactionModifier(factionInfo, 'UNIT_COST_MOD', { unitRole: unitToTrain.role });
                const modifiedUnitCost = getModifiedCost(unitToTrain.cost, unitCostMod);

                if (canAfford(modifiedUnitCost)) {
                    const settlement = ownedTiles.find(t => t.infrastructureId?.startsWith('settlement_'));
                    if (settlement) {
                        Object.entries(modifiedUnitCost).forEach(([resId, amount]) => { faction.resources[resId] -= amount; });
                        world[settlement.y][settlement.x].units.push({
                            id: nextUnitId, unitId: unitToTrain.id, factionId: faction.id, hp: getInitialHp(unitToTrain, factionInfo),
                            x: settlement.x, y: settlement.y, killCount: 0, combatLog: [],
                        });
                        return nextUnitId + 1;
                    }
                }
            }
        }
    }
    
    // Fallback: Upgrade Settlement if possible
    const infraCostMod = getFactionModifier(factionInfo, 'INFRASTRUCTURE_COST_MOD');
    const settlementTiles = ownedTiles.filter(t => t.infrastructureId?.startsWith('settlement_'));
    for (const tile of settlementTiles) {
        const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId!);
        if (infra?.upgradeCost) {
            let targetUpgradeId: string | undefined = infra.upgradesTo;
            if (infra.id.startsWith('settlement_')) {
                if (infra.id === 'settlement_town') targetUpgradeId = factionInfo.id === 'f6' ? 'settlement_city_elf' : `settlement_city_${factionInfo.archetype.toLowerCase()}`;
                else if (infra.id.startsWith('settlement_city_')) targetUpgradeId = factionInfo.id === 'f6' ? 'settlement_metropolis_elf' : `settlement_metropolis_${factionInfo.archetype.toLowerCase()}`;
            }
            if (targetUpgradeId && INFRASTRUCTURE_MAP.has(targetUpgradeId)) {
                const modifiedUpgradeCost = getModifiedCost(infra.upgradeCost, infraCostMod);
                if (canAfford(modifiedUpgradeCost) && faction.population >= (infra.populationCapacity || 0) * 0.8) {
                    Object.entries(modifiedUpgradeCost).forEach(([resId, amount]) => { faction.resources[resId] -= amount; });
                    world[tile.y][tile.x].infrastructureId = targetUpgradeId;
                    soundManager.playSFX('sfx_build_complete');
                    return nextUnitId;
                }
            }
        }
    }

    return nextUnitId;
};


const runLeaderAI = (faction: FactionState, ownedTiles: TileData[], world: TileData[][], tick: number, nextUnitId: number): number => {
    if (tick % 201 !== 0) return nextUnitId; // Run on its own schedule

    if (faction.leaderStatus === 'settled' && Math.random() < 0.1) { // 10% chance to go adventuring
        const settlement = ownedTiles.find(t => t.infrastructureId?.startsWith('settlement_'));
        if (settlement) {
            const factionInfo = FACTIONS_MAP.get(faction.id)!;
            const heroDef = UNITS.find(u => u.factionId === faction.id && u.role === 'Hero');
            const escortDef = UNITS.find(u => u.factionId === faction.id && u.role === 'Infantry' && u.tier === 1);
            if (!heroDef) return nextUnitId;
            
            faction.leaderStatus = 'adventuring';
            const adventureDuration = 500; // Ticks
            
            const leaderUnit: UnitInstance = { id: nextUnitId++, unitId: heroDef.id, factionId: faction.id, hp: getInitialHp(heroDef, factionInfo), x: settlement.x, y: settlement.y, adventureTicks: adventureDuration, killCount: 0, combatLog: [] };
            world[settlement.y][settlement.x].units.push(leaderUnit);

            if (escortDef) {
                 world[settlement.y][settlement.x].units.push({ id: nextUnitId++, unitId: escortDef.id, factionId: faction.id, hp: getInitialHp(escortDef, factionInfo), x: settlement.x, y: settlement.y, adventureTicks: adventureDuration, killCount: 0, combatLog: [] });
            }
        }
    }
    return nextUnitId;
}

const calculateFactionPower = (factionId: string, world: TileData[][], allFactions: Record<string, FactionState>): number => {
    const factionInfo = FACTIONS_MAP.get(factionId);
    const factionState = allFactions[factionId];
    if (!factionInfo || !factionState) return 0;

    // 1. Army Power
    let armyPower = 0;
    const units = world.flat().flatMap(t => t.units).filter(u => u.factionId === factionId);
    units.forEach(unit => {
        const unitDef = UNITS_MAP.get(unit.unitId);
        if (unitDef) {
            armyPower += unitDef.hp + (unitDef.atk * 5); // Value attack more
        }
    });

    // 2. Territory Power
    const territoryPower = getFactionOwnedTiles(world, factionId).length * 10;

    // 3. Tech Power
    const techPower = factionState.unlockedTechs.length * 50;

    return Math.floor(armyPower + territoryPower + techPower);
};

const getArchetypeOpinionModifier = (arch1: FactionArchetype, arch2: FactionArchetype): number => {
    if (arch1 === arch2) return 10;

    const rivalries: Record<string, string[]> = {
        'Holy': ['Undead', 'Shadow'],
        'Nature': ['Industrial'],
        'Industrial': ['Nature'],
        'Undead': ['Holy'],
        'Shadow': ['Holy'],
    };
    
    if (rivalries[arch1]?.includes(arch2)) return -50;

    return 0;
};

const runDiplomacyAI = (newState: GameState, factionId: string): void => {
    const allFactions = newState.factions;
    const faction = allFactions[factionId];
    const factionInfo = FACTIONS_MAP.get(factionId);
    if (!factionInfo || !factionInfo.personality || factionInfo.id === 'neutral_hostile') return;

    // Use a cache to avoid recalculating power for every single faction pair
    const calculateAndCacheFactionPower = (fId: string) => {
        if (FACTION_POWER_CACHE[fId] && FACTION_POWER_CACHE[fId].tick === newState.gameTime.tick) {
            return FACTION_POWER_CACHE[fId].power;
        }
        const power = calculateFactionPower(fId, newState.world, allFactions);
        FACTION_POWER_CACHE[fId] = { power, tick: newState.gameTime.tick };
        return power;
    };
    
    const myPower = calculateAndCacheFactionPower(factionId);

    for (const otherFactionId in faction.diplomacy) {
        if (factionId === otherFactionId) continue;
        
        const otherFaction = allFactions[otherFactionId];
        const otherFactionInfo = FACTIONS_MAP.get(otherFactionId);
        if (!otherFaction || !otherFactionInfo) continue;

        const relation = faction.diplomacy[otherFactionId];
        const theirRelationToUs = otherFaction.diplomacy[factionId];
        if (!relation || !theirRelationToUs) continue;

        const theirPower = calculateAndCacheFactionPower(otherFactionId);
        
        // --- Opinion Modifiers ---
        let opinionChange = -0.01; // Base decay (distrust, border friction)

        if (newState.gameTime.tick % 500 === 1) { // Periodically apply ideological drift
             const archetypeMod = getArchetypeOpinionModifier(factionInfo.archetype, otherFactionInfo.archetype) / 100;
             opinionChange += archetypeMod;
        }
        
        const powerRatio = myPower > 0 ? theirPower / myPower : 999;
        if (powerRatio > 1.8) { // They are much stronger, feel threatened
            opinionChange -= 0.05 * (factionInfo.personality.aggression / 10);
        }
        
        let hasCommonEnemy = false;
        for (const enemyId in faction.diplomacy) {
            if (faction.diplomacy[enemyId].status === 'War' && otherFaction.diplomacy[enemyId]?.status === 'War') {
                hasCommonEnemy = true;
                break;
            }
        }
        if (hasCommonEnemy) {
            opinionChange += 0.1;
        }

        relation.opinion = Math.max(-200, Math.min(200, relation.opinion + opinionChange));
        
        const factionTile = newState.world.flat().find(t => t.ownerFactionId === factionId);
        const location = factionTile ? { x: factionTile.x, y: factionTile.y } : { x: 0, y: 0 };

        // --- Decision Making ---
        const aggressionFactor = factionInfo.personality.aggression / 10.0;
        const diplomacyFactor = factionInfo.personality.diplomacy / 10.0;
        
        if (relation.status === 'Neutral') {
            const powerAdvantage = myPower > theirPower * (1.6 - (aggressionFactor * 0.6));
            const warThreshold = -50 - (aggressionFactor * 50);
            
            if (powerAdvantage && relation.opinion < warThreshold && Math.random() < (aggressionFactor / 150)) {
                relation.status = 'War';
                theirRelationToUs.status = 'War';
                const opinionHit = -100 - (aggressionFactor * 50);
                relation.opinion = opinionHit;
                theirRelationToUs.opinion = opinionHit;
                addGameEvent(newState, `${factionInfo.name} declared war on ${otherFactionInfo.name}!`, location);
            } else {
                const allianceThreshold = 60 + (diplomacyFactor * 40);
                if (relation.opinion > allianceThreshold && theirRelationToUs.opinion > allianceThreshold && Math.random() < (diplomacyFactor / 150)) {
                    relation.status = 'Alliance';
                    theirRelationToUs.status = 'Alliance';
                    relation.opinion = 200;
                    theirRelationToUs.opinion = 200;
                    addGameEvent(newState, `${factionInfo.name} and ${otherFactionInfo.name} have formed an alliance!`, location);
                }
            }
        } else if (relation.status === 'War') {
            relation.opinion += 0.1; // War weariness
            const peaceThreshold = -50;
            const powerDisadvantage = myPower < theirPower * 0.6;
            
            if ((powerDisadvantage || relation.opinion > peaceThreshold) && Math.random() < 0.02) {
                relation.status = 'Neutral';
                theirRelationToUs.status = 'Neutral';
                relation.opinion = -50;
                theirRelationToUs.opinion = -50;
                addGameEvent(newState, `${factionInfo.name} and ${otherFactionInfo.name} have signed a peace treaty.`, location);
            }
        }
    }
};

const processGameTick = (prevState: GameState, soundManager: SoundManager): GameState => {
    const newState: GameState = JSON.parse(JSON.stringify(prevState));
    const worldWidth = newState.world.length;
    const worldHeight = newState.world[0].length;

    // 1. Update Time & Clear Old Animations
    newState.gameTime.tick++;
    if (newState.gameTime.tick % TICK_PER_YEAR === 0) {
        newState.gameTime.year++;
    }
    for (const key in newState.attackFlashes) {
        if (newState.gameTime.tick - newState.attackFlashes[key] > 5) { // Flash lasts for 5 ticks
            delete newState.attackFlashes[key];
        }
    }
    newState.dyingUnits = newState.dyingUnits.filter(
        dyingUnit => newState.gameTime.tick - dyingUnit.deathTick < 25 
    );

    // 2. Population Growth & Research Generation
    if (newState.gameTime.tick % 50 === 0) {
        for (const factionId in newState.factions) {
            const faction = newState.factions[factionId];
            const factionInfo = FACTIONS_MAP.get(factionId)!;
            const ownedTiles = getFactionOwnedTiles(newState.world, factionId);
            const settlementTiles = ownedTiles.filter(t => t.infrastructureId?.startsWith('settlement_'));
            const capacity = settlementTiles.reduce((sum, tile) => sum + (INFRASTRUCTURE_MAP.get(tile.infrastructureId!)?.populationCapacity || 0), 0);
            
            const popGrowthBonus = getFactionModifier(factionInfo, 'POP_GROWTH_MOD');
            const growthRate = 0.01 * (1 + popGrowthBonus);
            
            const newPop = Math.floor(faction.population * (1 + growthRate)) + 1;
            faction.population = Math.min(newPop, capacity);
            
            ownedTiles.forEach(tile => {
                const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId!);
                if (infra?.generatesResearchPoints) {
                    faction.researchPoints += infra.generatesResearchPoints * 50;
                }
            });
        }
    }

    // 3. Resource Generation & Processing
    for (let y = 0; y < worldHeight; y++) {
        for (let x = 0; x < worldWidth; x++) {
            const tile = newState.world[y][x];
            if (tile.ownerFactionId && tile.infrastructureId) {
                const owner = newState.factions[tile.ownerFactionId];
                const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId);
                const ownerInfo = FACTIONS_MAP.get(tile.ownerFactionId);

                if (owner && infra && ownerInfo) {
                    const processResource = (resId: string, amount: number) => {
                        const resDef = RESOURCES_MAP.get(resId);
                        if (!resDef) return;
                        const storageTier = owner.storage[resDef.tier];
                        if (storageTier.current < storageTier.capacity) {
                            const currentAmount = owner.resources[resId] || 0;
                            const amountToAdd = Math.min(amount, storageTier.capacity - storageTier.current);
                            owner.resources[resId] = currentAmount + amountToAdd;
                            storageTier.current += amountToAdd;
                        }
                    };

                    if (infra.consumes && infra.consumes.length > 0 && infra.produces) {
                        const canAffordConsumption = infra.consumes.every(c => (owner.resources[c.resourceId] || 0) >= c.amount);
                        const producedResourceDefinition = RESOURCES_MAP.get(infra.produces.resourceId)!;
                        const storageTier = owner.storage[producedResourceDefinition.tier];
                        const hasStorage = storageTier.current < storageTier.capacity;

                        if (canAffordConsumption && hasStorage) {
                            infra.consumes.forEach(c => {
                                const consumesResDef = RESOURCES_MAP.get(c.resourceId)!;
                                owner.resources[c.resourceId] -= c.amount;
                                owner.storage[consumesResDef.tier].current -= c.amount;
                            });

                            const productionBonus = getFactionModifier(ownerInfo, 'PRODUCTION_MOD', { resourceTier: producedResourceDefinition.tier });
                            const finalAmount = infra.produces.amount * (1 + productionBonus);
                            processResource(infra.produces.resourceId, finalAmount);
                            
                            if (infra.id === 'infra_arcane_enchanter') {
                                newState.totalMintedAthar += infra.produces.amount * 10;
                            }
                        }
                    } else if (infra.produces) {
                        if (!infra.requiresResourceId || infra.requiresResourceId === tile.resourceId) {
                            const resDef = RESOURCES_MAP.get(infra.produces.resourceId)!;
                            const productionBonus = getFactionModifier(ownerInfo, 'PRODUCTION_MOD', { resourceTier: resDef.tier });
                            const finalAmount = infra.produces.amount * (1 + productionBonus);
                            processResource(infra.produces.resourceId, finalAmount);
                        }
                    }
                }
            }
        }
    }
    
    // 4. Faction AI
    for (const factionId in newState.factions) {
        const faction = newState.factions[factionId];
        const ownedTiles = getFactionOwnedTiles(newState.world, factionId);
        if (ownedTiles.length === 0) continue;

        if (newState.gameTime.tick > 0 && newState.gameTime.tick % 251 === 0) {
            recalculateStorage(faction, ownedTiles);
        }
        
        runResearchAI(faction, newState.gameTime.tick);
        newState.nextUnitId = runManagementAI(faction, ownedTiles, newState.world, newState.gameTime.tick, newState.nextUnitId, soundManager);
        newState.nextUnitId = runLeaderAI(faction, ownedTiles, newState.world, newState.gameTime.tick, newState.nextUnitId);

        if (newState.gameTime.tick > 1 && newState.gameTime.tick % 151 === 0) {
            runDiplomacyAI(newState, factionId);
        }
    }

    // 5. Unit AI
    if (newState.gameTime.tick % 50 !== 0) return newState;

    const allUnitsForTick = newState.world.flat().flatMap(tile => tile.units.map(unit => ({ unit, tile })));

    // HP Regen
    for (const { unit } of allUnitsForTick) {
        const unitDef = UNITS_MAP.get(unit.unitId);
        if (!unitDef?.traitIds) continue;
        const traits = unitDef.traitIds.map(id => UNIT_TRAITS_MAP.get(id)).filter(Boolean) as UnitTrait[];
        for (const trait of traits) {
            for (const effect of trait.effects) {
                if (effect.type === 'HP_REGEN') {
                    const factionInfo = FACTIONS_MAP.get(unit.factionId)!;
                    const maxHp = getInitialHp(unitDef, factionInfo);
                    if (unit.hp < maxHp) {
                         unit.hp = Math.min(maxHp, unit.hp + (effect.value || 0));
                    }
                }
            }
        }
    }

    const movedUnitIds = new Set<number>();
    const unitLocations: Record<string, UnitInstance[]> = {};
    Object.keys(newState.factions).forEach(id => unitLocations[id] = []);
    unitLocations['neutral_hostile'] = [];
    allUnitsForTick.forEach(({ unit }) => unitLocations[unit.factionId]?.push(unit));
    
    for (const { unit } of allUnitsForTick) {
        if (movedUnitIds.has(unit.id) || unit.hp <= 0) continue;
        
        if (unit.adventureTicks !== undefined) {
            unit.adventureTicks--;
            if (unit.adventureTicks <= 0) {
                const owner = newState.factions[unit.factionId];
                if (owner && UNITS_MAP.get(unit.unitId)?.role === 'Hero') owner.leaderStatus = 'settled';
                newState.world[unit.y][unit.x].units = newState.world[unit.y][unit.x].units.filter(u => u.id !== unit.id);
                continue;
            }
        }

        let moveX = 0, moveY = 0, targetFound = false;
        const factionInfo = FACTIONS_MAP.get(unit.factionId);
        if (factionInfo && factionInfo.personality.aggression > 6 && unit.adventureTicks === undefined) {
            let nearestEnemy: UnitInstance | null = null;
            let minDistance = 15;
            Object.keys(newState.factions).forEach(otherFactionId => {
                const relation = newState.factions[unit.factionId]?.diplomacy[otherFactionId];
                if (relation?.status === 'War') {
                    (unitLocations[otherFactionId] || []).forEach(enemy => {
                        const distance = Math.hypot(unit.x - enemy.x, unit.y - enemy.y);
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestEnemy = enemy;
                        }
                    });
                }
            });
            (unitLocations['neutral_hostile'] || []).forEach(enemy => {
                const distance = Math.hypot(unit.x - enemy.x, unit.y - enemy.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestEnemy = enemy;
                }
            });
            
            if (nearestEnemy) {
                moveX = Math.sign(nearestEnemy.x - unit.x);
                moveY = Math.sign(nearestEnemy.y - unit.y);
                targetFound = true;
            }
        }

        if (!targetFound) {
            moveX = Math.floor(Math.random() * 3) - 1;
            moveY = Math.floor(Math.random() * 3) - 1;
        }

        if (moveX === 0 && moveY === 0) continue;
        const newX = unit.x + moveX;
        const newY = unit.y + moveY;

        if (newX >= 0 && newX < worldWidth && newY >= 0 && newY < worldHeight) {
            const targetTile = newState.world[newY][newX];
            
            if (targetTile.units.length > 0 && targetTile.units[0].factionId !== unit.factionId) {
                 const enemyUnit = targetTile.units[0];
                 const relationStatus = newState.factions[unit.factionId]?.diplomacy[enemyUnit.factionId]?.status;
                 if (relationStatus === 'War' || enemyUnit.factionId === 'neutral_hostile' || unit.factionId === 'neutral_hostile') {
                    newState.attackFlashes[unit.id] = newState.gameTime.tick;
                    soundManager.playSFX('sfx_attack_sword');
                    
                    const unitDef = UNITS_MAP.get(unit.unitId)!;
                    const enemyUnitDef = UNITS_MAP.get(enemyUnit.unitId)!;
                    const attackerTraits = unitDef.traitIds?.map(id => UNIT_TRAITS_MAP.get(id)!).filter(Boolean) || [];
                    const defenderTraits = enemyUnitDef.traitIds?.map(id => UNIT_TRAITS_MAP.get(id)!).filter(Boolean) || [];
                    const attackerFactionInfo = FACTIONS_MAP.get(unit.factionId)!;
                    const defenderFactionInfo = FACTIONS_MAP.get(enemyUnit.factionId)!;
                    const attackerTerrain = calculateTerrainBonus(unit, BIOMES_MAP.get(newState.world[unit.y][unit.x].biomeId)!);
                    const defenderTerrain = calculateTerrainBonus(enemyUnit, BIOMES_MAP.get(targetTile.biomeId)!);

                    let damageToDefender = unitDef.atk * (1 + getFactionModifier(attackerFactionInfo, 'UNIT_STAT_MOD', { stat: 'atk' }) + getFactionModifier(attackerFactionInfo, 'UNIT_STAT_MOD', { unitRole: unitDef.role, stat: 'atk' }) + attackerTerrain.atkBonus);
                    attackerTraits.forEach(t => t.effects.forEach(e => {
                        if (e.type === 'BONUS_ATTACK_VS_TRAIT' && enemyUnitDef.traitIds?.includes(e.traitId!)) damageToDefender *= 1 + (e.value || 0);
                        if (e.type === 'CRITICAL_CHANCE' && Math.random() < (e.chance || 0)) damageToDefender *= (e.multiplier || 1);
                    }));
                    defenderTraits.forEach(t => t.effects.forEach(e => {
                        if (e.type === 'DAMAGE_REDUCTION_PERCENT') damageToDefender *= 1 - (e.value || 0);
                    }));
                    damageToDefender *= (1 - defenderTerrain.defBonus);
                    
                    let damageToAttacker = enemyUnitDef.atk * (1 + getFactionModifier(defenderFactionInfo, 'UNIT_STAT_MOD', { stat: 'atk' }) + getFactionModifier(defenderFactionInfo, 'UNIT_STAT_MOD', { unitRole: enemyUnitDef.role, stat: 'atk' }) + defenderTerrain.atkBonus);
                    attackerTraits.forEach(t => t.effects.forEach(e => {
                        if (e.type === 'DAMAGE_REDUCTION_PERCENT') damageToAttacker *= 1 - (e.value || 0);
                    }));
                    damageToAttacker *= (1 - attackerTerrain.defBonus);
                    
                    if (attackerTraits.some(t => t.effects.some(e => e.type === 'FIRST_STRIKE' && Math.random() < (e.chance || 0)))) {
                        enemyUnit.hp -= Math.max(1, damageToDefender);
                        if (enemyUnit.hp > 0) unit.hp -= Math.max(1, damageToAttacker);
                    } else {
                        enemyUnit.hp -= Math.max(1, damageToDefender);
                        unit.hp -= Math.max(1, damageToAttacker);
                    }
                    
                    if (enemyUnit.hp <= 0) {
                        soundManager.playSFX('sfx_unit_die');
                        newState.dyingUnits.push({ ...targetTile.units.shift()!, deathTick: newState.gameTime.tick });
                        newState.world[unit.y][unit.x].units.find(u => u.id === unit.id)!.killCount++;
                    }
                    if (unit.hp <= 0) {
                        soundManager.playSFX('sfx_unit_die');
                        const deadUnit = newState.world[unit.y][unit.x].units.find(u => u.id === unit.id)!;
                        newState.dyingUnits.push({ ...deadUnit, deathTick: newState.gameTime.tick });
                        newState.world[unit.y][unit.x].units = newState.world[unit.y][unit.x].units.filter(u => u.id !== unit.id);
                    }
                 }
            } else if (targetTile.units.length === 0) {
                 if (Math.random() <= 1 / BIOMES_MAP.get(targetTile.biomeId)!.moveCost) {
                    const currentTile = newState.world[unit.y][unit.x];
                    const unitIndex = currentTile.units.findIndex(u => u.id === unit.id);
                    if(unitIndex !== -1) {
                        unit.x = newX; unit.y = newY;
                        targetTile.units.push(unit);
                        currentTile.units.splice(unitIndex, 1);
                    }
                 }
            }
            movedUnitIds.add(unit.id);
        }
    }
    
    // 6. World Event & Hostile NPC Spawning
    if (newState.gameTime.tick > 1) {
        if (newState.gameTime.tick % (TICK_PER_YEAR * 2) === 0 && Math.random() < 0.25) {
            const event = WORLD_EVENTS[Math.floor(Math.random() * WORLD_EVENTS.length)];
            let placed = false, attempts = 0;
            while(!placed && attempts < 100) {
                const x = Math.floor(Math.random() * worldWidth), y = Math.floor(Math.random() * worldHeight);
                if(!newState.world[y][x].ownerFactionId && !newState.world[y][x].resourceId && !newState.world[y][x].worldEventId) {
                    newState.world[y][x].worldEventId = event.id; placed = true;
                } attempts++;
            }
        }
        if (newState.gameTime.tick % 200 === 0 && Math.random() < 0.5) {
            const hostileUnitDefs = UNITS.filter(u => u.factionId === 'neutral_hostile');
            if(hostileUnitDefs.length > 0) {
                const unitDef = hostileUnitDefs[Math.floor(Math.random() * hostileUnitDefs.length)];
                let placed = false, attempts = 0;
                while(!placed && attempts < 100) {
                    const x = Math.floor(Math.random() * worldWidth), y = Math.floor(Math.random() * worldHeight);
                    const tile = newState.world[y][x];
                    if(!tile.ownerFactionId && tile.units.length === 0) {
                        tile.units.push({id: newState.nextUnitId++, unitId: unitDef.id, factionId: 'neutral_hostile', hp: getInitialHp(unitDef, FACTIONS_MAP.get('neutral_hostile')!), x, y, killCount: 0, combatLog: []});
                        placed = true;
                    } attempts++;
                }
            }
        }
    }

    return newState;
};

export const useGameLoop = (
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
  gameSpeed: number,
  soundManager: SoundManager | null,
) => {
  const loopRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    clearInterval(loopRef.current);

    if (gameSpeed > 0 && soundManager) {
      const interval = 200 / gameSpeed;
      loopRef.current = window.setInterval(() => {
        setGameState((prevState) => {
            if (!prevState) return null;
            return processGameTick(prevState, soundManager)
        });
      }, interval);
    }

    return () => clearInterval(loopRef.current);
  }, [gameSpeed, setGameState, soundManager]);
};
