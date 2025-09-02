import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SOUND_PATHS } from '../sounds';

const BGM_VOLUME = 0.3;
const MAX_SFX_VOLUME = 0.5;
const MAX_AMBIANCE_VOLUME = 0.4;
const FADE_TIME = 1.0; // seconds for crossfade

export const useSoundManager = (zoom: number) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const lastHoverTimeRef = useRef(0);

  // State for UI
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  // Audio Nodes
  const bgmSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bgmGainNodeRef = useRef<GainNode | null>(null);
  
  const masterSfxGainNodeRef = useRef<GainNode | null>(null); // Controls ALL SFX/Ambiance
  const sfxGainNodeRef = useRef<GainNode | null>(null);
  const ambGainNodeRef = useRef<GainNode | null>(null);
  
  const ambSource1Ref = useRef<AudioBufferSourceNode | null>(null);
  const ambSource2Ref = useRef<AudioBufferSourceNode | null>(null);
  const ambGain1Ref = useRef<GainNode | null>(null);
  const ambGain2Ref = useRef<GainNode | null>(null);
  const currentAmbianceRef = useRef<string | null>(null);

  const startBGM = useCallback(() => {
    if (!isInitialized || !audioContextRef.current || !bgmGainNodeRef.current) return;
    const context = audioContextRef.current;

    const bgmBuffer = audioBuffersRef.current['bgm_main_theme'];
    if (bgmBuffer && !bgmSourceRef.current) {
      const source = context.createBufferSource();
      source.buffer = bgmBuffer;
      source.loop = true;
      source.connect(bgmGainNodeRef.current);
      source.start();
      bgmSourceRef.current = source;
    }
  }, [isInitialized]);

  const loadSounds = useCallback(async (context: AudioContext) => {
    const promises = Object.keys(SOUND_PATHS).map(async (id) => {
      if (!audioBuffersRef.current[id]) {
        try {
          const response = await fetch(SOUND_PATHS[id]);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await context.decodeAudioData(arrayBuffer);
          audioBuffersRef.current[id] = audioBuffer;
        } catch (error) {
          console.error(`Failed to load or decode sound: ${id}`, error);
        }
      }
    });
    await Promise.all(promises);
    if (audioBuffersRef.current['bgm_main_theme'] && !bgmSourceRef.current) {
      startBGM();
    }
  }, [startBGM]);

  const initializeAudio = useCallback(() => {
    if (isInitialized) return;
    
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = context;

    // BGM Channel
    const bgmGain = context.createGain();
    bgmGain.gain.value = BGM_VOLUME;
    bgmGain.connect(context.destination);
    bgmGainNodeRef.current = bgmGain;

    // Master SFX Channel
    const masterSfxGain = context.createGain();
    masterSfxGain.gain.value = 1.0; // Full volume, controlled by sub-gains
    masterSfxGain.connect(context.destination);
    masterSfxGainNodeRef.current = masterSfxGain;

    // SFX Sub-Channel
    const sfxGain = context.createGain();
    sfxGain.gain.value = MAX_SFX_VOLUME;
    sfxGain.connect(masterSfxGain);
    sfxGainNodeRef.current = sfxGain;
    
    // Ambiance Sub-Channel
    const ambMasterGain = context.createGain();
    ambMasterGain.gain.value = MAX_AMBIANCE_VOLUME;
    ambMasterGain.connect(masterSfxGain);
    ambGainNodeRef.current = ambMasterGain;

    const gain1 = context.createGain();
    gain1.gain.value = 0;
    gain1.connect(ambMasterGain);
    ambGain1Ref.current = gain1;

    const gain2 = context.createGain();
    gain2.gain.value = 0;
    gain2.connect(ambMasterGain);
    ambGain2Ref.current = gain2;

    setIsInitialized(true);
    loadSounds(context);
  }, [isInitialized, loadSounds]);


  useEffect(() => {
    if (!audioContextRef.current || !isSfxEnabled) return;
    const context = audioContextRef.current;
    const volume = Math.max(0, (zoom - 0.4) / (2.5 - 0.4));
    
    if (sfxGainNodeRef.current) {
      sfxGainNodeRef.current.gain.setValueAtTime(volume * MAX_SFX_VOLUME, context.currentTime);
    }
    if (ambGainNodeRef.current) {
      ambGainNodeRef.current.gain.setValueAtTime(volume * MAX_AMBIANCE_VOLUME, context.currentTime);
    }
  }, [zoom, isSfxEnabled]);

  const toggleBgm = useCallback(() => {
    if (!bgmGainNodeRef.current) return;
    const newEnabledState = !isBgmEnabled;
    setIsBgmEnabled(newEnabledState);
    bgmGainNodeRef.current.gain.value = newEnabledState ? BGM_VOLUME : 0;
  }, [isBgmEnabled]);

  const toggleSfx = useCallback(() => {
    if (!masterSfxGainNodeRef.current) return;
    const newEnabledState = !isSfxEnabled;
    setIsSfxEnabled(newEnabledState);
    masterSfxGainNodeRef.current.gain.value = newEnabledState ? 1.0 : 0;
  }, [isSfxEnabled]);

  const playSFX = useCallback((id: string) => {
    if (!isInitialized || !audioContextRef.current || !sfxGainNodeRef.current) return;
    
    const buffer = audioBuffersRef.current[id];
    if (buffer) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(sfxGainNodeRef.current);
      source.start();
    }
  }, [isInitialized]);

  const playUIHoverSFX = useCallback(() => {
      const now = performance.now();
      if (now - lastHoverTimeRef.current < 150) return;
      lastHoverTimeRef.current = now;
      playSFX('ui_hover');
  }, [playSFX]);

  const playAmbiance = useCallback((ambianceType: string) => {
    if (!isInitialized || !audioContextRef.current || !ambGain1Ref.current || !ambGain2Ref.current) return;
    if (ambianceType === currentAmbianceRef.current) return;

    const context = audioContextRef.current;
    const now = context.currentTime;
    
    const ambMap: Record<string, string> = { 'forest': 'amb_forest', 'wasteland': 'amb_wasteland' };
    const bufferId = ambMap[ambianceType];
    const buffer = audioBuffersRef.current[bufferId];

    ambGain1Ref.current.gain.linearRampToValueAtTime(0, now + FADE_TIME);
    ambGain2Ref.current.gain.linearRampToValueAtTime(0, now + FADE_TIME);
    
    if (ambSource1Ref.current) ambSource1Ref.current.stop(now + FADE_TIME);
    if (ambSource2Ref.current) ambSource2Ref.current.stop(now + FADE_TIME);
    ambSource1Ref.current = null;
    ambSource2Ref.current = null;

    currentAmbianceRef.current = ambianceType;

    if (buffer) {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(ambGain1Ref.current);
        source.start(now);
        
        ambGain1Ref.current.gain.setValueAtTime(0, now);
        ambGain1Ref.current.gain.linearRampToValueAtTime(1, now + FADE_TIME);

        ambSource1Ref.current = source;
    }
  }, [isInitialized]);

  const shutdown = useCallback(() => {
    if (!audioContextRef.current) return;
    audioContextRef.current.close().then(() => {
      audioContextRef.current = null;
      bgmSourceRef.current = null;
      setIsInitialized(false);
      // Reset all refs
      Object.keys(audioBuffersRef.current).forEach(key => delete audioBuffersRef.current[key]);
      currentAmbianceRef.current = null;
    });
  }, []);
  
  return useMemo(() => ({
    initializeAudio, 
    playSFX, 
    playUIHoverSFX, 
    playAmbiance, 
    isAudioInitialized: isInitialized,
    toggleBgm,
    toggleSfx,
    shutdown,
    isBgmEnabled,
    isSfxEnabled,
  }), [initializeAudio, playSFX, playUIHoverSFX, playAmbiance, isInitialized, toggleBgm, toggleSfx, shutdown, isBgmEnabled, isSfxEnabled]);
};