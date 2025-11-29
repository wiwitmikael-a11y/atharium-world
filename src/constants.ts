
import type { Trait, Character, Faction, Biome, Resource, UnitDefinition, Infrastructure, WorldEvent, UnitTrait, Rarity, GodPower } from './types';

export const WORLD_SIZE = 80;
export const TICK_PER_YEAR = 1000;
export const ATHAR_CAP = 1000000;
export const STARTING_YEAR = 214; 
export const XP_PER_LEVEL = 100;
export const STAT_INCREASE_PER_LEVEL = 0.10;
export const INFRA_HP_COST_MULTIPLIER = 10;
export const LEVEL_MILESTONES = [5, 10, 15, 20, 25, 30, 40, 50];
export const RESOURCE_SPAWN_CHANCES: Record<Resource['rarity'], number> = { Common: 0.15, Uncommon: 0.08, Rare: 0.03, Legendary: 0.005 };

export const EPOCHS = Object.freeze([
  { id: 'era_of_awakening', name: 'The Age of Scavengers', synopsis: 'Centuries after the Starfall destroyed the Old World, tribes emerge from the bunkers and ruins. They find the land altered by Atharium radiation, and ancient machines rusting in the wastes.' },
  { id: 'age_of_steam_sorcery', name: 'The Steam-Aether Revolution', synopsis: 'Humanity learns to harness Atharium crystals to power boilers. Steam engines roar to life, augmented by unstable magic. The first great City-States are founded upon the bones of giants.' },
  { id: 'the_great_flux', name: 'The Crystal Wars', synopsis: 'Demand for Atharium outstrips supply. Factions turn on each other. The atmosphere becomes choked with Aether-Smog, mutating the wildlife and empowering the darker arts.' },
  { id: 'epoch_of_the_cog_gods', name: 'Ascension of the Machine', synopsis: 'Flesh is weak. Metal is eternal. The survivors integrate Atharium directly into their bodies or transfer their souls into massive Cog-Golems. The planet begins to hum with a mechanical heartbeat.' },
]);

export const GOD_POWERS: GodPower[] = [
    // Destruction
    { id: 'Smite', name: 'Divine Smite', category: 'Destruction', cost: 50, icon: 'bolt', description: 'Deals 50 damage. Good for disciplining heretics.', effectType: 'Damage' },
    { id: 'Meteor', name: 'Meteor Strike', category: 'Destruction', cost: 200, icon: 'fire', description: 'Calls down a star. Massive area damage and terrain destruction.', brushSize: 3, effectType: 'Damage' },
    
    // Creatures
    { id: 'Heal', name: 'Blessing', category: 'Creatures', cost: 30, icon: 'heart', description: 'Heals units and repairs buildings.', effectType: 'Heal' },
    { id: 'Spawn_Orc', name: 'Spawn Scavengers', category: 'Creatures', cost: 100, icon: 'user', description: 'Spawn a Scavenger raiding party.', effectType: 'Spawn', payload: 'scav' },
    { id: 'Spawn_Beast', name: 'Spawn Rad-Beast', category: 'Creatures', cost: 80, icon: 'leaf', description: 'Spawn a hostile mutated wolf.', effectType: 'Spawn', payload: 'rad_beast' },
    
    // World
    { id: 'Terra_Forest', name: 'Plant Forest', category: 'World', cost: 10, icon: 'leaf', description: 'Transform land into Verdant Forest.', effectType: 'Terraform', payload: 'verdant' },
    { id: 'Terra_Waste', name: 'Scorched Earth', category: 'World', cost: 10, icon: 'fire', description: 'Transform land into Wasteland.', effectType: 'Terraform', payload: 'wasteland' },
    { id: 'Terra_Gloom', name: 'Spread Gloom', category: 'World', cost: 15, icon: 'moon', description: 'Transform land into Gloomwell.', effectType: 'Terraform', payload: 'gloomwell' },
    
    // Civilizations (Resources)
    { id: 'Enrich', name: 'Enrich Soil', category: 'Civilization', cost: 100, icon: 'sun', description: 'Spawn random resources on an empty tile.', effectType: 'Resource' },
];

export const TRAITS: readonly Trait[] = Object.freeze([
  { id: 'brave', name: 'Iron Will', type: 'Good', description: 'Fearless in the face of horrors.', effects: 'Unit Attack +5%' },
  { id: 'just', name: 'Lawbringer', type: 'Good', description: 'Upholds the ancient codes.', effects: 'Diplomacy Score +10' },
  { id: 'diligent', name: 'Gear-Turner', type: 'Good', description: 'Obsessed with efficiency.', effects: 'Production Speed +10%' },
  { id: 'fanatic', name: 'Crystal-Gazed', type: 'Neutral', description: 'Addicted to the whisper of Atharium.', effects: 'Attack +10%, Defense -5%' },
  { id: 'innovator', name: 'Spark-Minded', type: 'Good', description: 'Sees machines in dreams.', effects: 'Research +15%' },
  { id: 'ruthless', name: 'Wasteland King', type: 'Bad', description: 'Survival of the fittest.', effects: 'Attack +5%, Diplomacy -10' },
]);

