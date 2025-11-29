
import React, { useMemo } from 'react';
import { FACTION_COLOR_HEX_MAP, FACTIONS_MAP } from '../constants';
import { VisualGenes } from '../types';

interface ProceduralAssetProps {
  assetId: string;
  factionId?: string;
  isSelected?: boolean;
  scale?: number;
  visualGenes?: VisualGenes;
}

// Helper to darken/lighten color
const adjustColor = (color: string, amount: number) => {
    // Basic hex adjustment
    if (!color) return '#888888';
    if (!color.startsWith('#')) return color; // Skip named colors for now
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

// Voxel Primitive
const VoxelCube: React.FC<{ x: number; y: number; size: number; color: string; zIndex?: number }> = ({ x, y, size, color }) => {
    const topColor = adjustColor(color, 40);
    const leftColor = adjustColor(color, -20);
    const rightColor = adjustColor(color, -60); // Darkest side

    // Isometric projection offsets
    const h = size / 2; 
    
    // SVG Paths relative to (x,y) which is the center bottom of the cube
    const cx = x;
    const cy = y;

    return (
        <g>
            {/* Top Face */}
            <path d={`M${cx},${cy - size} L${cx + size},${cy - size - h} L${cx},${cy - size - 2*h} L${cx - size},${cy - size - h} Z`} fill={topColor} stroke={topColor} strokeWidth="0.5" />
            {/* Left Face */}
            <path d={`M${cx},${cy - size} L${cx - size},${cy - size - h} L${cx - size},${cy - h} L${cx},${cy} Z`} fill={leftColor} stroke={leftColor} strokeWidth="0.5" />
            {/* Right Face */}
            <path d={`M${cx},${cy - size} L${cx + size},${cy - size - h} L${cx + size},${cy - h} L${cx},${cy} Z`} fill={rightColor} stroke={rightColor} strokeWidth="0.5" />
        </g>
    );
};

const WeaponVoxel: React.FC<{ type: string; color: string; x: number; y: number }> = ({ type, color, x, y }) => {
    switch(type) {
        case 'Sword':
            return (
                <g>
                    <VoxelCube x={x} y={y} size={2} color="#8B4513" /> {/* Hilt */}
                    <VoxelCube x={x} y={y-4} size={2} color="#C0C0C0" /> {/* Guard */}
                    <VoxelCube x={x} y={y-8} size={2} color={color} /> {/* Blade 1 */}
                    <VoxelCube x={x} y={y-12} size={2} color={color} /> {/* Blade 2 */}
                    <VoxelCube x={x} y={y-16} size={2} color={color} /> {/* Blade 3 */}
                </g>
            );
        case 'Axe':
            return (
                <g>
                    <VoxelCube x={x} y={y} size={2} color="#5D4037" />
                    <VoxelCube x={x} y={y-6} size={2} color="#5D4037" />
                    <VoxelCube x={x} y={y-12} size={2} color="#5D4037" />
                    <VoxelCube x={x+4} y={y-10} size={4} color={color} /> {/* Head */}
                    <VoxelCube x={x-4} y={y-10} size={4} color={color} />
                </g>
            );
        case 'Bow':
            return (
                <g>
                    <VoxelCube x={x} y={y-5} size={2} color="#5D4037" />
                    <VoxelCube x={x-3} y={y-2} size={2} color={color} />
                    <VoxelCube x={x-3} y={y-8} size={2} color={color} />
                </g>
            );
        case 'Staff':
            return (
                <g>
                    <VoxelCube x={x} y={y} size={2} color="#5D4037" />
                    <VoxelCube x={x} y={y-6} size={2} color="#5D4037" />
                    <VoxelCube x={x} y={y-12} size={2} color="#5D4037" />
                    <VoxelCube x={x} y={y-18} size={3} color={color} /> {/* Orb */}
                </g>
            );
        case 'Hammer':
             return (
                <g>
                    <VoxelCube x={x} y={y} size={2} color="#5D4037" />
                    <VoxelCube x={x} y={y-6} size={2} color="#5D4037" />
                    <VoxelCube x={x} y={y-12} size={5} color={color} />
                </g>
            );
        default: return null;
    }
}

const HeadVoxel: React.FC<{ type: string; x: number; y: number; size: number }> = ({ type, x, y, size }) => {
    switch(type) {
        case 'Hood':
            return (
                <g>
                    <VoxelCube x={x} y={y} size={size} color="#2c3e50" />
                    <VoxelCube x={x} y={y} size={size-2} color="#000" /> {/* Face Shadow */}
                </g>
            );
        case 'Helm':
            return (
                <g>
                    <VoxelCube x={x} y={y} size={size} color="#95a5a6" />
                    <VoxelCube x={x} y={y-size/2} size={2} color="#f1c40f" /> {/* Crest */}
                </g>
            );
        case 'Crown':
            return (
                <g>
                    <VoxelCube x={x} y={y} size={size} color="#fcd34d" />
                    <VoxelCube x={x} y={y-size} size={size+1} color="#fbbf24" />
                </g>
            );
        case 'Beast':
             return (
                <g>
                    <VoxelCube x={x} y={y} size={size} color="#4a5568" />
                    <VoxelCube x={x+2} y={y-2} size={2} color="#f56565" /> {/* Eye */}
                    <VoxelCube x={x-2} y={y-2} size={2} color="#f56565" /> {/* Eye */}
                    <VoxelCube x={x+3} y={y-5} size={2} color="#cbd5e0" /> {/* Horn */}
                    <VoxelCube x={x-3} y={y-5} size={2} color="#cbd5e0" /> {/* Horn */}
                </g>
            );
        default: // Standard
             return <VoxelCube x={x} y={y} size={size} color="#fcd34d" />;
    }
}

const UnitVoxel: React.FC<{ type: string; color: string; isSelected?: boolean; genes?: VisualGenes }> = ({ type, color, isSelected, genes }) => {
    // Default genes if none provided
    const visual = genes || {
        bodyColor: color,
        headType: type.includes('hero') ? 'Crown' : type.includes('soldier') ? 'Helm' : type.includes('mage') ? 'Hood' : 'Standard',
        weaponType: type.includes('archer') ? 'Bow' : type.includes('mage') ? 'Staff' : type.includes('soldier') ? 'Axe' : 'None',
        weaponColor: '#bdc3c7',
        sizeScale: 1
    };

    const scale = visual.sizeScale;

    // Breathing Animation
    const breathingStyle = {
        animation: 'breathe 2s infinite ease-in-out',
        transformOrigin: 'bottom center',
    }

    return (
        <svg viewBox="0 0 64 64" className={`overflow-visible transition-transform duration-200 ${isSelected ? 'scale-110 drop-shadow-xl' : ''}`}>
            {/* Shadow */}
            <ellipse cx="32" cy="50" rx={14 * scale} ry={7 * scale} fill="black" opacity="0.3" />
            
            {/* Body Group */}
            <g style={breathingStyle} transform={`translate(32, 50) scale(${scale}) translate(-32, -50) translate(0, -5)`}>
                {/* Legs */}
                <VoxelCube x={26} y={50} size={5} color="#333" />
                <VoxelCube x={38} y={50} size={5} color="#333" />
                
                {/* Torso */}
                <VoxelCube x={32} y={42} size={9} color={visual.bodyColor} />
                
                {/* Head */}
                <HeadVoxel type={visual.headType} x={32} y={26} size={7} />
                
                {/* Weapon */}
                <WeaponVoxel type={visual.weaponType} color={visual.weaponColor} x={46} y={40} />

                {/* Back Accessories (Genes) */}
                {visual.accessory === 'Cape' && (
                    <path d="M26,30 Q32,60 38,30" fill={adjustColor(visual.bodyColor, -40)} />
                )}
            </g>
            <style>{`
                @keyframes breathe {
                    0%, 100% { transform: translateY(0) scaleY(1); }
                    50% { transform: translateY(-2px) scaleY(1.02); }
                }
            `}</style>
        </svg>
    );
};

const BuildingVoxel: React.FC<{ type: string; color: string; tier?: number; factionId?: string }> = ({ type, color, tier = 1, factionId }) => {
    const wallColor = '#d1d5db'; // Gray
    const roofColor = color;
    
    // Industrial Smoke Effect
    const isIndustrial = factionId === 'f1'; // Cogwork Compact
    const isUndead = factionId === 'f7';

    return (
        <svg viewBox="0 0 64 64" className="overflow-visible">
            {/* Shadow */}
            <ellipse cx="32" cy="50" rx="24" ry="12" fill="black" opacity="0.3" />

            <g transform="translate(0, 5)">
                {tier === 1 && (
                    <>
                        <VoxelCube x={20} y={45} size={8} color={wallColor} />
                        <VoxelCube x={20} y={30} size={8} color={roofColor} />
                        <VoxelCube x={44} y={45} size={8} color={wallColor} />
                        <VoxelCube x={44} y={30} size={8} color={roofColor} />
                    </>
                )}
                {tier === 2 && (
                    <>
                        <VoxelCube x={32} y={45} size={14} color={wallColor} />
                        <VoxelCube x={32} y={20} size={12} color={roofColor} />
                        <VoxelCube x={14} y={45} size={6} color={wallColor} />
                        <VoxelCube x={50} y={45} size={6} color={wallColor} />
                    </>
                )}
                {tier >= 3 && (
                    <>
                        <VoxelCube x={32} y={45} size={14} color={wallColor} />
                        <VoxelCube x={32} y={20} size={10} color={wallColor} />
                        <VoxelCube x={32} y={5} size={8} color={roofColor} />
                        <VoxelCube x={10} y={45} size={8} color={color} />
                        <VoxelCube x={54} y={45} size={8} color={color} />
                        {/* City Details */}
                        <VoxelCube x={22} y={50} size={4} color="#555" />
                        <VoxelCube x={42} y={50} size={4} color="#555" />
                    </>
                )}
            </g>
            
            {/* Particle Effects based on Type */}
            {(isIndustrial || isUndead) && (
                <g>
                    <circle cx="32" cy="10" r="2" fill={isIndustrial ? "#555" : "#0f0"} className="smoke-particle" />
                    <circle cx="36" cy="5" r="3" fill={isIndustrial ? "#777" : "#0f0"} className="smoke-particle delay-1" />
                </g>
            )}
             <style>{`
                .smoke-particle {
                    opacity: 0.6;
                    animation: smoke 3s infinite ease-out;
                }
                .delay-1 { animation-delay: 1.5s; }
                @keyframes smoke {
                    0% { transform: translateY(0) scale(1); opacity: 0.6; }
                    100% { transform: translateY(-30px) scale(3); opacity: 0; }
                }
            `}</style>
        </svg>
    );
};

const ResourceVoxel: React.FC<{ type: string }> = ({ type }) => {
    if (type.includes('tree') || type.includes('log')) {
        return (
            <svg viewBox="0 0 64 64" className="overflow-visible">
                <ellipse cx="32" cy="50" rx="10" ry="5" fill="black" opacity="0.3" />
                <g className="sway-animation" style={{ transformOrigin: 'bottom center' }}>
                    <VoxelCube x={32} y={50} size={4} color="#5D4037" /> {/* Trunk */}
                    <VoxelCube x={32} y={42} size={8} color="#2E7D32" /> {/* Leaves 1 */}
                    <VoxelCube x={32} y={30} size={6} color="#43A047" /> {/* Leaves 2 */}
                    <VoxelCube x={32} y={20} size={4} color="#66BB6A" /> {/* Leaves 3 */}
                </g>
                <style>{`
                    .sway-animation { animation: sway 3s infinite ease-in-out; }
                    @keyframes sway {
                        0%, 100% { transform: rotate(-2deg); }
                        50% { transform: rotate(2deg); }
                    }
                `}</style>
            </svg>
        );
    }
    if (type.includes('ore') || type.includes('iron')) {
        return (
            <svg viewBox="0 0 64 64" className="overflow-visible">
                <ellipse cx="32" cy="50" rx="12" ry="6" fill="black" opacity="0.3" />
                <VoxelCube x={24} y={50} size={6} color="#757575" />
                <VoxelCube x={40} y={50} size={5} color="#616161" />
                <VoxelCube x={32} y={45} size={7} color="#424242" />
                <VoxelCube x={24} y={42} size={2} color="#EF4444" /> 
                <VoxelCube x={38} y={44} size={2} color="#EF4444" />
            </svg>
        );
    }
    // Crystal
    return (
        <svg viewBox="0 0 64 64" className="overflow-visible">
            <ellipse cx="32" cy="50" rx="10" ry="5" fill="black" opacity="0.3" />
            <g className="animate-pulse">
                <VoxelCube x={32} y={50} size={6} color="#9C27B0" />
                <VoxelCube x={32} y={38} size={4} color="#BA68C8" />
                <VoxelCube x={20} y={50} size={3} color="#E1BEE7" />
                <VoxelCube x={44} y={50} size={3} color="#E1BEE7" />
            </g>
        </svg>
    );
};

export const ProceduralAsset: React.FC<ProceduralAssetProps> = ({ assetId, factionId, isSelected, scale = 1, visualGenes }) => {
    const factionColorHex = factionId ? (FACTION_COLOR_HEX_MAP[FACTIONS_MAP.get(factionId)?.color || 'gray-400'] || '#9ca3af') : '#9ca3af';
    
    if (assetId.startsWith('unit_')) {
        return (
            <div style={{ width: '100%', height: '100%', transform: `scale(${scale})` }}>
                <UnitVoxel type={assetId} color={factionColorHex} isSelected={isSelected} genes={visualGenes} />
            </div>
        );
    }

    if (assetId.startsWith('infra_') || assetId.startsWith('settlement_')) {
        let tier = 1;
        if (assetId.includes('town')) tier = 2;
        if (assetId.includes('city') || assetId.includes('metropolis')) tier = 3;
        
        return (
            <div style={{ width: '100%', height: '100%', transform: `translateY(-10%) scale(${scale})` }}>
                <BuildingVoxel type={assetId} color={factionColorHex} tier={tier} factionId={factionId} />
            </div>
        );
    }

    if (assetId.startsWith('resource_')) {
        return (
            <div style={{ width: '100%', height: '100%', transform: `scale(${scale})` }}>
                <ResourceVoxel type={assetId} />
            </div>
        );
    }

    if (assetId.startsWith('asset_loot')) {
         return (
            <div style={{ width: '100%', height: '100%', transform: `scale(${scale}) translateY(10%)` }}>
                <svg viewBox="0 0 64 64" className="overflow-visible animate-bounce">
                    <VoxelCube x={32} y={45} size={8} color="#FFD700" />
                    <VoxelCube x={32} y={35} size={8} color="#FFC107" />
                </svg>
            </div>
        );
    }

    // Fallback
    return (
        <div style={{ width: '100%', height: '100%' }} className="flex items-center justify-center">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </div>
    );
};
