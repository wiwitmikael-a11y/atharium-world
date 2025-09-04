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
import { BIOMES_MAP, INFRASTRUCTURE_MAP, WORLD_SIZE, FACTIONS_MAP, FACTION_COLOR_HEX_MAP, FACTION_COLOR_RGB_MAP } from './constants';
import IntroVideo from './components/IntroVideo';
import StartMenu from './components/StartMenu';
import LoginScreen from './components/LoginScreen';
import LoadingScreen from './components/LoadingScreen';
import { useAssetLoader } from './hooks/useAssetLoader';
import { ASSET_PATHS } from './assets';
import HelpModal from './components/HelpModal';


const TILE_WIDTH = 128;
const TILE_VISUAL_HEIGHT = 64;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [username, setUsername] = useState('');
  const [saveExists, setSaveExists] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFirstTimeSession, setIsFirstTimeSession] = useState(false);
  
  const targetPanRef = useRef({ x: 0, y: 0 });
  const hasPannedToStartRef = useRef(false);
  
  const initialPan = useMemo(() => ({ x: 0, y: 0 }), []);
  
  const [camera, setCamera] = useState({ pan: initialPan, zoom: 0.5 });
  const soundManager = useSoundManager(camera.zoom);
  
  const mapContainerRef = useCameraControls(setCamera, camera.zoom, setIsFollowing, gamePhase === 'playing' && soundManager.isAudioInitialized);

  useGameLoop(
    setGameState, 
    gamePhase === 'playing' ? gameSpeed : 0, 
    soundManager.isAudioInitialized ? soundManager : null
  );

  const getSaveKey = useCallback(() => `atharium_save_${username}`, [username]);

    useEffect(() => {
        if (username) {
            const savedGame = localStorage.getItem(getSaveKey());
            setSaveExists(!!savedGame);
        }
    }, [username, getSaveKey]);

  const handleLogin = useCallback((name: string) => {
    setUsername(name);
    setGamePhase('menu');
  }, []);

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

  const handleSelectFaction = useCallback((factionId: string) => {
    if (!gameState) return;

    const settlements = gameState.world.flat()
      .filter(t => t.ownerFactionId === factionId && t.infrastructureId?.startsWith('settlement_'));

    if (settlements.length > 0) {
      settlements.sort((a, b) => {
        const tierA = INFRASTRUCTURE_MAP.get(a.infrastructureId!)?.tier || 0;
        const tierB = INFRASTRUCTURE_MAP.get(b.infrastructureId!)?.tier || 0;
        return tierB - tierA;
      });

      const capital = settlements[0];
      handlePanToLocation({ x: capital.x, y: capital.y });
      handleSelectTile(capital.x, capital.y);
    }
  }, [gameState, handlePanToLocation, handleSelectTile]);


    const handleSaveGame = useCallback(() => {
        if (gameState && username) {
            try {
                const gameStateString = JSON.stringify(gameState);
                localStorage.setItem(getSaveKey(), gameStateString);
                setSaveExists(true);
                console.log('Game Saved!');
            } catch (error) {
                console.error("Failed to save game state:", error);
            }
        }
    }, [gameState, username, getSaveKey]);

    const handleNewGame = useCallback(() => {
        const initialState = generateInitialGameState();
        setGameState(initialState);
        soundManager.initializeAudio();
        setGamePhase('loading');
        hasPannedToStartRef.current = false;
        setIsHelpOpen(true);
        setIsFirstTimeSession(true);
    }, [soundManager]);

    const handleLoadGame = useCallback(() => {
        if (username) {
            const savedGameString = localStorage.getItem(getSaveKey());
            if (savedGameString) {
                try {
                    const savedGameState = JSON.parse(savedGameString);
                    setGameState(savedGameState);
                    soundManager.initializeAudio();
                    setGamePhase('loading');
                    hasPannedToStartRef.current = false;
                    setIsFirstTimeSession(false);
                } catch (error) {
                    console.error("Failed to load game state, starting a new game:", error);
                    handleNewGame();
                }
            }
        }
    }, [username, getSaveKey, soundManager, handleNewGame]);

  const handleResetWorld = useCallback(() => {
    handleNewGame();
    setGameSpeed(1);
    setIsFollowing(false);
  }, [handleNewGame]);

  const handleExitToMenu = useCallback(() => {
      soundManager.shutdown();
      setGameState(null);
      setGamePhase('menu');
      setCamera({ pan: initialPan, zoom: 0.5 });
      setIsFirstTimeSession(false);
  }, [soundManager, initialPan]);
  
  const allAssetUrls = useMemo(() => Object.values(ASSET_PATHS), []);
  const shouldLoadAssets = gamePhase === 'loading';
  const { isLoading: isGameLoading, progress, loadingMessage } = useAssetLoader(allAssetUrls, shouldLoadAssets);

  useEffect(() => {
      if (!isGameLoading && gamePhase === 'loading') {
          setGamePhase('playing');
      }
  }, [isGameLoading, gamePhase]);

  // Effect to set the dynamic faction color for UI elements
  useEffect(() => {
    const root = document.documentElement;
    let factionId: string | undefined;

    if (gameState) {
      if (gameState.selectedUnitId) {
        const unit = gameState.world.flat().flatMap(t => t.units).find(u => u.id === gameState.selectedUnitId);
        if (unit) {
          factionId = unit.factionId;
        }
      } else if (gameState.selectedTile) {
        const tile = gameState.world[gameState.selectedTile.y][gameState.selectedTile.x];
        if (tile) {
            if (tile.partOfInfrastructure) {
                const rootTile = gameState.world[tile.partOfInfrastructure.rootY][tile.partOfInfrastructure.rootX];
                factionId = rootTile.ownerFactionId;
            } else {
                factionId = tile.ownerFactionId;
            }
        }
      }
    }

    const faction = factionId ? FACTIONS_MAP.get(factionId) : null;
    if (faction?.color) {
      const hex = FACTION_COLOR_HEX_MAP[faction.color] || '#06b6d4';
      const rgb = FACTION_COLOR_RGB_MAP[faction.color] || '6, 182, 212';
      root.style.setProperty('--selection-glow-hex', hex);
      root.style.setProperty('--selection-glow-rgb', rgb);
    } else {
      // Reset to default cyan if no faction is selected or it has no color
      root.style.setProperty('--selection-glow-hex', '#06b6d4');
      root.style.setProperty('--selection-glow-rgb', '6, 182, 212');
    }
  }, [gameState?.selectedTile, gameState?.selectedUnitId, gameState?.world]);

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
    if (gamePhase !== 'playing' || !soundManager.isAudioInitialized) return;
    
    // Calculate center tile from camera pan
    const pan = camera.pan;
    const centerX = -pan.x / (TILE_WIDTH / 2);
    const centerY = -pan.y / (TILE_VISUAL_HEIGHT / 2);
    const tileY = Math.round((centerY - centerX) / 2);
    const tileX = Math.round((centerY + centerX) / 2);

    if (tileX >= 0 && tileX < WORLD_SIZE && tileY >= 0 && tileY < WORLD_SIZE) {
        const biomeId = gameState?.world[tileY][tileX]?.biomeId;
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
  }, [camera.pan, gamePhase, soundManager, gameState?.world]);


  const renderGameContent = () => {
    if (gamePhase === 'intro') {
      return <IntroVideo onFinish={() => setGamePhase('login')} />;
    }
    if (gamePhase === 'login') {
        return <LoginScreen onLogin={handleLogin} />
    }
    if (gamePhase === 'menu') {
      return <StartMenu username={username} onNewGame={handleNewGame} onLoadGame={handleLoadGame} saveExists={saveExists} />;
    }
    if (gamePhase === 'loading') {
        return <LoadingScreen progress={progress} loadingMessage={loadingMessage} />;
    }
    if (gamePhase === 'playing' && gameState && soundManager.isAudioInitialized) {
      return (
        <div className="w-full h-full flex">
          <main ref={mapContainerRef} className="flex-1 h-full relative">
            <GameMap gameState={gameState} onSelectTile={handleSelectTile} camera={camera} />
            <Header
              gameState={gameState}
              gameSpeed={gameSpeed}
              onSetSpeed={setGameSpeed}
              soundManager={soundManager}
              onResetWorld={handleResetWorld}
              onExitToMenu={handleExitToMenu}
              onSaveGame={handleSaveGame}
              onToggleHelp={() => setIsHelpOpen(p => !p)}
              onSelectFaction={handleSelectFaction}
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
          {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} isFirstTime={isFirstTimeSession} />}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-screen h-screen bg-gray-800 flex overflow-hidden">
        {renderGameContent()}
    </div>
  );
};

export default App;