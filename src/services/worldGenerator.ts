
import { WORLD_SIZE, BIOMES, RESOURCES, FACTIONS, CHARACTERS, WORLD_EVENTS, UNITS, FACTIONS_MAP, INFRASTRUCTURE_MAP, RESOURCES_MAP, RESOURCE_SPAWN_CHANCES, STARTING_YEAR, INFRA_HP_COST_MULTIPLIER } from '../constants';
import type { TileData, GameState, FactionState, Faction, FactionEffectType, UnitDefinition, ResourceTier, UnitInstance } from '../types';

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

const getInitialHp = (unitDef: UnitDefinition, factionInfo: Faction): number => {
    const hpMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { unitRole: unitDef.role, stat: 'hp' });
    const totalHpMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { stat: 'hp' });
    return Math.floor(unitDef.hp * (1 + hpMod + totalHpMod));
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

function generateNoiseMap(size: number, passes: number): number[][] {
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

function placeBiomes(world: TileData[][]): void {
    const elevationMap = generateNoiseMap(WORLD_SIZE, 4);
    const humidityMap = generateNoiseMap(WORLD_SIZE, 4);
    const magicMap = generateNoiseMap(WORLD_SIZE, 5);
    for (let y = 0; y < WORLD_SIZE; y++) {
        for (let x = 0; x < WORLD_SIZE; x++) {
            const elevation = elevationMap[y][x];
            const humidity = humidityMap[y][x];
            const magic = magicMap[y][x];
            if (magic > 0.75) world[y][x].biomeId = 'atharium_wastes';
            else if (elevation > 0.6) world[y][x].biomeId = humidity > 0.5 ? 'tundra' : 'ashlands';
            else if (elevation < 0.4) world[y][x].biomeId = humidity > 0.5 ? 'gloomwell' : 'wasteland';
            else world[y][x].biomeId = humidity > 0.55 ? 'gloomwell' : 'verdant';
        }
    }
}

function placeResources(world: TileData[][]): void {
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

function placeWorldEvents(world: TileData[][]): void {
    const discoveries = WORLD_EVENTS.filter(e => e.type === 'Discovery');
    let placedCount = 0;
    const maxEvents = 2;
    while (placedCount < maxEvents && discoveries.length > 0) {
        const eventToPlace = discoveries.splice(getRandomInt(0, discoveries.length - 1), 1)[0];
        let placed = false; let attempts = 0;
        while (!placed && attempts < 100) {
            const x = getRandomInt(0, WORLD_SIZE - 1);
            const y = getRandomInt(0, WORLD_SIZE - 1);
            const tile = world[y][x];
            if (!tile.worldEventId && !tile.infrastructureId && !tile.resourceId && !tile.ownerFactionId) {
                tile.worldEventId = eventToPlace.id;
                placed = true;
            }
            attempts++;
        }
        if (placed) placedCount++;
    }
}

function createUnit(id: number, unitDef: UnitDefinition, factionInfo: Faction, x: number, y: number): UnitInstance {
    return {
        id, unitId: unitDef.id, factionId: factionInfo.id, hp: getInitialHp(unitDef, factionInfo), x, y,
        level: 1, xp: 0, killCount: 0, combatLog: [],
        inventory: [],
        equipment: { Weapon: null, Armor: null, Accessory: null },
        currentActivity: 'Guarding',
    };
}

function placeFactions(world: TileData[][], factions: Record<string, FactionState>): number {
    const factionIds = Object.keys(factions);
    let unitIdCounter = 0;
    const SETTLEMENT_RADIUS = 5;
    const numFactions = factionIds.length;
    const center = { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 };
    const radius = Math.min(center.x, center.y) - 5;
    const startingPoints = factionIds.map((_, index) => {
        const angle = (2 * Math.PI / numFactions) * index;
        return { x: Math.round(center.x + radius * Math.cos(angle)), y: Math.round(center.y + radius * Math.sin(angle)) };
    });

    factionIds.forEach((factionId, index) => {
        const factionInfo = FACTIONS_MAP.get(factionId);
        if (!factionInfo) return;
        let placed = false; let attempts = 0;
        const startX = startingPoints[index].x;
        const startY = startingPoints[index].y;
        let searchRadius = 0;
        while (!placed && attempts < 500) {
            let foundSpot = false;
            for (let dy = -searchRadius; dy <= searchRadius; dy++) {
                for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                    if (searchRadius > 0 && Math.abs(dx) < searchRadius && Math.abs(dy) < searchRadius) continue;
                    const x = startX + dx;
                    const y = startY + dy;
                    if (x < 1 || x >= WORLD_SIZE - 1 || y < 1 || y >= WORLD_SIZE - 1) continue;
                    const rootTile = world[y][x];
                    const isPreferredBiome = factionInfo.preferredBiomes.length === 0 || factionInfo.preferredBiomes.includes(rootTile.biomeId);
                    const areaIsEmpty = [world[y][x], world[y+1][x], world[y][x+1], world[y+1][x+1]].every(t => !t.ownerFactionId && !t.infrastructureId && !t.worldEventId && !t.resourceId && !t.partOfInfrastructure);
                    if (isPreferredBiome && areaIsEmpty) {
                        const hamletDef = INFRASTRUCTURE_MAP.get('settlement_hamlet')!;
                        const maxHp = (Object.values(hamletDef.upgradeCost!).reduce((s, a) => s + a, 0)) * INFRA_HP_COST_MULTIPLIER;
                        
                        rootTile.ownerFactionId = factionId;
                        rootTile.infrastructureId = 'settlement_hamlet';
                        rootTile.hp = maxHp;
                        rootTile.maxHp = maxHp;

                        world[y+1][x].partOfInfrastructure = { rootX: x, rootY: y };
                        world[y][x+1].partOfInfrastructure = { rootX: x, rootY: y };
                        world[y+1][x+1].partOfInfrastructure = { rootX: x, rootY: y };
                        
                        const nativeBiome = factionInfo.preferredBiomes[0] || BIOMES[1].id;
                        for (let ddy = -SETTLEMENT_RADIUS; ddy <= SETTLEMENT_RADIUS; ddy++) {
                            for (let ddx = -SETTLEMENT_RADIUS; ddx <= SETTLEMENT_RADIUS; ddx++) {
                                const nx = x + ddx; const ny = y + ddy;
                                if (Math.hypot(ddx, ddy) <= SETTLEMENT_RADIUS && nx >= 0 && nx < WORLD_SIZE && ny >= 0 && ny < WORLD_SIZE) {
                                    world[ny][nx].biomeId = nativeBiome;
                                }
                            }
                        }
                        const workerDef = UNITS.find(u => u.factionId === factionId && u.role === 'Worker');
                        if (workerDef) {
                            rootTile.units.push(createUnit(unitIdCounter++, workerDef, factionInfo, x, y));
                            rootTile.units.push(createUnit(unitIdCounter++, workerDef, factionInfo, x, y));
                        }
                        const skirmisherDef = UNITS.find(u => u.factionId === factionId && u.role === 'Skirmisher' && u.tier === 1);
                        if (skirmisherDef) {
                            rootTile.units.push(createUnit(unitIdCounter++, skirmisherDef, factionInfo, x, y));
                        }
                        placed = true; foundSpot = true;
                        break;
                    }
                }
                if (foundSpot) break;
            }
            searchRadius++;
            attempts++;
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
  const startingResources = { iron_ore: 50, steamwood_log: 50 };
  mainFactions.forEach((faction, index) => {
    const initialStorage: Record<ResourceTier, { current: number; capacity: number }> = { Raw: { current: 0, capacity: 0 }, Processed: { current: 0, capacity: 0 }, Component: { current: 0, capacity: 0 }, Exotic: { current: 0, capacity: 0 }, };
    const hamletDef = INFRASTRUCTURE_MAP.get('settlement_hamlet');
    if (hamletDef?.addsStorage) {
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
  const factionIds = Object.keys(factionStates);
  for (const fA of factionIds) {
    for (const fB of factionIds) {
      if (fA !== fB) factionStates[fA].diplomacy[fB] = { status: 'Neutral', opinion: 0 };
    }
  }
  return { world, factions: factionStates, gameTime: { tick: 0, year: STARTING_YEAR, epoch: 'era_of_awakening' }, selectedTile: null, selectedUnitId: null, nextUnitId, attackFlashes: {}, dyingUnits: [], eventLog: [], nextEventId: 0, totalMintedAthar: 0 };
}
