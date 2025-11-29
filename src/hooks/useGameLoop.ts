
import { useEffect, useRef } from 'react';
// FIX: Added GameEventType to imports and corrected type usage.
import { GameState, TileData, Infrastructure as InfraType, FactionState, UnitInstance, GameEvent, Faction, FactionEffectType, UnitDefinition, SoundManager, Biome, ResourceTier, GameEventType, ItemDefinition, Rarity } from '../types';
// FIX: Added missing constants for new game mechanics.
import { TICK_PER_YEAR, INFRASTRUCTURE_MAP, UNITS_MAP, INFRASTRUCTURE, ATHAR_CAP, FACTIONS_MAP, UNITS, BIOMES_MAP, UNIT_TRAITS_MAP, RESOURCES_MAP, RESOURCES, XP_PER_LEVEL, STAT_INCREASE_PER_LEVEL, INFRA_HP_COST_MULTIPLIER, INFRA_RESOURCE_DROP_PERCENT, LEVEL_MILESTONES, RESOURCE_SPAWN_CHANCES } from '../constants';
import { ITEMS, ITEMS_MAP } from '../services/dataLoader';
import { getUnitStats } from '../utils/unit';

const getFactionOwnedTiles = (world: TileData[][], factionId: string) => world.flat().filter(t => t.ownerFactionId === factionId);

// FIX: Added 'type' parameter to align with new GameEvent structure.
const addGameEvent = (newState: GameState, type: GameEventType, message: string, location: { x: number, y: number }) => {
    const newEvent: GameEvent = {
        id: newState.nextEventId,
        tick: newState.gameTime.tick,
        type,
        message,
        location,
    };
    newState.nextEventId++;
    newState.eventLog.unshift(newEvent); // Add to the beginning
    if (newState.eventLog.length > 50) { // Keep log size manageable
        newState.eventLog.pop();
    }
};

const getFactionModifier = (factionInfo: Faction, effectType: FactionEffectType, filter?: any): number => {
    let modifier = 0;
    if (!factionInfo.traits) return 0;
    for (const trait of factionInfo.traits) {
        for (const effect of trait.effects) {
            if (effect.type === effectType) {
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
    return getUnitStats({
        id: -1, unitId: unitDef.id, factionId: factionInfo.id, hp: 0, x: 0, y: 0,
        level: 1, xp: 0, killCount: 0, combatLog: [], inventory: [], 
        equipment: { Weapon: null, Armor: null, Accessory: null }, 
        currentActivity: ''
    }).maxHp;
};

const handleLevelUp = (unit: UnitInstance, newState: GameState) => {
    let leveledUp = false;
    let newLevel = unit.level;
    while(unit.xp >= XP_PER_LEVEL) {
        newLevel++;
        unit.xp -= XP_PER_LEVEL;
        leveledUp = true;
    }
    if(leveledUp) {
        if (LEVEL_MILESTONES.includes(newLevel)) {
            const unitDef = UNITS_MAP.get(unit.unitId)!;
            addGameEvent(newState, GameEventType.LEVEL_MILESTONE, `${unitDef.name} has reached level ${newLevel}!`, {x: unit.x, y: unit.y});
        }
        unit.level = newLevel;
        const { maxHp } = getUnitStats(unit);
        unit.hp = maxHp; // Heal to full on level up
    }
};

const RARITY_ORDER: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

const autoEquip = (unit: UnitInstance) => {
    const getRarityScore = (item: ItemDefinition | null) => item ? RARITY_ORDER.indexOf(item.rarity) : -1;

    for (const slot of ['Weapon', 'Armor', 'Accessory'] as const) {
        const currentItem = unit.equipment[slot];
        const currentScore = getRarityScore(currentItem);

        let bestInventoryItem: ItemDefinition | null = null;
        let bestInventoryItemIndex = -1;
        let bestInventoryItemScore = -1;

        for (let i = 0; i < unit.inventory.length; i++) {
            const item = unit.inventory[i];
            if (item.slot === slot) {
                const itemScore = getRarityScore(item);
                if (itemScore > bestInventoryItemScore) {
                    bestInventoryItem = item;
                    bestInventoryItemScore = itemScore;
                    bestInventoryItemIndex = i;
                }
            }
        }

        if (bestInventoryItem && bestInventoryItemScore > currentScore) {
            // Unequip current item and add to inventory
            if (currentItem) {
                unit.inventory.push(currentItem);
            }
            // Equip new best item from inventory
            unit.equipment[slot] = bestInventoryItem;
            // Remove it from inventory
            unit.inventory.splice(bestInventoryItemIndex, 1);
        }
    }
}


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
                if (eff.stat === 'atk') atkBonus += eff.modifier;
                else if (eff.stat === 'def') defBonus += eff.modifier;
            }
        }
    }
    return { atkBonus, defBonus };
};


