
const GITHUB_SOUND_BASE_URL = 'https://cdn.jsdelivr.net/gh/wiwitmikael-a11y/atharium-sounds@main/';

const getSoundUrl = (fileName: string) => `${GITHUB_SOUND_BASE_URL}${fileName}`;

export const SOUND_PATHS: Record<string, string> = {
  // Background Music
  'bgm_main_theme': getSoundUrl('bgm_epoch_of_steam.mp3'),
  
  // Ambiance Loops
  'amb_forest': getSoundUrl('amb_forest_loop.mp3'),
  'amb_wasteland': getSoundUrl('amb_wasteland_wind.mp3'),

  // UI Sounds
  'ui_click_subtle': getSoundUrl('ui_click_subtle.mp3'),
  'ui_hover': getSoundUrl('ui_hover.mp3'),
  'ui_error': getSoundUrl('ui_error.mp3'),

  // Sound Effects
  'sfx_attack_sword': getSoundUrl('sfx_attack_sword.mp3'),
  'sfx_unit_die': getSoundUrl('sfx_unit_die.mp3'),
  'sfx_build_start': getSoundUrl('sfx_build_start.mp3'),
  'sfx_build_complete': getSoundUrl('sfx_build_complete.mp3'),
};
