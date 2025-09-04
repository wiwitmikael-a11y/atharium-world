
import type { Trait, Character, Faction, Biome, Resource, UnitDefinition, Infrastructure, TechNode, WorldEvent, UnitTrait, Epoch, ItemDefinition, Rarity } from './types';

export const WORLD_SIZE = 50;
export const TICK_PER_YEAR = 1000;
export const ATHAR_CAP = 1000000;
export const STARTING_YEAR = 1453;
export const XP_PER_LEVEL = 100;
export const STAT_INCREASE_PER_LEVEL = 0.10; // 10% bonus to HP and ATK per level
export const LEVEL_MILESTONES = [5, 10, 15, 20, 25, 30];

export const INFRA_HP_COST_MULTIPLIER = 10;
export const INFRA_RESOURCE_DROP_PERCENT = 0.25;

export const EPOCHS: readonly Epoch[] = [
  { id: 'era_of_awakening', name: 'Era of Awakening', synopsis: 'A time of nascent civilizations and untamed wilds. Factions are young, their ambitions just beginning to stir.' },
  { id: 'age_of_steam_sorcery', name: 'Age of Steam & Sorcery', synopsis: 'Invention and magic intertwine. Great cities rise, powered by steam and shielded by enchantments, but the world grows more perilous.' },
  { id: 'the_great_flux', name: 'The Great Flux', synopsis: 'A cataclysmic period where raw magic seeps into the world, twisting landscapes and birthing monstrous creatures. Survival is paramount.' },
  { id: 'epoch_of_the_cog_gods', name: 'Epoch of the Cog-Gods', synopsis: 'Order is forged from chaos. Mighty automatons and towering citadels dominate the land, but at the cost of the world\'s soul.' },
];

export const RESOURCE_SPAWN_CHANCES: Record<Resource['rarity'], number> = {
    Common: 0.1,
    Uncommon: 0.05,
    Rare: 0.02,
    Exotic: 0.005
};

export const RARITY_COLORS: Record<Rarity, string> = {
    Common: 'text-gray-300',
    Uncommon: 'text-green-400',
    Rare: 'text-blue-400',
    Epic: 'text-purple-500',
    Legendary: 'text-orange-400',
};

export const TRAITS: readonly Trait[] = [
  { id: 'brave', name: 'Brave', type: 'Good', description: 'Faces danger head-on, inspiring their troops.', effects: 'Unit Attack +5%' },
  { id: 'just', name: 'Just', type: 'Good', description: 'Known for fairness and integrity.', effects: 'Diplomacy Score +10' },
  { id: 'diligent', name: 'Diligent', type: 'Good', description: 'A tireless worker who pushes their people.', effects: 'Production Speed +10%' },
  { id: 'brilliant_strategist', name: 'Brilliant Strategist', type: 'Good', description: 'A master of tactics and logistics.', effects: 'Unit HP +10%' },
  { id: 'gregarious', name: 'Gregarious', type: 'Good', description: 'A charismatic and sociable leader.', effects: 'Population Growth +10%' },
  { id: 'scholar', name: 'Scholar', type: 'Good', description: 'Devotes their life to the pursuit of knowledge.', effects: 'Research Speed +15%' },
  { id: 'craven', name: 'Craven', type: 'Bad', description: 'Plagued by fear and hesitation.', effects: 'Unit Attack -5%' },
  { id: 'arbitrary', name: 'Arbitrary', type: 'Bad', description: 'Makes unpredictable decisions.', effects: 'Diplomacy Score -10' },
  { id: 'lazy', name: 'Lazy', type: 'Bad', description: 'Prefers leisure over labor.', effects: 'Production Speed -10%' },
  { id: 'paranoid', name: 'Paroid', type: 'Bad', description: 'Sees enemies in every shadow.', effects: 'Population Growth -10%' },
  { id: 'dull', name: 'Dull', type: 'Bad', description: 'Slow to grasp new concepts.', effects: 'Research Speed -15%' },
  { id: 'greedy', name: 'Greedy', type: 'Neutral', description: 'Desires wealth above all else.', effects: 'Resource Yield +10%, Diplomacy Score -5' },
  { id: 'ambitious', name: 'Ambitious', type: 'Neutral', description: 'Strives for power and greatness.', effects: 'Research Speed +5%, Diplomacy Score -5' },
];

export const CHARACTERS: readonly Character[] = [
  { id: 'char_hephaestus', name: 'Hephaestus', age: 87, traitIds: ['diligent', 'brilliant_strategist'], skills: { martial: 12, diplomacy: 4, stewardship: 18, intrigue: 6, learning: 15 } },
  { id: 'char_cenarius', name: 'Cenarius', age: 450, traitIds: ['just', 'scholar'], skills: { martial: 8, diplomacy: 15, stewardship: 14, intrigue: 5, learning: 19 } },
  { id: 'char_solara', name: 'Solara', age: 34, traitIds: ['gregarious', 'ambitious'], skills: { martial: 10, diplomacy: 18, stewardship: 9, intrigue: 11, learning: 16 } },
  { id: 'char_corvus', name: 'Corvus', age: 52, traitIds: ['paranoid', 'greedy'], skills: { martial: 7, diplomacy: 11, stewardship: 16, intrigue: 22, learning: 13 } },
  { id: 'char_thorgrim', name: 'Thorgrim Stonehand', age: 153, traitIds: ['brave', 'diligent'], skills: { martial: 16, diplomacy: 8, stewardship: 17, intrigue: 4, learning: 9 } },
  { id: 'char_lyra', name: 'Lyra Whisperwind', age: 211, traitIds: ['brilliant_strategist', 'gregarious'], skills: { martial: 14, diplomacy: 16, stewardship: 11, intrigue: 12, learning: 14 } },
  { id: 'char_malakor', name: 'Malakor the Lich', age: 999, traitIds: ['scholar', 'paranoid'], skills: { martial: 11, diplomacy: 2, stewardship: 13, intrigue: 18, learning: 25 } },
  { id: 'char_grommash', name: 'Grommash Bloodfist', age: 41, traitIds: ['brave', 'ambitious'], skills: { martial: 24, diplomacy: 1, stewardship: 6, intrigue: 7, learning: 3 } },
];

