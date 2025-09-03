import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { GameState } from '../types';
import Tile from './Tile';
import { UNITS_MAP, WORLD_SIZE } from '../constants';
import { ASSET_PATHS } from '../assets';

interface GameMapProps {
  gameState: GameState;
  onSelectTile: (x: number, y: number) => void;
  camera: { pan: { x: number; y: number; }; zoom: number; };
}

const TILE_WIDTH = 128;
const TILE_VISUAL_HEIGHT = 64;
const TILE_CONTAINER_HEIGHT = 128;


const GameMap: React.FC<GameMapProps> = ({ gameState, onSelectTile, camera }) => {
  const { world, selectedTile, dyingUnits } = gameState;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setViewportSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(container);
    // Set initial size
    setViewportSize({ width: container.clientWidth, height: container.clientHeight });

    return () => resizeObserver.disconnect();
  }, []);

  const visibleTiles = useMemo(() => {
    if (viewportSize.width === 0 || viewportSize.height === 0) {
      return [];
    }
    
    const { pan, zoom } = camera;
    const { width, height } = viewportSize;

    const centerX = -pan.x;
    const centerY = -pan.y;

    const visibleWidth = width / zoom;
    const visibleHeight = height / zoom;

    const corners = [
      { x: centerX - visibleWidth / 2, y: centerY - visibleHeight / 2 }, // top-left
      { x: centerX + visibleWidth / 2, y: centerY - visibleHeight / 2 }, // top-right
      { x: centerX + visibleWidth / 2, y: centerY + visibleHeight / 2 }, // bottom-right
      { x: centerX - visibleWidth / 2, y: centerY + visibleHeight / 2 }, // bottom-left
    ];

    const tileCorners = corners.map(corner => ({
      x: (corner.y / TILE_VISUAL_HEIGHT) + (corner.x / TILE_WIDTH),
      y: (corner.y / TILE_VISUAL_HEIGHT) - (corner.x / TILE_WIDTH)
    }));
    
    const buffer = 3;
    const minX = Math.max(0, Math.floor(Math.min(...tileCorners.map(c => c.x))) - buffer);
    const maxX = Math.min(WORLD_SIZE - 1, Math.ceil(Math.max(...tileCorners.map(c => c.x))) + buffer);
    const minY = Math.max(0, Math.floor(Math.min(...tileCorners.map(c => c.y))) - buffer);
    const maxY = Math.min(WORLD_SIZE - 1, Math.ceil(Math.max(...tileCorners.map(c => c.y))) + buffer);

    const tilesToRender = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const tile = world[y][x];
        if (tile) {
            tilesToRender.push(tile);
        }
      }
    }
    return tilesToRender;
  }, [camera, viewportSize, world]);

  return (
    <div 
      ref={mapContainerRef}
      className="relative w-full h-full overflow-hidden bg-gray-900" 
    >
        <div 
          className="absolute top-1/2 left-1/2"
          style={{ 
            transform: `scale(${camera.zoom}) translateX(${camera.pan.x}px) translateY(${camera.pan.y}px)`,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        >
          {visibleTiles.map((tile) => {
            const rootTile = tile.partOfInfrastructure 
              ? world[tile.partOfInfrastructure.rootY][tile.partOfInfrastructure.rootX] 
              : tile;

            const isSelected = !!selectedTile && 
                               selectedTile.x === rootTile.x && 
                               selectedTile.y === rootTile.y;
            
            const handleSelect = () => onSelectTile(rootTile.x, rootTile.y);
            
            return (
              <Tile
                key={`${tile.x}-${tile.y}`}
                tile={tile}
                isSelected={isSelected}
                onSelect={handleSelect}
                gameState={gameState}
              />
            )
          })}

          {dyingUnits.map((dyingUnit) => {
              const unitDef = UNITS_MAP.get(dyingUnit.unitId);
              if (!unitDef) return null;
              const unitAsset = ASSET_PATHS[unitDef.assetId];
              if (!unitAsset) return null;

              const screenX = (dyingUnit.x - dyingUnit.y) * (TILE_WIDTH / 2);
              const screenY = (dyingUnit.x + dyingUnit.y) * (TILE_VISUAL_HEIGHT / 2);
              const zIndex = (dyingUnit.x + dyingUnit.y) * 2 + 1;

              return (
                <div
                    key={`dying-${dyingUnit.id}-${dyingUnit.deathTick}`}
                    className="absolute dying-unit-animation"
                    style={{
                        transform: `translate(${screenX - TILE_WIDTH / 2}px, ${screenY - TILE_CONTAINER_HEIGHT / 2}px)`,
                        width: `${TILE_WIDTH}px`,
                        height: `${TILE_CONTAINER_HEIGHT}px`,
                        zIndex: zIndex,
                        pointerEvents: 'none'
                    }}
                >
                    <div className="absolute" style={{ width: '60%', height: '60%', left: '50%', bottom: '40%', transform: 'translateX(-50%)' }}>
                       <img 
                          src={unitAsset} 
                          alt={unitDef.name} 
                          className="absolute w-full h-full object-contain"
                          draggable="false" 
                        />
                    </div>
                </div>
              )
          })}
      </div>
    </div>
  );
};

export default React.memo(GameMap);