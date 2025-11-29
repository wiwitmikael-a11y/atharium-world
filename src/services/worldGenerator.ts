
import { WORLD_SIZE, BIOMES, RESOURCES, FACTIONS, CHARACTERS, WORLD_EVENTS, UNITS, FACTIONS_MAP, INFRASTRUCTURE_MAP, RESOURCES_MAP, RESOURCE_SPAWN_CHANCES, STARTING_YEAR, INFRA_HP_COST_MULTIPLIER } from '../constants';
import type { TileData, GameState, FactionState, Faction, UnitDefinition, ResourceTier, UnitInstance, ItemDefinition, Infrastructure } from '../types';
import { ITEMS, ITEMS_MAP } from './dataLoader';
import { getFactionModifier } from '../utils/faction';
import { getUnitStats } from '../utils/unit';

const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const createUnit = (id: number, unitDef: UnitDefinition, factionInfo: Faction, x: number, y: number): UnitInstance => {
    const equipment: UnitInstance['equipment'] = { Weapon: null, Armor: null, Accessory: null };
    let defaultWeapon: ItemDefinition | undefined;

    switch(unitDef.role) {
        case 'Worker': defaultWeapon = ITEMS_MAP.get('chipped_axe'); break;
        case 'Melee': defaultWeapon = ITEMS_MAP.get('rusty_shortsword'); break;
        case 'Ranged': defaultWeapon = ITEMS_MAP.get('splintered_shortbow'); break;
        case 'Support': case 'Hero': default: defaultWeapon = ITEMS_MAP.get('gnarled_staff'); break;
    }
    
    if (defaultWeapon) equipment.Weapon = defaultWeapon;

    const newUnit: UnitInstance = {
        id, unitId: unitDef.id, factionId: factionInfo.id, hp: 0, x, y,
        level: 1, xp: 0, killCount: 0, combatLog: [],
        inventory: [], equipment, currentActivity: 'Guarding',
    };
    // Set HP based on stats with equipment
    newUnit.hp = getUnitStats(newUnit).maxHp;
    return newUnit;
}

const createEmptyWorld = (): TileData[][] => {
  return Array.from({ length: WORLD_SIZE }, (_, y) =>
    Array.from({ length: WORLD_SIZE }, (_, x) => ({
      x, y, biomeId: BIOMES[0].id, units: [],
    }))
  );
}

const generateNoiseMap = (size: number, passes: number): number[][] => {
    let map = Array.from({ length: size }, () => Array.from({ length: size }, () => Math.random()));
    for (let pass = 0; pass < passes; pass++) {
        const newMap = JSON.parse(JSON.stringify(map));
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let total = 0; let count = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx; const ny = y + dy;
                        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                            total += map[ny][nx]; count++;
                        }
                    }
                }
                newMap[y][x] = total / count;
            }
        }
        map = newMap;
    }
    return map;
}

const placeBiomes = (world: TileData[][]) => {
    const elevationMap = generateNoiseMap(WORLD_SIZE, 4);
    const humidityMap = generateNoiseMap(WORLD_SIZE, 4);
    const magicMap = generateNoiseMap(WORLD_SIZE, 5);
    for (let y = 0; y < WORLD_SIZE; y++) {
        for (let x = 0; x < WORLD_SIZE; x++) {
            const e = elevationMap[y][x]; const h = humidityMap[y][x]; const m = magicMap[y][x];
            if (m > 0.75) world[y][x].biomeId = 'atharium_wastes';
            else if (e > 0.6) world[y][x].biomeId = h > 0.5 ? 'tundra' : 'ashlands';
            else if (e < 0.4) world[y][x].biomeId = h > 0.5 ? 'gloomwell' : 'wasteland';
            else world[y][x].biomeId = h > 0.55 ? 'gloomwell' : 'verdant';
        }
    }
}

