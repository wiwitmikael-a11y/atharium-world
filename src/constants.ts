
import type { Trait, Character, Faction, Biome, Resource, UnitDefinition, Infrastructure, TechNode, WorldEvent, UnitTrait, Rarity } from './types';

export const WORLD_SIZE = 80;
export const TICK_PER_YEAR = 1000;
export const ATHAR_CAP = 1000000;
export const STARTING_YEAR = 1453;
export const XP_PER_LEVEL = 100;
export const STAT_INCREASE_PER_LEVEL = 0.10;
export const INFRA_HP_COST_MULTIPLIER = 10;
export const LEVEL_MILESTONES = [5, 10, 15, 20, 25];
export const RESOURCE_SPAWN_CHANCES: Record<Resource['rarity'], number> = { Common: 0.1, Uncommon: 0.05, Rare: 0.02, Exotic: 0.005 };

export const EPOCHS = Object.freeze([
  { id: 'era_of_awakening', name: 'Era of Awakening', synopsis: 'A time of nascent civilizations and untamed wilds.' },
  { id: 'age_of_steam_sorcery', name: 'Age of Steam & Sorcery', synopsis: 'Invention and magic intertwine.' },
  { id: 'the_great_flux', name: 'The Great Flux', synopsis: 'A cataclysmic period where raw magic seeps into the world.' },
  { id: 'epoch_of_the_cog_gods', name: 'Epoch of the Cog-Gods', synopsis: 'Order is forged from chaos.' },
]);

export const TRAITS: readonly Trait[] = Object.freeze([
  { id: 'brave', name: 'Brave', type: 'Good', description: 'Faces danger head-on.', effects: 'Unit Attack +5%' },
  { id: 'just', name: 'Just', type: 'Good', description: 'Known for fairness.', effects: 'Diplomacy Score +10' },
  { id: 'diligent', name: 'Diligent', type: 'Good', description: 'A tireless worker.', effects: 'Production Speed +10%' },
]);

export const CHARACTERS: readonly Character[] = Object.freeze([
  { id: 'char_hephaestus', name: 'Hephaestus', age: 87, traitIds: ['diligent'], skills: { martial: 12, diplomacy: 4, stewardship: 18, intrigue: 6, learning: 15 } },
  { id: 'char_cenarius', name: 'Cenarius', age: 450, traitIds: ['just'], skills: { martial: 8, diplomacy: 15, stewardship: 14, intrigue: 5, learning: 19 } },
]);

export const FACTIONS: readonly Faction[] = Object.freeze([
  { id: 'f1', name: 'The Cogwork Compact', color: 'red-500', archetype: 'Industrial', traits: [], preferredBiomes: ['ashlands'], personality: { aggression: 6, expansion: 8, diplomacy: 2 }, techTreeId: 'cogwork_tech' },
  { id: 'f2', name: 'The Verdant Wardens', color: 'green-500', archetype: 'Nature', traits: [], preferredBiomes: ['verdant'], personality: { aggression: 3, expansion: 6, diplomacy: 7 }, techTreeId: 'verdant_tech' },
  { id: 'f3', name: 'The Sunfire Dynasty', color: 'yellow-600', archetype: 'Holy', traits: [], preferredBiomes: ['verdant'], personality: { aggression: 7, expansion: 7, diplomacy: 4 }, techTreeId: 'sunfire_tech' },
  { id: 'f4', name: 'The Gloom Syndicate', color: 'violet-500', archetype: 'Shadow', traits: [], preferredBiomes: ['gloomwell'], personality: { aggression: 5, expansion: 4, diplomacy: 8 }, techTreeId: 'gloom_tech' },
  { id: 'f5', name: 'Ironclad Dwarves', color: 'blue-400', archetype: 'Mountain', traits: [], preferredBiomes: ['ashlands'], personality: { aggression: 5, expansion: 5, diplomacy: 5 }, techTreeId: 'dwarf_tech' },
  { id: 'f6', name: 'Sylvan Elves', color: 'teal-400', archetype: 'Nature', traits: [], preferredBiomes: ['gloomwell'], personality: { aggression: 4, expansion: 3, diplomacy: 9 }, techTreeId: 'elf_tech' },
  { id: 'f7', name: 'Dread Legion', color: 'gray-400', archetype: 'Undead', traits: [], preferredBiomes: ['wasteland'], personality: { aggression: 9, expansion: 9, diplomacy: 1 }, techTreeId: 'undead_tech' },
  { id: 'f8', name: 'Crimson Horde', color: 'orange-500', archetype: 'Nomadic', traits: [], preferredBiomes: ['wasteland'], personality: { aggression: 10, expansion: 7, diplomacy: 0 }, techTreeId: 'horde_tech' },
  { id: 'neutral_hostile', name: 'Wildlands Creatures', color: 'gray-600', archetype: 'Nomadic', traits: [], preferredBiomes: [], personality: { aggression: 10, expansion: 0, diplomacy: 0 }, techTreeId: '' },
]);