export const FACTIONS: readonly Faction[] = [
  { id: 'f1', name: 'The Cogwork Compact', color: 'red-500', archetype: 'Industrial', traits: [{ name: 'Industrious', description: 'Infrastructure and automaton workers are 15% cheaper to build.', effects: [{ type: 'INFRASTRUCTURE_COST_MOD', value: -0.15 }, { type: 'UNIT_COST_MOD', unitRole: 'Worker', value: -0.15 }] }], preferredBiomes: ['ashlands', 'wasteland'], personality: { aggression: 6, expansion: 8, diplomacy: 2 }, techTreeId: 'cogwork_tech' },
  { id: 'f2', name: 'The Verdant Wardens', color: 'green-500', archetype: 'Nature', traits: [{ name: 'Attuned', description: 'Generates 15% more from raw resource deposits.', effects: [{ type: 'PRODUCTION_MOD', resourceTier: 'Raw', value: 0.15 }] }], preferredBiomes: ['verdant', 'gloomwell'], personality: { aggression: 3, expansion: 6, diplomacy: 7 }, techTreeId: 'verdant_tech' },
  { id: 'f3', name: 'The Sunfire Dynasty', color: 'yellow-600', archetype: 'Holy', traits: [{ name: 'Devout', description: 'Population grows 10% faster and their mages (Skirmishers) deal 10% more damage.', effects: [{ type: 'POP_GROWTH_MOD', value: 0.1 }, { type: 'UNIT_STAT_MOD', stat: 'atk', unitRole: 'Skirmisher', value: 0.1 }] }], preferredBiomes: ['verdant', 'tundra'], personality: { aggression: 7, expansion: 7, diplomacy: 4 }, techTreeId: 'sunfire_tech' },
  { id: 'f4', name: 'The Gloom Syndicate', color: 'violet-500', archetype: 'Shadow', traits: [{ name: 'Shadowy', description: 'Specialists in subterfuge, they produce processed goods 10% more efficiently.', effects: [{ type: 'PRODUCTION_MOD', resourceTier: 'Processed', value: 0.1 }] }], preferredBiomes: ['gloomwell', 'atharium_wastes'], personality: { aggression: 5, expansion: 4, diplomacy: 8 }, techTreeId: 'gloom_tech' },
  { id: 'f5', name: 'Ironclad Dwarves', color: 'blue-400', archetype: 'Mountain', traits: [{ name: 'Master Smiths', description: 'Their expert craftsmanship grants all units +20% base HP.', effects: [{ type: 'UNIT_STAT_MOD', stat: 'hp', value: 0.2 }] }], preferredBiomes: ['ashlands', 'tundra'], personality: { aggression: 5, expansion: 5, diplomacy: 5 }, techTreeId: 'dwarf_tech' },
  { id: 'f6', name: 'Sylvan Elves', color: 'teal-400', archetype: 'Nature', traits: [{ name: 'Woodland Archers', description: 'Their ranged units (Skirmishers) are exceptionally skilled, dealing 15% more damage.', effects: [{ type: 'UNIT_STAT_MOD', stat: 'atk', unitRole: 'Skirmisher', value: 0.15 }] }], preferredBiomes: ['gloomwell', 'verdant'], personality: { aggression: 4, expansion: 3, diplomacy: 9 }, techTreeId: 'elf_tech' },
  { id: 'f7', name: 'Dread Legion', color: 'gray-400', archetype: 'Undead', traits: [{ name: 'Undying Host', description: 'Their units are 15% cheaper but have 10% less HP.', effects: [{ type: 'UNIT_COST_MOD', value: -0.15 }, { type: 'UNIT_STAT_MOD', stat: 'hp', value: -0.10 }] }], preferredBiomes: ['wasteland', 'gloomwell'], personality: { aggression: 9, expansion: 9, diplomacy: 1 }, techTreeId: 'undead_tech' },
  { id: 'f8', name: 'Crimson Horde', color: 'orange-500', archetype: 'Nomadic', traits: [{ name: 'WAAAGH!', description: 'Their infantry units are filled with battle rage, dealing 10% more damage.', effects: [{ type: 'UNIT_STAT_MOD', stat: 'atk', unitRole: 'Infantry', value: 0.1 }] }], preferredBiomes: ['wasteland', 'ashlands'], personality: { aggression: 10, expansion: 7, diplomacy: 0 }, techTreeId: 'horde_tech' },
  { id: 'neutral_hostile', name: 'Wildlands Creatures', color: 'gray-600', archetype: 'Nomadic', traits: [{ name: 'Feral', description: 'Unpredictable and aggressive, these creatures deal 10% more damage.', effects: [{ type: 'UNIT_STAT_MOD', stat: 'atk', value: 0.1 }] }], preferredBiomes: [], personality: { aggression: 10, expansion: 0, diplomacy: 0 }, techTreeId: '' },
];

export const BIOMES: readonly Biome[] = [
    { id: 'gloomwell', name: 'Gloomwell Forest', moveCost: 2, terrainEffects: [
        { description: 'Guerilla Tactics (Nature): +15% ATK, +15% DEF', appliesTo: { factionArchetype: 'Nature' }, effects: [{ stat: 'atk', modifier: 0.15 }, { stat: 'def', modifier: 0.15 }] },
        { description: 'Obstructed Machinery (Industrial): -10% DEF', appliesTo: { factionArchetype: 'Industrial' }, effects: [{ stat: 'def', modifier: -0.1 }] },
    ] },
    { id: 'verdant', name: 'Verdant Plains', moveCost: 1, terrainEffects: [
        { description: 'Home Ground (Nature): +10% DEF', appliesTo: { factionArchetype: 'Nature' }, effects: [{ stat: 'def', modifier: 0.1 }] },
    ] },
    { id: 'wasteland', name: 'Cracked Wasteland', moveCost: 1.2, terrainEffects: [
        { description: 'Raider\'s Advantage (Nomadic): +10% ATK', appliesTo: { factionArchetype: 'Nomadic' }, effects: [{ stat: 'atk', modifier: 0.1 }] },
        { description: 'Withering Environment (Nature): -10% ATK', appliesTo: { factionArchetype: 'Nature' }, effects: [{ stat: 'atk', modifier: -0.1 }] },
    ] },
    { id: 'tundra', name: 'Frostbitten Tundra', moveCost: 1.5, terrainEffects: [
        { description: 'Acclimated (Mountain): +5% DEF', appliesTo: { factionArchetype: 'Mountain' }, effects: [{ stat: 'def', modifier: 0.05 }] },
    ] },
    { id: 'ashlands', name: 'Ashen Caldera', moveCost: 2.5, terrainEffects: [
        { description: 'Volcanic Fortitude (Mountain): +20% DEF', appliesTo: { factionArchetype: 'Mountain' }, effects: [{ stat: 'def', modifier: 0.2 }] },
        { description: 'Heat-Treated Armor (Industrial): +10% DEF', appliesTo: { factionArchetype: 'Industrial' }, effects: [{ stat: 'def', modifier: 0.1 }] },
        { description: 'Scorched Earth (Nature): -15% ATK', appliesTo: { factionArchetype: 'Nature' }, effects: [{ stat: 'atk', modifier: -0.15 }] },
    ] },
    { id: 'atharium_wastes', name: 'Atharium Wastes', moveCost: 1.8, terrainEffects: [
        { description: 'Unholy Ground (Undead): +15% DEF', appliesTo: { factionArchetype: 'Undead' }, effects: [{ stat: 'def', modifier: 0.15 }] },
        { description: 'Corrupting Influence (Holy): -10% DEF', appliesTo: { factionArchetype: 'Holy' }, effects: [{ stat: 'def', modifier: -0.1 }] },
    ] },
];

export const BIOME_PASTEL_COLORS: Record<string, string> = {
    gloomwell: '#8E9EAB',
    verdant: '#B2CDB3',
    wasteland: '#E0C9A6',
    tundra: '#D6E2E9',
    ashlands: '#A39D9D',
    atharium_wastes: '#B5A8C7',
};

