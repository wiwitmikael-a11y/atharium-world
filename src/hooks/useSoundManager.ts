
import { useState, useMemo, useCallback, useRef } from 'react';
import { playSynthSound } from '../services/audioSynth';

export const useSoundManager = (zoom: number) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [isSfxEnabled, setIsSfxEnabled] = useState(true);
  
  // Ref to throttle hover sounds
  const lastHoverTimeRef = useRef(0);

  const initializeAudio = useCallback(() => {
    setIsInitialized(true);
    // Synth doesn't need pre-loading
  }, []);

  const playSFX = useCallback((id: string) => {
    if (!isSfxEnabled) return;
    playSynthSound(id);
  }, [isSfxEnabled]);

  const playUIHoverSFX = useCallback(() => {
      const now = performance.now();
      if (now - lastHoverTimeRef.current < 100) return;
      lastHoverTimeRef.current = now;
      playSFX('ui_hover');
  }, [playSFX]);

  const playAmbiance = useCallback((ambianceType: string) => {
      // Procedural ambiance (simplified for now as one-shots or we could add loops in audioSynth)
      // For this lightweight version, we trigger subtle cues based on biome
      if (Math.random() < 0.05 && isSfxEnabled) {
          if (ambianceType === 'forest') playSynthSound('amb_forest');
          if (ambianceType === 'wasteland') playSynthSound('amb_wasteland');
      }
  }, [isSfxEnabled]);

  const toggleBgm = useCallback(() => setIsBgmEnabled(p => !p), []);
  const toggleSfx = useCallback(() => setIsSfxEnabled(p => !p), []);
  const shutdown = useCallback(() => setIsInitialized(false), []);

  return useMemo(() => ({
    initializeAudio,
    playSFX,
    playUIHoverSFX,
    playAmbiance,
    toggleBgm,
    toggleSfx,
    shutdown,
    isBgmEnabled,
    isSfxEnabled,
    isAudioInitialized: isInitialized,
  }), [initializeAudio, playSFX, playUIHoverSFX, playAmbiance, toggleBgm, toggleSfx, shutdown, isBgmEnabled, isSfxEnabled, isInitialized]);
};
