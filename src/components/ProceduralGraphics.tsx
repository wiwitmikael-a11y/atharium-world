
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

// --- MICRO-VOXEL ENGINE ---
// Resolution: 32x32x32 grid per tile. 
// Standard Unit Height: ~12-16 voxels.

const VOXEL_SIZE = 2; // Size of a micro-voxel in SVG units

// Color helper
const adjustColor = (color: string, amount: number) => {
    if (!color) return '#888888';
    let hex = color.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x00FF) + amount;
    return '#' + ((1 << 24) + (Math.max(0, Math.min(255, r)) << 16) + (Math.max(0, Math.min(255, g)) << 8) + Math.max(0, Math.min(255, b))).toString(16).slice(1);
};

// Helper to generate path for a single micro-voxel face
// Isometric Projection: X goes down-right, Y goes down-left, Z goes up
const drawVoxel = (x: number, y: number, z: number, color: string): React.ReactNode => {
    // Iso transform
    const isoX = (x - y) * VOXEL_SIZE;
    const isoY = (x + y) * (VOXEL_SIZE * 0.5) - (z * VOXEL_SIZE);
    
    const topColor = adjustColor(color, 40);
    const leftColor = adjustColor(color, -10);
    const rightColor = adjustColor(color, -50);

    return (
        <g key={`${x}-${y}-${z}`}>
            {/* Top */}
            <path d={`M${isoX},${isoY - VOXEL_SIZE} L${isoX + VOXEL_SIZE},${isoY - VOXEL_SIZE * 0.5} L${isoX},${isoY} L${isoX - VOXEL_SIZE},${isoY - VOXEL_SIZE * 0.5} Z`} fill={topColor} />
            {/* Left */}
            <path d={`M${isoX - VOXEL_SIZE},${isoY - VOXEL_SIZE * 0.5} L${isoX},${isoY} L${isoX},${isoY + VOXEL_SIZE} L${isoX - VOXEL_SIZE},${isoY + VOXEL_SIZE * 0.5} Z`} fill={leftColor} />
            {/* Right */}
            <path d={`M${isoX},${isoY} L${isoX + VOXEL_SIZE},${isoY - VOXEL_SIZE * 0.5} L${isoX + VOXEL_SIZE},${isoY + VOXEL_SIZE * 0.5} L${isoX},${isoY + VOXEL_SIZE} Z`} fill={rightColor} />
        </g>
    );
};

// --- ANATOMY GENERATORS ---