export const CHARACTERS: readonly Character[] = Object.freeze([
  { id: 'char_hephaestus', name: 'High Tinker Hephaestus', title: 'The Cog-Father', age: 142, traitIds: ['diligent', 'innovator'], lore: 'More machine than man, he rules the manufactories with a cold, calculating logic.', skills: { martial: 12, diplomacy: 4, stewardship: 25, intrigue: 6, learning: 20 } },
  { id: 'char_cenarius', name: 'Verdant Prophet Cenarius', title: 'The Root-Soul', age: 450, traitIds: ['just', 'brave'], lore: 'His blood has been replaced by sap. He remembers when the world was green without radiation.', skills: { martial: 8, diplomacy: 15, stewardship: 14, intrigue: 5, learning: 19 } },
  { id: 'char_voidwalker', name: 'Xal\'atath', title: 'The Whispering Shadow', age: 999, traitIds: ['fanatic'], lore: 'An entity formed from the corruption of the Starfall. It seeks to return all to the Void.', skills: { martial: 15, diplomacy: 2, stewardship: 5, intrigue: 25, learning: 25 } },
  { id: 'char_matriarch', name: 'Saint Seraphina', title: 'The Lightbearer', age: 50, traitIds: ['just', 'fanatic'], lore: 'She claims the Starfall was a gift from the Angels, and purges the unclean with holy fire.', skills: { martial: 10, diplomacy: 18, stewardship: 12, intrigue: 10, learning: 14 } },
  { id: 'char_warlord', name: 'Grom the Render', title: 'Khan of the Wastes', age: 45, traitIds: ['brave', 'ruthless'], lore: 'A mutant giant who unites the scavenger tribes through sheer brutality.', skills: { martial: 30, diplomacy: 1, stewardship: 5, intrigue: 5, learning: 2 } },
  { id: 'char_cyber_king', name: 'Unit 01-Prime', title: 'The Network', age: 12, traitIds: ['diligent'], lore: 'A sentient AI born from an ancient databank, seeking to optimize biological life.', skills: { martial: 20, diplomacy: 0, stewardship: 20, intrigue: 0, learning: 25 } },
]);