export const WORLD_EVENTS: readonly WorldEvent[] = [
    { id: 'fallen_airship', name: 'Fallen Airship', type: 'Discovery', assetId: 'discovery_fallen_airship', description: 'A colossal wreck of a forgotten sky leviathan, ripe for salvage.' },
    { id: 'ancient_automaton', name: 'Ancient Automaton', type: 'Discovery', assetId: 'discovery_ancient_automaton', description: 'A dormant war machine from a bygone era, its core still faintly glowing.' },
    { id: 'reality_tear', name: 'Reality Tear', type: 'Discovery', assetId: 'discovery_reality_tear', description: 'A shimmering, unstable fissure in the fabric of the world.' },
    { id: 'dragons_maw', name: 'Dragon\'s Maw', type: 'Relic', assetId: 'relic_dragons_maw', description: 'A cavernous opening that pulses with geothermal energy.' },
    { id: 'eye_of_the_watcher', name: 'Eye of the Watcher', type: 'Relic', assetId: 'relic_eye_of_the_watcher', description: 'An ancient monolith that seems to follow your every move.' },
    { id: 'flux_storm', name: 'Flux Storm', type: 'Hazard', assetId: 'hazard_flux_storm', description: 'A chaotic storm of raw magic rips across the landscape.' },
];

export const RESOURCES: readonly Resource[] = [
    { id: 'iron_ore', name: 'Iron Ore', tier: 'Raw', biomes: ['ashlands', 'wasteland'], assetId: 'resource_iron_ore', rarity: 'Common', respawnTime: TICK_PER_YEAR * 10 },
    { id: 'steamwood_log', name: 'Steamwood Log', tier: 'Raw', biomes: ['verdant', 'gloomwell'], assetId: 'resource_steamwood_tree', rarity: 'Common', respawnTime: TICK_PER_YEAR * 5 },
    { id: 'chronocrystal_raw', name: 'Raw Chrono-Crystal', tier: 'Raw', biomes: ['atharium_wastes', 'tundra'], assetId: 'resource_chronocrystal', rarity: 'Uncommon', respawnTime: TICK_PER_YEAR * 20 },
    { id: 'fluxbloom', name: 'Fluxbloom', tier: 'Raw', biomes: ['gloomwell', 'atharium_wastes'], assetId: 'resource_fluxbloom', rarity: 'Uncommon', respawnTime: TICK_PER_YEAR * 3 },
    { id: 'dragon_scale', name: 'Dragon Scale', tier: 'Exotic', biomes: ['ashlands'], assetId: 'resource_dragon_scale', rarity: 'Exotic' },
    { id: 'heartstone', name: 'Heartstone', tier: 'Exotic', biomes: ['gloomwell'], assetId: 'resource_heartstone', rarity: 'Rare' },
    { id: 'iron_ingot', name: 'Iron Ingot', tier: 'Processed', assetId: 'resource_iron_ingot', rarity: 'Common' },
    { id: 'steamwood_plank', name: 'Steamwood Plank', tier: 'Processed', assetId: 'resource_steamwood_plank', rarity: 'Common' },
    { id: 'refined_chronocrystal', name: 'Refined Chrono-Crystal', tier: 'Processed', assetId: 'resource_refined_chronocrystal', rarity: 'Uncommon' },
    { id: 'clockwork_gear', name: 'Clockwork Gear', tier: 'Component', assetId: 'resource_clockwork_gear', rarity: 'Common' },
    { id: 'athar_capacitor', name: 'Athar Capacitor', tier: 'Component', assetId: 'resource_athar_capacitor', rarity: 'Uncommon' },
];

export const INFRASTRUCTURE: readonly Infrastructure[] = [
  { id: 'settlement_hamlet', name: 'Hamlet', assetId: 'infra_settlement_hamlet', description: 'A small settlement, the heart of a burgeoning faction.', cost: {}, tier: 1, populationCapacity: 100, upgradesTo: 'settlement_town', upgradeCost: { 'steamwood_plank': 100, 'iron_ingot': 100 }, addsStorage: { 'Raw': 200, 'Processed': 100, 'Component': 50, 'Exotic': 10 }, multiTile: { width: 2, height: 2 }, },
  { id: 'settlement_town', name: 'Town', assetId: 'infra_settlement_town', description: 'A growing town capable of supporting a larger population and more advanced units.', cost: {}, tier: 2, populationCapacity: 500, upgradeCost: { 'steamwood_plank': 500, 'iron_ingot': 500, 'refined_chronocrystal': 100 }, addsStorage: { 'Raw': 1000, 'Processed': 500, 'Component': 250, 'Exotic': 50 }, multiTile: { width: 2, height: 2 }, },
  ...(['industrial', 'nature', 'holy', 'shadow', 'mountain', 'undead', 'nomadic', 'elf'].map(type => ({ id: `settlement_city_${type}`, name: `${type.charAt(0).toUpperCase() + type.slice(1)} City`, assetId: `infra_settlement_city_${type}`, description: 'A regional capital, projecting the faction\'s power and culture.', cost: {}, tier: 3, populationCapacity: 2500, addsStorage: { 'Raw': 5000, 'Processed': 2500, 'Component': 1000, 'Exotic': 250 }, upgradeCost: { 'steamwood_plank': 2000, 'iron_ingot': 2000, 'refined_chronocrystal': 500, 'athar_capacitor': 100 }, multiTile: { width: 2, height: 2 }, })) as Infrastructure[]),
  ...(['industrial', 'nature', 'holy', 'shadow', 'mountain', 'undead', 'nomadic', 'elf'].map(type => ({ id: `settlement_metropolis_${type}`, name: `${type.charAt(0).toUpperCase() + type.slice(1)} Metropolis`, assetId: `infra_settlement_metropolis_${type}`, description: 'The pinnacle of a civilization, a wonder of the world.', cost: {}, tier: 4, populationCapacity: 10000, addsStorage: { 'Raw': 20000, 'Processed': 10000, 'Component': 5000, 'Exotic': 1000 }, multiTile: { width: 2, height: 2 }, })) as Infrastructure[]),
  { id: 'iron_mine', name: 'Iron Mine', assetId: 'infra_mine', description: 'Extracts Iron Ore from a deposit.', cost: { 'steamwood_plank': 20 }, produces: { resourceId: 'iron_ore', amount: 0.5 }, requiresResourceId: 'iron_ore', tier: 1, xpGain: 15 },
  { id: 'lumber_camp', name: 'Lumber Camp', assetId: 'infra_lumber_camp', description: 'Harvests logs from Steamwood trees.', cost: { 'iron_ingot': 10 }, produces: { resourceId: 'steamwood_log', amount: 0.5 }, requiresResourceId: 'steamwood_log', tier: 1, xpGain: 15 },
  { id: 'crystal_harvester', name: 'Crystal Harvester', assetId: 'infra_crystal_harvester', description: 'Extracts raw Chrono-Crystals.', cost: { 'steamwood_plank': 15, 'iron_ingot': 15 }, produces: { resourceId: 'chronocrystal_raw', amount: 0.2 }, requiresResourceId: 'chronocrystal_raw', tier: 1, xpGain: 20 },
  { id: 'infra_forge', name: 'Forge', assetId: 'infra_forge', description: 'Refines 2 Iron Ore into 1 Iron Ingot.', cost: { 'steamwood_plank': 30 }, consumes: [{ resourceId: 'iron_ore', amount: 2 }], produces: { resourceId: 'iron_ingot', amount: 1 }, tier: 1, xpGain: 25 },
  { id: 'infra_warehouse', name: 'Warehouse', assetId: 'infra_warehouse', description: 'Increases storage capacity for Raw materials by 500.', cost: { 'steamwood_plank': 25 }, tier: 1, addsStorage: { 'Raw': 500 }, xpGain: 10 },
  { id: 'infra_workshop', name: 'Workshop', assetId: 'infra_workshop', description: 'Increases storage for Processed goods and Components.', cost: { 'steamwood_plank': 20, 'iron_ingot': 20 }, tier: 2, addsStorage: { 'Processed': 250, 'Component': 100 }, xpGain: 20 },
  { id: 'infra_sawmill', name: 'Sawmill', assetId: 'infra_sawmill', description: "Processes 2 Steamwood Logs into 1 Steamwood Plank. A noisy, vital part of any settlement's growth.", cost: { 'iron_ingot': 25 }, consumes: [{ resourceId: 'steamwood_log', amount: 2 }], produces: { resourceId: 'steamwood_plank', amount: 1 }, tier: 1, xpGain: 25 },
  { id: 'infra_gear_assembly', name: 'Gear Assembly', assetId: 'infra_gear_assembly', description: "Assembles 2 Iron Ingots and 1 Steamwood Plank into 1 Clockwork Gear. The heart of any industrial war machine.", cost: { 'steamwood_plank': 30, 'iron_ingot': 30 }, consumes: [{ resourceId: 'iron_ingot', amount: 2 }, { resourceId: 'steamwood_plank', amount: 1 }], produces: { resourceId: 'clockwork_gear', amount: 1 }, tier: 2, xpGain: 35 },
  { id: 'infra_capacitor_foundry', name: 'Capacitor Foundry', assetId: 'infra_capacitor_foundry', description: "Fuses 2 Iron Ingots with 1 Refined Chrono-Crystal to create an Athar Capacitor, a device capable of storing immense energy.", cost: { 'steamwood_plank': 50, 'iron_ingot': 50 }, consumes: [{ resourceId: 'iron_ingot', amount: 2 }, { resourceId: 'refined_chronocrystal', amount: 1 }], produces: { resourceId: 'athar_capacitor', amount: 1 }, tier: 2, xpGain: 40 },
  { id: 'infra_research_archive', name: 'Research Archive', assetId: 'infra_research_archive', description: 'Generates 0.5 research points per tick.', cost: { 'refined_chronocrystal': 20, 'steamwood_plank': 50 }, tier: 2, generatesResearchPoints: 0.5, xpGain: 50 },
  { id: 'infra_arcane_enchanter', name: 'Arcane Enchanter', assetId: 'infra_arcane_enchanter', description: 'Purifies 2 raw Chrono-Crystals into 1 Refined Chrono-Crystal, contributing to the world\'s overall magical and technological advancement ($ATHAR Minted).', cost: { 'steamwood_plank': 40, 'iron_ingot': 40 }, consumes: [{ resourceId: 'chronocrystal_raw', amount: 2 }], produces: { resourceId: 'refined_chronocrystal', amount: 1 }, tier: 2, xpGain: 30 },
];