const recalculateStorage = (factionState: FactionState, ownedTiles: TileData[]) => {
    for (const tier in factionState.storage) {
        factionState.storage[tier as ResourceTier].capacity = 0;
    }

    const infraTiles = ownedTiles.filter(t => t.infrastructureId);
    for (const tile of infraTiles) {
        const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId!);
        if (infra?.addsStorage) {
            for (const [tier, amount] of Object.entries(infra.addsStorage)) {
                factionState.storage[tier as ResourceTier].capacity += amount;
            }
        }
    }

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

const runManagementAI = (faction: FactionState, ownedTiles: TileData[], world: TileData[][], tick: number, nextUnitId: number, soundManager: SoundManager, newState: GameState): number => {
    if (tick % 101 !== 0) return nextUnitId;

    const factionInfo = FACTIONS_MAP.get(faction.id)!;
    const infraCostMod = getFactionModifier(factionInfo, 'INFRASTRUCTURE_COST_MOD');

    const settlementTiles = ownedTiles.filter(t => t.infrastructureId?.startsWith('settlement_'));
    for (const tile of settlementTiles) {
        const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId!);
        if (infra?.upgradesTo && infra.upgradeCost) {
            const modifiedUpgradeCost = getModifiedCost(infra.upgradeCost, infraCostMod);
            const canAfford = Object.entries(modifiedUpgradeCost).every(([resId, amount]) => (faction.resources[resId] || 0) >= amount);
            const meetsPopulation = faction.population >= (infra.populationCapacity || 0) * 0.8;

            if (canAfford && meetsPopulation) {
                Object.entries(modifiedUpgradeCost).forEach(([resId, amount]) => { faction.resources[resId] -= amount; });
                const newInfraId = infra.upgradesTo;
                world[tile.y][tile.x].infrastructureId = newInfraId;
                const newInfraDef = INFRASTRUCTURE_MAP.get(newInfraId)!;
                const newMaxHp = (Object.values(newInfraDef.upgradeCost || newInfraDef.cost).reduce((s, a) => s + a, 0)) * INFRA_HP_COST_MULTIPLIER;
                world[tile.y][tile.x].maxHp = newMaxHp;
                world[tile.y][tile.x].hp = newMaxHp;
                soundManager.playSFX('sfx_build_complete');
                addGameEvent(newState, GameEventType.UPGRADE, `${faction.leader.name} has upgraded their settlement to a ${newInfraDef.name}!`, {x: tile.x, y: tile.y});
                break;
            }
        }
    }

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
                        id: nextUnitId, unitId: unitToTrain.id, factionId: faction.id, hp: getInitialHp(unitToTrain, factionInfo),
                        x: settlement.x, y: settlement.y, level: 1, xp: 0, killCount: 0, combatLog: [], inventory: [], equipment: { Weapon: null, Armor: null, Accessory: null }, currentActivity: 'Guarding',
                    });
                    return nextUnitId + 1;
                }
            }
        }
    }
    return nextUnitId;
};

const runLeaderAI = (faction: FactionState, ownedTiles: TileData[], world: TileData[][], tick: number, nextUnitId: number, newState: GameState): number => {
    if (tick % 201 !== 0) return nextUnitId;

    if (faction.leaderStatus === 'settled' && Math.random() < 0.1) {
        const settlement = ownedTiles.find(t => t.infrastructureId?.startsWith('settlement_'));
        if (settlement) {
            const factionInfo = FACTIONS_MAP.get(faction.id)!;
            const heroDef = UNITS.find(u => u.factionId === faction.id && u.role === 'Hero');
            if (!heroDef) return nextUnitId;
            
            faction.leaderStatus = 'adventuring';
            const adventureDuration = 500;
            
            const leaderUnit: UnitInstance = { id: nextUnitId++, unitId: heroDef.id, factionId: faction.id, hp: getInitialHp(heroDef, factionInfo), x: settlement.x, y: settlement.y, adventureTicks: adventureDuration, level: 1, xp: 0, killCount: 0, combatLog: [], inventory: [], equipment: { Weapon: null, Armor: null, Accessory: null }, currentActivity: 'Adventuring' };
            world[settlement.y][settlement.x].units.push(leaderUnit);
        }
    }
    return nextUnitId;
}