export const FACTIONS: readonly Faction[] = Object.freeze([
  { 
    id: 'f1', name: 'Iron-Lung Directorate', color: 'red-500', archetype: 'Industrial', 
    description: 'A technocratic society that worships the machine.',
    traits: [{ name: 'Mass Production', description: 'Factories churn out smoke and machines.', effects: [{type: 'PRODUCTION_MOD', value: 0.2}] }], 
    preferredBiomes: ['ashlands', 'wasteland'], personality: { aggression: 7, expansion: 9, diplomacy: 3 }, techTreeId: 'industrial_tech' 
  },
  { 
    id: 'f2', name: 'The Spore-Bound', color: 'green-500', archetype: 'Nature', 
    description: 'Mutants who have formed a symbiosis with the irradiated flora.',
    traits: [{ name: 'Photosynthesis', description: 'Regenerate in sunlight.', effects: [{type: 'POP_GROWTH_MOD', value: 0.15}] }], 
    preferredBiomes: ['verdant', 'gloomwell'], personality: { aggression: 4, expansion: 6, diplomacy: 5 }, techTreeId: 'nature_tech' 
  },
  { 
    id: 'f3', name: 'Order of the Eternal Flame', color: 'yellow-600', archetype: 'Holy', 
    description: 'Religious zealots who believe Atharium is the blood of god.',
    traits: [{ name: 'Divine Mandate', description: 'Fearless in holy war.', effects: [{type: 'UNIT_STAT_MOD', stat: 'atk', value: 0.1}] }], 
    preferredBiomes: ['verdant', 'ashlands'], personality: { aggression: 9, expansion: 7, diplomacy: 2 }, techTreeId: 'holy_tech' 
  },
  { 
    id: 'f4', name: 'The Void-Touched', color: 'violet-500', archetype: 'Shadow', 
    description: 'Cultists who have gazed too long into the Atharium crystals.',
    traits: [{ name: 'Shadow Walk', description: 'Movement is silent and deadly.', effects: [{type: 'UNIT_STAT_MOD', stat: 'def', value: 0.15}] }], 
    preferredBiomes: ['gloomwell', 'atharium_wastes'], personality: { aggression: 6, expansion: 5, diplomacy: 8 }, techTreeId: 'shadow_tech' 
  },
  { 
    id: 'f5', name: 'Deep-Rock Cartel', color: 'blue-400', archetype: 'Mountain', 
    description: 'Dwarven miners who survived the apocalypse underground.',
    traits: [{ name: 'Stone Skin', description: 'Tough as the mountain.', effects: [{type: 'UNIT_STAT_MOD', stat: 'hp', value: 0.2}] }], 
    preferredBiomes: ['ashlands', 'tundra'], personality: { aggression: 5, expansion: 4, diplomacy: 6 }, techTreeId: 'mountain_tech' 
  },
  { 
    id: 'f6', name: 'The Crystal Sovereignty', color: 'teal-400', archetype: 'Arcane', 
    description: 'Descendants of the Old World mages.',
    traits: [{ name: 'Arcane Mastery', description: 'Superior energy manipulation.', effects: [{type: 'ATHARIUM_EFFICIENCY', value: 0.2}] }], 
    preferredBiomes: ['tundra', 'atharium_wastes'], personality: { aggression: 3, expansion: 3, diplomacy: 9 }, techTreeId: 'arcane_tech' 
  },
  { 
    id: 'f7', name: 'The Risen Dust', color: 'gray-400', archetype: 'Undead', 
    description: 'Corpses reanimated by the fallout of the Starfall.',
    traits: [{ name: 'Endless Tide', description: 'Units are cheap and plentiful.', effects: [{type: 'UNIT_COST_MOD', value: -0.2}] }], 
    preferredBiomes: ['wasteland', 'atharium_wastes'], personality: { aggression: 10, expansion: 10, diplomacy: 0 }, techTreeId: 'undead_tech' 
  },
  { 
    id: 'f8', name: 'The Junk-Lords', color: 'orange-500', archetype: 'Scavenger', 
    description: 'Raiders who rule the wastelands in rusted vehicles.',
    traits: [{ name: 'Scavenger', description: 'More loot from ruins.', effects: [{type: 'PRODUCTION_MOD', resourceTier: 'Scrap', value: 0.3}] }], 
    preferredBiomes: ['ashlands', 'wasteland'], personality: { aggression: 9, expansion: 8, diplomacy: 1 }, techTreeId: 'scavenger_tech' 
  },
  { id: 'neutral_hostile', name: 'Wasteland Horrors', color: 'gray-600', archetype: 'Nature', description: 'Monstrosities born from radiation and chaos.', traits: [], preferredBiomes: [], personality: { aggression: 10, expansion: 0, diplomacy: 0 }, techTreeId: '' },
]);

export const BIOMES: readonly Biome[] = Object.freeze([
    { id: 'gloomwell', name: 'Gloomwell Forest', moveCost: 2, spreadsTo: ['verdant'], spreadChance: 0.005, corruptionRate: 0.05, terrainEffects: [{description: "Dense Spores", appliesTo: {}, effects: [{stat: 'def', modifier: 0.2}]}] },
    { id: 'verdant', name: 'Radiant Plains', moveCost: 1, spreadsTo: ['wasteland'], spreadChance: 0.002, terrainEffects: [] },
    { id: 'wasteland', name: 'Scorched Wastes', moveCost: 1.2, spreadsTo: ['verdant'], spreadChance: 0.003, terrainEffects: [{description: "Radiation Pockets", appliesTo: {}, effects: [{stat: 'hp', modifier: -0.01}]}] },
    { id: 'tundra', name: 'Frozen Peaks', moveCost: 1.5, terrainEffects: [{description: "Bitter Cold", appliesTo: {}, effects: [{stat: 'atk', modifier: -0.1}]}] },
    { id: 'ashlands', name: 'Volcanic Ashlands', moveCost: 2.5, terrainEffects: [{description: "Searing Heat", appliesTo: {factionArchetype: 'Industrial'}, effects: [{stat: 'atk', modifier: 0.1}]}] },
    { id: 'atharium_wastes', name: 'Atharium Fallout Zone', moveCost: 1.8, spreadsTo: ['wasteland'], spreadChance: 0.008, corruptionRate: 0.2, terrainEffects: [{description: "Mana Surge", appliesTo: {factionArchetype: 'Arcane'}, effects: [{stat: 'atk', modifier: 0.2}]}] },
]);

