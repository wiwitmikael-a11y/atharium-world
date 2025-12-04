
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

const TILE_WIDTH = 128;
const TILE_VISUAL_HEIGHT = 64;
const TILE_CONTAINER_HEIGHT = 128;

// --- TERRAIN PATTERNS ---
const TerrainTexture: React.FC<{ biomeId: string, factionColor?: string }> = ({ biomeId, factionColor }) => {
    const patternId = `pattern-${biomeId}`;
    let patternContent = <rect width="100%" height="100%" fill="transparent" />;

    if (biomeId === 'verdant') {
        patternContent = (
            <>
                <circle cx="2" cy="2" r="1" fill="#1b5e20" opacity="0.2" />
                <path d="M8 8 L10 4 L12 8 Z" fill="#2e7d32" opacity="0.3" />
            </>
        );
    } else if (biomeId === 'wasteland') {
        patternContent = (
            <>
                <path d="M0 0 L10 5 L5 10 Z" fill="#3e2723" opacity="0.1" />
                <line x1="0" y1="0" x2="16" y2="16" stroke="#5d4037" strokeWidth="0.5" opacity="0.2" />
            </>
        );
    } else if (biomeId === 'ashlands') {
        patternContent = (
            <>
                <rect x="2" y="2" width="2" height="2" fill="#212121" opacity="0.3" />
                <rect x="10" y="10" width="3" height="3" fill="#424242" opacity="0.2" />
            </>
        );
    } else if (biomeId === 'gloomwell') {
        patternContent = (
            <>
                <circle cx="4" cy="4" r="2" fill="#4a148c" opacity="0.1" />
                <circle cx="12" cy="12" r="1.5" fill="#311b92" opacity="0.2" />
            </>
        );
    } else if (biomeId === 'tundra') {
        patternContent = (
            <path d="M0 8 L8 0 L16 8 L8 16 Z" fill="#eceff1" opacity="0.3" />
        );
    }

    return (
        <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none opacity-50">
            <defs>
                <pattern id={patternId} width="16" height="16" patternUnits="userSpaceOnUse">
                    {patternContent}
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            {factionColor && (
                <rect width="100%" height="100%" fill={factionColor} opacity="0.15" style={{mixBlendMode: 'overlay'}} />
            )}
        </svg>
    );
};

const Tile: React.FC<TileProps> = ({ tile, isSelected, onSelect, gameState }) => {
  const resource = tile.resourceId ? RESOURCES_MAP.get(tile.resourceId) : null;
  const infrastructure = tile.infrastructureId ? INFRASTRUCTURE_MAP.get(tile.infrastructureId) : null;
  const worldEvent = tile.worldEventId ? WORLD_EVENTS_MAP.get(tile.worldEventId) : null;
  const unitInstance = tile.units.length > 0 ? tile.units[0] : null;
  const unitDef = unitInstance ? UNITS_MAP.get(unitInstance.unitId) : null;
  
  const isUnitSelected = !!unitInstance && gameState.selectedUnitId === unitInstance.id;
  
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
  
  // Convert Tailwind color names to Hex approx for texture overlay
  const hexMap: Record<string, string> = {
      'red-500': '#ef4444', 'green-500': '#22c55e', 'yellow-600': '#ca8a04',
      'violet-500': '#8b5cf6', 'blue-400': '#60a5fa', 'teal-400': '#2dd4bf',
      'gray-400': '#9ca3af', 'orange-500': '#f97316'
  };
  const factionHex = faction ? (hexMap[faction.color] || '#888') : undefined;

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
        <TerrainTexture biomeId={tile.biomeId} factionColor={factionHex} />
        
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
                <ProceduralAsset assetId={infrastructure.assetId} factionId={tile.ownerFactionId} scale={isSettlement ? 1.4 : 1.0} />
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
            <div className="absolute left-[25%] top-[0%] w-[50%] h-[50%] z-30 transition-transform duration-200">
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
