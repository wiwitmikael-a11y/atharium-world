
import React from 'react';
import { FACTION_COLOR_HEX_MAP, FACTIONS_MAP } from '../constants';
import { VisualGenes } from '../types';

interface ProceduralAssetProps {
  assetId: string;
  factionId?: string;
  isSelected?: boolean;
  scale?: number;
  visualGenes?: VisualGenes;
}

const adjustColor = (color: string, amount: number) => {
    if (!color) return '#888888';
    if (!color.startsWith('#')) return color;
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

const VoxelCube: React.FC<{ x: number; y: number; size: number; color: string }> = ({ x, y, size, color }) => {
    const topColor = adjustColor(color, 40);
    const leftColor = adjustColor(color, -20);
    const rightColor = adjustColor(color, -60);
    const h = size / 2; 
    const cx = x;
    const cy = y;

    return (
        <g>
            <path d={`M${cx},${cy - size} L${cx + size},${cy - size - h} L${cx},${cy - size - 2*h} L${cx - size},${cy - size - h} Z`} fill={topColor} stroke={topColor} strokeWidth="0.5" />
            <path d={`M${cx},${cy - size} L${cx - size},${cy - size - h} L${cx - size},${cy - h} L${cx},${cy} Z`} fill={leftColor} stroke={leftColor} strokeWidth="0.5" />
            <path d={`M${cx},${cy - size} L${cx + size},${cy - size - h} L${cx + size},${cy - h} L${cx},${cy} Z`} fill={rightColor} stroke={rightColor} strokeWidth="0.5" />
        </g>
    );
};

const WeaponVoxel: React.FC<{ type: string; color: string; x: number; y: number }> = ({ type, color, x, y }) => {
    switch(type) {
        case 'Sword':
            return (
                <g>
                    <VoxelCube x={x} y={y} size={2} color="#8B4513" />
                    <VoxelCube x={x} y={y-4} size={2} color="#C0C0C0" />
                    <VoxelCube x={x} y={y-8} size={2} color={color} />
                    <VoxelCube x={x} y={y-12} size={2} color={color} />
                </g>
            );
        case 'Axe':
            return (
                <g>
                    <VoxelCube x={x} y={y} size={2} color="#5D4037" />
                    <VoxelCube x={x} y={y-6} size={2} color="#5D4037" />
                    <VoxelCube x={x+4} y={y-10} size={4} color={color} />
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
                    <VoxelCube x={x} y={y-18} size={3} color={color} />
                </g>
            );
        default: return null;
    }
}

const HeadVoxel: React.FC<{ type: string; x: number; y: number; size: number }> = ({ type, x, y, size }) => {
    switch(type) {
        case 'Hood':
            return <VoxelCube x={x} y={y} size={size} color="#2c3e50" />;
        case 'Helm':
            return (
                <g>
                    <VoxelCube x={x} y={y} size={size} color="#95a5a6" />
                    <VoxelCube x={x} y={y-size/2} size={2} color="#f1c40f" />
                </g>
            );
        case 'Crown':
            return (
                <g>
                    <VoxelCube x={x} y={y} size={size} color="#fcd34d" />
                    <VoxelCube x={x} y={y-size} size={size+1} color="#fbbf24" />
                </g>
            );
        default:
             return <VoxelCube x={x} y={y} size={size} color="#fcd34d" />;
    }
}

const UnitVoxel: React.FC<{ type: string; color: string; isSelected?: boolean; genes?: VisualGenes }> = ({ type, color, isSelected, genes }) => {
    const visual = genes || {
        bodyColor: color,
        headType: type.includes('hero') ? 'Crown' : type.includes('soldier') ? 'Helm' : 'Standard',
        weaponType: type.includes('archer') ? 'Bow' : type.includes('mage') ? 'Staff' : 'Sword',
        weaponColor: '#bdc3c7',
        sizeScale: 1,
        accessory: 'None'
    };

    const scale = visual.sizeScale || 1;

    return (
        <svg viewBox="0 0 64 64" className={`overflow-visible transition-transform duration-200 ${isSelected ? 'scale-110 drop-shadow-xl' : ''}`}>
            <ellipse cx="32" cy="50" rx={14 * scale} ry={7 * scale} fill="black" opacity="0.3" />
            <g transform={`translate(32, 50) scale(${scale}) translate(-32, -50) translate(0, -5)`}>
                <VoxelCube x={26} y={50} size={5} color="#333" />
                <VoxelCube x={38} y={50} size={5} color="#333" />
                <VoxelCube x={32} y={42} size={9} color={visual.bodyColor} />
                <HeadVoxel type={visual.headType} x={32} y={26} size={7} />
                <WeaponVoxel type={visual.weaponType} color={visual.weaponColor} x={46} y={40} />
            </g>
        </svg>
    );
};

const BuildingVoxel: React.FC<{ color: string; tier?: number }> = ({ color, tier = 1 }) => {
    const wallColor = '#d1d5db';
    const roofColor = color;

    return (
        <svg viewBox="0 0 64 64" className="overflow-visible">
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
                {tier >= 2 && (
                    <>
                        <VoxelCube x={32} y={45} size={14} color={wallColor} />
                        <VoxelCube x={32} y={20} size={12} color={roofColor} />
                    </>
                )}
            </g>
        </svg>
    );
};

const ResourceVoxel: React.FC<{ type: string }> = ({ type }) => {
    if (type.includes('tree') || type.includes('log')) {
        return (
            <svg viewBox="0 0 64 64" className="overflow-visible">
                <VoxelCube x={32} y={50} size={4} color="#5D4037" />
                <VoxelCube x={32} y={42} size={8} color="#2E7D32" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 64 64" className="overflow-visible">
            <VoxelCube x={24} y={50} size={6} color="#757575" />
            <VoxelCube x={32} y={45} size={7} color="#424242" />
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
        if (assetId.includes('city')) tier = 3;
        
        return (
            <div style={{ width: '100%', height: '100%', transform: `translateY(-10%) scale(${scale})` }}>
                <BuildingVoxel color={factionColorHex} tier={tier} />
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', transform: `scale(${scale})` }}>
            <ResourceVoxel type={assetId} />
        </div>
    );
};