export const RESOURCES: readonly Resource[] = Object.freeze([
    // Tier 1: Scavenged & Raw
    { id: 'scrap_metal', name: 'Rusted Scrap', tier: 'Scrap', biomes: ['wasteland', 'ashlands'], assetId: 'resource_iron_ore', rarity: 'Common', respawnTime: TICK_PER_YEAR * 2, description: 'Debris from the Old World.' },
    { id: 'mutated_wood', name: 'Mutated Timber', tier: 'Raw', biomes: ['gloomwell', 'verdant'], assetId: 'resource_steamwood_tree', rarity: 'Common', respawnTime: TICK_PER_YEAR * 4, description: 'Wood hardened by radiation.' },
    { id: 'ancient_circuitry', name: 'Ancient Circuitry', tier: 'Scrap', biomes: ['wasteland'], assetId: 'resource_clockwork_gear', rarity: 'Uncommon', respawnTime: TICK_PER_YEAR * 6, description: 'Fried electronics from the Before Times.' },
    
    // Tier 2: Atharium
    { id: 'atharium_dust', name: 'Atharium Dust', tier: 'Raw', biomes: ['atharium_wastes', 'tundra'], assetId: 'resource_fluxbloom', rarity: 'Uncommon', respawnTime: TICK_PER_YEAR * 5, description: 'Faintly glowing residue of the Starfall.' },
    { id: 'atharium_crystal', name: 'Atharium Crystal', tier: 'Atharium', biomes: ['atharium_wastes'], assetId: 'resource_chronocrystal', rarity: 'Rare', respawnTime: TICK_PER_YEAR * 10, description: 'A pure shard of cosmic energy.' },
    
    // Tier 3: Exotic
    { id: 'void_essence', name: 'Void Essence', tier: 'Artifact', biomes: ['atharium_wastes'], assetId: 'resource_void_essence', rarity: 'Legendary', description: 'Corrupted energy from the tear in reality.' },
    { id: 'titan_alloy', name: 'Titan Alloy', tier: 'Artifact', biomes: ['ashlands'], assetId: 'resource_dragon_scale', rarity: 'Legendary', description: 'Metal from the hull of a Fallen Sky-Ship.' },
    
    // Processed (Produced by buildings)
    { id: 'steel_ingot', name: 'Refined Steel', tier: 'Refined', assetId: 'resource_iron_ingot', rarity: 'Common', description: 'Smelted from scrap and ore.' },
    { id: 'aether_cell', name: 'Aether Cell', tier: 'Refined', assetId: 'resource_refined_chronocrystal', rarity: 'Uncommon', description: 'Atharium dust compressed into a battery.' },
    { id: 'cogwork_mechanism', name: 'Cogwork Mechanism', tier: 'Refined', assetId: 'resource_clockwork_gear', rarity: 'Uncommon', description: 'Precision gears for automatons.' },
    { id: 'infused_plank', name: 'Infused Plank', tier: 'Refined', assetId: 'resource_steamwood_plank', rarity: 'Common', description: 'Wood soaked in Aether.' },
]);