const placeResources = (world: TileData[][]) => {
  const rawResources = RESOURCES.filter(r => r.tier === 'Raw');
  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
        const tile = world[y][x];
        if (tile.resourceId || tile.ownerFactionId) continue;
        for (const resource of rawResources) {
            if (resource.biomes?.includes(tile.biomeId) && Math.random() < RESOURCE_SPAWN_CHANCES[resource.rarity]) {
                tile.resourceId = resource.id;
                break;
            }
        }
    }
  }
}

const placeWorldEvents = (world: TileData[][]) => {
    const discoveries = WORLD_EVENTS.filter(e => e.type === 'Discovery');
    for(let i=0; i<2; i++) {
        if(discoveries.length === 0) break;
        const eventToPlace = discoveries.splice(getRandomInt(0, discoveries.length - 1), 1)[0];
        let placed = false; let attempts = 0;
        while (!placed && attempts < 100) {
            const x = getRandomInt(0, WORLD_SIZE - 1);
            const y = getRandomInt(0, WORLD_SIZE - 1);
            const tile = world[y]?.[x];
            if (tile && !tile.worldEventId && !tile.infrastructureId && !tile.resourceId && !tile.ownerFactionId) {
                tile.worldEventId = eventToPlace.id;
                placed = true;
            }
            attempts++;
        }
    }
}

const placeInitialLoot = (world: TileData[][]) => {
    const commonItems = ITEMS.filter(item => item.rarity === 'Common' && item.slot !== 'None');
    if(commonItems.length === 0) return;
    for(let i=0; i<5; i++) {
        let placed = false; let attempts = 0;
        while (!placed && attempts < 100) {
            const x = getRandomInt(0, WORLD_SIZE - 1);
            const y = getRandomInt(0, WORLD_SIZE - 1);
            const tile = world[y]?.[x];
            if (tile && !tile.worldEventId && !tile.infrastructureId && !tile.resourceId && !tile.ownerFactionId && !tile.loot) {
                tile.loot = [commonItems[getRandomInt(0, commonItems.length - 1)]];
                placed = true;
            }
            attempts++;
        }
    }
}

const placeFactions = (world: TileData[][], factions: Record<string, FactionState>): number => {
    let unitIdCounter = 0;
    const factionIds = Object.keys(factions);
    const numFactions = factionIds.length;
    const center = { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 };
    const radius = Math.min(center.x, center.y) - 10;
    
    factionIds.forEach((factionId, index) => {
        const factionInfo = FACTIONS_MAP.get(factionId)!;
        const angle = (2 * Math.PI / numFactions) * index;
        const startX = Math.round(center.x + radius * Math.cos(angle));
        const startY = Math.round(center.y + radius * Math.sin(angle));

        let placed = false;
        for (let r = 0; r < 15 && !placed; r++) { // Search in expanding radius
            for (let dy = -r; dy <= r; dy++) {
                if(placed) break;
                for (let dx = -r; dx <= r; dx++) {
                    if(placed) break;
                    if (r > 0 && Math.abs(dx) < r && Math.abs(dy) < r) continue;
                    
                    const x = startX + dx;
                    const y = startY + dy;
                    
                    const hamletDef = INFRASTRUCTURE_MAP.get('settlement_hamlet')!;
                    const {width, height} = hamletDef.multiTile!;
                    
                    // Check if area is valid and empty
                    let areaIsValid = true;
                    for(let my=0; my < height; my++) {
                        for(let mx=0; mx < width; mx++) {
                            const tile = world[y+my]?.[x+mx];
                            if (!tile || tile.ownerFactionId || tile.infrastructureId || tile.resourceId || tile.worldEventId || tile.partOfInfrastructure) {
                                areaIsValid = false;
                                break;
                            }
                        }
                        if(!areaIsValid) break;
                    }
                    
                    if (areaIsValid) {
                        const rootTile = world[y][x];
                        const maxHp = (Object.values(hamletDef.upgradeCost!).reduce((s, a) => s + a, 0)) * INFRA_HP_COST_MULTIPLIER;
                        
                        // Place structure and link parts
                        rootTile.ownerFactionId = factionId;
                        rootTile.infrastructureId = hamletDef.id;
                        rootTile.hp = maxHp;
                        rootTile.maxHp = maxHp;
                        for(let my=0; my < height; my++) {
                            for(let mx=0; mx < width; mx++) {
                                if (mx === 0 && my === 0) continue;
                                world[y+my][x+mx].partOfInfrastructure = { rootX: x, rootY: y };
                            }
                        }
                        
                        // Spawn initial units
                        const workerDef = UNITS.find(u => u.factionId === factionId && u.role === 'Worker');
                        if (workerDef) {
                            rootTile.units.push(createUnit(unitIdCounter++, workerDef, factionInfo, x, y));
                            rootTile.units.push(createUnit(unitIdCounter++, workerDef, factionInfo, x, y));
                        }
                        const rangedDef = UNITS.find(u => u.factionId === factionId && u.role === 'Ranged' && u.tier === 1);
                        if (rangedDef) {
                            rootTile.units.push(createUnit(unitIdCounter++, rangedDef, factionInfo, x, y));
                        }
                        
                        placed = true;
                    }
                }
            }
        }
        if (!placed) console.error(`CRITICAL: Could not place faction ${factionInfo.name}.`);
    });
    return unitIdCounter;
}

