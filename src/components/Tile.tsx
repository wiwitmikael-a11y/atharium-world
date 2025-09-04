
import React from 'react';
import type { TileData, GameState } from '../types';
import { FACTIONS_MAP, RESOURCES_MAP, UNITS_MAP, BIOMES_MAP, INFRASTRUCTURE_MAP, WORLD_EVENTS_MAP, BIOME_PASTEL_COLORS, FACTION_COLOR_RGB_MAP } from '../constants';
import { ASSET_PATHS, BIOME_TERRAIN_MAP } from '../assets';

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
  const unitFaction = unitInstance ? FACTIONS_MAP.get(unitInstance.factionId) : null;
  const biome = BIOMES_MAP.get(tile.biomeId);
  const hasLoot = (tile.loot && tile.loot.length > 0) || (tile.resourceCache && Object.keys(tile.resourceCache).length > 0);
  const lootAsset = hasLoot ? ASSET_PATHS['asset_loot_container'] : null;

  const resourceAsset = resource ? ASSET_PATHS[resource.assetId] : null;
  const infrastructureAsset = infrastructure ? ASSET_PATHS[infrastructure.assetId] : null;
  const worldEventAsset = worldEvent ? ASSET_PATHS[worldEvent.assetId] : null;
  const unitAsset = unitDef ? ASSET_PATHS[unitDef.assetId] : null;
  const terrainAssetId = BIOME_TERRAIN_MAP[tile.biomeId];
  const terrainAsset = terrainAssetId ? ASSET_PATHS[terrainAssetId] : null;

  const isUnitSelected = unitInstance && gameState.selectedUnitId === unitInstance.id;
  const showAttackFlash = unitInstance && gameState.attackFlashes[unitInstance.id];

  const TILE_WIDTH = 128;
  const TILE_VISUAL_HEIGHT = 64;
  const TILE_CONTAINER_HEIGHT = 128;

  const screenX = (tile.x - tile.y) * (TILE_WIDTH / 2);
  const screenY = (tile.x + tile.y) * (TILE_VISUAL_HEIGHT / 2);

  const terrainZ = (tile.x + tile.y) * 4;
  const objectZ = terrainZ + 1;
  const unitZ = terrainZ + 3;

  const isSettlement = infrastructure?.multiTile && !tile.partOfInfrastructure;
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
  const factionColor = faction ? FACTION_COLOR_RGB_MAP[faction.color] : undefined;
  const unitFactionRgb = unitFaction ? FACTION_COLOR_RGB_MAP[unitFaction.color] : undefined;
  const auraRgb = isSettlement && faction ? FACTION_COLOR_RGB_MAP[faction.color] : undefined;

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
            style={{ width: '100%', height: 'auto', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            draggable="false"
          />
        )}
        {factionColor && (
          <div
            className="absolute top-0 left-0 w-full h-full opacity-30"
            style={{ backgroundColor: `rgb(${factionColor})` }}
          />
        )}
        {isSelected && !isUnitSelected && (
          <div 
            className="selection-glow absolute top-0 left-0 w-full h-full" 
            style={{ 
              boxShadow: 'inset 0 0 8px 3px rgba(var(--selection-glow-rgb), 0.4)',
              backgroundColor: 'rgba(var(--selection-glow-rgb), 0.2)'
            }}
          />
        )}
      </div>

      {shouldRenderObjects && (
        <>
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{ zIndex: objectZ, pointerEvents: 'none' }}
          >
            {resourceAsset && (
              <img src={resourceAsset} alt={resource?.name} className="absolute object-contain" style={{ width: '60%', height: '60%', left: '50%', top: '50%', transform: 'translate(-50%, -70%)' }} draggable="false" />
            )}
            {infrastructureAsset && !infrastructure.multiTile && (
              <>
                <img
                  src={infrastructureAsset} alt={infrastructure?.name} className="absolute transition-transform group-hover:scale-105 object-contain"
                  style={{ width: '60%', height: '60%', left: '50%', top: '50%', transform: 'translate(-50%, -70%)' }} draggable="false"
                />
                {isSelected && tile.hp !== undefined && typeof tile.maxHp === 'number' && tile.maxHp > 0 && (
                  <div className="absolute w-1/2 left-1/4 top-[40%] h-1.5 bg-gray-900/70 rounded-full border border-black/50">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${(tile.hp / tile.maxHp) * 100}%`}}></div>
                  </div>
                )}
              </>
            )}
            {worldEventAsset && (
              <img 
                src={worldEventAsset} alt={worldEvent?.name} className={`absolute object-contain transition-transform group-hover:scale-110 ${isRelic ? 'aura-glow' : ''}`} 
                style={{ width: '60%', height: '60%', left: '50%', top: '50%', transform: 'translate(-50%, -70%)' }} draggable="false" 
              />
            )}
            {lootAsset && (
              <img src={lootAsset} alt="Loot" className="absolute object-contain transition-transform group-hover:scale-110" style={{ width: '40%', height: '40%', left: '50%', top: '50%', transform: 'translate(-50%, -60%)' }} draggable="false" />
            )}
          </div>
          
          {infrastructureAsset && isSettlement && (
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{ 
                zIndex: (tile.x + tile.y + 2) * 4 + 2,
                pointerEvents: 'none' 
              }}
            >
              <img
                src={infrastructureAsset} alt={infrastructure?.name} className="absolute transition-transform group-hover:scale-105 object-contain aura-glow"
                style={{
                  width: '250%', height: '250%', left: '50%', top: '50%',
                  transform: 'translate(-50%, -55%)',
                  ...auraRgb && { '--aura-color': auraRgb } as React.CSSProperties
                }}
                draggable="false"
              />
               {isSelected && tile.hp !== undefined && typeof tile.maxHp === 'number' && tile.maxHp > 0 && (
                  <div className="absolute w-full left-0 top-[20%] h-2.5 bg-gray-900/70 rounded-full border border-black/50">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${(tile.hp / tile.maxHp) * 100}%`}}></div>
                  </div>
                )}
            </div>
          )}

          {unitAsset && unitFaction && (
             <div
                className="absolute top-0 left-0 w-full h-full"
                style={{ zIndex: unitZ, pointerEvents: 'none' }}
            >
                <div className="absolute" style={{ width: '60%', height: '60%', left: '50%', bottom: '40%', transform: 'translateX(-50%)' }}>
                  <div
                    className="absolute left-1/2 w-1/2 rounded-full opacity-30"
                    style={{ backgroundColor: '#000', height: '25%', bottom: '10%', transform: 'translateX(-50%) scaleY(0.5)', filter: 'blur(4px)' }}
                  />
                  <img 
                    src={unitAsset} alt={unitDef?.name} 
                    className={`absolute w-full h-full object-contain transition-transform group-hover:scale-110 ${isUnitSelected ? 'unit-selection-glow' : ''} ${isHero ? 'aura-glow' : ''}`} 
                    style={{ ...isHero && unitFactionRgb && { '--aura-color': unitFactionRgb } as React.CSSProperties }}
                    draggable="false" 
                  />
                  {showAttackFlash && (
                    <div className="absolute w-full h-full top-0 left-0 attack-flash-effect" />
                  )}
                </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(Tile);
