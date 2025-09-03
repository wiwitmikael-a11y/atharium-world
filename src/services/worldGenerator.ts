

import { WORLD_SIZE, BIOMES, RESOURCES, FACTIONS, CHARACTERS, WORLD_EVENTS, UNITS, FACTIONS_MAP, INFRASTRUCTURE_MAP, RESOURCES_MAP, STARTING_YEAR } from '../constants';
import type { TileData, GameState, FactionState, Faction, FactionEffectType, UnitDefinition, ResourceTier, Infrastructure } from '../types';

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to calculate faction modifiers, duplicated from game loop for use in generation
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

const getInitialHp = (unitDef: UnitDefinition, factionInfo: Faction): number => {
    const hpMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { unitRole: unitDef.role, stat: 'hp' });
    return Math.floor(unitDef.hp * (1 + hpMod));
};

function createEmptyWorld(): TileData[][] {
  return Array.from({ length: WORLD_SIZE }, (_, y) =>
    Array.from({ length: WORLD_SIZE }, (_, x) => ({
      x,
      y,
      biomeId: BIOMES[0].id,
      units: [],
    }))
  );
}

function smoothBiomes(world: TileData[][]): TileData[][] {
    const newWorld = JSON.parse(JSON.stringify(world));
    for (let y = 0; y < WORLD_SIZE; y++) {
        for (let x = 0; x < WORLD_SIZE; x++) {
            const neighborCounts: Record<string, number> = {};
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < WORLD_SIZE && ny >= 0 && ny < WORLD_SIZE) {
                        const neighborBiome = world[ny][nx].biomeId;
                        neighborCounts[neighborBiome] = (neighborCounts[neighborBiome] || 0) + 1;
                    }
                }
            }

            let dominantBiome = world[y][x].biomeId;
            let maxCount = 0;
            for (const biomeId in neighborCounts) {
                if (neighborCounts[biomeId] > maxCount) {
                    maxCount = neighborCounts[biomeId];
                    dominantBiome = biomeId;
                }
            }
            newWorld[y][x].biomeId = dominantBiome;
        }
    }
    return newWorld;
}


function placeBiomes(world: TileData[][]): void {
  // 1. Seed the world with random biomes
  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      world[y][x].biomeId = BIOMES[getRandomInt(0, BIOMES.length - 1)].id;
    }
  }

  // 2. Smooth the biomes multiple times to create clusters
  let smoothedWorld = world;
  for (let i = 0; i < 4; i++) { // 4 passes for good clustering
    smoothedWorld = smoothBiomes(smoothedWorld);
  }
  
  // Apply the final smoothed world back
  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      world[y][x].biomeId = smoothedWorld[y][x].biomeId;
    }
  }
}

function placeResources(world: TileData[][]): void {
  const resourceSpawnChances = {
    Common: 0.1,
    Uncommon: 0.05,
    Rare: 0.02,
    Exotic: 0.005
  };
  
  const rawResources = RESOURCES.filter(r => r.tier === 'Raw');

  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
        const tile = world[y][x];
        if (tile.resourceId) continue;
        
        for (const resource of rawResources) {
            if (resource.biomes?.includes(tile.biomeId)) {
                if (Math.random() < resourceSpawnChances[resource.rarity]) {
                    tile.resourceId = resource.id;
                    break; // Only one resource per tile
                }
            }
        }
    }
  }
}

function placeWorldEvents(world: TileData[][]): void {
    const discoveries = WORLD_EVENTS.filter(e => e.type === 'Discovery');
    let placedCount = 0;
    const maxEvents = 2; // Place up to 2 random discovery events at start

    while (placedCount < maxEvents && discoveries.length > 0) {
        const eventIndex = getRandomInt(0, discoveries.length - 1);
        const eventToPlace = discoveries.splice(eventIndex, 1)[0];

        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) { // Try 100 times to find a spot
            const x = getRandomInt(0, WORLD_SIZE - 1);
            const y = getRandomInt(0, WORLD_SIZE - 1);
            const tile = world[y][x];

            if (!tile.worldEventId && !tile.infrastructureId && !tile.resourceId) { // Place on empty tiles
                tile.worldEventId = eventToPlace.id;
                placed = true;
            }
            attempts++;
        }
        if (placed) {
          placedCount++;
        }
    }
}