const buildHumanoid = (genes: VisualGenes, primary: string, secondary: string) => {
    const voxels: React.ReactNode[] = [];
    const h = genes.sizeScale * 1.0; 

    // 1. LEGS (Separated for clarity)
    // Left Leg
    for(let z=0; z<4*h; z++) voxels.push(drawVoxel(-2, -1, z, '#333'));
    // Right Leg (stepping forward)
    for(let z=0; z<4*h; z++) voxels.push(drawVoxel(2, 2, z, '#333'));

    // 2. TORSO (Varies by archetype)
    const torsoColor = primary;
    const armorColor = secondary;
    
    if (genes.bodyType === 'Construct') {
        // Bulky Block Torso
        for(let z=4*h; z<9*h; z++) {
            for(let x=-3; x<=3; x++) {
                for(let y=-1; y<=3; y++) {
                    voxels.push(drawVoxel(x, y, z, torsoColor));
                }
            }
        }
        // Exhaust Pipes
        voxels.push(drawVoxel(-2, 4, 9*h, '#111')); 
        voxels.push(drawVoxel(2, 4, 9*h, '#111'));
        voxels.push(drawVoxel(-2, 4, 10*h, '#555')); // Smoke start
        voxels.push(drawVoxel(2, 4, 10*h, '#555'));
    } else {
        // Standard Humanoid Torso
        for(let z=4*h; z<9*h; z++) {
            for(let x=-2; x<=2; x++) {
                voxels.push(drawVoxel(x, 0, z, torsoColor)); // Core
                voxels.push(drawVoxel(x, 1, z, torsoColor)); // Back
            }
        }
        // Armor Plate
        voxels.push(drawVoxel(0, -1, 6*h, armorColor)); 
        voxels.push(drawVoxel(-1, -1, 7*h, armorColor)); 
        voxels.push(drawVoxel(1, -1, 7*h, armorColor)); 
    }

    // 3. HEAD
    const headZ = 9*h;
    const headColor = '#f5cca9'; // Skin default
    
    if (genes.headType === 'Helm') {
        // Full Helm
        for(let z=headZ; z<headZ+3; z++) {
            for(let x=-1; x<=1; x++) voxels.push(drawVoxel(x, 0, z, secondary));
        }
        // Visor
        voxels.push(drawVoxel(0, -1, headZ+1, '#00ffff')); 
    } else if (genes.headType === 'Hood') {
        // Hooded
        for(let z=headZ; z<headZ+3; z++) voxels.push(drawVoxel(0, 1, z, primary)); // Back of hood
        voxels.push(drawVoxel(0, 0, headZ+1, '#111')); // Shadow face
    } else if (genes.headType === 'GasMask') {
        voxels.push(drawVoxel(0, 0, headZ, '#333'));
        voxels.push(drawVoxel(0, 0, headZ+1, '#333'));
        voxels.push(drawVoxel(0, -1, headZ, '#111')); // Filter
        voxels.push(drawVoxel(0, -1, headZ+1, '#0f0')); // Goggles
    } else {
        // Standard Head
        voxels.push(drawVoxel(0, 0, headZ, headColor));
        voxels.push(drawVoxel(0, 0, headZ+1, headColor));
        // Hair/Crown
        if (genes.headType === 'Crown') voxels.push(drawVoxel(0, 0, headZ+2, '#FFD700'));
        else voxels.push(drawVoxel(0, 0, headZ+2, primary));
    }

    // 4. ARMS & WEAPONS
    // Right Arm (Weapon Arm)
    for(let z=5*h; z<8*h; z++) voxels.push(drawVoxel(3, 0, z, torsoColor));
    
    // Weapon
    const wZ = 6*h;
    const wColor = genes.weaponColor || '#silver';
    
    if (genes.weaponType === 'Sword') {
        voxels.push(drawVoxel(3, -1, wZ, '#5D4037')); // Hilt
        for(let i=1; i<6; i++) voxels.push(drawVoxel(3, -1-i, wZ, wColor)); // Blade
    } else if (genes.weaponType === 'Hammer') {
        voxels.push(drawVoxel(3, -1, wZ, '#5D4037')); // Handle
        voxels.push(drawVoxel(3, -2, wZ, '#5D4037'));
        voxels.push(drawVoxel(2, -3, wZ, wColor)); // Head
        voxels.push(drawVoxel(3, -3, wZ, wColor));
        voxels.push(drawVoxel(4, -3, wZ, wColor));
    } else if (genes.weaponType === 'Rifle') {
        voxels.push(drawVoxel(3, -1, wZ, '#5D4037')); // Stock
        voxels.push(drawVoxel(3, -2, wZ, '#111')); // Barrel
        voxels.push(drawVoxel(3, -3, wZ, '#111'));
    } else if (genes.weaponType === 'Staff') {
        for(let i=-2; i<5; i++) voxels.push(drawVoxel(3, -1, wZ+i-2, '#5D4037')); // Pole
        voxels.push(drawVoxel(3, -1, wZ+3, secondary)); // Gem
    }

    return voxels;
};

const buildVehicle = (genes: VisualGenes, primary: string, secondary: string) => {
    const voxels: React.ReactNode[] = [];
    
    // Chassis
    for(let x=-3; x<=3; x++) {
        for(let y=-3; y<=3; y++) {
            voxels.push(drawVoxel(x, y, 1, primary));
            voxels.push(drawVoxel(x, y, 2, primary));
        }
    }
    
    // Wheels/Treads
    for(let y=-2; y<=2; y+=2) {
        voxels.push(drawVoxel(-4, y, 0, '#111'));
        voxels.push(drawVoxel(-4, y, 1, '#111'));
        voxels.push(drawVoxel(4, y, 0, '#111'));
        voxels.push(drawVoxel(4, y, 1, '#111'));
    }

    // Turret
    for(let z=3; z<5; z++) {
        for(let x=-1; x<=1; x++) {
            for(let y=-1; y<=1; y++) voxels.push(drawVoxel(x, y, z, secondary));
        }
    }
    
    // Barrel
    voxels.push(drawVoxel(0, -2, 4, '#333'));
    voxels.push(drawVoxel(0, -3, 4, '#333'));
    voxels.push(drawVoxel(0, -4, 4, '#111'));

    return voxels;
};