export const UNIT_TRAITS: readonly UnitTrait[] = [
    { id: 'armored', name: 'Armored', description: 'Reduces incoming physical damage by 20%.', effects: [{ type: 'DAMAGE_REDUCTION_PERCENT', value: 0.2 }] },
    { id: 'siege_weapon', name: 'Siege Weapon', description: 'Deals 50% bonus damage to Armored units.', effects: [{ type: 'BONUS_ATTACK_VS_TRAIT', traitId: 'armored', value: 0.5 }] },
    { id: 'feral_strength', name: 'Feral Strength', description: '10% chance to deal a critical hit for 200% damage.', effects: [{ type: 'CRITICAL_CHANCE', chance: 0.1, multiplier: 2.0 }] },
    { id: 'undying', name: 'Undying', description: 'Slowly regenerates health over time.', effects: [{ type: 'HP_REGEN', value: 0.1 }] },
    { id: 'long_range', name: 'Long Range', description: '50% chance to attack before the enemy retaliates.', effects: [{ type: 'FIRST_STRIKE', chance: 0.5 }] },
];

// This is where the magic happens. A huge list of items.
export const ITEMS: readonly ItemDefinition[] = [
    // WEAPONS
    // Common
    { id: 'rusty_shortsword', name: 'Rusty Shortsword', rarity: 'Common', slot: 'Weapon', description: 'A pitted and dull shortsword. Better than nothing.', effects: [{ type: 'ATTACK_FLAT', value: 2 }] },
    { id: 'chipped_axe', name: 'Chipped Axe', rarity: 'Common', slot: 'Weapon', description: 'An axe that has seen better days. The blade is notched.', effects: [{ type: 'ATTACK_FLAT', value: 3 }] },
    { id: 'splintered_shortbow', name: 'Splintered Shortbow', rarity: 'Common', slot: 'Weapon', description: 'A simple wooden bow, bound with leather straps to keep it from breaking.', effects: [{ type: 'ATTACK_FLAT', value: 2 }] },
    { id: 'gnarled_staff', name: 'Gnarled Staff', rarity: 'Common', slot: 'Weapon', description: 'A twisted piece of wood that can be used for hitting things, or perhaps focusing minor magics.', effects: [{ type: 'ATTACK_FLAT', value: 1 }, {type: 'HP_FLAT', value: 5}] },
    // Uncommon
    { id: 'steel_longsword', name: 'Steel Longsword', rarity: 'Uncommon', slot: 'Weapon', description: 'A well-balanced and reliable steel sword.', effects: [{ type: 'ATTACK_FLAT', value: 5 }] },
    { id: 'iron_warhammer', name: 'Iron Warhammer', rarity: 'Uncommon', slot: 'Weapon', description: 'A heavy hammer capable of denting armor.', effects: [{ type: 'ATTACK_FLAT', value: 6 }, { type: 'BONUS_DMG_VS_SIEGE', value: 0.1 }] },
    { id: 'elven_yew_bow', name: 'Elven Yew Bow', rarity: 'Uncommon', slot: 'Weapon', description: 'A finely crafted bow of yew, light and accurate.', effects: [{ type: 'ATTACK_FLAT', value: 4 }, { type: 'FIRST_STRIKE_CHANCE', value: 0.1 }] },
    { id: 'apprentice_wand', name: 'Apprentice\'s Wand', rarity: 'Uncommon', slot: 'Weapon', description: 'A simple wand carved with runes of power, it hums with a faint energy.', effects: [{ type: 'ATTACK_PERCENT', value: 0.10 }] },
    { id: 'orcish_cleaver', name: 'Orcish Cleaver', rarity: 'Uncommon', slot: 'Weapon', description: 'A brutally effective weapon, designed to hack and chop.', effects: [{ type: 'ATTACK_FLAT', value: 7 }] },
    // Rare
    { id: 'dwarven_runic_axe', name: 'Dwarven Runic Axe', rarity: 'Rare', slot: 'Weapon', description: 'A masterfully forged axe with runes of power that glow faintly in battle.', effects: [{ type: 'ATTACK_FLAT', value: 10 }, { type: 'DEFENSE_FLAT', value: 5 }] },
    { id: 'cogwork_repeater_crossbow', name: 'Cogwork Repeater Crossbow', rarity: 'Rare', slot: 'Weapon', description: 'A complex steampunk crossbow capable of firing bolts in rapid succession.', effects: [{ type: 'ATTACK_FLAT', value: 8 }, { type: 'FIRST_STRIKE_CHANCE', value: 0.25 }] },
    { id: 'sunfire_battlemace', name: 'Sunfire Battlemace', rarity: 'Rare', slot: 'Weapon', description: 'A mace that seems to glow with an inner light, searing foes on impact.', effects: [{ type: 'ATTACK_FLAT', value: 9 }, { type: 'BONUS_DMG_VS_INFANTRY', value: 0.15 }] },
    { id: 'shadow_stiletto', name: 'Shadow Stiletto', rarity: 'Rare', slot: 'Weapon', description: 'A thin, dark blade that seems to drink the light around it.', effects: [{ type: 'ATTACK_PERCENT', value: 0.15 }, {type: 'FIRST_STRIKE_CHANCE', value: 0.3 }] },
    // Epic
    { id: 'archmages_staff_of_power', name: 'Archmage\'s Staff of Power', rarity: 'Epic', slot: 'Weapon', description: 'A staff brimming with raw magical energy, topped with a flawless, floating Chrono-Crystal.', effects: [{ type: 'ATTACK_PERCENT', value: 0.25 }, { type: 'HP_FLAT', value: 25 }] },
    { id: 'blade_of_the_verdant_warden', name: 'Blade of the Verdant Warden', rarity: 'Epic', slot: 'Weapon', description: 'A living sword of woven wood and thorns. It slowly heals its wielder.', effects: [{ type: 'ATTACK_FLAT', value: 15 }, { type: 'HP_REGEN', value: 1.0 }] },
    { id: 'gromril_war-axe', name: 'Gromril War-Axe', rarity: 'Epic', slot: 'Weapon', description: 'An axe forged from near-indestructible Gromril, with a perfectly balanced, devastating head.', effects: [{ type: 'ATTACK_FLAT', value: 20 }, { type: 'BONUS_DMG_VS_SIEGE', value: 0.25 }] },
    // Legendary
    { id: 'forgelords_hammer', name: 'Forge-Lord\'s Hammer, "World-Forger"', rarity: 'Legendary', slot: 'Weapon', description: 'The personal hammer of Hephaestus, said to have shaped the first automatons. It strikes with the force of a falling star.', effects: [{ type: 'ATTACK_FLAT', value: 30 }, { type: 'ATTACK_PERCENT', value: 0.20 }, { type: 'BONUS_DMG_VS_SIEGE', value: 0.5 }] },
    { id: 'grommashs_gorehowl', name: 'Grommash\'s "Gorehowl"', rarity: 'Legendary', slot: 'Weapon', description: 'A legendary axe that howls for blood in the heat of battle. Its thirst is never slaked.', effects: [{ type: 'ATTACK_FLAT', value: 40 }, { type: 'BONUS_DMG_VS_INFANTRY', value: 0.3 }] },

    // ARMOR
    // Common
    { id: 'leather_jerkin', name: 'Leather Jerkin', rarity: 'Common', slot: 'Armor', description: 'Padded leather armor. Offers minimal protection.', effects: [{ type: 'HP_FLAT', value: 10 }, { type: 'DEFENSE_FLAT', value: 3 }] },
    { id: 'tattered_robes', name: 'Tattered Robes', rarity: 'Common', slot: 'Armor', description: 'Simple cloth robes, offering little more than modesty.', effects: [{ type: 'HP_FLAT', value: 5 }, { type: 'DEFENSE_FLAT', value: 1 }] },
    // Uncommon
    { id: 'chainmail_hauberk', name: 'Chainmail Hauberk', rarity: 'Uncommon', slot: 'Armor', description: 'A shirt of interlocking iron rings. Good against slashing attacks.', effects: [{ type: 'HP_FLAT', value: 20 }, { type: 'DEFENSE_FLAT', value: 8 }] },
    { id: 'hardened_leather_armor', name: 'Hardened Leather Armor', rarity: 'Uncommon', slot: 'Armor', description: 'Leather that has been boiled and treated to provide decent protection.', effects: [{ type: 'HP_FLAT', value: 15 }, { type: 'DEFENSE_FLAT', value: 6 }] },
    { id: 'acolyte_robes', name: 'Acolyte Robes', rarity: 'Uncommon', slot: 'Armor', description: 'Robes enchanted with minor protective wards.', effects: [{ type: 'HP_FLAT', value: 10 }, { type: 'DEFENSE_PERCENT', value: 0.05 }] },
    // Rare
    { id: 'steel_plate_armor', name: 'Steel Plate Armor', rarity: 'Rare', slot: 'Armor', description: 'Full plate armor made of fine steel. Offers excellent protection at the cost of mobility.', effects: [{ type: 'HP_FLAT', value: 40 }, { type: 'DEFENSE_FLAT', value: 15 }] },
    { id: 'elven_leaf-weave_armor', name: 'Elven Leaf-Weave Armor', rarity: 'Rare', slot: 'Armor', description: 'Magically woven leaves that are as strong as leather but light as silk.', effects: [{ type: 'HP_FLAT', value: 25 }, { type: 'DEFENSE_PERCENT', value: 0.10 }] },
    { id: 'cogwork_carapace', name: 'Cogwork Carapace', rarity: 'Rare', slot: 'Armor', description: 'Reinforced brass plating with internal clockwork mechanisms that aid movement.', effects: [{ type: 'HP_PERCENT', value: 0.10 }, { type: 'DEFENSE_FLAT', value: 12 }] },
    // Epic
    { id: 'dwarven_gromril_platemail', name: 'Dwarven Gromril Platemail', rarity: 'Epic', slot: 'Armor', description: 'The pinnacle of dwarven smithing. Nearly impervious to conventional weapons.', effects: [{ type: 'HP_FLAT', value: 75 }, { type: 'DEFENSE_PERCENT', value: 0.20 }] },
    { id: 'robes_of_the_shadow_weave', name: 'Robes of the Shadow Weave', rarity: 'Epic', slot: 'Armor', description: 'Robes spun from pure shadow. The wearer is difficult to see and strike.', effects: [{ type: 'HP_FLAT', value: 40 }, { type: 'DEFENSE_PERCENT', value: 0.15 }, { type: 'FIRST_STRIKE_CHANCE', value: 0.1 }] },
    // Legendary
    { id: 'bulwark_of_the_mountain_king', name: 'Bulwark of the Mountain King', rarity: 'Legendary', slot: 'Armor', description: 'The personal armor of Thorgrim Stonehand. It is said to be unbreakable.', effects: [{ type: 'HP_PERCENT', value: 0.25 }, { type: 'DEFENSE_PERCENT', value: 0.30 }] },

    // ACCESSORIES
    // Common
    { id: 'lucky_charm', name: 'Lucky Charm', rarity: 'Common', slot: 'Accessory', description: 'A small, crudely carved wooden charm.', effects: [{ type: 'HP_FLAT', value: 5 }] },
    { id: 'iron_ring', name: 'Iron Ring', rarity: 'Common', slot: 'Accessory', description: 'A simple ring of cold iron.', effects: [{ type: 'DEFENSE_FLAT', value: 1 }] },
    // Uncommon
    { id: 'ring_of_vigor', name: 'Ring of Vigor', rarity: 'Uncommon', slot: 'Accessory', description: 'A simple ring that seems to warm the wearer.', effects: [{ type: 'HP_FLAT', value: 15 }] },
    { id: 'amulet_of_the_marksman', name: 'Amulet of the Marksman', rarity: 'Uncommon', slot: 'Accessory', description: 'Helps the wearer aim true.', effects: [{ type: 'ATTACK_FLAT', value: 2 }] },
    { id: 'troll-hide_bracers', name: 'Troll-hide Bracers', rarity: 'Uncommon', slot: 'Accessory', description: 'These tough bracers slowly mend themselves... and their wearer.', effects: [{ type: 'HP_REGEN', value: 0.2 }] },
    // Rare
    { id: 'clockwork_targeting_system', name: 'Clockwork Targeting System', rarity: 'Rare', slot: 'Accessory', description: 'A complex series of lenses and gears that helps identify weak points in enemies.', effects: [{ type: 'ATTACK_PERCENT', value: 0.10 }, {type: 'BONUS_DMG_VS_SKIRMISHER', value: 0.2}] },
    { id: 'heartstone_pendant', name: 'Heartstone Pendant', rarity: 'Rare', slot: 'Accessory', description: 'A fragment of a Heartstone that beats with a slow, steady rhythm, bolstering the life force of the wearer.', effects: [{ type: 'HP_PERCENT', value: 0.15 }] },
    { id: 'ring_of_regeneration', name: 'Ring of Regeneration', rarity: 'Rare', slot: 'Accessory', description: 'A magical ring that constantly works to close the wearer\'s wounds.', effects: [{ type: 'HP_REGEN', value: 0.5 }] },
    // Epic
    { id: 'eye_of_the_watcher_shard', name: 'Eye of the Watcher Shard', rarity: 'Epic', slot: 'Accessory', description: 'A shard from the great monolith. It grants its wearer a fraction of its precognitive abilities.', effects: [{ type: 'DEFENSE_PERCENT', value: 0.10 }, { type: 'FIRST_STRIKE_CHANCE', value: 0.33 }] },
    { id: 'dragonscale_shield', name: 'Dragonscale Shield', rarity: 'Epic', slot: 'Accessory', description: 'A shield crafted from a single, massive dragon scale. It is incredibly light and nearly indestructible.', effects: [{ type: 'HP_FLAT', value: 50 }, { type: 'DEFENSE_PERCENT', value: 0.15 }] },
    // Legendary
    { id: 'crown_of_the_lich_lord', name: 'Crown of the Lich Lord', rarity: 'Legendary', slot: 'Accessory', description: 'Malakor\'s crown, which holds a fragment of his vast intellect and power.', effects: [{ type: 'ATTACK_PERCENT', value: 0.20 }, { type: 'HP_PERCENT', value: 0.20 }] },

    // ITEMS (Non-equipment)
    { id: 'item_ancient_cog', name: 'Ancient Cog', rarity: 'Uncommon', slot: 'None', description: 'A perfectly preserved gear from a forgotten automaton. It hums with latent energy.', effects: [] },
    { id: 'item_dragon_heartscale', name: 'Dragon Heartscale', rarity: 'Epic', slot: 'None', description: "A scale taken from near a dragon's heart. It is incredibly durable and warm to the touch.", effects: [] },
    { id: 'item_flux_in_a_bottle', name: 'Flux-in-a-Bottle', rarity: 'Rare', slot: 'None', description: 'A swirling vortex of raw magic contained in a reinforced vial. Highly unstable.', effects: [] },
    { id: 'item_map_to_nowhere', name: 'Map to Nowhere', rarity: 'Common', slot: 'None', description: 'An ancient, incomplete map that seems to change every time you look away.', effects: [] },
];