export const INFRASTRUCTURE: readonly Infrastructure[] = [
  // Settlements
  { id: 'settlement_hamlet', name: 'Outpost', assetId: 'infra_settlement_hamlet', description: 'A fortified camp for survivors.', cost: {}, tier: 1, populationCapacity: 100, upgradesTo: 'settlement_town', upgradeCost: { 'infused_plank': 100, 'steel_ingot': 100 }, addsStorage: { 'Scrap': 200, 'Raw': 100 }, multiTile: { width: 2, height: 2 }, xpGain: 100 },
  { id: 'settlement_town', name: 'Bastion', assetId: 'infra_settlement_town', description: 'A walled town protected by steam turrets.', cost: {}, tier: 2, populationCapacity: 500, upgradesTo: 'settlement_city', upgradeCost: { 'aether_cell': 50, 'cogwork_mechanism': 50 }, addsStorage: { 'Scrap': 1000, 'Refined': 500 }, multiTile: { width: 2, height: 2 }, xpGain: 250 },
  { id: 'settlement_city', name: 'Sky-Citadel', assetId: 'infra_settlement_city', description: 'A massive metropolis utilizing anti-gravity tech.', cost: {}, tier: 3, populationCapacity: 2000, addsStorage: { 'Refined': 2000, 'Atharium': 500, 'Artifact': 50 }, multiTile: { width: 2, height: 2 }, xpGain: 1000 },

  // Resource Gathering
  { id: 'scrap_yard', name: 'Scrap Yard', assetId: 'infra_mine', description: 'Sorts usable metal from the wastes.', cost: { 'mutated_wood': 20 }, produces: { resourceId: 'scrap_metal', amount: 1.0 }, requiresResourceId: 'scrap_metal', tier: 1, xpGain: 20, pollution: 0.2 },
  { id: 'spore_farm', name: 'Spore Farm', assetId: 'infra_lumber_camp', description: 'Harvests rapid-growth fungal wood.', cost: { 'scrap_metal': 10 }, produces: { resourceId: 'mutated_wood', amount: 1.0 }, requiresResourceId: 'mutated_wood', tier: 1, xpGain: 20 },
  { id: 'aether_siphon', name: 'Aether Siphon', assetId: 'infra_crystal_harvester', description: 'Draws energy from Atharium deposits.', cost: { 'steel_ingot': 20, 'infused_plank': 20 }, produces: { resourceId: 'atharium_dust', amount: 0.5 }, requiresResourceId: 'atharium_dust', tier: 1, xpGain: 30, pollution: 2.0 },
  
  // Processing
  { id: 'smeltery', name: 'Smeltery', assetId: 'infra_forge', description: 'Melts scrap into steel.', cost: { 'mutated_wood': 50 }, consumes: [{ resourceId: 'scrap_metal', amount: 2 }], produces: { resourceId: 'steel_ingot', amount: 1 }, tier: 1, xpGain: 25, pollution: 3.0, adjacencyBonuses: [{targetType: 'Infrastructure', targetId: 'scrap_yard', effect: 'Production', value: 0.5}] },
  { id: 'machinists_shop', name: 'Machinist Shop', assetId: 'infra_workshop', description: 'Crafts gears and circuits.', cost: { 'steel_ingot': 30 }, consumes: [{ resourceId: 'steel_ingot', amount: 1 }, {resourceId: 'ancient_circuitry', amount: 0.1}], produces: { resourceId: 'cogwork_mechanism', amount: 1 }, tier: 2, xpGain: 35 },
  { id: 'refinery', name: 'Aether Refinery', assetId: 'infra_refinery', description: 'Compresses dust into fuel cells.', cost: { 'steel_ingot': 50, 'cogwork_mechanism': 10 }, consumes: [{ resourceId: 'atharium_dust', amount: 2 }], produces: { resourceId: 'aether_cell', amount: 1 }, tier: 2, xpGain: 50, pollution: 5.0 },
  
  // Utility
  { id: 'vault', name: 'Vault', assetId: 'infra_warehouse', description: 'Reinforced storage bunker.', cost: { 'steel_ingot': 50 }, tier: 1, addsStorage: { 'Scrap': 2000, 'Refined': 1000 }, xpGain: 15 },
  { id: 'tech_archive', name: 'Tech Archive', assetId: 'infra_research_archive', description: 'Decodes Old World blueprints.', cost: { 'aether_cell': 20, 'ancient_circuitry': 10 }, tier: 2, generatesResearchPoints: 1.0, xpGain: 50 },
  { id: 'star_forge', name: 'Star Forge', assetId: 'infra_arcane_enchanter', description: 'Uses pure Atharium to mint currency.', cost: { 'titan_alloy': 10, 'aether_cell': 100 }, consumes: [{resourceId: 'atharium_crystal', amount: 0.1}], produces: { resourceId: 'void_essence', amount: 0.05 }, tier: 3, xpGain: 200, pollution: 10.0 },
];

