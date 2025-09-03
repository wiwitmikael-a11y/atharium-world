import React from 'react';
import type { TileData, GameState } from '../types';
import { FACTIONS_MAP, RESOURCES_MAP, UNITS_MAP, BIOMES_MAP, INFRASTRUCTURE_MAP, WORLD_EVENTS_MAP, BIOME_PASTEL_COLORS } from '../constants';
import { ASSET_PATHS, BIOME_TERRAIN_MAP } from '../assets';

interface TileProps {
  tile: TileData;
  isSelected: boolean;
  onSelect: () => void;
  gameState: GameState;
}

const FACTION_COLOR_MAP: Record<string, string> = {
  'red-500': '#ef4444',
  'green-500': '#22c55e',
  'yellow-600': '#ca8a04',
  'violet-500': '#8b5cf6',
  'blue-400': '#60a5fa',
  'teal-400': '#2dd4bf',
  'gray-400': '#9ca3af',
  'orange-500': '#f97316',
};

const Tile: React.FC<TileProps> = ({ tile, isSelected, onSelect, gameState }) => {
  const resource = tile.resourceId ? RESOURCES_MAP.get(tile.resourceId) : null;
  const infrastructure = tile.infrastructureId ? INFRASTRUCTURE_MAP.get(tile.infrastructureId) : null;
  const worldEvent = tile.worldEventId ? WORLD_EVENTS_MAP.get(tile.worldEventId) : null;
  const unitInstance = tile.units.length > 0 ? tile.units[0] : null;
  const unitDef = unitInstance ? UNITS_MAP.get(unitInstance.unitId) : null;
  const unitFaction = unitInstance ? FACTIONS_MAP.get(unitInstance.factionId) : null;
  const biome = BIOMES_MAP.get(tile.biomeId);

  const resourceAsset = resource ? ASSET_PATHS[resource.assetId] : null;
  const infrastructureAsset = infrastructure ? ASSET_PATHS[infrastructure.assetId] : null;
  const worldEventAsset = worldEvent ? ASSET_PATHS[worldEvent.assetId] : null;
  const unitAsset = unitDef ? ASSET_PATHS[unitDef.assetId] : null;
  const terrainAssetId = BIOME_TERRAIN_MAP[tile.biomeId];
  const terrainAsset = terrainAssetId ? ASSET_PATHS[terrainAssetId] : ASSET_PATHS['terrain_base'];


  const isUnitSelected = unitInstance && gameState.selectedUnitId === unitInstance.id;
  const showAttackFlash = unitInstance && gameState.attackFlashes[unitInstance.id];

  const TILE_WIDTH = 128;
  const TILE_VISUAL_HEIGHT = 64;
  const TILE_CONTAINER_HEIGHT = 128;

  const screenX = (tile.x - tile.y) * (TILE_WIDTH / 2);
  const screenY = (tile.x + tile.y) * (TILE_VISUAL_HEIGHT / 2);

  const terrainZ = (tile.x + tile.y) * 2;
  const objectZ = terrainZ + 1;
  
  const isSettlement = infrastructure?.id.startsWith('settlement_');
  const isHero = unitDef?.role === 'Hero';
  const isRelic = worldEvent?.type === 'Relic';

  const shouldRenderObjects = !tile.partOfInfrastructure;

  const getOwnerFaction = () => {
    if (tile.partOfInfrastructure) {
      const rootTile = gameState.world[tile.partOfInfrastructure.rootY][tile.partOfInfrastructure.rootX];
      return rootTile.ownerFactionId ? FACTIONS_MAP.get(rootTile.ownerFactionId) : null;
    }
    return tile.ownerFactionId ? FACTIONS_MAP.get(tile.ownerFactionId) : null;
  };

  const faction = getOwnerFaction();
  const factionColor = faction ? FACTION_COLOR_MAP[faction.color] : undefined;

  const verticalPadding = (1 - (TILE_VISUAL_HEIGHT / TILE_CONTAINER_HEIGHT)) / 2 * 100;
  const ISOMETRIC_CLIP_PATH = `polygon(50% ${verticalPadding}%, 100% 50%, 50% ${100 - verticalPadding}%, 0% 50%)`;

  return (
    <div
      className={`absolute cursor-pointer group`}
      style={{
        transform: `translate(${screenX - TILE_WIDTH / 2}px, ${screenY - TILE_CONTAINER_HEIGHT / 2}px)`,
        width: `${TILE_WIDTH}px`,
        height: `${TILE_CONTAINER_HEIGHT}px`,
        willChange: 'transform',
      }}
      onClick={onSelect}
      role="button"
      aria-label={`Tile ${tile.x}, ${tile.y}: ${biome?.name}`}
    >
      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{
          zIndex: terrainZ,
          clipPath: ISOMETRIC_CLIP_PATH,
          WebkitClipPath: ISOMETRIC_CLIP_PATH,
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{ backgroundColor: BIOME_PASTEL_COLORS[tile.biomeId] || '#333' }}
        />
        
        {terrainAsset && (
          <img
            src={terrainAsset}
            alt={biome?.name}
            className="absolute"
            style={{
                width: '100%',
                height: 'auto',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            }}
            draggable="false"
          />
        )}
        
        {factionColor && (
          <div
            className="absolute top-0 left-0 w-full h-full opacity-30"
            style={{ backgroundColor: factionColor }}
          />
        )}
         {isSelected && !isUnitSelected && (
          <div 
            className="selection-glow absolute top-0 left-0 w-full h-full bg-yellow-400/20" 
            style={{ boxShadow: 'inset 0 0 8px 3px rgba(253, 224, 71, 0.4)' }}
          />
        )}
      </div>

      {shouldRenderObjects && (
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: objectZ, pointerEvents: 'none' }}
        >
          {resourceAsset && (
            <img src={resourceAsset} alt={resource?.name} className="absolute object-contain" style={{ width: '60%', height: '60%', left: '50%', top: '50%', transform: 'translate(-50%, -70%)' }} draggable="false" />
          )}

          {infrastructureAsset && (
            <img
              src={infrastructureAsset}
              alt={infrastructure?.name}
              className={`absolute transition-transform group-hover:scale-105 object-contain ${isSettlement ? 'aura-glow' : ''}`}
              style={{
                width: isSettlement ? '150%' : '60%',
                height: isSettlement ? '150%' : '60%',
                left: '50%',
                top: '50%',
                transform: isSettlement ? 'translate(-50%, -75%)' : 'translate(-50%, -70%)',
              }}
              draggable="false"
            />
          )}

          {worldEventAsset && (
            <img 
              src={worldEventAsset} 
              alt={worldEvent?.name} 
              className={`absolute object-contain transition-transform group-hover:scale-110 ${isRelic ? 'aura-glow' : ''}`} 
              style={{ width: '60%', height: '60%', left: '50%', top: '50%', transform: 'translate(-50%, -70%)' }} 
              draggable="false" 
            />
          )}

          {unitAsset && unitFaction && (
            <div className="absolute" style={{ width: '60%', height: '60%', left: '50%', bottom: '40%', transform: 'translateX(-50%)' }}>
              <div
                className="absolute left-1/2 w-1/2 rounded-full opacity-30"
                style={{
                  backgroundColor: '#000',
                  height: '25%',
                  bottom: '10%',
                  transform: 'translateX(-50%) scaleY(0.5)',
                  filter: 'blur(4px)',
                }}
              />
              <img 
                src={unitAsset} 
                alt={unitDef?.name} 
                className={`absolute w-full h-full object-contain transition-transform group-hover:scale-110 ${isUnitSelected ? 'unit-selection-glow' : ''} ${isHero ? 'aura-glow' : ''}`} 
                draggable="false" 
              />
               {showAttackFlash && (
                <div className="absolute w-full h-full top-0 left-0 attack-flash-effect" />
               )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(Tile);