export const UNITS: readonly UnitDefinition[] = [
    // Faction 1: The Cogwork Compact
    { id: 'automaton_worker', name: 'Automaton Worker', factionId: 'f1', hp: 50, atk: 5, defense: 5, role: 'Worker', assetId: 'unit_citizen_automaton', cost: { 'iron_ingot': 10 }, tier: 1 },
    { id: 'gearforged_soldier', name: 'Gear-Forged Soldier', factionId: 'f1', hp: 110, atk: 12, defense: 10, role: 'Infantry', assetId: 'unit_soldier_gearforged', cost: { 'iron_ingot': 20, 'clockwork_gear': 5 }, tier: 1, traitIds: ['armored'] },
    { id: 'clockwork_marksman', name: 'Clockwork Marksman', factionId: 'f1', hp: 70, atk: 15, defense: 0, role: 'Skirmisher', assetId: 'unit_archer_clockwork', cost: { 'steamwood_plank': 10, 'clockwork_gear': 8 }, tier: 1, traitIds: ['long_range'] },
    { id: 'steam_hulk', name: 'Steam Hulk', factionId: 'f1', hp: 250, atk: 25, defense: 20, role: 'Siege', assetId: 'unit_golem_steam', cost: { 'iron_ingot': 50, 'athar_capacitor': 2 }, tier: 3, traitIds: ['armored', 'siege_weapon'] },
    { id: 'hero_cogwork', name: 'Hephaestus, the Forge-Lord', factionId: 'f1', hp: 400, atk: 30, defense: 15, role: 'Hero', assetId: 'unit_hero_forgelord', cost: {}, tier: 0, traitIds: ['armored'] },

    // Faction 2: The Verdant Wardens
    { id: 'warden_initiate', name: 'Warden Initiate', factionId: 'f2', hp: 60, atk: 8, defense: 0, role: 'Worker', assetId: 'unit_warden_initiate', cost: { 'steamwood_plank': 10 }, tier: 1 },
    { id: 'thorn_slinger', name: 'Thorn Slinger', factionId: 'f2', hp: 50, atk: 12, defense: 0, role: 'Skirmisher', assetId: 'unit_archer_thorn', cost: { 'steamwood_log': 15 }, tier: 1, traitIds: ['long_range'] },
    { id: 'grove_guardian', name: 'Grove Guardian', factionId: 'f2', hp: 200, atk: 18, defense: 25, role: 'Siege', assetId: 'unit_golem_wood', cost: { 'steamwood_plank': 40, 'fluxbloom': 5 }, tier: 3, traitIds: ['armored'] },
    { id: 'beast_tamer', name: 'Beast Tamer', factionId: 'f2', hp: 80, atk: 10, defense: 5, role: 'Support', assetId: 'unit_mage_beasttamer', cost: { 'steamwood_plank': 15, 'chronocrystal_raw': 5 }, tier: 2, traitIds: ['long_range'] },
    { id: 'hero_verdant', name: 'Cenarius, the Elderwood', factionId: 'f2', hp: 350, atk: 25, defense: 20, role: 'Hero', assetId: 'unit_hero_elderwood', cost: {}, tier: 0, traitIds: ['undying'] },

    // Faction 3: The Sunfire Dynasty
    { id: 'sunfire_initiate', name: 'Sunfire Initiate', factionId: 'f3', hp: 55, atk: 9, defense: 0, role: 'Worker', assetId: 'unit_sunfire_initiate', cost: { 'steamwood_plank': 5 }, tier: 1 },
    { id: 'sun_templar', name: 'Sun Templar', factionId: 'f3', hp: 130, atk: 15, defense: 15, role: 'Infantry', assetId: 'unit_soldier_templar', cost: { 'iron_ingot': 25, 'refined_chronocrystal': 5 }, tier: 1, traitIds: ['armored'] },
    { id: 'technomancer', name: 'Technomancer', factionId: 'f3', hp: 65, atk: 18, defense: 0, role: 'Skirmisher', assetId: 'unit_mage_technomancer', cost: { 'refined_chronocrystal': 10, 'clockwork_gear': 8 }, tier: 1, traitIds: ['long_range'] },
    { id: 'aether_cannon', name: 'Athar Cannon', factionId: 'f3', hp: 90, atk: 40, defense: 5, role: 'Siege', assetId: 'unit_siege_cannon', cost: { 'clockwork_gear': 20, 'athar_capacitor': 3 }, tier: 3, traitIds: ['siege_weapon'] },
    { id: 'hero_sunfire', name: 'Solara, the Sun Priestess', factionId: 'f3', hp: 300, atk: 35, defense: 10, role: 'Hero', assetId: 'unit_hero_sunpriestess', cost: {}, tier: 0, traitIds: ['long_range'] },

    // Faction 4: The Gloom Syndicate
    { id: 'syndicate_lackey', name: 'Syndicate Lackey', factionId: 'f4', hp: 50, atk: 5, defense: 0, role: 'Worker', assetId: 'unit_syndicate_lackey', cost: { 'iron_ingot': 8 }, tier: 1 },
    { id: 'syndicate_thug', name: 'Syndicate Thug', factionId: 'f4', hp: 70, atk: 10, defense: 5, role: 'Infantry', assetId: 'unit_syndicate_thug', cost: { 'iron_ingot': 8 }, tier: 1, traitIds: ['feral_strength'] },
    { id: 'flux_alchemist', name: 'Flux Alchemist', factionId: 'f4', hp: 60, atk: 16, defense: 0, role: 'Skirmisher', assetId: 'unit_mage_alchemist', cost: { 'fluxbloom': 10 }, tier: 1 },
    { id: 'shadow_stalker', name: 'Shadow Stalker', factionId: 'f4', hp: 80, atk: 20, defense: 0, role: 'Skirmisher', assetId: 'unit_rogue_shadow', cost: { 'iron_ingot': 15, 'fluxbloom': 15 }, tier: 2, traitIds: ['long_range'] },
    { id: 'saboteur', name: 'Saboteur', factionId: 'f4', hp: 75, atk: 8, defense: 5, role: 'Support', assetId: 'unit_rogue_saboteur', cost: { 'iron_ingot': 10, 'fluxbloom': 15 }, tier: 2, traitIds: ['siege_weapon'] },
    { id: 'hero_gloom', name: 'Corvus, the Shadow Broker', factionId: 'f4', hp: 320, atk: 28, defense: 10, role: 'Hero', assetId: 'unit_hero_shadowbroker', cost: {}, tier: 0, traitIds: ['long_range'] },

    // Faction 5: Ironclad Dwarves
    { id: 'dwarf_miner', name: 'Dwarf Miner', factionId: 'f5', hp: 80, atk: 9, defense: 5, role: 'Worker', assetId: 'unit_dwarf_miner', cost: { 'iron_ingot': 5 }, tier: 1 },
    { id: 'dwarf_warrior', name: 'Dwarf Warrior', factionId: 'f5', hp: 150, atk: 14, defense: 15, role: 'Infantry', assetId: 'unit_dwarf_warrior', cost: { 'iron_ingot': 25 }, tier: 1, traitIds: ['armored'] },
    { id: 'dwarf_thunderer', name: 'Dwarf Thunderer', factionId: 'f5', hp: 100, atk: 20, defense: 5, role: 'Skirmisher', assetId: 'unit_dwarf_thunderer', cost: { 'iron_ingot': 15, 'clockwork_gear': 5 }, tier: 1, traitIds: ['long_range'] },
    { id: 'hero_dwarf', name: 'Thorgrim Stonehand', factionId: 'f5', hp: 500, atk: 35, defense: 25, role: 'Hero', assetId: 'unit_hero_dwarf_king', cost: {}, tier: 0, traitIds: ['armored'] },

    // Faction 6: Sylvan Elves
    { id: 'elf_harvester', name: 'Elf Harvester', factionId: 'f6', hp: 50, atk: 6, defense: 0, role: 'Worker', assetId: 'unit_elf_harvester', cost: { 'steamwood_log': 5 }, tier: 1 },
    { id: 'elf_longbow', name: 'Elf Longbow', factionId: 'f6', hp: 60, atk: 18, defense: 0, role: 'Skirmisher', assetId: 'unit_elf_longbow', cost: { 'steamwood_plank': 15 }, tier: 1, traitIds: ['long_range'] },
    { id: 'elf_bladedancer', name: 'Elf Bladedancer', factionId: 'f6', hp: 90, atk: 22, defense: 5, role: 'Infantry', assetId: 'unit_elf_bladedancer', cost: { 'steamwood_plank': 10, 'iron_ingot': 10 }, tier: 2, traitIds: ['feral_strength'] },
    { id: 'hero_elf', name: 'Lyra, the Whisperwind', factionId: 'f6', hp: 300, atk: 40, defense: 10, role: 'Hero', assetId: 'unit_hero_elf_queen', cost: {}, tier: 0, traitIds: ['long_range'] },

    // Faction 7: Dread Legion
    { id: 'skeleton_worker', name: 'Skeleton Worker', factionId: 'f7', hp: 40, atk: 5, defense: 0, role: 'Worker', assetId: 'unit_skeleton_worker', cost: {}, tier: 1, traitIds: ['undying'] },
    { id: 'skeleton_scout', name: 'Skeleton Scout', factionId: 'f7', hp: 30, atk: 8, defense: 0, role: 'Skirmisher', assetId: 'unit_skeleton_scout', cost: {}, tier: 1, traitIds: ['undying'] },
    { id: 'necromancer', name: 'Necromancer', factionId: 'f7', hp: 70, atk: 15, defense: 5, role: 'Support', assetId: 'unit_necromancer', cost: { 'fluxbloom': 20 }, tier: 2, traitIds: ['undying'] },
    { id: 'bone_golem', name: 'Bone Golem', factionId: 'f7', hp: 220, atk: 20, defense: 20, role: 'Siege', assetId: 'unit_bone_golem', cost: { 'iron_ingot': 30 }, tier: 3, traitIds: ['armored', 'undying'] },
    { id: 'hero_undead', name: 'Malakor, the Lich Lord', factionId: 'f7', hp: 350, atk: 30, defense: 15, role: 'Hero', assetId: 'unit_hero_lich_lord', cost: {}, tier: 0, traitIds: ['undying'] },

    // Faction 8: Crimson Horde
    { id: 'orc_peon', name: 'Orc Peon', factionId: 'f8', hp: 70, atk: 6, defense: 0, role: 'Worker', assetId: 'unit_orc_peon', cost: { 'iron_ore': 5 }, tier: 1 },
    { id: 'orc_hunter', name: 'Orc Hunter', factionId: 'f8', hp: 90, atk: 12, defense: 0, role: 'Skirmisher', assetId: 'unit_orc_hunter', cost: { 'iron_ore': 10 }, tier: 1, traitIds: ['feral_strength'] },
    { id: 'orc_brute', name: 'Orc Brute', factionId: 'f8', hp: 140, atk: 16, defense: 5, role: 'Infantry', assetId: 'unit_orc_brute', cost: { 'iron_ore': 15 }, tier: 1, traitIds: ['feral_strength'] },
    { id: 'orc_berserker', name: 'Orc Berserker', factionId: 'f8', hp: 100, atk: 25, defense: 0, role: 'Infantry', assetId: 'unit_orc_berserker', cost: { 'iron_ore': 20 }, tier: 2, traitIds: ['feral_strength'] },
    { id: 'hero_horde', name: 'Grommash Bloodfist', factionId: 'f8', hp: 450, atk: 45, defense: 10, role: 'Hero', assetId: 'unit_hero_orc_warlord', cost: {}, tier: 0, traitIds: ['feral_strength'] },

    // Neutral & Minor Factions
    { id: 'scrapfang', name: 'Scrapfang', factionId: 'neutral_hostile', hp: 80, atk: 12, defense: 5, role: 'Infantry', assetId: 'unit_beast_scrapfang', cost: {}, tier: 1, traitIds: ['feral_strength'] },
    { id: 'aetherwing', name: 'Aetherwing', factionId: 'neutral_hostile', hp: 60, atk: 10, defense: 0, role: 'Skirmisher', assetId: 'unit_beast_aetherwing', cost: {}, tier: 1, traitIds: ['feral_strength'] },
    { id: 'bandit_raider', name: 'Bandit Raider', factionId: 'neutral_hostile', hp: 70, atk: 10, defense: 3, role: 'Infantry', assetId: 'unit_bandit_raider', cost: {}, tier: 1, traitIds: ['feral_strength'] },
    { id: 'goblin_raider', name: 'Goblin Raider', factionId: 'neutral_hostile', hp: 50, atk: 8, defense: 0, role: 'Infantry', assetId: 'unit_goblin_raider', cost: {}, tier: 1, traitIds: ['feral_strength'] },
];