const runDiplomacyAI = (newState: GameState, faction: FactionState, factionId: string, allFactions: Record<string, FactionState>): void => {
    const factionInfo = FACTIONS_MAP.get(factionId);
    if (!factionInfo) return;

    for (const otherFactionId in faction.diplomacy) {
        if (factionId === otherFactionId) continue;
        const relation = faction.diplomacy[otherFactionId];
        const otherFactionInfo = FACTIONS_MAP.get(otherFactionId);
        if (!otherFactionInfo) return;
        
        relation.opinion -= 0.01;
        const warThreshold = -100 + factionInfo.personality.aggression * 6;
        const warChance = factionInfo.personality.aggression / 500;
        if (relation.status === 'Neutral' && relation.opinion < warThreshold && Math.random() < warChance) {
           relation.status = 'War';
           allFactions[otherFactionId].diplomacy[factionId].status = 'War';
           relation.opinion = -100;
           allFactions[otherFactionId].diplomacy[factionId].opinion = -100;
           const factionTile = newState.world.flat().find(t => t.ownerFactionId === factionId);
           if (factionTile) addGameEvent(newState, GameEventType.WAR_DECLARED, `${factionInfo.name} declared war on ${otherFactionInfo.name}!`, {x: factionTile.x, y: factionTile.y});
        }
    }
};