const buildStructure = (assetId: string, color: string, tier: number) => {
    const voxels: React.ReactNode[] = [];
    const isIndustrial = assetId.includes('forge') || assetId.includes('mine');
    const isNature = assetId.includes('lumber') || assetId.includes('grove');
    const isMagic = assetId.includes('crystal') || assetId.includes('arcane');
    const isSettlement = assetId.includes('settlement');

    // Base Foundation
    for(let x=-4; x<=4; x++) {
        for(let y=-4; y<=4; y++) {
            if (Math.abs(x)===4 || Math.abs(y)===4) voxels.push(drawVoxel(x, y, 0, '#555')); // Foundation trim
            else voxels.push(drawVoxel(x, y, 0, '#333'));
        }
    }

    if (isSettlement) {
        // Main Keep
        const wallColor = tier === 1 ? '#8D6E63' : tier === 2 ? '#757575' : '#ECEFF1';
        const height = tier * 3 + 4;
        
        for(let z=1; z<height; z++) {
            for(let x=-3; x<=3; x++) {
                for(let y=-3; y<=3; y++) {
                    if (Math.abs(x)===3 || Math.abs(y)===3) voxels.push(drawVoxel(x, y, z, wallColor));
                }
            }
        }
        // Door
        voxels.push(drawVoxel(0, -4, 1, '#3E2723'));
        voxels.push(drawVoxel(0, -4, 2, '#3E2723'));

        // Roof
        for(let x=-3; x<=3; x++) {
            for(let y=-3; y<=3; y++) voxels.push(drawVoxel(x, y, height, color));
        }
        for(let x=-2; x<=2; x++) {
            for(let y=-2; y<=2; y++) voxels.push(drawVoxel(x, y, height+1, color));
        }
    } else if (isIndustrial) {
        // Factory Block
        for(let z=1; z<6; z++) {
            for(let x=-3; x<=3; x++) {
                for(let y=-2; y<=2; y++) voxels.push(drawVoxel(x, y, z, '#546E7A'));
            }
        }
        // Chimney
        for(let z=1; z<12; z++) {
            voxels.push(drawVoxel(2, 2, z, '#263238'));
        }
        voxels.push(drawVoxel(2, 2, 12, '#cfd8dc')); // Smoke puff
        voxels.push(drawVoxel(2, 1, 13, '#cfd8dc'));
    } else if (isNature) {
        // Tree-house style
        for(let z=0; z<8; z++) voxels.push(drawVoxel(0, 0, z, '#5D4037')); // Trunk
        
        // Foliage blobs
        const leafColor = '#2E7D32';
        for(let x=-2; x<=2; x++) for(let y=-2; y<=2; y++) voxels.push(drawVoxel(x, y, 6, leafColor));
        for(let x=-1; x<=1; x++) for(let y=-1; y<=1; y++) voxels.push(drawVoxel(x, y, 7, leafColor));
        
        // Platform
        if (assetId.includes('camp')) {
            for(let x=-2; x<=2; x++) voxels.push(drawVoxel(x, 1, 2, '#8D6E63'));
        }
    } else if (isMagic) {
        // Crystal Spire
        for(let z=0; z<4; z++) {
            voxels.push(drawVoxel(0, 0, z, '#4A148C'));
            voxels.push(drawVoxel(1, 0, z, '#4A148C'));
            voxels.push(drawVoxel(0, 1, z, '#4A148C'));
            voxels.push(drawVoxel(-1, 0, z, '#4A148C'));
            voxels.push(drawVoxel(0, -1, z, '#4A148C'));
        }
        // Floating Crystal
        voxels.push(drawVoxel(0, 0, 6, '#E040FB'));
        voxels.push(drawVoxel(0, 0, 7, '#E040FB'));
        voxels.push(drawVoxel(0, 0, 8, '#EA80FC'));
    }

    return voxels;
};