export const UNITS: readonly UnitDefinition[] = [
    // Faction 1: Iron-Lung Directorate (Industrial)
    { id: 'steam_scout', name: 'Steam Scout', factionId: 'f1', hp: 60, atk: 8, defense: 5, role: 'Scout', assetId: 'unit_citizen_automaton', cost: { 'scrap_metal': 10 }, tier: 1, description: 'Lightly armored scout with a steam jetpack.' },
    { id: 'boiler_guard', name: 'Boiler Guard', factionId: 'f1', hp: 120, atk: 15, defense: 20, role: 'Infantry', assetId: 'unit_soldier_gearforged', cost: { 'steel_ingot': 20 }, tier: 2, description: 'Heavy infantry in pressurized suits.' },
    { id: 'railgunner', name: 'Railgunner', factionId: 'f1', hp: 80, atk: 35, defense: 10, role: 'Ranged', assetId: 'unit_archer_clockwork', cost: { 'steel_ingot': 10, 'aether_cell': 2 }, tier: 2, description: 'Wields a magnetic rifle powered by Aether.' },
    { id: 'iron_colossus', name: 'Iron Colossus', factionId: 'f1', hp: 400, atk: 50, defense: 40, role: 'Construct', assetId: 'unit_golem_steam', cost: { 'steel_ingot': 100, 'cogwork_mechanism': 20, 'aether_cell': 10 }, tier: 3, description: 'A walking tank of brass and iron.' },
    { id: 'hero_f1', name: 'Hephaestus', factionId: 'f1', hp: 600, atk: 60, defense: 50, role: 'Hero', assetId: 'unit_hero_forgelord', cost: {}, tier: 4, description: 'The Cog-Father himself.' },

    // Faction 2: The Spore-Bound (Nature)
    { id: 'sporeling', name: 'Sporeling', factionId: 'f2', hp: 50, atk: 10, defense: 0, role: 'Scout', assetId: 'unit_warden_initiate', cost: { 'mutated_wood': 5 }, tier: 1, description: 'Small, quick plant-mutants.' },
    { id: 'thorn_knight', name: 'Thorn Knight', factionId: 'f2', hp: 110, atk: 18, defense: 15, role: 'Infantry', assetId: 'unit_archer_thorn', cost: { 'mutated_wood': 20, 'atharium_dust': 2 }, tier: 2, description: 'Armor grown from razor-sharp bark.' },
    { id: 'spore_cannon', name: 'Spore Cannon', factionId: 'f2', hp: 150, atk: 25, defense: 5, role: 'Siege', assetId: 'unit_mage_beasttamer', cost: { 'mutated_wood': 40, 'biomass': 10 }, tier: 2, description: 'Launches corrosive gas pods.' },
    { id: 'root_titan', name: 'Root Titan', factionId: 'f2', hp: 500, atk: 40, defense: 30, role: 'Construct', assetId: 'unit_golem_wood', cost: { 'mutated_wood': 100, 'atharium_crystal': 1 }, tier: 3, description: 'A massive treant corrupted by radiation.' },
    { id: 'hero_f2', name: 'Cenarius', factionId: 'f2', hp: 550, atk: 50, defense: 25, role: 'Hero', assetId: 'unit_hero_elderwood', cost: {}, tier: 4, description: 'The Prophet of the New Green.' },

    // Faction 3: Order of the Eternal Flame (Holy)
    { id: 'initiate', name: 'Torchbearer', factionId: 'f3', hp: 60, atk: 12, defense: 5, role: 'Infantry', assetId: 'unit_sunfire_initiate', cost: { 'scrap_metal': 10 }, tier: 1, description: 'Fanatics wielding flaming clubs.' },
    { id: 'purifier', name: 'Purifier', factionId: 'f3', hp: 130, atk: 22, defense: 18, role: 'Infantry', assetId: 'unit_soldier_templar', cost: { 'steel_ingot': 25, 'aether_cell': 1 }, tier: 2, description: 'Cleanses the wasteland with flamethrowers.' },
    { id: 'sun_mage', name: 'Solaris', factionId: 'f3', hp: 70, atk: 40, defense: 5, role: 'Ranged', assetId: 'unit_mage_technomancer', cost: { 'aether_cell': 5, 'ancient_circuitry': 2 }, tier: 2, description: 'Channels the heat of the Starfall.' },
    { id: 'archangel_engine', name: 'Archangel Engine', factionId: 'f3', hp: 350, atk: 55, defense: 25, role: 'Construct', assetId: 'unit_siege_cannon', cost: { 'steel_ingot': 80, 'atharium_crystal': 2 }, tier: 3, description: 'A flying machine of gold and fire.' },
    { id: 'hero_f3', name: 'Seraphina', factionId: 'f3', hp: 500, atk: 70, defense: 20, role: 'Hero', assetId: 'unit_hero_sunpriestess', cost: {}, tier: 4, description: 'The Living Flame.' },

    // Faction 4: The Void-Touched (Shadow)
    { id: 'cultist', name: 'Whisperer', factionId: 'f4', hp: 40, atk: 15, defense: 0, role: 'Scout', assetId: 'unit_syndicate_lackey', cost: { 'atharium_dust': 5 }, tier: 1, description: 'Maddened cultist with a glass dagger.' },
    { id: 'shadow_blade', name: 'Void-Stalker', factionId: 'f4', hp: 90, atk: 45, defense: 10, role: 'Infantry', assetId: 'unit_rogue_shadow', cost: { 'steel_ingot': 15, 'void_essence': 1 }, tier: 2, description: 'Invisibility cloaked assassin.' },
    { id: 'rift_weaver', name: 'Rift Weaver', factionId: 'f4', hp: 60, atk: 35, defense: 10, role: 'Ranged', assetId: 'unit_mage_alchemist', cost: { 'atharium_dust': 20 }, tier: 2, description: 'Tears holes in reality to damage foes.' },
    { id: 'horror', name: 'Abyssal Horror', factionId: 'f4', hp: 450, atk: 60, defense: 10, role: 'Construct', assetId: 'unit_beast_scrapfang', cost: { 'biomass': 50, 'void_essence': 5 }, tier: 3, description: 'A nightmare made flesh.' },
    { id: 'hero_f4', name: 'Corvus', factionId: 'f4', hp: 480, atk: 80, defense: 15, role: 'Hero', assetId: 'unit_hero_shadowbroker', cost: {}, tier: 4, description: 'The Shadow King.' },

    // Faction 5: Deep-Rock Cartel (Mountain)
    { id: 'driller', name: 'Tunnel Rat', factionId: 'f5', hp: 80, atk: 10, defense: 10, role: 'Worker', assetId: 'unit_dwarf_miner', cost: { 'scrap_metal': 10 }, tier: 1, description: 'Expert at finding Atharium.' },
    { id: 'ironbreaker', name: 'Ironbreaker', factionId: 'f5', hp: 160, atk: 20, defense: 30, role: 'Infantry', assetId: 'unit_dwarf_warrior', cost: { 'steel_ingot': 30 }, tier: 2, description: 'Impenetrable shield wall.' },
    { id: 'thunderer', name: 'Thunderer', factionId: 'f5', hp: 100, atk: 25, defense: 15, role: 'Ranged', assetId: 'unit_dwarf_thunderer', cost: { 'steel_ingot': 20, 'gunpowder': 10 }, tier: 2, description: 'Wields heavy boomsticks.' },
    { id: 'runic_golem', name: 'Rune Guardian', factionId: 'f5', hp: 500, atk: 35, defense: 50, role: 'Construct', assetId: 'unit_golem_steam', cost: { 'steel_ingot': 100, 'atharium_crystal': 2 }, tier: 3, description: 'Animated stone etched with power.' },
    { id: 'hero_f5', name: 'Thorgrim', factionId: 'f5', hp: 700, atk: 45, defense: 60, role: 'Hero', assetId: 'unit_hero_dwarf_king', cost: {}, tier: 4, description: 'The High King Under the Mountain.' },

    // Faction 6: Crystal Sovereignty (Arcane)
    { id: 'apprentice', name: 'Crystal Novice', factionId: 'f6', hp: 50, atk: 15, defense: 5, role: 'Scout', assetId: 'unit_elf_harvester', cost: { 'atharium_dust': 10 }, tier: 1, description: 'Learning to control the hum.' },
    { id: 'spellblade', name: 'Spellblade', factionId: 'f6', hp: 100, atk: 30, defense: 10, role: 'Infantry', assetId: 'unit_elf_bladedancer', cost: { 'steel_ingot': 10, 'aether_cell': 2 }, tier: 2, description: 'Sword imbued with magic.' },
    { id: 'crystal_bow', name: 'Aether Archer', factionId: 'f6', hp: 70, atk: 35, defense: 5, role: 'Ranged', assetId: 'unit_elf_longbow', cost: { 'mutated_wood': 15, 'atharium_dust': 10 }, tier: 2, description: 'Arrows that phase through armor.' },
    { id: 'arcane_construct', name: 'Crystal Golem', factionId: 'f6', hp: 350, atk: 50, defense: 20, role: 'Construct', assetId: 'unit_golem_wood', cost: { 'atharium_crystal': 5 }, tier: 3, description: 'Pure energy given form.' },
    { id: 'hero_f6', name: 'Lyra', factionId: 'f6', hp: 450, atk: 75, defense: 20, role: 'Hero', assetId: 'unit_hero_elf_queen', cost: {}, tier: 4, description: 'The Arch-Magus.' },

    // Faction 7: The Risen Dust (Undead)
    { id: 'shambler', name: 'Rot-Walker', factionId: 'f7', hp: 40, atk: 8, defense: 0, role: 'Infantry', assetId: 'unit_skeleton_worker', cost: { 'biomass': 5 }, tier: 1, description: 'Basic cannon fodder.' },
    { id: 'bone_guard', name: 'Grave Guard', factionId: 'f7', hp: 100, atk: 15, defense: 10, role: 'Infantry', assetId: 'unit_skeleton_scout', cost: { 'scrap_metal': 10, 'biomass': 10 }, tier: 2, description: 'Armed with rusted ancient weapons.' },
    { id: 'necro_alchemist', name: 'Plague Spreader', factionId: 'f7', hp: 60, atk: 20, defense: 5, role: 'Ranged', assetId: 'unit_necromancer', cost: { 'atharium_dust': 15 }, tier: 2, description: 'Throws radioactive sludge.' },
    { id: 'abomination', name: 'Flesh Titan', factionId: 'f7', hp: 600, atk: 40, defense: 5, role: 'Construct', assetId: 'unit_bone_golem', cost: { 'biomass': 100, 'void_essence': 1 }, tier: 3, description: 'A mountain of stitched bodies.' },
    { id: 'hero_f7', name: 'Malakor', factionId: 'f7', hp: 500, atk: 55, defense: 30, role: 'Hero', assetId: 'unit_hero_lich_lord', cost: {}, tier: 4, description: 'The Lich of the Wastes.' },

    // Faction 8: The Junk-Lords (Scavenger)
    { id: 'scav', name: 'Scav', factionId: 'f8', hp: 60, atk: 10, defense: 5, role: 'Scout', assetId: 'unit_orc_peon', cost: { 'scrap_metal': 5 }, tier: 1, description: 'Always looking for shiny things.' },
    { id: 'psycho', name: 'Saw-Hand', factionId: 'f8', hp: 110, atk: 25, defense: 5, role: 'Infantry', assetId: 'unit_orc_brute', cost: { 'scrap_metal': 20 }, tier: 2, description: 'Replaced arm with a buzzsaw.' },
    { id: 'rocket_boy', name: 'Boom-Boy', factionId: 'f8', hp: 70, atk: 40, defense: 0, role: 'Ranged', assetId: 'unit_orc_hunter', cost: { 'scrap_metal': 15, 'gunpowder': 5 }, tier: 2, description: 'Strap a rocket to a stick.' },
    { id: 'war_rig', name: 'Battle Rig', factionId: 'f8', hp: 450, atk: 45, defense: 35, role: 'Siege', assetId: 'unit_orc_berserker', cost: { 'steel_ingot': 50, 'cogwork_mechanism': 10 }, tier: 3, description: 'A tank made of garbage, but it works.' },
    { id: 'hero_f8', name: 'Grom', factionId: 'f8', hp: 650, atk: 65, defense: 30, role: 'Hero', assetId: 'unit_hero_orc_warlord', cost: {}, tier: 4, description: 'The Khan of Khans.' },
    
    // Neutral
    { id: 'rad_beast', name: 'Rad-Wolf', factionId: 'neutral_hostile', hp: 80, atk: 15, defense: 0, role: 'Infantry', assetId: 'unit_beast_scrapfang', cost: {}, tier: 1 },
    { id: 'void_wraith', name: 'Void Wraith', factionId: 'neutral_hostile', hp: 150, atk: 30, defense: 20, role: 'Ranged', assetId: 'unit_beast_aetherwing', cost: {}, tier: 2 },
];