export const BIOMES: readonly Biome[] = Object.freeze([
    { id: 'gloomwell', name: 'Gloomwell Forest', moveCost: 2, spreadsTo: ['verdant'], spreadChance: 0.005, terrainEffects: [] },
    { id: 'verdant', name: 'Verdant Plains', moveCost: 1, spreadsTo: ['wasteland'], spreadChance: 0.002, terrainEffects: [] },
    { id: 'wasteland', name: 'Cracked Wasteland', moveCost: 1.2, spreadsTo: ['verdant'], spreadChance: 0.003, terrainEffects: [] },
    { id: 'tundra', name: 'Frostbitten Tundra', moveCost: 1.5, terrainEffects: [] },
    { id: 'ashlands', name: 'Ashen Caldera', moveCost: 2.5, terrainEffects: [] },
    { id: 'atharium_wastes', name: 'Atharium Wastes', moveCost: 1.8, spreadsTo: ['wasteland'], spreadChance: 0.008, terrainEffects: [] },
]);

export const RESOURCES: readonly Resource[] = Object.freeze([
    { id: 'iron_ore', name: 'Iron Ore', tier: 'Raw', biomes: ['ashlands', 'wasteland'], assetId: 'resource_iron_ore', rarity: 'Common', respawnTime: TICK_PER_YEAR * 5 },
    { id: 'steamwood_log', name: 'Steamwood Log', tier: 'Raw', biomes: ['verdant', 'gloomwell'], assetId: 'resource_steamwood_tree', rarity: 'Common', respawnTime: TICK_PER_YEAR * 4 },
    { id: 'chronocrystal_raw', name: 'Raw Chrono-Crystal', tier: 'Raw', biomes: ['atharium_wastes', 'tundra'], assetId: 'resource_chronocrystal', rarity: 'Uncommon', respawnTime: TICK_PER_YEAR * 8 },
    { id: 'fluxbloom', name: 'Fluxbloom', tier: 'Raw', biomes: ['gloomwell', 'atharium_wastes'], assetId: 'resource_fluxbloom', rarity: 'Uncommon', respawnTime: TICK_PER_YEAR * 6 },
    { id: 'dragon_scale', name: 'Dragon Scale', tier: 'Exotic', biomes: ['ashlands'], assetId: 'resource_dragon_scale', rarity: 'Exotic' },
    { id: 'heartstone', name: 'Heartstone', tier: 'Exotic', biomes: ['gloomwell'], assetId: 'resource_heartstone', rarity: 'Rare' },
    { id: 'iron_ingot', name: 'Iron Ingot', tier: 'Processed', assetId: 'resource_iron_ingot', rarity: 'Common' },
    { id: 'steamwood_plank', name: 'Steamwood Plank', tier: 'Processed', assetId: 'resource_steamwood_plank', rarity: 'Common' },
    { id: 'refined_chronocrystal', name: 'Refined Chrono-Crystal', tier: 'Processed', assetId: 'resource_refined_chronocrystal', rarity: 'Uncommon' },
    { id: 'clockwork_gear', name: 'Clockwork Gear', tier: 'Component', assetId: 'resource_clockwork_gear', rarity: 'Common' },
    { id: 'athar_capacitor', name: 'Athar Capacitor', tier: 'Component', assetId: 'resource_athar_capacitor', rarity: 'Uncommon' },
]);