export const TECH_TREES: Record<string, TechNode[]> = {
    cogwork_tech: [{ id: 'cw1', name: 'Reinforced Plating', tier: 1, cost: 100, prerequisites: [], effect: 'All automatons +10% HP.' }, { id: 'cw2', name: 'High-Tension Servos', tier: 1, cost: 150, prerequisites: ['cw1'], effect: 'Unlocks Clockwork Marksman unit.' }, { id: 'cw3', name: 'Automated Assembly', tier: 2, cost: 200, prerequisites: ['cw2'], effect: 'Automaton cost -10%.' }, { id: 'cw4', name: 'Atharic Engines', tier: 2, cost: 300, prerequisites: ['cw3'], effect: 'Unlocks Steam Hulk unit.' }, { id: 'cw5', name: 'Forge-Lord Project', tier: 3, cost: 500, prerequisites: ['cw4'], effect: 'Unlocks Hephaestus hero.' }, ],
    verdant_tech: [{ id: 'vt1', name: 'Herbalism', tier: 1, cost: 100, prerequisites: [], effect: 'Increased population growth.' }, { id: 'vt2', name: 'Beast Taming', tier: 1, cost: 150, prerequisites: ['vt1'], effect: 'Unlocks Beast Tamer unit.' }, ],
    sunfire_tech: [{ id: 'st1', name: 'Atharic Weaving', tier: 1, cost: 100, prerequisites: [], effect: 'Mages are more effective.' }, { id: 'st2', name: 'Lens Crafting', tier: 1, cost: 150, prerequisites: ['st1'], effect: 'Unlocks Technomancer unit.' }, ],
    gloom_tech: [{ id: 'gt1', name: 'Shadow Operations', tier: 1, cost: 100, prerequisites: [], effect: 'Intrigue actions are more effective.' }, { id: 'gt2', name: 'Alchemical Warfare', tier: 1, cost: 150, prerequisites: ['gt1'], effect: 'Unlocks Flux Alchemist unit.' }, ],
    dwarf_tech: [{ id: 'dt1', name: 'Masterwork Forging', tier: 1, cost: 100, prerequisites: [], effect: 'All units +5% HP.' }, { id: 'dt2', name: 'Gunpowder', tier: 1, cost: 150, prerequisites: ['dt1'], effect: 'Unlocks Dwarf Thunderer unit.' }, ],
    elf_tech: [{ id: 'et1', name: 'Farsight', tier: 1, cost: 100, prerequisites: [], effect: 'Ranged units gain +1 range.' }, { id: 'et2', name: 'Ancient Weaving', tier: 1, cost: 150, prerequisites: ['et1'], effect: 'Unlocks Elf Bladedancer unit.' }, ],
    undead_tech: [{ id: 'ut1', name: 'Soul Binding', tier: 1, cost: 100, prerequisites: [], effect: 'Raised Skeletons have +5 HP.' }, { id: 'ut2', name: 'Corpse Amalgamation', tier: 1, cost: 150, prerequisites: ['ut1'], effect: 'Unlocks Bone Golem unit.' }, ],
    horde_tech: [{ id: 'ht1', name: 'War Drums', tier: 1, cost: 100, prerequisites: [], effect: 'WAAAGH! bonus is more effective.' }, { id: 'ht2', name: 'Blood Rage', tier: 1, cost: 150, prerequisites: ['ht1'], effect: 'Unlocks Orc Berserker unit.' }, ],
};