export const WORLD_EVENTS: readonly WorldEvent[] = Object.freeze([
    { id: 'fallen_airship', name: 'Fallen Sky-Titan', type: 'Discovery', assetId: 'discovery_fallen_airship', description: 'The wreckage of a god-machine from the Old Wars.' },
    { id: 'flux_storm', name: 'Aether-Quake', type: 'Hazard', assetId: 'hazard_flux_storm', description: 'The ground cracks, leaking unstable magic.' },
    { id: 'ancient_automaton', name: 'Dormant God-Engine', type: 'Discovery', assetId: 'discovery_ancient_automaton', description: 'A massive construct from the First Epoch, waiting to be awoken.' },
    { id: 'meteor_shower', name: 'Atharium Meteor', type: 'Anomaly', assetId: 'resource_chronocrystal', description: 'A fresh deposit of Atharium falls from the sky.' },
]);

export const UNIT_TRAITS: readonly UnitTrait[] = []; 
export const UNIT_TRAITS_MAP = new Map(UNIT_TRAITS.map(t => [t.id, t]));

export const BIOME_PASTEL_COLORS: Record<string, string> = {
    gloomwell: '#1A237E', // Deep Indigo for eerie forest
    verdant: '#2E7D32',   // Rich Forest Green
    wasteland: '#BF360C', // Deep Burnt Orange
    tundra: '#90A4AE',    // Blue Grey
    ashlands: '#37474F',  // Dark Blue Grey
    atharium_wastes: '#4A148C', // Deep Purple
};