export function generateInitialGameState(): GameState {
  const world = createEmptyWorld();
  placeBiomes(world);

  const factionStates: Record<string, FactionState> = {};
  const mainFactions = FACTIONS.filter(f => f.id !== 'neutral_hostile');
  const startingResources = { 'steamwood_plank': 20, 'iron_ingot': 20 };

  mainFactions.forEach((faction, index) => {
    const initialStorage: Record<ResourceTier, { current: number; capacity: number }> = { Raw: { current: 0, capacity: 0 }, Processed: { current: 0, capacity: 0 }, Component: { current: 0, capacity: 0 }, Exotic: { current: 0, capacity: 0 }, };
    const hamletDef = INFRASTRUCTURE_MAP.get('settlement_hamlet')!;
    if (hamletDef.addsStorage) {
        for (const [tier, amount] of Object.entries(hamletDef.addsStorage)) {
            initialStorage[tier as ResourceTier].capacity = amount;
        }
    }
    for (const [resId, amount] of Object.entries(startingResources)) {
        const resDef = RESOURCES_MAP.get(resId);
        if (resDef) initialStorage[resDef.tier].current += amount;
    }
    factionStates[faction.id] = { id: faction.id, resources: startingResources, storage: initialStorage, leader: CHARACTERS[index % CHARACTERS.length], researchPoints: 0, unlockedTechs: [], athar: 100, population: 10, leaderStatus: 'settled', diplomacy: {}, isEliminated: false };
  });
  
  const nextUnitId = placeFactions(world, factionStates);
  placeResources(world);
  placeWorldEvents(world);
  placeInitialLoot(world);

  // Initialize diplomatic relations with natural enmity
  const factionIds = Object.keys(factionStates);
  const naturalEnemies: Record<string, { nemesis: string, opinion: number }> = {
      'f1': { nemesis: 'f2', opinion: -25 }, // Industrial vs Nature
      'f3': { nemesis: 'f7', opinion: -50 }, // Holy vs Undead
  };
  for (const fA of factionIds) {
    for (const fB of factionIds) {
      if (fA !== fB) {
        let initialOpinion = 0;
        if (naturalEnemies[fA]?.nemesis === fB || naturalEnemies[fB]?.nemesis === fA) {
            initialOpinion = naturalEnemies[fA]?.opinion || naturalEnemies[fB]?.opinion || 0;
        }
        factionStates[fA].diplomacy[fB] = { status: 'Neutral', opinion: initialOpinion };
      }
    }
  }

  return { 
      world, 
      factions: factionStates, 
      gameTime: { tick: 0, year: STARTING_YEAR, epoch: 'era_of_awakening' }, 
      selectedTile: null, 
      selectedUnitId: null, 
      nextUnitId, 
      attackFlashes: {}, 
      dyingUnits: [], 
      eventLog: [], 
      nextEventId: 0, 
      totalMintedAthar: 0 
    };
}
