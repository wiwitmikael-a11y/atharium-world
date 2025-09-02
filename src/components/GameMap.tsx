import React from 'react';
import type { GameState } from '../types';
import Tile from './Tile';
import { UNITS_MAP } from '../constants';
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

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-gray-900" 
    >
        <div 
          className="absolute top-1/2 left-1/2 transition-transform duration-100 ease-linear"
          style={{ 
            transform: `scale(${camera.zoom}) translateX(${camera.pan.x}px) translateY(${camera.pan.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          {world.flat().map((tile) => {
            // If the tile is part of a larger structure, find its root tile.
            // Otherwise, the root tile is the tile itself.
            const rootTile = tile.partOfInfrastructure 
              ? world[tile.partOfInfrastructure.rootY][tile.partOfInfrastructure.rootX] 
              : tile;

            // A tile is considered selected if the game's selectedTile matches its root tile.
            // This makes the entire 2x2 structure appear selected.
            const isSelected = !!selectedTile && 
                               selectedTile.x === rootTile.x && 
                               selectedTile.y === rootTile.y;
            
            // Clicking any part of a multi-tile structure should select its root tile.
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

          {/* Render Dying Units */}
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