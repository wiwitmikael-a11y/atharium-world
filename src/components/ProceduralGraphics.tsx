import React, { useMemo } from 'react';
import { FACTION_COLOR_HEX_MAP, FACTIONS_MAP } from '../constants';

interface ProceduralAssetProps {
  assetId: string;
  factionId?: string;
  isSelected?: boolean;
  scale?: number;
}

// Helper to darken a hex color for 3D depth effects
const adjustColor = (color: string, amount: number) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

const SHADOW_ELLIPSE = <ellipse cx="32" cy="52" rx="16" ry="8" fill="black" opacity="0.3" />;

const UnitGraphic: React.FC<{ type: string; color: string; isSelected?: boolean }> = ({ type, color, isSelected }) => {
    const darkColor = adjustColor(color, -40);
    const lightColor = adjustColor(color, 40);
    
    // Base "Pawn" shape for units
    const renderBody = () => (
        <g transform="translate(32, 48)">
            {/* Body */}
            <path d="M-8,0 L-10,-20 Q-12,-35 0,-40 Q12,-35 10,-20 L8,0 Z" fill={darkColor} stroke={lightColor} strokeWidth="1" />
            {/* Head/Helmet */}
            <circle cx="0" cy="-42" r="10" fill={color} stroke="white" strokeWidth={isSelected ? 2 : 0} />
            {/* Faction Band */}
            <rect x="-9" y="-20" width="18" height="4" fill={lightColor} rx="1" />
        </g>
    );

    const renderWeapon = () => {
        if (type.includes('worker')) return <path d="M40,20 L50,10 M45,10 L55,20" stroke="#aaa" strokeWidth="3" />; // Pickaxeish
        if (type.includes('archer') || type.includes('range')) return <path d="M42,20 Q55,32 42,44" fill="none" stroke="brown" strokeWidth="2" />; // Bow
        if (type.includes('hero')) return <circle cx="45" cy="20" r="4" fill="gold" filter="url(#glow)" />; // Orb/Crown
        // Default Sword
        return <path d="M42,35 L52,15" stroke="#ddd" strokeWidth="3" />;
    };

    return (
        <svg viewBox="0 0 64 64" className={`overflow-visible transition-transform duration-200 ${isSelected ? 'scale-110 drop-shadow-lg' : ''}`}>
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>
            {SHADOW_ELLIPSE}
            {renderBody()}
            {renderWeapon()}
        </svg>
    );
};

const BuildingGraphic: React.FC<{ type: string; color: string; tier?: number }> = ({ type, color, tier = 1 }) => {
    const wallColor = '#e5e7eb'; // Gray-200
    const roofColor = color;
    const darkRoof = adjustColor(color, -60);

    const renderHouse = (x: number, y: number, scale: number) => (
        <g transform={`translate(${x}, ${y}) scale(${scale})`}>
            {/* Base */}
            <path d="M-10,0 L0,5 L10,0 L10,-15 L-10,-15 Z" fill={wallColor} stroke="#4b5563" strokeWidth="0.5" />
            {/* Roof */}
            <path d="M-12,-12 L0,-22 L12,-12 L0,-2" fill={roofColor} stroke={darkRoof} strokeWidth="0.5" />
            <path d="M-12,-12 L0,-2 L0,5 L-10,0 Z" fillOpacity="0.2" fill="black" /> {/* Side Shadow */}
        </g>
    );

    const renderTower = () => (
        <g transform="translate(32, 40)">
             {/* Tower Base */}
             <path d="M-15,0 L0,8 L15,0 L15,-30 L-15,-30 Z" fill={wallColor} stroke="#374151" strokeWidth="1" />
             {/* Spire */}
             <path d="M-18,-25 L0,-50 L18,-25 L0,-10 Z" fill={darkRoof} />
             {/* Banner */}
             <path d="M0,-50 L15,-45 L0,-40" fill={color} />
        </g>
    );

    if (type.includes('settlement')) {
        return (
            <svg viewBox="0 0 64 64" className="overflow-visible">
                {SHADOW_ELLIPSE}
                {/* Outbuildings */}
                {renderHouse(15, 35, 0.7)}
                {renderHouse(50, 40, 0.8)}
                {/* Main Keep based on Tier */}
                {tier >= 2 ? renderTower() : renderHouse(32, 45, 1.2)}
            </svg>
        );
    }

    if (type.includes('mine')) {
        return (
            <svg viewBox="0 0 64 64" className="overflow-visible">
                {SHADOW_ELLIPSE}
                <path d="M10,50 L32,30 L54,50 L32,60 Z" fill="#4b5563" /> {/* Base */}
                <path d="M20,50 L32,10 L44,50" fill="#374151" /> {/* Mountain */}
                <circle cx="32" cy="45" r="8" fill="black" /> {/* Entrance */}
                <rect x="28" y="45" width="8" height="2" fill="brown" /> {/* Track */}
            </svg>
        );
    }

    // Generic Infra
    return (
        <svg viewBox="0 0 64 64" className="overflow-visible">
            {SHADOW_ELLIPSE}
            <rect x="16" y="32" width="32" height="20" fill={wallColor} stroke="#374151" />
            <path d="M14,32 L32,15 L50,32" fill={roofColor} />
            <rect x="28" y="40" width="8" height="12" fill="#374151" />
        </svg>
    );
};

