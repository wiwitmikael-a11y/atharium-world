
const GITHUB_ASSET_BASE_URL = 'https://raw.githubusercontent.com/wiwitmikael-a11y/atharium-assets/main/';
const GITHUB_MEDIA_BASE_URL = 'https://cdn.jsdelivr.net/gh/wiwitmikael-a11y/atharium-assets@main/';

const getAssetUrl = (fileName: string) => `${GITHUB_ASSET_BASE_URL}${fileName}.png`;
const getMediaUrl = (fileName: string) => `${GITHUB_MEDIA_BASE_URL}${fileName}`;

export const ASSET_PATHS: Record<string, string> = {
  // Media
  'video_intro': getMediaUrl('intro.mp4'),
  'ui_menu_background_video': getMediaUrl('menu_background.mp4'),
  'ui_title_logo': getAssetUrl('ui_title_logo'),

  // UI & Overlays
  'faction_overlay': getAssetUrl('faction_overlay'),
  'asset_loot_container': getAssetUrl('lootbox'),

  // World Events
  'discovery_fallen_airship': getAssetUrl('discovery_fallen_airship'),
  'discovery_ancient_automaton': getAssetUrl('discovery_ancient_automaton'),
  'discovery_reality_tear': getAssetUrl('discovery_reality_tear'),
  'relic_dragons_maw': getAssetUrl('relic_dragons_maw'),
  'relic_eye_of_the_watcher': getAssetUrl('relic_eye_of_the_watcher'),
  'hazard_flux_storm': getAssetUrl('hazard_flux_storm'),
  
  // Resources
  'resource_iron_ore': getAssetUrl('resource_iron_ore'),
  'resource_steamwood_tree': getAssetUrl('resource_steamwood_tree'),
  'resource_chronocrystal': getAssetUrl('resource_chronocrystal'),
  'resource_fluxbloom': getAssetUrl('resource_fluxbloom'),
  'resource_dragon_scale': getAssetUrl('resource_dragon_scale'),
  'resource_heartstone': getAssetUrl('resource_heartstone'),
  'resource_iron_ingot': getAssetUrl('resource_iron_ingot'),
  'resource_steamwood_plank': getAssetUrl('resource_steamwood_plank'),
  'resource_refined_chronocrystal': getAssetUrl('resource_refined_chronocrystal'),
  'resource_clockwork_gear': getAssetUrl('resource_clockwork_gear'),
  'resource_athar_capacitor': getAssetUrl('resource_athar_capacitor'),

  // Infrastructure
  'infra_settlement_hamlet': getAssetUrl('infra_settlement_hamlet'),
  'infra_settlement_town': getAssetUrl('infra_settlement_town'),
  'infra_mine': getAssetUrl('infra_mine'),
  'infra_lumber_camp': getAssetUrl('infra_lumber_camp'),
  'infra_crystal_harvester': getAssetUrl('infra_crystal_harvester'),
  'infra_forge': getAssetUrl('infra_forge'),
  'infra_arcane_enchanter': getAssetUrl('infra_arcane_enchanter'),
  'infra_warehouse': getAssetUrl('infra_warehouse'),
  'infra_workshop': getAssetUrl('infra_workshop'),
  'infra_research_archive': getAssetUrl('infra_research_archive'),

  // Units: Cogwork Compact
  'unit_citizen_automaton': getAssetUrl('unit_citizen_automaton'),
  'unit_soldier_gearforged': getAssetUrl('unit_soldier_gearforged'),
  'unit_archer_clockwork': getAssetUrl('unit_archer_clockwork'),
  'unit_golem_steam': getAssetUrl('unit_golem_steam'),
  'unit_hero_forgelord': getAssetUrl('unit_hero_forgelord'),

  // Units: Verdant Wardens
  'unit_citizen_human': getAssetUrl('unit_citizen_human'),
  'unit_warden_initiate': getAssetUrl('unit_warden_initiate'),
  'unit_archer_thorn': getAssetUrl('unit_archer_thorn'),
  'unit_golem_wood': getAssetUrl('unit_golem_wood'),
  'unit_mage_beasttamer': getAssetUrl('unit_mage_beasttamer'),
  'unit_hero_elderwood': getAssetUrl('unit_hero_elderwood'),

  // Units: Sunfire Dynasty
  'unit_sunfire_initiate': getAssetUrl('unit_sunfire_initiate'),
  'unit_mage_technomancer': getAssetUrl('unit_mage_technomancer'),
  'unit_soldier_templar': getAssetUrl('unit_soldier_templar'),
  'unit_siege_cannon': getAssetUrl('unit_siege_cannon'),
  'unit_hero_sunpriestess': getAssetUrl('unit_hero_sunpriestess'),

  // Units: Gloom Syndicate
  'unit_syndicate_lackey': getAssetUrl('unit_syndicate_lackey'),
  'unit_syndicate_thug': getAssetUrl('unit_syndicate_thug'),
  'unit_mage_alchemist': getAssetUrl('unit_mage_alchemist'),
  'unit_rogue_shadow': getAssetUrl('unit_rogue_shadow'),
  'unit_rogue_saboteur': getAssetUrl('unit_rogue_saboteur'),
  'unit_hero_shadowbroker': getAssetUrl('unit_hero_shadowbroker'),

  // Units: Ironclad Dwarves
  'unit_dwarf_miner': getAssetUrl('unit_dwarf_miner'),
  'unit_dwarf_warrior': getAssetUrl('unit_dwarf_warrior'),
  'unit_dwarf_thunderer': getAssetUrl('unit_dwarf_thunderer'),
  'unit_hero_dwarf_king': getAssetUrl('unit_hero_dwarf_king'),

  // Units: Sylvan Elves
  'unit_elf_harvester': getAssetUrl('unit_elf_harvester'),
  'unit_elf_longbow': getAssetUrl('unit_elf_longbow'),
  'unit_elf_bladedancer': getAssetUrl('unit_elf_bladedancer'),
  'unit_hero_elf_queen': getAssetUrl('unit_hero_elf_queen'),

  // Units: Dread Legion
  'unit_skeleton': getAssetUrl('unit_skeleton'),
  'unit_skeleton_worker': getAssetUrl('unit_skeleton_worker'),
  'unit_skeleton_scout': getAssetUrl('unit_skeleton_scout'),
  'unit_necromancer': getAssetUrl('unit_necromancer'),
  'unit_bone_golem': getAssetUrl('unit_bone_golem'),
  'unit_hero_lich_lord': getAssetUrl('unit_hero_lich_lord'),
  
  // Units: Crimson Horde
  'unit_orc_peon': getAssetUrl('unit_orc_peon'),
  'unit_orc_hunter': getAssetUrl('unit_orc_hunter'),
  'unit_orc_brute': getAssetUrl('unit_orc_brute'),
  'unit_orc_berserker': getAssetUrl('unit_orc_berserker'),
  'unit_hero_orc_warlord': getAssetUrl('unit_hero_orc_warlord'),

  // Units: Neutral
  'unit_beast_scrapfang': getAssetUrl('unit_beast_scrapfang'),
  'unit_beast_aetherwing': getAssetUrl('unit_beast_aetherwing'),
  'unit_goblin_raider': getAssetUrl('unit_goblin_raider'),
  'unit_bandit_raider': getAssetUrl('unit_bandit_raider'),
};