// Explicitly type INFRASTRUCTURE to match interface requirements
export const INFRASTRUCTURE: readonly Infrastructure[] = [
  { id: 'settlement_hamlet', name: 'Hamlet', assetId: 'infra_settlement_hamlet', description: 'A small settlement.', cost: {}, tier: 1, populationCapacity: 100, upgradesTo: 'settlement_town', upgradeCost: { 'steamwood_plank': 100, 'iron_ingot': 100 }, addsStorage: { 'Raw': 200, 'Processed': 100 }, multiTile: { width: 2, height: 2 }, xpGain: 100 },
  { id: 'settlement_town', name: 'Town', assetId: 'infra_settlement_town', description: 'A growing town.', cost: {}, tier: 2, populationCapacity: 500, addsStorage: { 'Raw': 1000, 'Processed': 500 }, multiTile: { width: 2, height: 2 }, xpGain: 250 },
  { id: 'iron_mine', name: 'Iron Mine', assetId: 'infra_mine', description: 'Extracts Iron Ore.', cost: { 'steamwood_plank': 20 }, produces: { resourceId: 'iron_ore', amount: 0.5 }, requiresResourceId: 'iron_ore', tier: 1, xpGain: 20, pollution: 0.5 },
  { id: 'lumber_camp', name: 'Lumber Camp', assetId: 'infra_lumber_camp', description: 'Harvests logs.', cost: { 'iron_ingot': 10 }, produces: { resourceId: 'steamwood_log', amount: 0.5 }, requiresResourceId: 'steamwood_log', tier: 1, xpGain: 20 },
  { id: 'crystal_harvester', name: 'Crystal Harvester', assetId: 'infra_crystal_harvester', description: 'Extracts raw Chrono-Crystals.', cost: { 'steamwood_plank': 15, 'iron_ingot': 15 }, produces: { resourceId: 'chronocrystal_raw', amount: 0.2 }, requiresResourceId: 'chronocrystal_raw', tier: 1, xpGain: 30 },
  { id: 'infra_forge', name: 'Forge', assetId: 'infra_forge', description: 'Refines Iron Ore.', cost: { 'steamwood_plank': 30 }, consumes: [{ resourceId: 'iron_ore', amount: 2 }], produces: { resourceId: 'iron_ingot', amount: 1 }, tier: 1, xpGain: 25, pollution: 2 },
  { id: 'infra_warehouse', name: 'Warehouse', assetId: 'infra_warehouse', description: 'Increases storage.', cost: { 'steamwood_plank': 25 }, tier: 1, addsStorage: { 'Raw': 500 }, xpGain: 15 },
  { id: 'infra_workshop', name: 'Workshop', assetId: 'infra_workshop', description: 'Increases storage.', cost: { 'steamwood_plank': 20, 'iron_ingot': 20 }, tier: 2, addsStorage: { 'Processed': 250, 'Component': 100 }, xpGain: 35, pollution: 1 },
  { id: 'infra_research_archive', name: 'Research Archive', assetId: 'infra_research_archive', description: 'Generates research points.', cost: { 'refined_chronocrystal': 20, 'steamwood_plank': 50 }, tier: 2, generatesResearchPoints: 0.5, xpGain: 50 },
];

export const UNITS: readonly UnitDefinition[] = [
    { id: 'automaton_worker', name: 'Automaton Worker', factionId: 'f1', hp: 50, atk: 5, defense: 5, role: 'Worker', assetId: 'unit_citizen_automaton', cost: { 'iron_ingot': 10 }, tier: 1 },
    { id: 'gearforged_soldier', name: 'Gear-Forged Soldier', factionId: 'f1', hp: 110, atk: 12, defense: 10, role: 'Melee', assetId: 'unit_soldier_gearforged', cost: { 'iron_ingot': 20, 'clockwork_gear': 5 }, tier: 1 },
    { id: 'clockwork_marksman', name: 'Clockwork Marksman', factionId: 'f1', hp: 70, atk: 15, defense: 0, role: 'Ranged', assetId: 'unit_archer_clockwork', cost: { 'steamwood_plank': 10, 'clockwork_gear': 8 }, tier: 1 },
    { id: 'steam_hulk', name: 'Steam Hulk', factionId: 'f1', hp: 250, atk: 25, defense: 20, role: 'Special', assetId: 'unit_golem_steam', cost: { 'iron_ingot': 50, 'athar_capacitor': 2 }, tier: 3 },
    { id: 'hero_cogwork', name: 'Hephaestus', factionId: 'f1', hp: 400, atk: 30, defense: 15, role: 'Hero', assetId: 'unit_hero_forgelord', cost: {}, tier: 0 },
    { id: 'warden_initiate', name: 'Warden Initiate', factionId: 'f2', hp: 60, atk: 8, defense: 0, role: 'Worker', assetId: 'unit_warden_initiate', cost: { 'steamwood_plank': 10 }, tier: 1 },
    { id: 'thorn_slinger', name: 'Thorn Slinger', factionId: 'f2', hp: 50, atk: 12, defense: 0, role: 'Ranged', assetId: 'unit_archer_thorn', cost: { 'steamwood_log': 15 }, tier: 1 },
    { id: 'grove_guardian', name: 'Grove Guardian', factionId: 'f2', hp: 200, atk: 18, defense: 25, role: 'Special', assetId: 'unit_golem_wood', cost: { 'steamwood_plank': 40, 'fluxbloom': 5 }, tier: 3 },
    { id: 'beast_tamer', name: 'Beast Tamer', factionId: 'f2', hp: 80, atk: 10, defense: 5, role: 'Support', assetId: 'unit_mage_beasttamer', cost: { 'steamwood_plank': 15, 'chronocrystal_raw': 5 }, tier: 2 },
    { id: 'hero_verdant', name: 'Cenarius', factionId: 'f2', hp: 350, atk: 25, defense: 20, role: 'Hero', assetId: 'unit_hero_elderwood', cost: {}, tier: 0 },
    // Simplified others for brevity, patterns repeat
    { id: 'sunfire_initiate', name: 'Sunfire Initiate', factionId: 'f3', hp: 55, atk: 9, defense: 0, role: 'Worker', assetId: 'unit_sunfire_initiate', cost: { 'steamwood_plank': 5 }, tier: 1 },
    { id: 'syndicate_lackey', name: 'Syndicate Lackey', factionId: 'f4', hp: 50, atk: 5, defense: 0, role: 'Worker', assetId: 'unit_syndicate_lackey', cost: { 'iron_ingot': 8 }, tier: 1 },
    { id: 'dwarf_miner', name: 'Dwarf Miner', factionId: 'f5', hp: 80, atk: 9, defense: 5, role: 'Worker', assetId: 'unit_dwarf_miner', cost: { 'iron_ingot': 5 }, tier: 1 },
    { id: 'elf_harvester', name: 'Elf Harvester', factionId: 'f6', hp: 50, atk: 6, defense: 0, role: 'Worker', assetId: 'unit_elf_harvester', cost: { 'steamwood_log': 5 }, tier: 1 },
    { id: 'skeleton_worker', name: 'Skeleton Worker', factionId: 'f7', hp: 40, atk: 5, defense: 0, role: 'Worker', assetId: 'unit_skeleton_worker', cost: {}, tier: 1 },
    { id: 'orc_peon', name: 'Orc Peon', factionId: 'f8', hp: 70, atk: 6, defense: 0, role: 'Worker', assetId: 'unit_orc_peon', cost: { 'iron_ore': 5 }, tier: 1 },
];