export const FACTION_COLOR_HEX_MAP: Record<string, string> = {
    'red-500': '#D32F2F', // Industrial Red
    'green-500': '#388E3C', // Nature Green
    'yellow-600': '#FBC02D', // Holy Gold
    'violet-500': '#7B1FA2', // Shadow Violet
    'blue-400': '#1976D2', // Mountain Blue
    'teal-400': '#009688', // Arcane Teal
    'gray-400': '#616161', // Undead Grey
    'orange-500': '#E64A19', // Scavenger Orange
    'gray-600': '#424242', // Neutral
};

export const FACTION_COLOR_RGB_MAP: Record<string, string> = {
    'red-500': '211, 47, 47', 
    'green-500': '56, 142, 60', 
    'yellow-600': '251, 192, 45',
    'violet-500': '123, 31, 162', 
    'blue-400': '25, 118, 210', 
    'teal-400': '0, 150, 136',
    'gray-400': '97, 97, 97', 
    'orange-500': '230, 74, 25', 
    'gray-600': '66, 66, 66',
};

export const RARITY_COLORS: Record<Rarity, string> = {
    Common: 'text-gray-300', Uncommon: 'text-green-400', Rare: 'text-blue-400',
    Epic: 'text-purple-500', Legendary: 'text-orange-400', Artifact: 'text-red-500'
};

export const FACTIONS_MAP = new Map(FACTIONS.map(f => [f.id, f]));
export const UNITS_MAP = new Map(UNITS.map(u => [u.id, u]));
export const BIOMES_MAP = new Map(BIOMES.map(b => [b.id, b]));
export const RESOURCES_MAP = new Map(RESOURCES.map(r => [r.id, r]));
export const INFRASTRUCTURE_MAP = new Map(INFRASTRUCTURE.map(i => [i.id, i]));
export const TRAITS_MAP = new Map(TRAITS.map(t => [t.id, t]));
export const CHARACTERS_MAP = new Map(CHARACTERS.map(c => [c.id, c]));
export const WORLD_EVENTS_MAP = new Map(WORLD_EVENTS.map(e => [e.id, e]));