const processGameTick = (prevState: GameState, soundManager: SoundManager): GameState => {
    const newState: GameState = JSON.parse(JSON.stringify(prevState));
    const worldWidth = newState.world.length;
    const worldHeight = newState.world[0].length;

    newState.gameTime.tick++;
    if (newState.gameTime.tick % TICK_PER_YEAR === 0) newState.gameTime.year++;
    for (const key in newState.attackFlashes) {
        if (newState.gameTime.tick - newState.attackFlashes[key] > 5) delete newState.attackFlashes[key];
    }
    newState.dyingUnits = newState.dyingUnits.filter(u => newState.gameTime.tick - u.deathTick < 25);

    if (newState.gameTime.tick % 50 === 0) {
        for (const factionId in newState.factions) {
            const faction = newState.factions[factionId];
            if (faction.isEliminated) continue;
            const factionInfo = FACTIONS_MAP.get(factionId)!;
            const ownedTiles = getFactionOwnedTiles(newState.world, factionId);
            if (ownedTiles.length === 0) {
                faction.isEliminated = true;
                addGameEvent(newState, GameEventType.FACTION_ELIMINATED, `${factionInfo.name} has been eliminated!`, {x: -1, y: -1});
                continue;
            }
            const settlementTiles = ownedTiles.filter(t => t.infrastructureId?.startsWith('settlement_'));
            const capacity = settlementTiles.reduce((sum, tile) => sum + (INFRASTRUCTURE_MAP.get(tile.infrastructureId!)?.populationCapacity || 0), 0);
            const popGrowthBonus = getFactionModifier(factionInfo, 'POP_GROWTH_MOD');
            const growthRate = 0.01 * (1 + popGrowthBonus);
            faction.population = Math.min(Math.floor(faction.population * (1 + growthRate)) + 1, capacity);
            ownedTiles.forEach(tile => {
                const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId!);
                if (infra?.generatesResearchPoints) faction.researchPoints += infra.generatesResearchPoints * 50;
            });
        }
    }
    for (const factionId in newState.factions) {
        const faction = newState.factions[factionId];
        faction.athar = Math.min(faction.athar + (faction.population * 0.001), ATHAR_CAP);
    }

    const DEPLETION_CHANCE = 0.05;
    for (let y = 0; y < worldHeight; y++) {
        for (let x = 0; x < worldWidth; x++) {
            const tile = newState.world[y][x];
            if (tile.ownerFactionId && tile.infrastructureId) {
                const owner = newState.factions[tile.ownerFactionId];
                const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId);
                const ownerInfo = FACTIONS_MAP.get(tile.ownerFactionId);
                if (owner && infra && ownerInfo) {
                    const processResource = (resId: string, amount: number) => {
                        const resDef = RESOURCES_MAP.get(resId)!;
                        const storage = owner.storage[resDef.tier];
                        if (storage.current < storage.capacity) {
                            const amountToAdd = Math.min(amount, storage.capacity - storage.current);
                            owner.resources[resId] = (owner.resources[resId] || 0) + amountToAdd;
                            storage.current += amountToAdd;
                        }
                    };
                    if (infra.consumes && infra.produces) {
                        // FIX: Updated logic to handle array of consumables
                        if (infra.consumes.every(c => (owner.resources[c.resourceId] || 0) >= c.amount)) {
                             infra.consumes.forEach(c => {
                                 const resDef = RESOURCES_MAP.get(c.resourceId)!;
                                 owner.resources[c.resourceId] -= c.amount;
                                 owner.storage[resDef.tier].current -= c.amount;
                             });
                            const prodDef = RESOURCES_MAP.get(infra.produces.resourceId)!;
                            const bonus = getFactionModifier(ownerInfo, 'PRODUCTION_MOD', { resourceTier: prodDef.tier });
                            processResource(infra.produces.resourceId, infra.produces.amount * (1 + bonus));
                            // FIX: Added logic to track total minted Athar
                            if (infra.id === 'infra_arcane_enchanter') newState.totalMintedAthar += infra.produces.amount * (1 + bonus);
                        }
                    } else if (infra.produces && infra.requiresResourceId === tile.resourceId) {
                        const resDef = RESOURCES_MAP.get(infra.produces.resourceId)!;
                        const bonus = getFactionModifier(ownerInfo, 'PRODUCTION_MOD', { resourceTier: resDef.tier });
                        processResource(infra.produces.resourceId, infra.produces.amount * (1 + bonus));
                        if (Math.random() < DEPLETION_CHANCE) {
                            const resourceDef = RESOURCES_MAP.get(tile.resourceId!);
                            // FIX: Added resource depletion and respawn logic
                            if (resourceDef?.respawnTime) tile.resourceCooldown = newState.gameTime.tick + resourceDef.respawnTime;
                            tile.resourceId = undefined;
                        }
                    }
                }
            }
        }
    }
    
    for (const factionId in newState.factions) {
        const faction = newState.factions[factionId];
        if (faction.isEliminated) continue;
        const ownedTiles = getFactionOwnedTiles(newState.world, factionId);
        if (ownedTiles.length === 0 && factionId !== 'neutral_hostile') {
            if (!faction.isEliminated) {
                faction.isEliminated = true;
                addGameEvent(newState, GameEventType.FACTION_ELIMINATED, `${FACTIONS_MAP.get(factionId)!.name} has been eliminated!`, {x: -1, y: -1});
            }
            continue;
        }

        if (newState.gameTime.tick % 251 === 0) recalculateStorage(faction, ownedTiles);
        newState.nextUnitId = runManagementAI(faction, ownedTiles, newState.world, newState.gameTime.tick, newState.nextUnitId, soundManager, newState);
        newState.nextUnitId = runLeaderAI(faction, ownedTiles, newState.world, newState.gameTime.tick, newState.nextUnitId, newState);
        if (newState.gameTime.tick % 151 === 0) runDiplomacyAI(newState, faction, factionId, newState.factions);

        if (newState.gameTime.tick > 1 && newState.gameTime.tick % 50 === 0) {
            const factionInfo = FACTIONS_MAP.get(factionId);
            if (!factionInfo || Math.random() >= (factionInfo.personality.expansion || 5) / 15.0) continue;

            const buildSites = ownedTiles.flatMap(t => [-1, 0, 1].flatMap(dy => [-1, 0, 1].map(dx => ({ dx, dy, t })))
                .filter(({ dx, dy }) => !(dx === 0 && dy === 0))
                .map(({ dx, dy, t }) => newState.world[t.y + dy]?.[t.x + dx])
                .filter(Boolean)
            ).filter(t => !t.ownerFactionId && !t.infrastructureId && !t.partOfInfrastructure);
            if (buildSites.length === 0) continue;

            let buildChoice: { tile: TileData, infra: InfraType } | null = null;
            const infraCostMod = getFactionModifier(factionInfo, 'INFRASTRUCTURE_COST_MOD');
            
            const neededProcessingInfra = INFRASTRUCTURE.find(i => {
                if (!i.consumes || i.consumes.length === 0) return false;
                const inputRes = i.consumes[0].resourceId;
                const outputRes = i.produces!.resourceId;
                return (faction.resources[inputRes] || 0) > 100 && (faction.resources[outputRes] || 0) < 20;
            });
            if (neededProcessingInfra) {
                const site = buildSites.find(s => !s.resourceId && !s.worldEventId);
                if (site) buildChoice = { tile: site, infra: neededProcessingInfra };
            }

            if (!buildChoice) {
                const extractorCandidates = buildSites.map(s => s.resourceId ? { tile: s, infra: INFRASTRUCTURE.find(i => i.requiresResourceId === s.resourceId) } : null)
                    .filter((c): c is { tile: TileData; infra: InfraType } => c !== null && c.infra !== undefined);
                for (const candidate of extractorCandidates) {
                    if (candidate.infra.produces) {
                        const resDef = RESOURCES_MAP.get(candidate.infra.produces.resourceId)!;
                        if (faction.storage[resDef.tier].current < faction.storage[resDef.tier].capacity) {
                            buildChoice = candidate;
                            break;
                        }
                    }
                }
            }
            
            if (buildChoice) {
                const { tile, infra } = buildChoice;
                const modifiedCost = getModifiedCost(infra.cost, infraCostMod);
                if (Object.entries(modifiedCost).every(([res,amt]) => (faction.resources[res]||0) >= amt)) {
                    Object.entries(modifiedCost).forEach(([res,amt]) => { faction.resources[res] -= amt; });
                    const newTile = newState.world[tile.y][tile.x];
                    newTile.infrastructureId = infra.id;
                    newTile.ownerFactionId = faction.id;
                    const maxHp = (Object.values(infra.cost).reduce((s, a) => s + a, 0)) * INFRA_HP_COST_MULTIPLIER;
                    newTile.maxHp = maxHp;
                    newTile.hp = maxHp;
                    soundManager.playSFX('sfx_build_start');

                    const worker = newState.world.flat().flatMap(t => t.units).find(u => u.factionId === faction.id && UNITS_MAP.get(u.unitId)?.role === 'Worker' && u.currentActivity !== 'Constructing');
                    if(worker && infra.xpGain) {
                        worker.xp += infra.xpGain;
                        worker.buildTicks = 100;
                        handleLevelUp(worker, newState);
                    }
                }
            }
        }
    }

    if (newState.gameTime.tick % 50 !== 0) return newState;
    const allUnitsForTick = newState.world.flat().flatMap(tile => tile.units);

    for (const unit of allUnitsForTick) {
        if (unit.buildTicks && unit.buildTicks > 0) unit.buildTicks -= 50;
        const unitDef = UNITS_MAP.get(unit.unitId)!;
        if (unitDef.traitIds?.some(id => UNIT_TRAITS_MAP.get(id)?.effects.some(e => e.type === 'HP_REGEN'))) {
            const { maxHp } = getUnitStats(unit);
            if (unit.hp < maxHp) unit.hp = Math.min(maxHp, unit.hp + 0.1);
        }
    }

    const movedUnitIds = new Set<number>();
    const unitLocations: Record<string, UnitInstance[]> = {};
    for (const factionId in newState.factions) unitLocations[factionId] = [];
    unitLocations['neutral_hostile'] = [];
    allUnitsForTick.forEach(u => unitLocations[u.factionId]?.push(u));
    
    for (const unit of allUnitsForTick) {
        if (movedUnitIds.has(unit.id) || unit.hp <= 0) continue;
        
        unit.currentActivity = (unit.buildTicks && unit.buildTicks > 0) ? 'Constructing' : 'Guarding';

        if (unit.adventureTicks !== undefined) {
            unit.currentActivity = 'Adventuring';
            unit.adventureTicks--;
            if (unit.adventureTicks <= 0) {
                const owner = newState.factions[unit.factionId];
                if (owner && UNITS_MAP.get(unit.unitId)?.role === 'Hero') {
                    owner.leaderStatus = 'settled';
                    if (Math.random() < 0.33) {
                        // FIX: Logic was comparing EquipmentSlot to 'None'.
                        const loreItems = ITEMS.filter(item => item.slot === 'None');
                        if (loreItems.length > 0) {
                            const foundItem = loreItems[Math.floor(Math.random() * loreItems.length)];
                            unit.inventory.push(foundItem);
                            addGameEvent(newState, GameEventType.LOOT, `${owner.leader.name} found a ${foundItem.name}!`, { x: unit.x, y: unit.y });
                        }
                    }
                }
                newState.world[unit.y][unit.x].units = newState.world[unit.y][unit.x].units.filter(u => u.id !== unit.id);
                movedUnitIds.add(unit.id);
                continue;
            }
        }

        let moveX = 0, moveY = 0, targetFound = false;
        const factionInfo = FACTIONS_MAP.get(unit.factionId)!;
        const unitDef = UNITS_MAP.get(unit.unitId)!;

        if (unitDef.role === 'Worker' && unit.currentActivity === 'Guarding') {
            let nearestExtractor: {x:number, y:number} | null = null;
            let minDistance = 4; // search radius
            for (let dy = -minDistance; dy <= minDistance; dy++) {
                for (let dx = -minDistance; dx <= minDistance; dx++) {
                    const nx = unit.x + dx;
                    const ny = unit.y + dy;
                    if (nx >= 0 && nx < worldWidth && ny >= 0 && ny < worldHeight) {
                        const tile = newState.world[ny][nx];
                        if (tile.ownerFactionId === unit.factionId && tile.infrastructureId) {
                            const infra = INFRASTRUCTURE_MAP.get(tile.infrastructureId);
                            if (infra?.produces && RESOURCES_MAP.get(infra.produces.resourceId)?.tier === 'Raw') {
                                const dist = Math.hypot(dx, dy);
                                if (dist < minDistance) {
                                    minDistance = dist;
                                    nearestExtractor = {x: nx, y: ny};
                                }
                            }
                        }
                    }
                }
            }
            if (nearestExtractor) {
                targetFound = true;
                if (minDistance <= 1.5) { // Is adjacent
                    unit.currentActivity = 'Harvesting';
                } else {
                    unit.currentActivity = 'Harvesting'; // Simplified for now
                    moveX = Math.sign(nearestExtractor.x - unit.x);
                    moveY = Math.sign(nearestExtractor.y - unit.y);
                }
            }
        }

        const isAggressive = factionInfo.personality.aggression > 6 && !unit.adventureTicks;
        if (!targetFound && isAggressive) {
            let nearestEnemy: (UnitInstance | TileData) | null = null, minDistance = 15;
            const enemyFactions = [...Object.keys(newState.factions), 'neutral_hostile'].filter(id => {
                if (id === unit.factionId) return false;
                const relation = newState.factions[unit.factionId]?.diplomacy[id];
                return id === 'neutral_hostile' || relation?.status === 'War';
            });
            for(const enemyFactionId of enemyFactions) {
                for (const enemy of unitLocations[enemyFactionId] || []) {
                    const d = Math.hypot(unit.x - enemy.x, unit.y - enemy.y);
                    if (d < minDistance) { minDistance = d; nearestEnemy = enemy; }
                }
                 const enemyTiles = newState.world.flat().filter(t => t.ownerFactionId === enemyFactionId && t.infrastructureId);
                 for (const tile of enemyTiles) {
                    const d = Math.hypot(unit.x - tile.x, unit.y - tile.y);
                     if (d < minDistance) { minDistance = d; nearestEnemy = tile; }
                 }
            }
            if (nearestEnemy) {
                unit.currentActivity = 'Advancing';
                moveX = Math.sign(nearestEnemy.x - unit.x);
                moveY = Math.sign(nearestEnemy.y - unit.y);
                targetFound = true;
            }
        }

        if (!targetFound && !unit.adventureTicks && (!unit.buildTicks || unit.buildTicks <= 0)) {
            unit.currentActivity = 'Patrolling';
            moveX = Math.floor(Math.random() * 3) - 1;
            moveY = Math.floor(Math.random() * 3) - 1;
        }

        if (moveX === 0 && moveY === 0) continue;
        const newX = unit.x + moveX, newY = unit.y + moveY;

        if (newX >= 0 && newX < worldWidth && newY >= 0 && newY < worldHeight) {
            const targetTile = newState.world[newY][newX];
            
            if (targetTile.units.length > 0 && targetTile.units[0].factionId !== unit.factionId) {
                 const enemyUnit = targetTile.units[0];
                 const isAtWar = FACTIONS_MAP.get(enemyUnit.factionId) && (newState.factions[unit.factionId]?.diplomacy[enemyUnit.factionId]?.status === 'War' || enemyUnit.factionId === 'neutral_hostile');
                 if (isAtWar) {
                    newState.attackFlashes[unit.id] = newState.gameTime.tick;
                    soundManager.playSFX('sfx_attack_sword');
                    
                    const enemyUnitDef = UNITS_MAP.get(enemyUnit.unitId)!;
                    const attackerStats = getUnitStats(unit);
                    const defenderStats = getUnitStats(enemyUnit);

                    const attackerTraits = unitDef.traitIds?.map(id => UNIT_TRAITS_MAP.get(id)!).filter(Boolean) || [];
                    const defenderTraits = enemyUnitDef.traitIds?.map(id => UNIT_TRAITS_MAP.get(id)!).filter(Boolean) || [];
                    const attackerTerrain = calculateTerrainBonus(unit, BIOMES_MAP.get(newState.world[unit.y][unit.x].biomeId)!);
                    const defenderTerrain = calculateTerrainBonus(enemyUnit, BIOMES_MAP.get(targetTile.biomeId)!);

                    let damageToDefender = attackerStats.attack * (1 + attackerTerrain.atkBonus);
                    attackerTraits.forEach(t => t.effects.forEach(e => {
                        if (e.type === 'BONUS_ATTACK_VS_TRAIT' && enemyUnitDef.traitIds?.includes(e.traitId!)) damageToDefender *= 1 + (e.value || 0);
                        if (e.type === 'CRITICAL_CHANCE' && Math.random() < (e.chance || 0)) damageToDefender *= (e.multiplier || 1);
                    }));
                    damageToDefender = Math.max(1, damageToDefender - defenderStats.defense);

                    let damageToAttacker = defenderStats.attack * (1 + defenderTerrain.atkBonus);
                    damageToAttacker = Math.max(1, damageToAttacker - attackerStats.defense);

                    const attackerStrikesFirst = attackerTraits.some(t => t.effects.some(e => e.type === 'FIRST_STRIKE' && Math.random() < (e.chance || 0)));
                    if (attackerStrikesFirst) {
                        enemyUnit.hp -= Math.max(1, damageToDefender);
                        if (enemyUnit.hp > 0) unit.hp -= Math.max(1, damageToAttacker);
                    } else {
                        enemyUnit.hp -= Math.max(1, damageToDefender);
                        unit.hp -= Math.max(1, damageToAttacker);
                    }

                    if (enemyUnit.hp <= 0) {
                        soundManager.playSFX('sfx_unit_die');
                        const deadUnit = targetTile.units.shift()!;
                        newState.dyingUnits.push({ ...deadUnit, deathTick: newState.gameTime.tick });

                        const lootToDrop = [...deadUnit.inventory, ...Object.values(deadUnit.equipment).filter(Boolean) as ItemDefinition[]];
                        if(lootToDrop.length > 0) {
                            targetTile.loot = [...(targetTile.loot || []), ...lootToDrop];
                        }

                        unit.killCount++;
                        unit.xp += 10 + (enemyUnitDef.tier * 5);
                        if(UNITS_MAP.get(unit.unitId)?.role === 'Hero') unit.xp += 10;
                        handleLevelUp(unit, newState);
                    }
                    if (unit.hp <= 0) {
                        soundManager.playSFX('sfx_unit_die');
                        const deadUnit = newState.world[unit.y][unit.x].units.find(u => u.id === unit.id)!;
                        newState.world[unit.y][unit.x].units = newState.world[unit.y][unit.x].units.filter(u => u.id !== unit.id);
                        newState.dyingUnits.push({ ...deadUnit, deathTick: newState.gameTime.tick });
                        
                        const lootToDrop = [...deadUnit.inventory, ...Object.values(deadUnit.equipment).filter(Boolean) as ItemDefinition[]];
                        if(lootToDrop.length > 0) {
                            const tileForLoot = newState.world[unit.y][unit.x];
                            tileForLoot.loot = [...(tileForLoot.loot || []), ...lootToDrop];
                        }

                        enemyUnit.killCount++;
                        enemyUnit.xp += 10 + (unitDef.tier * 5);
                        handleLevelUp(enemyUnit, newState);
                    }
                 }
            } else if (targetTile.ownerFactionId && targetTile.ownerFactionId !== unit.factionId) { // Attack infrastructure
                const relation = newState.factions[unit.factionId]?.diplomacy[targetTile.ownerFactionId];
                if (relation?.status === 'War') {
                    newState.attackFlashes[unit.id] = newState.gameTime.tick;
                    if (targetTile.hp && targetTile.hp > 0) {
                        const attackerStats = getUnitStats(unit);
                        targetTile.hp -= Math.max(1, attackerStats.attack);
                        
                        if (targetTile.hp <= 0) {
                            const destroyedInfra = INFRASTRUCTURE_MAP.get(targetTile.infrastructureId!)!;
                            addGameEvent(newState, GameEventType.BATTLE, `${unitDef.name} destroyed a ${destroyedInfra.name}!`, {x: newX, y: newY});
                            
                            const resourceCache: Record<string, number> = {};
                            const costs = destroyedInfra.upgradeCost || destroyedInfra.cost;
                            for(const [resId, amount] of Object.entries(costs)) {
                                resourceCache[resId] = Math.floor(amount * INFRA_RESOURCE_DROP_PERCENT);
                            }
                            targetTile.resourceCache = resourceCache;

                            targetTile.infrastructureId = undefined;
                            targetTile.ownerFactionId = undefined;
                            targetTile.hp = undefined;
                            targetTile.maxHp = undefined;

                            if (destroyedInfra.multiTile) {
                                for(let dy=0; dy < destroyedInfra.multiTile.height; dy++) {
                                    for(let dx=0; dx < destroyedInfra.multiTile.width; dx++) {
                                        if (dx === 0 && dy === 0) continue;
                                        newState.world[newY+dy][newX+dx].partOfInfrastructure = undefined;
                                    }
                                }
                            }

                            unit.xp += destroyedInfra.xpGain || 10;
                            handleLevelUp(unit, newState);
                        }
                    }
                }
            } else if (targetTile.units.length === 0) {
                 if (Math.random() <= 1 / BIOMES_MAP.get(targetTile.biomeId)!.moveCost) {
                    const currentTile = newState.world[unit.y][unit.x];
                    const unitIndex = currentTile.units.findIndex(u => u.id === unit.id);
                    if(unitIndex !== -1) {
                        const [movedUnit] = currentTile.units.splice(unitIndex, 1);
                        movedUnit.x = newX; movedUnit.y = newY;
                        targetTile.units.push(movedUnit);

                        if(targetTile.loot && targetTile.loot.length > 0) {
                            movedUnit.inventory.push(...targetTile.loot);
                            targetTile.loot = [];
                            autoEquip(movedUnit);
                            addGameEvent(newState, GameEventType.LOOT, `${unitDef.name} collected loot!`, {x: newX, y: newY});
                        }
                        if(targetTile.resourceCache && unitDef.role === 'Worker') {
                            const owner = newState.factions[movedUnit.factionId];
                            for(const [resId, amount] of Object.entries(targetTile.resourceCache)) {
                                // FIX: Ensured safe addition to resources.
                                owner.resources[resId] = (owner.resources[resId] || 0) + Number(amount);
                            }
                            recalculateStorage(owner, getFactionOwnedTiles(newState.world, owner.id));
                            targetTile.resourceCache = undefined;
                        }
                    }
                 }
            }
            movedUnitIds.add(unit.id);
        }
    }
    
    if (newState.gameTime.tick % 101 === 0) {
      // FIX: Corrected logic for resource respawning
      const rawRes = RESOURCES.filter(r => r.tier === 'Raw' && r.respawnTime);
      for (let y = 0; y < worldHeight; y++) {
        for (let x = 0; x < worldWidth; x++) {
          const tile = newState.world[y][x];
          if (!tile.resourceId && tile.resourceCooldown && newState.gameTime.tick >= tile.resourceCooldown) {
            const pRes = rawRes.filter(r => r.biomes?.includes(tile.biomeId));
            if (pRes.length > 0) {
              const res = pRes[Math.floor(Math.random() * pRes.length)];
              if (Math.random() < RESOURCE_SPAWN_CHANCES[res.rarity]) {
                  tile.resourceId = res.id;
                  tile.resourceCooldown = undefined;
              }
            }
          }
        }
      }
    }

    if (newState.gameTime.tick > 1 && newState.gameTime.tick % 400 === 0) {
        const hostileDefs = UNITS.filter(u => u.factionId === 'neutral_hostile');
        if(hostileDefs.length > 0) {
            let placed = false, attempts = 0;
            while(!placed && attempts < 100) {
                const x = Math.floor(Math.random() * worldWidth);
                const y = Math.floor(Math.random() * worldHeight);
                const tile = newState.world[y][x];
                if(!tile.ownerFactionId && tile.units.length === 0) {
                    const unitDef = hostileDefs[Math.floor(Math.random() * hostileDefs.length)];
                    const factionInfo = FACTIONS_MAP.get('neutral_hostile')!;
                    tile.units.push({id: newState.nextUnitId++, unitId: unitDef.id, factionId: 'neutral_hostile', hp: getInitialHp(unitDef, factionInfo), x, y, level: 1, xp: 0, killCount: 0, combatLog: [], inventory: [], equipment: { Weapon: null, Armor: null, Accessory: null }, currentActivity: 'Guarding'});
                    placed = true;
                }
                attempts++;
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

    if (gameSpeed > 0 && soundManager?.isAudioInitialized) {
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