export const WORLD_EVENTS: readonly WorldEvent[] = Object.freeze([
    { id: 'fallen_airship', name: 'Fallen Airship', type: 'Discovery', assetId: 'discovery_fallen_airship', description: 'A colossal wreck.' },
    { id: 'flux_storm', name: 'Flux Storm', type: 'Hazard', assetId: 'hazard_flux_storm', description: 'A chaotic storm.' },
]);

export const UNIT_TRAITS: readonly UnitTrait[] = [];

export const BIOME_PASTEL_COLORS: Record<string, string> = {
    gloomwell: '#2c3e50',
    verdant: '#27ae60',
    wasteland: '#d35400',
    tundra: '#bdc3c7',
    ashlands: '#7f8c8d',
    atharium_wastes: '#8e44ad',
};

export const FACTION_COLOR_HEX_MAP: Record<string, string> = {
    'red-500': '#ef4444', 
    'green-500': '#22c55e', 
    'yellow-600': '#ca8a04',
    'violet-500': '#8b5cf6', 
    'blue-400': '#60a5fa', 
    'teal-400': '#2dd4bf',
    'gray-400': '#9ca3af', 
    'orange-500': '#f97316', 
    'gray-600': '#4b5563',
};

export const FACTION_COLOR_RGB_MAP: Record<string, string> = {
    'red-500': '239, 68, 68', 
    'green-500': '34, 197, 94', 
    'yellow-600': '202, 138, 4',
    'violet-500': '139, 92, 246', 
    'blue-400': '96, 165, 250', 
    'teal-400': '45, 212, 191',
    'gray-400': '156, 163, 175', 
    'orange-500': '249, 115, 22', 
    'gray-600': '75, 85, 99',
};

export const RARITY_COLORS: Record<Rarity, string> = {
    Common: 'text-gray-300', Uncommon: 'text-green-400', Rare: 'text-blue-400',
    Epic: 'text-purple-500', Legendary: 'text-orange-400',
};

export const FACTIONS_MAP = new Map(FACTIONS.map(f => [f.id, f]));
export const UNITS_MAP = new Map(UNITS.map(u => [u.id, u]));
export const BIOMES_MAP = new Map(BIOMES.map(b => [b.id, b]));
export const RESOURCES_MAP = new Map(RESOURCES.map(r => [r.id, r]));
export const INFRASTRUCTURE_MAP = new Map(INFRASTRUCTURE.map(i => [i.id, i]));
export const TRAITS_MAP = new Map(TRAITS.map(t => [t.id, t]));
export const UNIT_TRAITS_MAP = new Map(UNIT_TRAITS.map(t => [t.id, t]));
export const CHARACTERS_MAP = new Map(CHARACTERS.map(c => [c.id, c]));
export const WORLD_EVENTS_MAP = new Map(WORLD_EVENTS.map(e => [e.id, e]));
