
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { GameState, TileData, GamePhase } from '../types';
import { generateInitialGameState } from '../services/worldGenerator';
import { useGameLoop } from '../hooks/useGameLoop';
import { useCameraControls } from '../hooks/useCameraControls';
import { useSoundManager } from '../hooks/useSoundManager';
import { useAssetLoader } from '../hooks/useAssetLoader';
import { BIOMES_MAP, INFRASTRUCTURE_MAP, WORLD_SIZE, FACTIONS_MAP, FACTION_COLOR_HEX_MAP, FACTION_COLOR_RGB_MAP } from '../constants';
import { ASSET_PATHS } from '../assets';
import GameMap from './GameMap';
import Sidebar from './Sidebar';
import Header from './Header';
import EventTicker from './EventTicker';
import IntroVideo from './IntroVideo';
import LoginScreen from './LoginScreen';
import StartMenu from './StartMenu';
import LoadingScreen from './LoadingScreen';
import HelpModal from './HelpModal';
import SaveConfirmationDialog from './SaveConfirmationDialog';

const TILE_WIDTH = 128;
const TILE_VISUAL_HEIGHT = 64;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
  
  const [username, setUsername] = useState('');
  const [saveExists, setSaveExists] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFirstTimeSession, setIsFirstTimeSession] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const targetPanRef = useRef({ x: 0, y: 0 });
  const hasPannedToStartRef = useRef(false);
  
  const initialPan = useMemo(() => ({ x: 0, y: 0 }), []);
  const [camera, setCamera] = useState({ pan: initialPan, zoom: 0.5 });
  
  const soundManager = useSoundManager(camera.zoom);
  const isGameActive = gamePhase === 'playing';
  const mapContainerRef = useCameraControls(setCamera, camera.zoom, setIsFollowing, isGameActive && soundManager.isAudioInitialized);
  
  useGameLoop(setGameState, isGameActive ? gameSpeed : 0, soundManager.isAudioInitialized ? soundManager : null);

  const allAssetUrls = useMemo(() => Object.values(ASSET_PATHS), []);
  const { isLoading: isGameLoading, progress, loadingMessage } = useAssetLoader(allAssetUrls, gamePhase === 'loading');

  const getSaveKey = useCallback(() => `atharium_save_${username}`, [username]);

  useEffect(() => {
    if (username) {
      const savedGame = localStorage.getItem(getSaveKey());
      setSaveExists(!!savedGame);
    }
  }, [username, getSaveKey]);
  
  useEffect(() => {
    if (gamePhase === 'loading' && !isGameLoading) {
      setGamePhase('playing');
    }
  }, [gamePhase, isGameLoading]);

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
        const clickedTile = prev.world[y]?.[x];
        if (!clickedTile) return prev;

        const selectedUnitId = clickedTile.units.length > 0 ? clickedTile.units[0].id : null;
        setIsFollowing(!!selectedUnitId);
        return { ...prev, selectedTile: { x, y }, selectedUnitId };
    });
  }, [soundManager]);
  
  const handleSelectUnit = useCallback((unitId: number | null) => {
    setIsFollowing(!!unitId);
    setGameState(prev => {
        if (!prev) return null;
        const newSelectedTile = unitId ? findUnitLocation(unitId, prev.world) : prev.selectedTile;
        return { ...prev, selectedTile: newSelectedTile, selectedUnitId: unitId };
    });
  }, [findUnitLocation]);

  const handleSelectFaction = useCallback((factionId: string) => {
    if (!gameState) return;
    const settlements = gameState.world.flat().filter(t => t.ownerFactionId === factionId && t.infrastructureId?.startsWith('settlement_'));
    if (settlements.length > 0) {
      settlements.sort((a, b) => (INFRASTRUCTURE_MAP.get(b.infrastructureId!)?.tier || 0) - (INFRASTRUCTURE_MAP.get(a.infrastructureId!)?.tier || 0));
      const capital = settlements[0];
      handlePanToLocation({ x: capital.x, y: capital.y });
      handleSelectTile(capital.x, capital.y);
    }
  }, [gameState, handlePanToLocation, handleSelectTile]);

  const handleLogin = useCallback((name: string) => {
    setUsername(name);
    setGamePhase('menu');
  }, []);
  
  const handleNewGame = useCallback(() => {
    soundManager.initializeAudio();
    setGameState(generateInitialGameState());
    setGamePhase('loading');
    hasPannedToStartRef.current = false;
    setIsFirstTimeSession(true);
    setIsHelpOpen(true);
  }, [soundManager]);
  
  const handleLoadGame = useCallback(() => {
    if (!username) return;
    const savedGameString = localStorage.getItem(getSaveKey());
    if (savedGameString) {
      try {
        setGameState(JSON.parse(savedGameString));
        soundManager.initializeAudio();
        setGamePhase('loading');
        hasPannedToStartRef.current = false;
        setIsFirstTimeSession(false);
      } catch (error) {
        console.error("Failed to load game state, starting a new game:", error);
        handleNewGame();
      }
    }
  }, [username, getSaveKey, soundManager, handleNewGame]);

  const handleSaveGame = useCallback(() => {
    if (gameState && username) {
      try {
        localStorage.setItem(getSaveKey(), JSON.stringify(gameState));
        setSaveExists(true);
        setShowSaveConfirm(true);
        setTimeout(() => setShowSaveConfirm(false), 2000);
      } catch (error) {
        console.error("Failed to save game state:", error);
      }
    }
  }, [gameState, username, getSaveKey]);
  
  const handleResetWorld = useCallback(() => {
    setGameSpeed(1);
    setIsFollowing(false);
    handleNewGame();
  }, [handleNewGame]);

  const handleExitToMenu = useCallback(() => {
    soundManager.shutdown();
    setGameState(null);
    setGamePhase('menu');
    setCamera({ pan: initialPan, zoom: 0.5 });
    setIsFirstTimeSession(false);
  }, [soundManager, initialPan]);

  useEffect(() => {
    const root = document.documentElement;
    let factionId: string | undefined;
    if (gameState?.selectedTile) {
      const { x, y } = gameState.selectedTile;
      const tile = gameState.world[y]?.[x];
      if (tile) {
        if (tile.partOfInfrastructure) {
          const rootTile = gameState.world[tile.partOfInfrastructure.rootY]?.[tile.partOfInfrastructure.rootX];
          factionId = rootTile?.ownerFactionId;
        } else {
          factionId = tile.ownerFactionId;
        }
      }
    }
    const faction = factionId ? FACTIONS_MAP.get(factionId) : null;
    if (faction?.color) {
      root.style.setProperty('--selection-glow-hex', FACTION_COLOR_HEX_MAP[faction.color] || '#06b6d4');
      root.style.setProperty('--selection-glow-rgb', FACTION_COLOR_RGB_MAP[faction.color] || '6, 182, 212');
    } else {
      root.style.setProperty('--selection-glow-hex', '#06b6d4');
      root.style.setProperty('--selection-glow-rgb', '6, 182, 212');
    }
  }, [gameState?.selectedTile, gameState?.world]);

  useEffect(() => {
    if (!isFollowing || !gameState?.selectedUnitId) return;
    let animationFrame: number;
    const smoothPan = () => {
        setGameState(currentGameState => {
            if (!currentGameState?.selectedUnitId) return currentGameState;
            const unitLoc = findUnitLocation(currentGameState.selectedUnitId, currentGameState.world);
            if (unitLoc) {
                targetPanRef.current = { 
                    x: -(unitLoc.x - unitLoc.y) * (TILE_WIDTH / 2), 
                    y: -(unitLoc.x + unitLoc.y) * (TILE_VISUAL_HEIGHT / 2)
                };
            }
            return currentGameState;
        });
        setCamera(prev => {
            if (!isFollowing) return prev;
            const dx = targetPanRef.current.x - prev.pan.x;
            const dy = targetPanRef.current.y - prev.pan.y;
            return (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) 
              ? { ...prev, pan: targetPanRef.current } 
              : { ...prev, pan: { x: prev.pan.x + dx * 0.1, y: prev.pan.y + dy * 0.1 } };
        });
        animationFrame = requestAnimationFrame(smoothPan);
    };
    animationFrame = requestAnimationFrame(smoothPan);
    return () => cancelAnimationFrame(animationFrame);
  }, [isFollowing, gameState?.selectedUnitId, findUnitLocation]);

  useEffect(() => {
    if (isGameActive && gameState && !hasPannedToStartRef.current) {
      const factionIds = Object.keys(gameState.factions).filter(id => !gameState.factions[id].isEliminated);
      if (factionIds.length > 0) {
        const randomFactionId = factionIds[Math.floor(Math.random() * factionIds.length)];
        const startTile = gameState.world.flat().find(t => t.ownerFactionId === randomFactionId && t.infrastructureId?.startsWith('settlement_'));
        if (startTile) handlePanToLocation(startTile);
      }
      hasPannedToStartRef.current = true;
    }
  }, [isGameActive, gameState, handlePanToLocation]);

  useEffect(() => {
    if (!isGameActive || !soundManager.isAudioInitialized || !gameState) return;
    const panX = -camera.pan.x / (TILE_WIDTH / 2);
    const panY = -camera.pan.y / (TILE_VISUAL_HEIGHT / 2);
    const tileY = Math.round((panY - panX) / 2);
    const tileX = Math.round((panY + panX) / 2);

    if (tileX >= 0 && tileX < WORLD_SIZE && tileY >= 0 && tileY < WORLD_SIZE) {
        const biomeId = gameState.world[tileY]?.[tileX]?.biomeId;
        const biome = BIOMES_MAP.get(biomeId || '');
        if (biome) {
            const ambiance = (biome.id === 'gloomwell' || biome.id === 'verdant') ? 'forest' 
                : (biome.id === 'wasteland' || biome.id === 'ashlands' || biome.id === 'atharium_wastes') ? 'wasteland' 
                : 'none';
            soundManager.playAmbiance(ambiance);
        }
    }
  }, [camera.pan, isGameActive, soundManager, gameState?.world]);

  const renderGamePhase = () => {
    switch (gamePhase) {
      case 'intro': return <IntroVideo onFinish={() => setGamePhase('login')} />;
      case 'login': return <LoginScreen onLogin={handleLogin} />;
      case 'menu': return <StartMenu username={username} onNewGame={handleNewGame} onLoadGame={handleLoadGame} saveExists={saveExists} />;
      case 'loading': return <LoadingScreen progress={progress} loadingMessage={loadingMessage} />;
      case 'playing':
        if (gameState && soundManager.isAudioInitialized) {
          return (
            <div className="w-full h-full flex">
              <main ref={mapContainerRef} className="flex-1 h-full relative">
                <GameMap gameState={gameState} onSelectTile={handleSelectTile} camera={camera} />
                <Header gameState={gameState} gameSpeed={gameSpeed} onSetSpeed={setGameSpeed} soundManager={soundManager} onResetWorld={handleResetWorld} onExitToMenu={handleExitToMenu} onSaveGame={handleSaveGame} onToggleHelp={() => setIsHelpOpen(p => !p)} onSelectFaction={handleSelectFaction} />
                <EventTicker events={gameState.eventLog} onEventClick={handlePanToLocation} />
                <SaveConfirmationDialog show={showSaveConfirm} />
              </main>
              <Sidebar selectedTile={gameState.selectedTile ? gameState.world[gameState.selectedTile.y]?.[gameState.selectedTile.x] : null} gameState={gameState} onSelectUnit={handleSelectUnit} onPanToLocation={handlePanToLocation} soundManager={soundManager} isMinimized={isSidebarMinimized} onToggleMinimize={() => setIsSidebarMinimized(p => !p)} />
              {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} isFirstTime={isFirstTimeSession} />}
            </div>
          );
        }
        return <LoadingScreen progress={0} loadingMessage="Initializing..." />; // Fallback
      default: return null;
    }
  };

  return <div className="w-screen h-screen bg-gray-800 flex overflow-hidden">{renderGamePhase()}</div>;
};

export default App;
