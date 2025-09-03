
import { useEffect, useRef } from 'react';
import { GameState, TileData, Infrastructure as InfraType, FactionState, UnitInstance, UnitTrait, GameEvent, CombatLogEntry, Faction, FactionEffectType, UnitDefinition, SoundManager, Biome, ResourceTier, FactionArchetype } from '../types';
import { TICK_PER_YEAR, INFRASTRUCTURE_MAP, UNITS_MAP, INFRASTRUCTURE, ATHAR_CAP, WORLD_EVENTS, FACTIONS_MAP, UNITS, BIOMES_MAP, UNIT_TRAITS_MAP, RESOURCES_MAP } from '../constants';

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

const runManagementAI = (faction: FactionState, ownedTiles: TileData[], world: TileData[][], tick: number, nextUnitId: number, soundManager: SoundManager): number => {
    if (tick % 101 !== 0) return nextUnitId;

    const factionInfo = FACTIONS_MAP.get(faction.id)!;
    const infraCostMod = getFactionModifier(factionInfo, 'INFRASTRUCTURE_COST_MOD');

    // 1. Settlement Upgrade Logic
    const settlementTiles = ownedTiles.filter(t => t.infrastructureId?.startsWith('settlement_'));
    for (const tile of settlementTiles) {
        const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId!);
        if (infra?.upgradeCost) {
            let targetUpgradeId: string | undefined = infra.upgradesTo;

            // Dynamic upgrade logic for multi-tiered, archetype-specific settlements
            if (infra.id.startsWith('settlement_')) {
                if (infra.id === 'settlement_town') {
                    // Special case for Sylvan Elves who share the Nature archetype but have unique assets
                    if (factionInfo.id === 'f6') {
                        targetUpgradeId = 'settlement_city_elf';
                    } else {
                        targetUpgradeId = `settlement_city_${factionInfo.archetype.toLowerCase()}`;
                    }
                } else if (infra.id.startsWith('settlement_city_')) {
                    if (factionInfo.id === 'f6') {
                        targetUpgradeId = 'settlement_metropolis_elf';
                    } else {
                        targetUpgradeId = `settlement_metropolis_${factionInfo.archetype.toLowerCase()}`;
                    }
                }
            }
            
            if (targetUpgradeId && INFRASTRUCTURE_MAP.has(targetUpgradeId)) {
                const modifiedUpgradeCost = getModifiedCost(infra.upgradeCost, infraCostMod);
                const canAfford = Object.entries(modifiedUpgradeCost).every(([resId, amount]) => (faction.resources[resId] || 0) >= amount);
                const meetsPopulation = faction.population >= (infra.populationCapacity || 0) * 0.8;

                if (canAfford && meetsPopulation) {
                    Object.entries(modifiedUpgradeCost).forEach(([resId, amount]) => { faction.resources[resId] -= amount; });
                    world[tile.y][tile.x].infrastructureId = targetUpgradeId;
                    soundManager.playSFX('sfx_build_complete');
                    break; // Only one upgrade per tick
                }
            }
        }
    }


    // 2. Unit Training Logic
    const totalPopulationCapacity = settlementTiles.reduce((sum, tile) => sum + (INFRASTRUCTURE_MAP.get(tile.infrastructureId!)?.populationCapacity || 0), 0);
    const totalUnits = world.flat().reduce((sum, tile) => sum + tile.units.filter(u => u.factionId === faction.id).length, 0);

    if (faction.population > totalUnits && faction.population < totalPopulationCapacity) {
        const settlement = settlementTiles[0];
        if (settlement) {
            const settlementInfra = INFRASTRUCTURE_MAP.get(settlement.infrastructureId!);
            const trainableUnits = UNITS.filter(u => u.factionId === faction.id && u.role !== 'Hero' && u.tier > 0 && u.tier <= (settlementInfra?.tier || 0));
            
            if (trainableUnits.length > 0) {
                const unitToTrain = trainableUnits[Math.floor(Math.random() * trainableUnits.length)];
                
                const unitCostMod = getFactionModifier(factionInfo, 'UNIT_COST_MOD', { unitRole: unitToTrain.role });
                const totalUnitCostMod = getFactionModifier(factionInfo, 'UNIT_COST_MOD');
                const modifiedUnitCost = getModifiedCost(unitToTrain.cost, unitCostMod + totalUnitCostMod);

                const canAfford = Object.entries(modifiedUnitCost).every(([resId, amount]) => (faction.resources[resId] || 0) >= amount);
                
                if (canAfford) {
                    Object.entries(modifiedUnitCost).forEach(([resId, amount]) => { faction.resources[resId] -= amount; });
                    world[settlement.y][settlement.x].units.push({
                        id: nextUnitId,
                        unitId: unitToTrain.id,
                        factionId: faction.id,
                        hp: getInitialHp(unitToTrain, factionInfo),
                        x: settlement.x,
                        y: settlement.y,
                        killCount: 0,
                        combatLog: [],
                    });
                    return nextUnitId + 1;
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
    // Remove units whose death animation has finished (e.g., after 25 ticks, which is >1s even at max speed)
    newState.dyingUnits = newState.dyingUnits.filter(
        dyingUnit => newState.gameTime.tick - dyingUnit.deathTick < 25 
    );


    // 2. Population Growth & Athar/Research Generation
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
            
            // Research Points
            ownedTiles.forEach(tile => {
                const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId!);
                if (infra?.generatesResearchPoints) {
                    faction.researchPoints += infra.generatesResearchPoints * 50; // *50 because this block runs every 50 ticks
                }
            });
        }
    }
    for (const factionId in newState.factions) {
        const faction = newState.factions[factionId];
        const atharPerPop = 0.001;
        faction.athar = Math.min(faction.athar + (faction.population * atharPerPop), ATHAR_CAP);
    }

    // 3. Resource Generation from Infrastructure
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

                    if (infra.id === 'infra_arcane_enchanter' && infra.consumes && infra.produces) {
                        const consumesResDef = RESOURCES_MAP.get(infra.consumes.resourceId)!;
                         if ((owner.resources[infra.consumes.resourceId] || 0) >= infra.consumes.amount) {
                            owner.resources[infra.consumes.resourceId] -= infra.consumes.amount;
                            owner.storage[consumesResDef.tier].current -= infra.consumes.amount;
                            
                            const prodResDef = RESOURCES_MAP.get(infra.produces.resourceId)!;
                            processResource(infra.produces.resourceId, infra.produces.amount);

                            // Mint $ATHAR for the world
                            newState.totalMintedAthar += infra.produces.amount * 10;
                         }
                    } else if (infra.consumes && infra.produces) { // Processing
                        const consumesResDef = RESOURCES_MAP.get(infra.consumes.resourceId)!;
                        if ((owner.resources[infra.consumes.resourceId] || 0) >= infra.consumes.amount) {
                            owner.resources[infra.consumes.resourceId] -= infra.consumes.amount;
                            owner.storage[consumesResDef.tier].current -= infra.consumes.amount;
                            
                            const prodResDef = RESOURCES_MAP.get(infra.produces.resourceId)!;
                            const productionBonus = getFactionModifier(ownerInfo, 'PRODUCTION_MOD', { resourceTier: prodResDef.tier });
                            const finalAmount = infra.produces.amount * (1 + productionBonus);
                            processResource(infra.produces.resourceId, finalAmount);
                        }
                    } else if (infra.produces) { // Generating
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

        // Recalculate capacity periodically
        if (newState.gameTime.tick > 0 && newState.gameTime.tick % 251 === 0) {
            recalculateStorage(faction, ownedTiles);
        }

        // Management (Upgrade, Train)
        newState.nextUnitId = runManagementAI(faction, ownedTiles, newState.world, newState.gameTime.tick, newState.nextUnitId, soundManager);

        // Leader Adventures
        newState.nextUnitId = runLeaderAI(faction, ownedTiles, newState.world, newState.gameTime.tick, newState.nextUnitId);

        // Diplomacy (War, Alliances)
        if (newState.gameTime.tick > 1 && newState.gameTime.tick % 151 === 0) {
            runDiplomacyAI(newState, factionId);
        }

        // Expansion (Build new infra)
        if (newState.gameTime.tick > 1 && newState.gameTime.tick % 50 === 0) {
            const factionInfo = FACTIONS_MAP.get(factionId);
            if (!factionInfo) continue;
            
            const expansionChance = (factionInfo.personality.expansion || 5) / 15.0;

            if (Math.random() < expansionChance) {
                 const buildSites = ownedTiles.map(t => { // Find adjacent empty tiles
                    const neighbors: TileData[] = [];
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nx = t.x + dx;
                            const ny = t.y + dy;
                            if (nx >= 0 && nx < worldWidth && ny >= 0 && ny < worldHeight) {
                                neighbors.push(newState.world[ny][nx]);
                            }
                        }
                    }
                    return neighbors;
                }).flat().filter(t => !t.ownerFactionId && !t.infrastructureId && !t.partOfInfrastructure);

                if (buildSites.length > 0) {
                    let buildChoice: { tile: TileData, infra: InfraType } | null = null;
                    const infraCostMod = getFactionModifier(factionInfo, 'INFRASTRUCTURE_COST_MOD');

                    // Priority 1: Build resource extractors
                    const extractorCandidates = buildSites
                        .map(site => {
                            if (site.resourceId) {
                                const requiredInfra = INFRASTRUCTURE.find(i => i.requiresResourceId === site.resourceId);
                                if (requiredInfra) return { tile: site, infra: requiredInfra };
                            }
                            return null;
                        })
                        .filter((c): c is { tile: TileData; infra: InfraType } => c !== null);

                    for (const candidate of extractorCandidates) {
                        const { infra } = candidate;
                        const modifiedCost = getModifiedCost(infra.cost, infraCostMod);
                        const canAfford = Object.entries(modifiedCost).every(([res, amt]) => (faction.resources[res] || 0) >= amt);
                        
                        let hasStorage = true;
                        if (infra.produces) {
                            const resDef = RESOURCES_MAP.get(infra.produces.resourceId)!;
                            const storageTier = faction.storage[resDef.tier];
                            if (storageTier.current >= storageTier.capacity) {
                                hasStorage = false;
                            }
                        }

                        if (canAfford && hasStorage) {
                            buildChoice = candidate;
                            break;
                        }
                    }

                    // Priority 2: Build a forge
                    if (!buildChoice && (faction.resources['iron_ore'] || 0) > 50) {
                        const forgeDef = INFRASTRUCTURE_MAP.get('infra_forge');
                        if (forgeDef) {
                            const modifiedCost = getModifiedCost(forgeDef.cost, infraCostMod);
                            const canAfford = Object.entries(modifiedCost).every(([res, amt]) => (faction.resources[res] || 0) >= amt);
                            
                            const producedResDef = RESOURCES_MAP.get(forgeDef.produces!.resourceId)!;
                            const storageTier = faction.storage[producedResDef.tier];
                            const hasStorage = storageTier.current < storageTier.capacity;

                            if (canAfford && hasStorage) {
                                const forgeSite = buildSites.find(s => !s.resourceId && !s.worldEventId);
                                if (forgeSite) buildChoice = { tile: forgeSite, infra: forgeDef };
                            }
                        }
                    }
                    
                    if (buildChoice) {
                        const { tile, infra } = buildChoice;
                        const modifiedCost = getModifiedCost(infra.cost, infraCostMod);
                        if (Object.entries(modifiedCost).every(([res,amt]) => (faction.resources[res]||0) >= amt)) {
                            Object.entries(modifiedCost).forEach(([res,amt]) => { faction.resources[res] -= amt; });
                            newState.world[tile.y][tile.x].infrastructureId = infra.id;
                            newState.world[tile.y][tile.x].ownerFactionId = faction.id;
                            soundManager.playSFX('sfx_build_start');
                        }
                    }
                }
            }
        }
    }


    // 5. Unit AI (run every 50 ticks for slower movement)
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

    // Pre-calculate all unit locations for faster lookups in aggressive AI
    const unitLocations: Record<string, UnitInstance[]> = {};
    for (const factionId in newState.factions) {
        unitLocations[factionId] = [];
    }
    unitLocations['neutral_hostile'] = [];
    allUnitsForTick.forEach(({ unit }) => {
        if (unitLocations[unit.factionId]) {
            unitLocations[unit.factionId].push(unit);
        }
    });
    
    for (const { unit } of allUnitsForTick) {
        if (movedUnitIds.has(unit.id) || unit.hp <= 0) continue;
        
        // Adventure logic
        if (unit.adventureTicks !== undefined) {
            unit.adventureTicks--;
            if (unit.adventureTicks <= 0) {
                const owner = newState.factions[unit.factionId];
                if (owner && UNITS_MAP.get(unit.unitId)?.role === 'Hero') {
                    owner.leaderStatus = 'settled';
                }
                const currentTile = newState.world[unit.y][unit.x];
                currentTile.units = currentTile.units.filter(u => u.id !== unit.id);
                continue;
            }
        }

        let moveX = 0;
        let moveY = 0;
        
        const factionInfo = FACTIONS_MAP.get(unit.factionId);
        const isAggressive = factionInfo && factionInfo.personality.aggression > 6 && unit.adventureTicks === undefined;

        let targetFound = false;
        if (isAggressive) {
            let nearestEnemy: UnitInstance | null = null;
            let minDistance = 15; // Search radius

            for (const otherFactionId in newState.factions) {
                if (unit.factionId === otherFactionId) continue;
                const relation = newState.factions[unit.factionId]?.diplomacy[otherFactionId];
                if (relation?.status === 'War') {
                    const enemyUnits = unitLocations[otherFactionId] || [];
                    for (const enemy of enemyUnits) {
                        const distance = Math.hypot(unit.x - enemy.x, unit.y - enemy.y);
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestEnemy = enemy;
                        }
                    }
                }
            }
             // Also check for neutral hostiles
            const hostileUnits = unitLocations['neutral_hostile'] || [];
            for (const enemy of hostileUnits) {
                const distance = Math.hypot(unit.x - enemy.x, unit.y - enemy.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestEnemy = enemy;
                }
            }
            
            if (nearestEnemy) {
                moveX = Math.sign(nearestEnemy.x - unit.x);
                moveY = Math.sign(nearestEnemy.y - unit.y);
                targetFound = true;
            }
        }

        if (!targetFound) {
            // Default random movement
            moveX = Math.floor(Math.random() * 3) - 1;
            moveY = Math.floor(Math.random() * 3) - 1;
        }

        if (moveX === 0 && moveY === 0) continue;

        const newX = unit.x + moveX;
        const newY = unit.y + moveY;

        if (newX >= 0 && newX < worldWidth && newY >= 0 && newY < worldHeight) {
            const targetTile = newState.world[newY][newX];
            
            // Combat
            if (targetTile.units.length > 0 && targetTile.units[0].factionId !== unit.factionId) {
                 const enemyUnit = targetTile.units[0];
                 const relationStatus = newState.factions[unit.factionId]?.diplomacy[enemyUnit.factionId]?.status;
                 const isAtWar = relationStatus === 'War' || enemyUnit.factionId === 'neutral_hostile' || unit.factionId === 'neutral_hostile';

                 if (isAtWar) {
                    newState.attackFlashes[unit.id] = newState.gameTime.tick;
                    soundManager.playSFX('sfx_attack_sword');
                    const unitDef = UNITS_MAP.get(unit.unitId)!;
                    const enemyUnitDef = UNITS_MAP.get(enemyUnit.unitId)!;
                    
                    if (newState.gameTime.tick % 50 === 0) { // Don't spam events
                        addGameEvent(newState, `A battle rages between ${FACTIONS_MAP.get(unit.factionId)?.name} and ${FACTIONS_MAP.get(enemyUnit.factionId)?.name}!`, {x: targetTile.x, y: targetTile.y});
                    }

                    const attackerTraits = unitDef.traitIds?.map(id => UNIT_TRAITS_MAP.get(id)!).filter(Boolean) || [];
                    const defenderTraits = enemyUnitDef.traitIds?.map(id => UNIT_TRAITS_MAP.get(id)!).filter(Boolean) || [];
                    
                    const attackerFactionInfo = FACTIONS_MAP.get(unit.factionId)!;

                    const attackerBiome = BIOMES_MAP.get(newState.world[unit.y][unit.x].biomeId)!;
                    const defenderBiome = BIOMES_MAP.get(targetTile.biomeId)!;
                    
                    const attackerTerrain = calculateTerrainBonus(unit, attackerBiome);
                    const defenderTerrain = calculateTerrainBonus(enemyUnit, defenderBiome);

                    // --- Calculate Damage to Defender ---
                    let damageToDefender = unitDef.atk;
                    // Faction ATK bonus
                    const atkMod = getFactionModifier(attackerFactionInfo, 'UNIT_STAT_MOD', { unitRole: unitDef.role, stat: 'atk' });
                    const totalAtkMod = getFactionModifier(attackerFactionInfo, 'UNIT_STAT_MOD', { stat: 'atk' });
                    damageToDefender *= (1 + atkMod + totalAtkMod + attackerTerrain.atkBonus);

                    // Attacker offensive traits
                    attackerTraits.forEach(trait => {
                        trait.effects.forEach(effect => {
                            if (effect.type === 'BONUS_ATTACK_VS_TRAIT' && enemyUnitDef.traitIds?.includes(effect.traitId!)) {
                                damageToDefender *= 1 + (effect.value || 0);
                            }
                            if (effect.type === 'CRITICAL_CHANCE' && Math.random() < (effect.chance || 0)) {
                                damageToDefender *= (effect.multiplier || 1);
                            }
                        });
                    });
                     // Defender defensive traits
                    defenderTraits.forEach(trait => {
                        trait.effects.forEach(effect => {
                            if (effect.type === 'DAMAGE_REDUCTION_PERCENT') {
                                damageToDefender *= 1 - (effect.value || 0);
                            }
                        });
                    });
                    // Defender terrain bonus
                    damageToDefender *= (1 - defenderTerrain.defBonus);

                    // --- Calculate Damage to Attacker (Retaliation) ---
                    const defenderFactionInfo = FACTIONS_MAP.get(enemyUnit.factionId)!;
                    let damageToAttacker = enemyUnitDef.atk;
                    // Faction ATK bonus for defender
                    const enemyAtkMod = getFactionModifier(defenderFactionInfo, 'UNIT_STAT_MOD', { unitRole: enemyUnitDef.role, stat: 'atk' });
                    const enemyTotalAtkMod = getFactionModifier(defenderFactionInfo, 'UNIT_STAT_MOD', { stat: 'atk' });
                    damageToAttacker *= (1 + enemyAtkMod + enemyTotalAtkMod + defenderTerrain.atkBonus);

                    // Attacker defensive traits
                     attackerTraits.forEach(trait => {
                        trait.effects.forEach(effect => {
                            if (effect.type === 'DAMAGE_REDUCTION_PERCENT') {
                                damageToAttacker *= 1 - (effect.value || 0);
                            }
                        });
                    });
                    // Attacker terrain bonus
                    damageToAttacker *= (1 - attackerTerrain.defBonus);

                    // --- Apply Damage ---
                    const attackerStrikesFirst = attackerTraits.some(t => t.effects.some(e => e.type === 'FIRST_STRIKE' && Math.random() < (e.chance || 0)));

                    if (attackerStrikesFirst) {
                        enemyUnit.hp -= Math.max(1, damageToDefender);
                        if (enemyUnit.hp > 0) {
                            unit.hp -= Math.max(1, damageToAttacker);
                        }
                    } else {
                        enemyUnit.hp -= Math.max(1, damageToDefender);
                        unit.hp -= Math.max(1, damageToAttacker);
                    }

                     // --- Create and Add Combat Logs ---
                    const isFatalToOpponent = enemyUnit.hp <= 0;
                    const isFatalToSelf = unit.hp <= 0;

                    const attackerLogEntry: CombatLogEntry = {
                        tick: newState.gameTime.tick,
                        opponentUnitId: enemyUnit.unitId,
                        opponentFactionId: enemyUnit.factionId,
                        damageDealt: Math.max(1, Math.round(damageToDefender)),
                        damageTaken: Math.max(1, Math.round(damageToAttacker)),
                        isFatalToOpponent,
                        isFatalToSelf,
                    };
                    const defenderLogEntry: CombatLogEntry = {
                        tick: newState.gameTime.tick,
                        opponentUnitId: unit.unitId,
                        opponentFactionId: unit.factionId,
                        damageDealt: Math.max(1, Math.round(damageToAttacker)),
                        damageTaken: Math.max(1, Math.round(damageToDefender)),
                        isFatalToOpponent: isFatalToSelf,
                        isFatalToSelf: isFatalToOpponent,
                    };
                    
                    unit.combatLog.unshift(attackerLogEntry);
    								if (unit.combatLog.length > 10) unit.combatLog.pop();
    
    								enemyUnit.combatLog.unshift(defenderLogEntry);
    								if (enemyUnit.combatLog.length > 10) enemyUnit.combatLog.pop();


                    if (enemyUnit.hp <= 0) {
                        soundManager.playSFX('sfx_unit_die');
                        const deadUnit = targetTile.units.shift()!;
                        newState.dyingUnits.push({ ...deadUnit, deathTick: newState.gameTime.tick });
                        // Find the attacker in the new state to update kill count
                        const currentAttackerTile = newState.world[unit.y][unit.x];
                        const attackerUnit = currentAttackerTile.units.find(u => u.id === unit.id);
                        if (attackerUnit) {
                            attackerUnit.killCount++;
                        }
                    }
                    
                    const currentTile = newState.world[unit.y][unit.x];
                    const unitIndex = currentTile.units.findIndex(u => u.id === unit.id);
                    if (unit.hp <= 0 && unitIndex !== -1) {
                        soundManager.playSFX('sfx_unit_die');
                        const deadUnit = currentTile.units.splice(unitIndex, 1)[0];
                        newState.dyingUnits.push({ ...deadUnit, deathTick: newState.gameTime.tick });
                    }
                 }
            // Movement to empty tile
            } else if (targetTile.units.length === 0) {
                 const targetBiome = BIOMES_MAP.get(targetTile.biomeId)!;
                 const moveChance = 1 / targetBiome.moveCost;

                 if (Math.random() <= moveChance) {
                    const currentTile = newState.world[unit.y][unit.x];
                    const unitIndex = currentTile.units.findIndex(u => u.id === unit.id);
                    if(unitIndex !== -1) {
                        unit.x = newX;
                        unit.y = newY;
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
        // New event every 2 years
        if (newState.gameTime.tick % (TICK_PER_YEAR * 2) === 0 && Math.random() < 0.25) {
            const event = WORLD_EVENTS[Math.floor(Math.random() * WORLD_EVENTS.length)];
            let placed = false, attempts = 0;
            while(!placed && attempts < 100) {
                const x = Math.floor(Math.random() * worldWidth);
                const y = Math.floor(Math.random() * worldHeight);
                if(!newState.world[y][x].ownerFactionId && !newState.world[y][x].resourceId && !newState.world[y][x].worldEventId) {
                    newState.world[y][x].worldEventId = event.id;
                    placed = true;
                }
                attempts++;
            }
        }
        // New hostile spawn every 200 ticks
        if (newState.gameTime.tick % 200 === 0 && Math.random() < 0.5) {
            const hostileUnitDefs = UNITS.filter(u => u.factionId === 'neutral_hostile');
            if(hostileUnitDefs.length > 0) {
                const unitDef = hostileUnitDefs[Math.floor(Math.random() * hostileUnitDefs.length)];
                 let placed = false, attempts = 0;
                while(!placed && attempts < 100) {
                    const x = Math.floor(Math.random() * worldWidth);
                    const y = Math.floor(Math.random() * worldHeight);
                    const tile = newState.world[y][x];
                    if(!tile.ownerFactionId && tile.units.length === 0) {
                        const factionInfo = FACTIONS_MAP.get('neutral_hostile')!;
                        tile.units.push({id: newState.nextUnitId++, unitId: unitDef.id, factionId: 'neutral_hostile', hp: getInitialHp(unitDef, factionInfo), x, y, killCount: 0, combatLog: []});
                        placed = true;
                    }
                    attempts++;
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
