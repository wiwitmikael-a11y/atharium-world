
export interface Epoch {
  id: string;
  name: string;
  synopsis: string;
}

export interface Trait {
  id: string;
  name: string;
  type: 'Good' | 'Bad' | 'Neutral';
  description: string;
  effects: string;
}

export interface UnitTraitEffect {
    type: 'DAMAGE_REDUCTION_PERCENT' | 'BONUS_ATTACK_VS_TRAIT' | 'CRITICAL_CHANCE' | 'HP_REGEN' | 'FIRST_STRIKE';
    value?: number; // For percentage, flat values, or regen amount
    traitId?: string; // For bonus vs trait
    chance?: number; // For chance-based effects
    multiplier?: number; // For critical hits
}

export interface UnitTrait {
    id: string;
    name: string;
    description: string;
    effects: UnitTraitEffect[];
}

export interface Character {
  id: string;
  name: string;
  age: number;
  traitIds: string[];
  skills: {
    martial: number;
    diplomacy: number;
    stewardship: number;
    intrigue: number;
    learning: number;
  };
}

export type FactionEffectType = 
  'PRODUCTION_MOD' |      // Affects resource generation amount
  'INFRASTRUCTURE_COST_MOD' | // Affects cost of building/upgrading infra
  'UNIT_COST_MOD' |         // Affects cost of training units
  'POP_GROWTH_MOD' |        // Affects population growth rate
  'UNIT_STAT_MOD';          // Affects base stats of new units

export interface FactionTraitEffect {
    type: FactionEffectType;
    value: number; // e.g., 0.1 for +10%, -0.1 for -10%
    resourceTier?: Resource['tier'];
    unitRole?: UnitDefinition['role'];
    stat?: 'hp' | 'atk';
}

export interface FactionTrait {
  name: string;
  description: string;
  effects: FactionTraitEffect[];
}

export type FactionArchetype = 'Industrial' | 'Nature' | 'Holy' | 'Shadow' | 'Mountain' | 'Undead' | 'Nomadic';

export interface Faction {
  id:string;
  name: string;
  color: string;
  traits: FactionTrait[];
  preferredBiomes: string[];
  archetype: FactionArchetype;
  personality: {
    aggression: number;
    expansion: number;
    diplomacy: number;
  };
  techTreeId: string;
}

export interface TerrainEffect {
  description: string;
  appliesTo: {
    factionArchetype?: FactionArchetype;
    unitRole?: UnitDefinition['role'];
  };
  effects: {
    stat: 'atk' | 'def';
    modifier: number; // e.g., 0.1 for +10%, -0.1 for -10%
  }[];
}


export interface Biome {
  id: string;
  name: string;
  moveCost: number;
  terrainEffects: TerrainEffect[];
}

export type ResourceTier = 'Raw' | 'Processed' | 'Component' | 'Exotic';

export interface Resource {
  id: string;
  name: string;
  tier: ResourceTier;
  biomes?: string[];
  assetId: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Exotic';
}

export interface UnitDefinition {
  id: string;
  name: string;
  factionId: string;
  hp: number;
  atk: number;
  role: 'Worker' | 'Infantry' | 'Skirmisher' | 'Siege' | 'Support' | 'Hero';
  assetId: string;
  cost: Record<string, number>;
  tier: number;
  traitIds?: string[];
}

export interface CombatLogEntry {
  tick: number;
  opponentUnitId: string;
  opponentFactionId: string;
  damageDealt: number;
  damageTaken: number;
  isFatalToOpponent: boolean;
  isFatalToSelf: boolean;
}

export interface UnitInstance {
  id: number;
  unitId: string;
  factionId: string;
  hp: number;
  x: number;
  y: number;
  killCount: number;
  adventureTicks?: number; // For leader adventures
  combatLog: CombatLogEntry[];
}

export interface Infrastructure {
  id: string;
  name: string;
  assetId: string;
  description: string;
  cost: Record<string, number>;
  produces?: { resourceId: string; amount: number; };
  consumes?: { resourceId: string; amount: number; }[];
  requiresResourceId?: string;
  tier: number;
  upgradesTo?: string;
  upgradeCost?: Record<string, number>;
  populationCapacity?: number;
  multiTile?: { width: number; height: number };
  addsStorage?: Partial<Record<ResourceTier, number>>;
  generatesResearchPoints?: number;
}

export interface WorldEvent {
  id: string;
  name: string;
  type: 'Discovery' | 'Relic' | 'Hazard';
  assetId: string;
  description: string;
}

export interface TileData {
  x: number;
  y: number;
  biomeId: string;
  resourceId?: string;
  infrastructureId?: string;
  ownerFactionId?: string;
  units: UnitInstance[];
  worldEventId?: string;
  partOfInfrastructure?: { rootX: number, rootY: number };
}

export interface GameEvent {
    id: number;
    tick: number;
    message: string;
    location: { x: number, y: number };
}

export interface GameState {
  world: TileData[][];
  factions: Record<string, FactionState>;
  gameTime: {
    tick: number;
    year: number;
    epoch: string;
  };
  selectedTile: { x: number; y: number } | null;
  selectedUnitId: number | null;
  nextUnitId: number;
  attackFlashes: Record<number, number>; // Key: unit.id, Value: tick
  dyingUnits: (UnitInstance & { deathTick: number })[];
  eventLog: GameEvent[];
  nextEventId: number;
  totalMintedAthar: number;
}

export type DiplomaticStatus = 'War' | 'Neutral' | 'Alliance';

export interface DiplomaticRelation {
  status: DiplomaticStatus;
  opinion: number;
}

export interface StorageTierData {
    current: number;
    capacity: number;
}

export interface FactionState {
  id: string;
  resources: Record<string, number>;
  storage: Record<ResourceTier, StorageTierData>;
  leader: Character;
  researchPoints: number;
  unlockedTechs: string[];
  athar: number;
  population: number;
  leaderStatus: 'settled' | 'adventuring';
  diplomacy: Record<string, DiplomaticRelation>;
}

export interface TechNode {
    id: string;
    name: string;
    tier: number;
    cost: number;
    prerequisites: string[];
    effect: string;
}

export interface SoundManager {
  playSFX: (id: string) => void;
  playUIHoverSFX: () => void;
  playAmbiance: (ambianceType: string) => void;
  toggleBgm: () => void;
  toggleSfx: () => void;
  shutdown: () => void;
  isBgmEnabled: boolean;
  isSfxEnabled: boolean;
  isAudioInitialized: boolean;
}

export type GamePhase = 'intro' | 'login' | 'menu' | 'loading' | 'playing';