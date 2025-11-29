
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SOUND_PATHS } from '../sounds';

const BGM_VOLUME = 0.3;
const MAX_SFX_VOLUME = 0.5;
const MAX_AMBIANCE_VOLUME = 0.4;

export const useSoundManager = (zoom: number) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);

  const bgmSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bgmGainNodeRef = useRef<GainNode | null>(null);
  const masterSfxGainNodeRef = useRef<GainNode | null>(null);
  const sfxGainNodeRef = useRef<GainNode | null>(null);
  const ambGainNodeRef = useRef<GainNode | null>(null);
  const currentAmbianceRef = useRef<string | null>(null);

  const startBGM = useCallback(() => {
    const context = audioContextRef.current;
    const gainNode = bgmGainNodeRef.current;
    if (!context || !gainNode) return;

    const bgmBuffer = audioBuffersRef.current['bgm_main_theme'];
    if (bgmBuffer && !bgmSourceRef.current) {
      const source = context.createBufferSource();
      source.buffer = bgmBuffer;
      source.loop = true;
      source.connect(gainNode);
      source.start();
      bgmSourceRef.current = source;
    }
  }, []);

  const initializeAudio = useCallback(() => {
    if (isInitialized) return;
    
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = context;

    const bgmGain = context.createGain();
    bgmGain.gain.value = isBgmEnabled ? BGM_VOLUME : 0;
    bgmGain.connect(context.destination);
    bgmGainNodeRef.current = bgmGain;

    const masterSfxGain = context.createGain();
    masterSfxGain.gain.value = isSfxEnabled ? 1.0 : 0;
    masterSfxGain.connect(context.destination);
    masterSfxGainNodeRef.current = masterSfxGain;

    const sfxGain = context.createGain();
    sfxGain.connect(masterSfxGain);
    sfxGainNodeRef.current = sfxGain;
    
    const ambGain = context.createGain();
    ambGain.connect(masterSfxGain);
    ambGainNodeRef.current = ambGain;

    setIsInitialized(true);

    (async () => {
      const promises = Object.entries(SOUND_PATHS).map(async ([id, path]) => {
        try {
          const response = await fetch(path);
          const arrayBuffer = await response.arrayBuffer();
          audioBuffersRef.current[id] = await context.decodeAudioData(arrayBuffer);
        } catch (error) {
          console.error(`Failed to load sound: ${id}`, error);
        }
      });
      await Promise.all(promises);
      startBGM();
    })();
  }, [isInitialized, isBgmEnabled, isSfxEnabled, startBGM]);

  useEffect(() => {
    const context = audioContextRef.current;
    if (!context || !isSfxEnabled) return;
    const volume = Math.max(0, (zoom - 0.4) / (2.5 - 0.4));
    if (sfxGainNodeRef.current) sfxGainNodeRef.current.gain.setValueAtTime(volume * MAX_SFX_VOLUME, context.currentTime);
    if (ambGainNodeRef.current) ambGainNodeRef.current.gain.setValueAtTime(volume * MAX_AMBIANCE_VOLUME, context.currentTime);
  }, [zoom, isSfxEnabled]);

  const toggleBgm = useCallback(() => {
    setIsBgmEnabled(prev => {
        const newState = !prev;
        if (bgmGainNodeRef.current) bgmGainNodeRef.current.gain.value = newState ? BGM_VOLUME : 0;
        return newState;
    });
  }, []);

  const toggleSfx = useCallback(() => {
    setIsSfxEnabled(prev => {
        const newState = !prev;
        if (masterSfxGainNodeRef.current) masterSfxGainNodeRef.current.gain.value = newState ? 1.0 : 0;
        return newState;
    });
  }, []);

  const playSFX = useCallback((id: string) => {
    const context = audioContextRef.current;
    const gainNode = sfxGainNodeRef.current;
    const buffer = audioBuffersRef.current[id];
    if (context && gainNode && buffer && isSfxEnabled) {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);
      source.start();
    }
  }, [isSfxEnabled]);

  const playAmbiance = useCallback((ambianceType: string) => {
      // Placeholder for future ambiance logic
      currentAmbianceRef.current = ambianceType; 
  }, []);
  
  const lastHoverTimeRef = useRef(0);
  const playUIHoverSFX = useCallback(() => {
      const now = performance.now();
      if (now - lastHoverTimeRef.current < 150) return;
      lastHoverTimeRef.current = now;
      playSFX('ui_hover');
  }, [playSFX]);

  const shutdown = useCallback(() => {
    audioContextRef.current?.close().then(() => {
      audioContextRef.current = null;
      bgmSourceRef.current = null;
      setIsInitialized(false);
      audioBuffersRef.current = {};
      currentAmbianceRef.current = null;
    });
  }, []);
  
  return useMemo(() => ({
    initializeAudio, playSFX, playUIHoverSFX, playAmbiance, shutdown,
    toggleBgm, toggleSfx, isBgmEnabled, isSfxEnabled,
    isAudioInitialized: isInitialized,
  }), [initializeAudio, playSFX, playUIHoverSFX, playAmbiance, shutdown, toggleBgm, toggleSfx, isBgmEnabled, isSfxEnabled, isInitialized]);
};