export const FACTION_COLOR_HEX_MAP: Record<string, string> = {
  'red-500': '#ef4444', 'green-500': '#22c55e', 'yellow-600': '#ca8a04', 'violet-500': '#8b5cf6', 'blue-400': '#60a5fa', 'teal-400': '#2dd4bf', 'gray-400': '#9ca3af', 'orange-500': '#f97316', 'gray-600': '#4b5563',
};
export const FACTION_COLOR_RGB_MAP: Record<string, string> = {
  'red-500': '239, 68, 68', 'green-500': '34, 197, 94', 'yellow-600': '202, 138, 4', 'violet-500': '139, 92, 246', 'blue-400': '96, 165, 250', 'teal-400': '45, 212, 191', 'gray-400': '156, 163, 175', 'orange-500': '249, 115, 22', 'gray-600': '75, 85, 99',
};

// Data maps for efficient lookups
export const FACTIONS_MAP = new Map(FACTIONS.map(f => [f.id, f]));
export const UNITS_MAP = new Map(UNITS.map(u => [u.id, u]));
export const BIOMES_MAP = new Map(BIOMES.map(b => [b.id, b]));
export const RESOURCES_MAP = new Map(RESOURCES.map(r => [r.id, r]));
export const INFRASTRUCTURE_MAP = new Map(INFRASTRUCTURE.map(i => [i.id, i]));
export const TRAITS_MAP = new Map(TRAITS.map(t => [t.id, t]));
export const UNIT_TRAITS_MAP = new Map(UNIT_TRAITS.map(t => [t.id, t]));
export const CHARACTERS_MAP = new Map(CHARACTERS.map(c => [c.id, c]));
export const WORLD_EVENTS_MAP = new Map(WORLD_EVENTS.map(e => [e.id, e]));
export const ITEMS_MAP = new Map(ITEMS.map(i => [i.id, i]));
