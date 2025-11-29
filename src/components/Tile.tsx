
import React from 'react';
import type { TileData, GameState } from '../types';
import { RESOURCES_MAP, UNITS_MAP, INFRASTRUCTURE_MAP, WORLD_EVENTS_MAP, BIOME_PASTEL_COLORS, FACTIONS_MAP } from '../constants';
import { ProceduralAsset } from './ProceduralGraphics';

interface TileProps {
  tile: TileData;
  isSelected: boolean;
  onSelect: () => void;
  gameState: GameState;
}

const Tile: React.FC<TileProps> = ({ tile, isSelected, onSelect, gameState }) => {
  const resource = tile.resourceId ? RESOURCES_MAP.get(tile.resourceId) : null;
  const infrastructure = tile.infrastructureId ? INFRASTRUCTURE_MAP.get(tile.infrastructureId) : null;
  const worldEvent = tile.worldEventId ? WORLD_EVENTS_MAP.get(tile.worldEventId) : null;
  const unitInstance = tile.units.length > 0 ? tile.units[0] : null;
  const unitDef = unitInstance ? UNITS_MAP.get(unitInstance.unitId) : null;
  
  const isUnitSelected = !!unitInstance && gameState.selectedUnitId === unitInstance.id;
  
  const TILE_WIDTH = 128;
  const TILE_VISUAL_HEIGHT = 64;
  const TILE_CONTAINER_HEIGHT = 128;

  const screenX = (tile.x - tile.y) * (TILE_WIDTH / 2);
  const screenY = (tile.x + tile.y) * (TILE_VISUAL_HEIGHT / 2);
  const terrainZ = (tile.x + tile.y) * 2;
  
  const isSettlement = infrastructure?.id.startsWith('settlement_');
  const shouldRenderObjects = !tile.partOfInfrastructure;

  const getOwnerFaction = () => {
    let ownerId = tile.ownerFactionId;
    if (tile.partOfInfrastructure) {
      const { rootX, rootY } = tile.partOfInfrastructure;
      const rootTile = gameState.world[rootY]?.[rootX];
      ownerId = rootTile?.ownerFactionId;
    }
    return ownerId ? FACTIONS_MAP.get(ownerId) : null;
  };

  const faction = getOwnerFaction();
  const verticalPadding = (1 - (TILE_VISUAL_HEIGHT / TILE_CONTAINER_HEIGHT)) / 2 * 100;
  const ISOMETRIC_CLIP_PATH = `polygon(50% ${verticalPadding}%, 100% 50%, 50% ${100 - verticalPadding}%, 0% 50%)`;

  return (
    <div
      className="absolute cursor-pointer group"
      style={{ 
        transform: `translate(${screenX - TILE_WIDTH / 2}px, ${screenY - TILE_CONTAINER_HEIGHT / 2}px)`, 
        width: `${TILE_WIDTH}px`, 
        height: `${TILE_CONTAINER_HEIGHT}px` 
      }}
      onClick={onSelect}
    >
      <div 
        className="absolute inset-0" 
        style={{ 
            zIndex: terrainZ, 
            clipPath: ISOMETRIC_CLIP_PATH, 
            WebkitClipPath: ISOMETRIC_CLIP_PATH,
            backgroundColor: BIOME_PASTEL_COLORS[tile.biomeId] || '#333'
        }}
      >
        {faction && (
            <div className="absolute inset-0 opacity-20" style={{ backgroundColor: faction.color.replace('500', '400') }} />
        )}
        {isSelected && !isUnitSelected && (
            <div className="absolute inset-0 bg-yellow-400/30 animate-pulse" style={{ mixBlendMode: 'overlay' }} />
        )}
      </div>

      {shouldRenderObjects && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: terrainZ + 1 }}>
          {resource && (
            <div className="absolute left-[20%] top-[10%] w-[60%] h-[60%]">
                <ProceduralAsset assetId={resource.assetId} />
            </div>
          )}
          {infrastructure && (
            <div className="absolute left-0 top-[-20%] w-full h-full">
                <ProceduralAsset assetId={infrastructure.assetId} factionId={tile.ownerFactionId} scale={isSettlement ? 1.2 : 0.8} />
            </div>
          )}
          {worldEvent && (
             <div className="absolute left-[25%] top-[15%] w-[50%] h-[50%] animate-pulse">
                 <ProceduralAsset assetId="resource_chronocrystal" /> 
             </div>
          )}
          {tile.loot && tile.loot.length > 0 && (
             <div className="absolute left-[35%] top-[35%] w-[30%] h-[30%] z-20">
                <ProceduralAsset assetId="asset_loot_container" />
             </div>
          )}
          {unitInstance && unitDef && (
            <div className="absolute left-[25%] top-[5%] w-[50%] h-[50%] z-30 transition-transform duration-200">
              <ProceduralAsset 
                assetId={unitDef.assetId} 
                factionId={unitInstance.factionId} 
                isSelected={isUnitSelected}
                visualGenes={unitInstance.visualGenes}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(Tile);