const ResourceGraphic: React.FC<{ type: string }> = ({ type }) => {
    if (type.includes('tree') || type.includes('log')) {
        return (
            <svg viewBox="0 0 64 64" className="overflow-visible">
                <ellipse cx="32" cy="55" rx="8" ry="4" fill="black" opacity="0.3" />
                <rect x="28" y="45" width="8" height="10" fill="#5D4037" />
                <path d="M32,10 L50,45 L14,45 Z" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1" />
                <path d="M32,10 L42,45 L32,45 Z" fill="#43A047" opacity="0.5" />
            </svg>
        );
    }
    if (type.includes('ore') || type.includes('iron')) {
        return (
            <svg viewBox="0 0 64 64" className="overflow-visible">
                <ellipse cx="32" cy="55" rx="12" ry="6" fill="black" opacity="0.3" />
                <path d="M20,55 L30,35 L40,50 Z" fill="#757575" />
                <path d="M35,55 L45,40 L55,55 Z" fill="#616161" />
                {/* Ore veins */}
                <circle cx="30" cy="45" r="2" fill="#FFD700" /> 
                <circle cx="45" cy="50" r="2" fill="#FFD700" />
            </svg>
        );
    }
    // Crystal/Flux
    return (
        <svg viewBox="0 0 64 64" className="overflow-visible">
            <ellipse cx="32" cy="55" rx="10" ry="5" fill="black" opacity="0.3" />
            <path d="M32,55 L22,35 L32,15 L42,35 Z" fill="#9C27B0" opacity="0.8">
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M32,55 L25,40 L32,30 Z" fill="#E1BEE7" opacity="0.5" />
        </svg>
    );
};

export const ProceduralAsset: React.FC<ProceduralAssetProps> = ({ assetId, factionId, isSelected, scale = 1 }) => {
    const factionColorHex = factionId ? (FACTION_COLOR_HEX_MAP[FACTIONS_MAP.get(factionId)?.color || 'gray-400'] || '#9ca3af') : '#9ca3af';
    
    // Determine what to render based on assetId
    // Asset IDs are like 'unit_soldier_gearforged' or 'infra_settlement_town'
    
    if (assetId.startsWith('unit_')) {
        return (
            <div style={{ width: '100%', height: '100%', transform: `scale(${scale})` }}>
                <UnitGraphic type={assetId} color={factionColorHex} isSelected={isSelected} />
            </div>
        );
    }

    if (assetId.startsWith('infra_') || assetId.startsWith('settlement_')) {
        let tier = 1;
        if (assetId.includes('town')) tier = 2;
        if (assetId.includes('city') || assetId.includes('metropolis')) tier = 3;
        
        return (
            <div style={{ width: '100%', height: '100%', transform: `translateY(-25%) scale(${scale * 1.5})` }}>
                <BuildingGraphic type={assetId} color={factionColorHex} tier={tier} />
            </div>
        );
    }

    if (assetId.startsWith('resource_')) {
        return (
            <div style={{ width: '100%', height: '100%', transform: `scale(${scale})` }}>
                <ResourceGraphic type={assetId} />
            </div>
        );
    }

    if (assetId.startsWith('asset_loot')) {
         return (
            <div style={{ width: '100%', height: '100%', transform: `scale(${scale}) translateY(10%)` }}>
                <svg viewBox="0 0 64 64" className="overflow-visible animate-bounce">
                    <rect x="22" y="35" width="20" height="15" rx="2" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
                    <path d="M22,35 L42,35 L38,28 L26,28 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
                </svg>
            </div>
        );
    }

    // Fallback/Unknown
    return (
        <div style={{ width: '100%', height: '100%' }} className="flex items-center justify-center">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </div>
    );
};