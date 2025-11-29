
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

  // We keep visual assets for fallback, but main engine is now procedural
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
};
