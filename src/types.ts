
//
// CORE ENTITY TRAITS & DEFINITIONS
//

export interface Trait {
  id: string;
  name: string;
  type: 'Good' | 'Bad' | 'Neutral';
  description: string;
  effects: string; // Simplified for display
}

export interface UnitTraitEffect {
  type: 'DAMAGE_REDUCTION_PERCENT' | 'BONUS_ATTACK_VS_TRAIT' | 'CRITICAL_CHANCE' | 'HP_REGEN' | 'FIRST_STRIKE';
  value?: number;
  traitId?: string;
  chance?: number;
  multiplier?: number;
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
  | 'PRODUCTION_MOD'
  | 'INFRASTRUCTURE_COST_MOD'
  | 'UNIT_COST_MOD'
  | 'POP_GROWTH_MOD'
  | 'UNIT_STAT_MOD';

export interface FactionTraitEffect {
  type: FactionEffectType;
  value: number; // e.g., 0.1 for +10%
  resourceTier?: Resource['tier'];
  unitRole?: UnitRole;
  stat?: 'hp' | 'atk';
}

export interface FactionTrait {
  name: string;
  description: string;
  effects: FactionTraitEffect[];
}

export type FactionArchetype = 'Industrial' | 'Nature' | 'Holy' | 'Shadow' | 'Mountain' | 'Undead' | 'Nomadic';

export interface Faction {
  id: string;
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

//
// WORLD & MAP DEFINITIONS
//

export type WeatherType = 'Clear' | 'Rain' | 'Storm' | 'Fog' | 'Heatwave';

export interface TerrainEffect {
  description: string;
  appliesTo: {
    factionArchetype?: FactionArchetype;
    unitRole?: UnitRole;
  };
  effects: {
    stat: 'atk' | 'def';
    modifier: number;
  }[];
}

export interface Biome {
  id: string;
  name: string;
  moveCost: number;
  terrainEffects: TerrainEffect[];
  spreadsTo?: string[]; // Biome expansion logic
  spreadChance?: number;
}

export type ResourceTier = 'Raw' | 'Processed' | 'Component' | 'Exotic';

export interface Resource {
  id: string;
  name: string;
  tier: ResourceTier;
  biomes?: string[];
  assetId: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Exotic';
  respawnTime?: number;
}

//
// ITEM & EQUIPMENT SYSTEM
//

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type EquipmentSlot = 'Weapon' | 'Armor' | 'Accessory' | 'None';

export type StatEffect =
  | 'HP_FLAT' | 'HP_PERCENT'
  | 'ATTACK_FLAT' | 'ATTACK_PERCENT'
  | 'DEFENSE_FLAT' | 'DEFENSE_PERCENT'
  | 'BONUS_DMG_VS_MELEE' | 'BONUS_DMG_VS_RANGED' | 'BONUS_DMG_VS_SPECIAL'
  | 'FIRST_STRIKE_CHANCE' | 'HP_REGEN';

export interface ItemEffect {
  type: StatEffect;
  value: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  slot: EquipmentSlot;
  effects: ItemEffect[];
  visualColor?: string; // For procedural graphics
}

//
// UNIT & INFRASTRUCTURE DEFINITIONS
//

export type UnitRole = 'Worker' | 'Melee' | 'Ranged' | 'Special' | 'Support' | 'Hero';

export interface UnitDefinition {
  id: string;
  name: string;
  factionId: string;
  hp: number;
  atk: number;
  defense: number;
  role: UnitRole;
  assetId: string;
  cost: Record<string, number>;
  tier: number;
  traitIds?: string[];
}

export interface AdjacencyBonus {
    targetType: 'Biome' | 'Infrastructure';
    targetId: string; // Biome ID or Infrastructure ID
    effect: 'Production' | 'Defense';
    value: number; // Multiplier (e.g., 0.5 for +50%)
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
  xpGain?: number;
  adjacencyBonuses?: AdjacencyBonus[];
  pollution?: number; // New: Generates corruption
}

export interface WorldEvent {
  id: string;
  name: string;
  type: 'Discovery' | 'Relic' | 'Hazard';
  assetId: string;
  description: string;
}

//
// DYNAMIC GAME STATE INSTANCES
//

export interface CombatLogEntry {
  tick: number;
  opponentUnitId: string;
  opponentFactionId: string;
  damageDealt: number;
  damageTaken: number;
  isFatalToOpponent: boolean;
  isFatalToSelf: boolean;
}

// Advanced Procedural Generation Types
export interface VisualGenes {
    bodyColor: string;
    headType: 'Standard' | 'Hood' | 'Helm' | 'Crown' | 'Beast' | 'Mask';
    weaponType: 'None' | 'Sword' | 'Axe' | 'Bow' | 'Staff' | 'Hammer' | 'Daggers';
    weaponColor: string;
    sizeScale: number;
    accessory?: 'None' | 'Cape' | 'Backpack' | 'Wings';
}

export interface UnitInstance {
  id: number;
  unitId: string;
  factionId: string;
  hp: number;
  x: number;
  y: number;
  level: number;
  xp: number;
  killCount: number;
  adventureTicks?: number;
  combatLog: CombatLogEntry[];
  inventory: ItemDefinition[];
  equipment: {
    Weapon: ItemDefinition | null;
    Armor: ItemDefinition | null;
    Accessory: ItemDefinition | null;
  };
  currentActivity: string;
  buildTicks?: number;
  visualGenes?: VisualGenes; 
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
  loot?: ItemDefinition[];
  hp?: number;
  maxHp?: number;
  resourceCache?: Record<string, number>;
  resourceCooldown?: number;
  efficiency?: number;
  corruption?: number; // 0-100, determines biome shift
}

export enum GameEventType {
  BATTLE,
  LOOT,
  UPGRADE,
  LEVEL_MILESTONE,
  FACTION_ELIMINATED,
  WAR_DECLARED,
  ALLIANCE_FORMED,
  BIOME_CHANGE,
  WEATHER_CHANGE,
}

export interface GameEvent {
  id: number;
  tick: number;
  type: GameEventType;
  message: string;
  location: { x: number, y: number };
}

export type DiplomaticStatus = 'War' | 'Neutral' | 'Alliance';

export interface DiplomaticRelation {
  status: DiplomaticStatus;
  opinion: number;
  grievances: string[]; // History of why we hate them
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
  isEliminated?: boolean;
}

export interface FloatingText {
    id: number;
    text: string;
    x: number; // grid x
    y: number; // grid y
    color: string;
    life: number; // 0-1, fades out
    velocity: { x: number, y: number };
}

export type GodPowerType = 'Smite' | 'Heal' | 'Enrich';

export interface GodPower {
    id: GodPowerType;
    name: string;
    cost: number;
    icon: string;
    description: string;
}

export interface GameState {
  world: TileData[][];
  factions: Record<string, FactionState>;
  gameTime: {
    tick: number;
    year: number;
    epoch: string;
    timeOfDay: number; // 0 - 24
  };
  weather: WeatherType; 
  selectedTile: { x: number; y: number } | null;
  selectedUnitId: number | null;
  nextUnitId: number;
  attackFlashes: Record<number, number>;
  dyingUnits: (UnitInstance & { deathTick: number })[];
  eventLog: GameEvent[];
  nextEventId: number;
  totalMintedAthar: number;
  floatingTexts: FloatingText[]; // New: For combat feedback
  activeGodPower: GodPowerType | null; // New: Interaction mode
}

//
// UTILITY & SYSTEM TYPES
//

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