function placeFactions(world: TileData[][], factions: Record<string, FactionState>): number {
    const factionIds = Object.keys(factions);
    let unitIdCounter = 0;
    const MIN_FACTION_DISTANCE = 20; // Increased distance for larger settlements
    const placedFactionCoords: {x: number, y: number}[] = [];
    const settlementDef = INFRASTRUCTURE_MAP.get('settlement_hamlet') as Infrastructure;
    const settlementSize = settlementDef.multiTile || { width: 1, height: 1 };

    for(const factionId of factionIds) {
        const factionInfo = FACTIONS_MAP.get(factionId);
        if (!factionInfo) continue;

        let placed = false;
        let attempts = 0;
        while(!placed && attempts < 2000) {
            const x = getRandomInt(0, WORLD_SIZE - settlementSize.width);
            const y = getRandomInt(0, WORLD_SIZE - settlementSize.height);
            
            // Check 1: Valid Biome and if the entire 2x2 area is empty
            const rootTileBiome = world[y][x].biomeId;
            const isPreferredBiome = factionInfo.preferredBiomes.length === 0 || factionInfo.preferredBiomes.includes(rootTileBiome);
            
            let areaIsClear = true;
            for (let dy = 0; dy < settlementSize.height; dy++) {
                for (let dx = 0; dx < settlementSize.width; dx++) {
                    const tile = world[y + dy][x + dx];
                    if (tile.ownerFactionId || tile.infrastructureId || tile.worldEventId || tile.resourceId) {
                        areaIsClear = false;
                        break;
                    }
                }
                if (!areaIsClear) break;
            }

            if (isPreferredBiome && areaIsClear) {
                // Check 2: Distance from other factions
                let isFarEnough = true;
                for (const coord of placedFactionCoords) {
                    // Check distance from all 4 corners of the new settlement to be safe
                    const distance = Math.hypot(x - coord.x, y - coord.y);
                    if (distance < MIN_FACTION_DISTANCE) {
                        isFarEnough = false;
                        break;
                    }
                }

                if (isFarEnough) {
                    // Place multi-tile settlement
                    const rootX = x;
                    const rootY = y;
                    
                    for (let dy = 0; dy < settlementSize.height; dy++) {
                        for (let dx = 0; dx < settlementSize.width; dx++) {
                            const currentTile = world[y + dy][x + dx];
                            currentTile.ownerFactionId = factionId;
                            if (dx === 0 && dy === 0) { // This is the root tile
                                currentTile.infrastructureId = settlementDef.id;
                            } else {
                                currentTile.partOfInfrastructure = { rootX, rootY };
                            }
                        }
                    }
                    
                    const rootTile = world[rootY][rootX];

                    // Add starting units to the root tile
                    const workerUnitDef = UNITS.find(u => u.factionId === factionId && u.role === 'Worker' && u.tier === 1);
                    if (workerUnitDef) {
                        for (let i = 0; i < 2; i++) {
                            rootTile.units.push({
                                id: unitIdCounter++,
                                unitId: workerUnitDef.id,
                                factionId: factionId,
                                hp: getInitialHp(workerUnitDef, factionInfo),
                                x: rootX,
                                y: rootY,
                                killCount: 0,
                                combatLog: [],
                            });
                        }
                    }

                    const skirmisherUnitDef = UNITS.find(u => u.factionId === factionId && u.role === 'Skirmisher' && u.tier === 1);
                    if (skirmisherUnitDef) {
                         rootTile.units.push({
                            id: unitIdCounter++,
                            unitId: skirmisherUnitDef.id,
                            factionId: factionId,
                            hp: getInitialHp(skirmisherUnitDef, factionInfo),
                            x: rootX,
                            y: rootY,
                            killCount: 0,
                            combatLog: [],
                        });
                    }

                    placedFactionCoords.push({x: rootX, y: rootY});
                    placed = true;
                }
            }
            attempts++;
        }
        if (!placed) {
            console.warn(`Could not place faction ${factionInfo.name} after ${attempts} attempts.`);
        }
    }
    return unitIdCounter;
}


export function generateInitialGameState(): GameState {
  const world = createEmptyWorld();
  placeBiomes(world);
  placeResources(world);
  placeWorldEvents(world);

  const factionStates: Record<string, FactionState> = {};
  const mainFactions = FACTIONS.filter(f => f.id !== 'neutral_hostile');
  
  const startingResources = { iron_ore: 10, steamwood_log: 10 };

  mainFactions.forEach((faction, index) => {
    const initialStorage: Record<ResourceTier, { current: number; capacity: number }> = {
        Raw: { current: 0, capacity: 0 },
        Processed: { current: 0, capacity: 0 },
        Component: { current: 0, capacity: 0 },
        Exotic: { current: 0, capacity: 0 },
    };

    // Add capacity from starting Hamlet
    const hamletDef = INFRASTRUCTURE_MAP.get('settlement_hamlet');
    if (hamletDef?.addsStorage) {
        for (const [tier, amount] of Object.entries(hamletDef.addsStorage)) {
            initialStorage[tier as ResourceTier].capacity = amount;
        }
    }

    // Calculate initial resource usage
    for (const [resId, amount] of Object.entries(startingResources)) {
        const resDef = RESOURCES_MAP.get(resId);
        if (resDef) {
            initialStorage[resDef.tier].current += amount;
        }
    }

    factionStates[faction.id] = {
      id: faction.id,
      resources: startingResources,
      storage: initialStorage,
      leader: CHARACTERS[index % CHARACTERS.length], // Assign leaders cyclically
      researchPoints: 0,
      unlockedTechs: [],
      athar: 100,
      population: 10, // Starting population is smaller
      leaderStatus: 'settled',
      diplomacy: {},
    };
  });

  // Initialize diplomatic relations
  const factionIds = Object.keys(factionStates);
  for (const factionAId of factionIds) {
    for (const factionBId of factionIds) {
      if (factionAId !== factionBId) {
        factionStates[factionAId].diplomacy[factionBId] = {
          status: 'Neutral',
          opinion: 0,
        };
      }
    }
  }
  
  const nextUnitId = placeFactions(world, factionStates);

  return {
    world,
    factions: factionStates,
    gameTime: {
      tick: 0,
      year: STARTING_YEAR,
      epoch: 'era_of_awakening',
    },
    selectedTile: null,
    selectedUnitId: null,
    nextUnitId,
    attackFlashes: {},
    dyingUnits: [],
    eventLog: [],
    nextEventId: 0,
    totalMintedAthar: 10,
  };
}