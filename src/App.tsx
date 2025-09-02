import React from 'react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { GameState, TileData, GamePhase } from './types';
import { generateInitialGameState } from './services/worldGenerator';
import { useGameLoop } from './hooks/useGameLoop';
import { useCameraControls } from './hooks/useCameraControls';
import { useSoundManager } from './hooks/useSoundManager';
import GameMap from './components/GameMap';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EventTicker from './components/EventTicker';
import { BIOMES_MAP, WORLD_SIZE } from './constants';
import IntroVideo from './components/IntroVideo';
import StartMenu from './components/StartMenu';
import { ASSET_PATHS } from './assets';
import { useAssetLoader } from './hooks/useAssetLoader';
import LoadingScreen from './components/LoadingScreen';

const TILE_WIDTH = 128;
const TILE_VISUAL_HEIGHT = 64;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const targetPanRef = useRef({ x: 0, y: 0 });
  const hasPannedToStartRef = useRef(false);
  
  const initialPan = useMemo(() => ({ x: 0, y: 0 }), []);
  
  const [camera, setCamera] = useState({ pan: initialPan, zoom: 0.5 });
  const soundManager = useSoundManager(camera.zoom);
  const { isLoading: assetsLoading, progress, loadingMessage } = useAssetLoader(Object.values(ASSET_PATHS), gamePhase === 'loading');
  
  const mapContainerRef = useCameraControls(setCamera, camera.zoom, setIsFollowing, gamePhase === 'playing' && soundManager.isAudioInitialized);

  useGameLoop(
    setGameState, 
    gamePhase === 'playing' ? gameSpeed : 0, 
    gamePhase === 'playing' && soundManager.isAudioInitialized ? soundManager : null
  );

  const findUnitLocation = useCallback((unitId: number, world: TileData[][]) => {
    for (const row of world) {
      for (const tile of row) {
        if (tile.units.some(u => u.id === unitId)) {
          return { x: tile.x, y: tile.y };
        }
      }
    }
    return null;
  }, []);

  const handlePanToLocation = useCallback(({ x, y }: { x: number; y: number; }) => {
    setIsFollowing(false);
    const panX = -(x - y) * (TILE_WIDTH / 2);
    const panY = -(x + y) * (TILE_VISUAL_HEIGHT / 2);
    setCamera(prev => ({ ...prev, zoom: Math.max(0.8, prev.zoom), pan: { x: panX, y: panY }}));
  }, []);
  
  const handleSelectTile = useCallback((x: number, y: number) => {
    soundManager.playSFX('ui_click_subtle');
    setIsSidebarMinimized(false);
    setGameState(prev => {
        if (!prev) return null;
        const clickedTile = prev.world[y][x];
        if (clickedTile.units.length > 0) {
            setIsFollowing(true); 
            return {
                ...prev,
                selectedTile: { x, y },
                selectedUnitId: clickedTile.units[0].id
            };
        } else {
            setIsFollowing(false);
            return {
                ...prev,
                selectedTile: { x, y },
                selectedUnitId: null
            };
        }
    });
  }, [soundManager]);
  
  const handleSelectUnit = useCallback((unitId: number | null) => {
    setIsFollowing(unitId !== null);
    setGameState(prev => {
        if (!prev) return null;
        const newSelectedTile = unitId ? findUnitLocation(unitId, prev.world) : prev.selectedTile;
        return {
            ...prev,
            selectedTile: newSelectedTile,
            selectedUnitId: unitId
        };
    });
  }, [findUnitLocation]);

  const handleResetWorld = useCallback(() => {
    const newState = generateInitialGameState();
    setGameState(newState);
    setGameSpeed(1);
    setIsFollowing(false);
    hasPannedToStartRef.current = false;
    // Pan to a new random location on reset
    const factionIds = Object.keys(newState.factions);
    if (factionIds.length > 0) {
        const randomFactionId = factionIds[Math.floor(Math.random() * factionIds.length)];
        const startTile = newState.world.flat().find(t => t.ownerFactionId === randomFactionId && t.infrastructureId?.startsWith('settlement_'));
        if (startTile) {
            handlePanToLocation({ x: startTile.x, y: startTile.y });
        }
    }
  }, [handlePanToLocation]);

  const handleExitToMenu = useCallback(() => {
      soundManager.shutdown();
      setGameState(null);
      setGamePhase('intro');
      // Reset camera to default
      setCamera({ pan: initialPan, zoom: 0.5 });
  }, [soundManager, initialPan]);

  const handleStart = useCallback(() => {
    setGamePhase('loading');
  }, []);

  // Effect to handle transition from loading to playing
  useEffect(() => {
    if (gamePhase === 'loading' && !assetsLoading) {
        const initialState = generateInitialGameState();
        setGameState(initialState);
        soundManager.initializeAudio();
        setGamePhase('playing');
        hasPannedToStartRef.current = false;
    }
  }, [gamePhase, assetsLoading, soundManager]);

  // Effect for smooth camera follow
  useEffect(() => {
    if (!isFollowing || !gameState || !gameState.selectedUnitId) return;

    let animationFrame: number;
    const smoothPan = () => {
        setGameState(currentGameState => {
            if (!currentGameState || !currentGameState.selectedUnitId) return currentGameState;
            const unitLoc = findUnitLocation(currentGameState.selectedUnitId, currentGameState.world);
            if (unitLoc) {
                const panX = -(unitLoc.x - unitLoc.y) * (TILE_WIDTH / 2);
                const panY = -(unitLoc.x + unitLoc.y) * (TILE_VISUAL_HEIGHT / 2);
                targetPanRef.current = { x: panX, y: panY };
            }
            return currentGameState;
        });

        setCamera(prev => {
            if (!isFollowing) return prev;
            const dx = targetPanRef.current.x - prev.pan.x;
            const dy = targetPanRef.current.y - prev.pan.y;
            const easing = 0.1;
            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
                return { ...prev, pan: targetPanRef.current };
            }
            return { ...prev, pan: { x: prev.pan.x + dx * easing, y: prev.pan.y + dy * easing } };
        });
        animationFrame = requestAnimationFrame(smoothPan);
    };
    animationFrame = requestAnimationFrame(smoothPan);
    return () => cancelAnimationFrame(animationFrame);
  }, [isFollowing, gameState?.selectedUnitId, findUnitLocation]);

  // Effect for initial pan to a random faction
  useEffect(() => {
    if (gamePhase === 'playing' && gameState && !hasPannedToStartRef.current) {
      const factionIds = Object.keys(gameState.factions);
      if (factionIds.length > 0) {
        const randomFactionId = factionIds[Math.floor(Math.random() * factionIds.length)];
        const startTile = gameState.world.flat().find(t => t.ownerFactionId === randomFactionId && t.infrastructureId?.startsWith('settlement_'));
        if (startTile) {
          handlePanToLocation({ x: startTile.x, y: startTile.y });
        }
      }
      hasPannedToStartRef.current = true;
    }
  }, [gamePhase, gameState, handlePanToLocation]);

  // Effect for dynamic ambiance sound
  useEffect(() => {
    if (gamePhase !== 'playing' || !soundManager.isAudioInitialized || !gameState) return;
    
    // Calculate center tile from camera pan
    const pan = camera.pan;
    const centerX = -pan.x / (TILE_WIDTH / 2);
    const centerY = -pan.y / (TILE_VISUAL_HEIGHT / 2);
    const tileY = Math.round((centerY - centerX) / 2);
    const tileX = Math.round((centerY + centerX) / 2);

    if (tileX >= 0 && tileX < WORLD_SIZE && tileY >= 0 && tileY < WORLD_SIZE) {
        const biomeId = gameState.world[tileY][tileX]?.biomeId;
        const biome = BIOMES_MAP.get(biomeId || '');
        if (biome) {
            if (biome.id === 'gloomwell' || biome.id === 'verdant') {
                soundManager.playAmbiance('forest');
            } else if (biome.id === 'wasteland' || biome.id === 'ashlands' || biome.id === 'atharium_wastes') {
                soundManager.playAmbiance('wasteland');
            } else {
                 soundManager.playAmbiance('none');
            }
        }
    }
  }, [camera.pan, gamePhase, soundManager, gameState]);


  const renderGameContent = () => {
    if (gamePhase === 'intro') {
      return <IntroVideo onFinish={() => setGamePhase('menu')} />;
    }
    if (gamePhase === 'menu') {
      return <StartMenu onStart={handleStart} />;
    }
     if (gamePhase === 'loading') {
      return <LoadingScreen progress={progress} loadingMessage={loadingMessage} />;
    }
    if (gamePhase === 'playing' && gameState && soundManager.isAudioInitialized) {
      return (
        <div className="flex w-full h-full">
          <main ref={mapContainerRef} className="flex-1 h-full relative">
            <GameMap gameState={gameState} onSelectTile={handleSelectTile} camera={camera} />
            <Header
              gameState={gameState}
              gameSpeed={gameSpeed}
              onSetSpeed={setGameSpeed}
              soundManager={soundManager}
              onResetWorld={handleResetWorld}
              onExitToMenu={handleExitToMenu}
            />
            <EventTicker events={gameState.eventLog} onEventClick={handlePanToLocation} />
          </main>
          <Sidebar
            selectedTile={gameState.selectedTile ? gameState.world[gameState.selectedTile.y][gameState.selectedTile.x] : null}
            gameState={gameState}
            onSelectUnit={handleSelectUnit}
            onPanToLocation={handlePanToLocation}
            soundManager={soundManager}
            isMinimized={isSidebarMinimized}
            onToggleMinimize={() => setIsSidebarMinimized(p => !p)}
          />
        </div>
      );
    }
    // Fallback for initial loading state or if something unexpected happens
    return null;
  };

  return (
    <div className="w-screen h-screen bg-gray-800 flex overflow-hidden">
        {renderGameContent()}
    </div>
  );
};

export default App;