const buildResource = (assetId: string) => {
    const voxels: React.ReactNode[] = [];
    
    if (assetId.includes('tree')) {
        // Detailed Tree
        for(let z=0; z<6; z++) voxels.push(drawVoxel(0, 0, z, '#5D4037')); // Trunk
        // Branches
        voxels.push(drawVoxel(1, 0, 3, '#5D4037'));
        voxels.push(drawVoxel(-1, 0, 4, '#5D4037'));
        
        // Leaves
        const leafColor = assetId.includes('mutated') ? '#9C27B0' : '#388E3C';
        for(let x=-2; x<=2; x++) for(let y=-2; y<=2; y++) if(Math.random()>0.3) voxels.push(drawVoxel(x, y, 5, leafColor));
        for(let x=-1; x<=1; x++) for(let y=-1; y<=1; y++) voxels.push(drawVoxel(x, y, 6, leafColor));
        voxels.push(drawVoxel(0, 0, 7, leafColor));

    } else if (assetId.includes('ore') || assetId.includes('stone')) {
        // Rock Cluster
        const rockColor = assetId.includes('iron') ? '#8D6E63' : '#9E9E9E';
        const oreColor = assetId.includes('iron') ? '#D32F2F' : '#FFD700';
        
        for(let x=-2; x<=1; x++) for(let y=-1; y<=2; y++) voxels.push(drawVoxel(x, y, 0, rockColor));
        voxels.push(drawVoxel(0, 0, 1, rockColor));
        voxels.push(drawVoxel(-1, 1, 1, rockColor));
        voxels.push(drawVoxel(0, 0, 2, oreColor)); // Vein
    } else if (assetId.includes('crystal') || assetId.includes('flux')) {
        // Crystal Shards
        const cColor = assetId.includes('flux') ? '#00E676' : '#D500F9';
        // Main shard
        for(let z=0; z<6; z++) voxels.push(drawVoxel(0, 0, z, cColor));
        // Side shards
        voxels.push(drawVoxel(1, 1, 0, cColor));
        voxels.push(drawVoxel(1, 1, 1, cColor));
        voxels.push(drawVoxel(-1, 0, 0, cColor));
    } else if (assetId.includes('scrap')) {
        // Scrap Pile
        voxels.push(drawVoxel(0, 0, 0, '#555'));
        voxels.push(drawVoxel(1, 0, 0, '#333'));
        voxels.push(drawVoxel(0, 1, 0, '#777'));
        voxels.push(drawVoxel(0, 0, 1, '#DAA520')); // Gold gear
    }

    return voxels;
};

// --- MAIN COMPONENT ---

export const ProceduralAsset: React.FC<ProceduralAssetProps> = ({ assetId, factionId, isSelected, scale = 1, visualGenes }) => {
    const faction = factionId ? FACTIONS_MAP.get(factionId) : null;
    const primary = faction ? (FACTION_COLOR_HEX_MAP[faction.color] || '#888') : '#888';
    // Darker secondary for contrast
    const secondary = adjustColor(primary, -40);

    const isUnit = assetId.startsWith('unit_');
    const isInfra = assetId.startsWith('infra_') || assetId.startsWith('settlement_');
    const isResource = assetId.startsWith('resource_') || assetId.startsWith('asset_') || assetId.startsWith('discovery_');

    const content = useMemo(() => {
        if (isUnit && visualGenes) {
            if (visualGenes.bodyType === 'Vehicle') return buildVehicle(visualGenes, primary, secondary);
            return buildHumanoid(visualGenes, primary, secondary);
        } else if (isInfra) {
            let tier = 1;
            if (assetId.includes('town')) tier = 2;
            if (assetId.includes('city')) tier = 3;
            return buildStructure(assetId, primary, tier);
        } else if (isResource) {
            return buildResource(assetId);
        }
        return <g />;
    }, [assetId, primary, secondary, visualGenes, isUnit, isInfra, isResource]);

    return (
        <svg 
            viewBox="-50 -50 100 100" 
            className={`overflow-visible transition-transform duration-200 ${isSelected ? 'drop-shadow-[0_0_5px_rgba(255,255,0,0.8)]' : ''}`}
            style={{ width: '100%', height: '100%', transform: `scale(${scale}) translateY(${isUnit ? '-10%' : '0'})` }}
        >
            {/* Ground Shadow for grounding */}
            <ellipse cx="0" cy="10" rx="12" ry="6" fill="black" opacity="0.3" filter="blur(2px)" />
            
            {content}
        </svg>
    );
};
