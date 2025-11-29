
import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { GameState, FloatingText } from '../types';
import Tile from './Tile';
import { WORLD_SIZE } from '../constants';

interface GameMapProps {
  gameState: GameState;
  onSelectTile: (x: number, y: number) => void;
  camera: { pan: { x: number; y: number; }; zoom: number; };
}

const TILE_WIDTH = 128;
const TILE_VISUAL_HEIGHT = 64;

const FloatingTextLayer: React.FC<{ texts: FloatingText[], camera: { pan: {x:number, y:number}, zoom: number } }> = ({ texts, camera }) => {
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
            {texts.map(ft => {
                const screenX = (ft.x - ft.y) * (TILE_WIDTH / 2);
                const screenY = (ft.x + ft.y) * (TILE_VISUAL_HEIGHT / 2);
                return (
                    <div
                        key={ft.id}
                        className="absolute text-xl font-bold font-mono"
                        style={{
                            left: '50%', top: '50%',
                            transform: `scale(${camera.zoom}) translate(${camera.pan.x + screenX}px, ${camera.pan.y + screenY - 50}px)`,
                            color: ft.color,
                            opacity: ft.life,
                            textShadow: '2px 2px 0px black'
                        }}
                    >
                        {ft.text}
                    </div>
                )
            })}
        </div>
    )
}

const GameMap: React.FC<GameMapProps> = ({ gameState, onSelectTile, camera }) => {
  const { world, selectedTile, floatingTexts, gameTime } = gameState;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) setViewportSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const visibleTiles = useMemo(() => {
    if (viewportSize.width === 0) return [];
    
    const { pan, zoom } = camera;
    const centerX = -pan.x;
    const centerY = -pan.y;
    const visibleWidth = viewportSize.width / zoom;
    const visibleHeight = viewportSize.height / zoom;

    const corners = [
      { x: centerX - visibleWidth / 2, y: centerY - visibleHeight / 2 },
      { x: centerX + visibleWidth / 2, y: centerY - visibleHeight / 2 },
      { x: centerX + visibleWidth / 2, y: centerY + visibleHeight / 2 },
      { x: centerX - visibleWidth / 2, y: centerY + visibleHeight / 2 },
    ];

    const tileCorners = corners.map(c => ({
      x: (c.x / (TILE_WIDTH / 2) + c.y / (TILE_VISUAL_HEIGHT / 2)) / 2,
      y: (c.y / (TILE_VISUAL_HEIGHT / 2) - c.x / (TILE_WIDTH / 2)) / 2
    }));
    
    const buffer = 4; 
    const minX = Math.max(0, Math.floor(Math.min(...tileCorners.map(c => c.x))) - buffer);
    const maxX = Math.min(WORLD_SIZE - 1, Math.ceil(Math.max(...tileCorners.map(c => c.x))) + buffer);
    const minY = Math.max(0, Math.floor(Math.min(...tileCorners.map(c => c.y))) - buffer);
    const maxY = Math.min(WORLD_SIZE - 1, Math.ceil(Math.max(...tileCorners.map(c => c.y))) + buffer);

    const tiles = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if(world[y]?.[x]) tiles.push(world[y][x]);
      }
    }
    return tiles;
  }, [camera, viewportSize, world]);

  const timeOfDay = gameTime.timeOfDay; 
  const nightOpacity = Math.max(0, Math.min(0.6, timeOfDay < 6 ? 0.6 - (timeOfDay/6)*0.6 : timeOfDay > 18 ? (timeOfDay-18)/6*0.6 : 0));

  return (
    <div ref={mapContainerRef} className="relative w-full h-full overflow-hidden bg-gray-900">
        <div 
          className="absolute top-1/2 left-1/2"
          style={{ transform: `scale(${camera.zoom}) translate(${camera.pan.x}px, ${camera.pan.y}px)`, transformOrigin: 'center center' }}
        >
          {visibleTiles.map((tile) => {
            const rootTile = tile.partOfInfrastructure ? world[tile.partOfInfrastructure.rootY]?.[tile.partOfInfrastructure.rootX] : tile;
            if (!rootTile) return null;
            const isSelected = !!selectedTile && selectedTile.x === rootTile.x && selectedTile.y === rootTile.y;
            return <Tile key={`${tile.x}-${tile.y}`} tile={tile} isSelected={isSelected} onSelect={() => onSelectTile(rootTile.x, rootTile.y)} gameState={gameState} />;
          })}
      </div>
      <FloatingTextLayer texts={floatingTexts} camera={camera} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: '#000033', opacity: nightOpacity, mixBlendMode: 'multiply' }} />
    </div>
  );
};

export default React.memo(GameMap);
