
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

// --- Voxel Primitive Engine ---

const adjustColor = (color: string, amount: number) => {
    if (!color) return '#888888';
    let hex = color.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x00FF) + amount;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const Cube: React.FC<{ x: number; y: number; z: number; size: number; color: string; brightness?: number, opacity?: number }> = ({ x, y, z, size, color, brightness = 0, opacity = 1 }) => {
    const baseColor = brightness !== 0 ? adjustColor(color, brightness) : color;
    const topColor = adjustColor(baseColor, 40);
    const leftColor = adjustColor(baseColor, -10);
    const rightColor = adjustColor(baseColor, -50);

    const cx = x;
    const cy = y - z; 
    const s = size;
    const h = size * 0.6; 

    return (
        <g opacity={opacity}>
            <path d={`M${cx},${cy - h} L${cx + s},${cy} L${cx},${cy + h} L${cx - s},${cy} Z`} fill={topColor} />
            <path d={`M${cx - s},${cy} L${cx},${cy + h} L${cx},${cy + h + s*1.2} L${cx - s},${cy + s*1.2} Z`} fill={leftColor} />
            <path d={`M${cx},${cy + h} L${cx + s},${cy} L${cx + s},${cy + s*1.2} L${cx},${cy + h + s*1.2} Z`} fill={rightColor} />
        </g>
    );
};

// --- Archetype Renderers ---

const HumanoidBody: React.FC<{ s: number, color: string, secondary: string }> = ({s, color, secondary}) => (
    <g>
        <Cube x={-s*0.6} y={0} z={0} size={s*0.4} color="#333" /> 
        <Cube x={s*0.6} y={0} z={0} size={s*0.4} color="#333" />  
        <Cube x={-s*0.6} y={0} z={s*0.8} size={s*0.35} color="#444" /> 
        <Cube x={s*0.6} y={0} z={s*0.8} size={s*0.35} color="#444" />  
        <Cube x={0} y={0} z={s*1.8} size={s*0.7} color={color} /> 
        <Cube x={0} y={0} z={s*2.8} size={s*0.8} color={color} /> 
        <Cube x={0} y={0} z={s*3} size={s*0.4} color={secondary} /> {/* Emblem */}
    </g>
);

const ConstructBody: React.FC<{ s: number, color: string, secondary: string }> = ({s, color, secondary}) => (
    <g>
        <Cube x={-s} y={0} z={0} size={s*0.6} color="#555" /> {/* Heavy Foot */}
        <Cube x={s} y={0} z={0} size={s*0.6} color="#555" />
        <Cube x={0} y={0} z={s*1.5} size={s*1.2} color={color} /> {/* Bulk Torso */}
        <Cube x={0} y={0} z={s*2.5} size={s} color={color} />
        <Cube x={-s*1.2} y={0} z={s*2} size={s*0.5} color={secondary} /> {/* Shoulder piston */}
        <Cube x={s*1.2} y={0} z={s*2} size={s*0.5} color={secondary} />
        <Cube x={0} y={-s} z={s*3} size={s*0.3} color="#222" /> {/* Exhaust */}
    </g>
);

const EtherealBody: React.FC<{ s: number, color: string, secondary: string }> = ({s, color, secondary}) => (
    <g>
        {/* Floating Segments */}
        <Cube x={0} y={0} z={s*1.0} size={s*0.4} color={color} opacity={0.6} />
        <Cube x={0} y={0} z={s*2.0} size={s*0.6} color={color} opacity={0.8} />
        <Cube x={0} y={0} z={s*3.0} size={s*0.8} color={color} />
        {/* Floating Crystals */}
        <Cube x={-s} y={0} z={s*2.5} size={s*0.2} color={secondary} brightness={50} />
        <Cube x={s} y={0} z={s*2.5} size={s*0.2} color={secondary} brightness={50} />
    </g>
);

const VehicleBody: React.FC<{ s: number, color: string, secondary: string }> = ({s, color, secondary}) => (
    <g>
        <Cube x={-s} y={-s} z={0} size={s*0.5} color="#111" /> {/* Wheel 1 */}
        <Cube x={s} y={-s} z={0} size={s*0.5} color="#111" />
        <Cube x={-s} y={s} z={0} size={s*0.5} color="#111" />
        <Cube x={s} y={s} z={0} size={s*0.5} color="#111" />
        <Cube x={0} y={0} z={s} size={s*1.5} color={color} /> {/* Chassis */}
        <Cube x={0} y={0} z={s*2} size={s*0.8} color={secondary} /> {/* Turret */}
    </g>
);

const EntityRenderer: React.FC<{ 
    genes: VisualGenes; 
    isSelected?: boolean;
}> = ({ genes, isSelected }) => {
    const s = 6 * (genes.sizeScale || 1);
    const color = genes.bodyColor || '#888';
    const secondary = genes.secondaryColor || '#fff';
    const weaponColor = genes.weaponColor || '#ccc';

    return (
        <g transform="translate(50, 70)">
            <ellipse cx="0" cy="0" rx={s*2.5} ry={s} fill="black" opacity="0.3" />

            {/* BODY */}
            {genes.bodyType === 'Humanoid' && <HumanoidBody s={s} color={color} secondary={secondary} />}
            {genes.bodyType === 'Construct' && <ConstructBody s={s} color={color} secondary={secondary} />}
            {genes.bodyType === 'Ethereal' && <EtherealBody s={s} color={color} secondary={secondary} />}
            {genes.bodyType === 'Vehicle' && <VehicleBody s={s} color={color} secondary={secondary} />}
            {genes.bodyType === 'Floating' && <EtherealBody s={s} color={color} secondary={secondary} />} 
            {genes.bodyType === 'Beast' && <ConstructBody s={s} color={color} secondary={secondary} />} 

            {/* HEAD */}
            <g transform={`translate(0, ${-s* (genes.bodyType === 'Construct' ? 0.5 : 0)})`}>
                {genes.bodyType !== 'Vehicle' && <Cube x={0} y={0} z={s*3.8} size={s*0.5} color="#f5cca9" />}
                
                {genes.headType === 'Helm' && <Cube x={0} y={0} z={s*4.2} size={s*0.6} color={secondary} />}
                {genes.headType === 'Hood' && <Cube x={0} y={0} z={s*4.2} size={s*0.6} color={adjustColor(color, -30)} />}
                {genes.headType === 'Crown' && <Cube x={0} y={0} z={s*4.4} size={s*0.4} color="#f1c40f" />}
                {genes.headType === 'Void' && <Cube x={0} y={0} z={s*4.0} size={s*0.4} color="#000" />}
                {genes.headType === 'GasMask' && (
                    <>
                        <Cube x={0} y={0} z={s*4.0} size={s*0.5} color="#333" />
                        <Cube x={0} y={-s*0.3} z={s*3.9} size={s*0.2} color="#111" /> {/* Filter */}
                    </>
                )}
                {genes.headType === 'Eye' && (
                    <>
                        <Cube x={0} y={0} z={s*4.0} size={s*0.5} color="#111" />
                        <Cube x={0} y={0} z={s*4.0} size={s*0.2} color="red" brightness={50} />
                    </>
                )}
            </g>

            {/* WEAPON */}
            <g transform={`translate(${s*1.8}, ${-s*2})`}>
                {genes.weaponType === 'Sword' && (
                    <>
                        <Cube x={0} y={0} z={0} size={s*0.2} color="#5D4037" /> 
                        <Cube x={0} y={0} z={s*2.5} size={s*0.2} color={weaponColor} brightness={40} />
                    </>
                )}
                {genes.weaponType === 'Staff' && (
                    <>
                        <Cube x={0} y={0} z={0} size={s*0.15} color="#5D4037" />
                        <Cube x={0} y={0} z={s*3} size={s*0.3} color={secondary} brightness={50} />
                    </>
                )}
                {genes.weaponType === 'Axe' && (
                    <>
                        <Cube x={0} y={0} z={0} size={s*0.15} color="#5D4037" />
                        <Cube x={0} y={0} z={s*2.5} size={s*0.6} color={weaponColor} />
                    </>
                )}
                {genes.weaponType === 'Rifle' && (
                    <>
                        <Cube x={0} y={s*0.5} z={s*1} size={s*0.2} color="#5D4037" />
                        <Cube x={0} y={-s*0.5} z={s*1} size={s*0.8} color="#111" />
                    </>
                )}
                {genes.weaponType === 'Wrench' && (
                    <>
                        <Cube x={0} y={0} z={s} size={s*0.6} color={weaponColor} />
                    </>
                )}
            </g>

            {/* PARTICLES & AURA */}
            {(genes.accessory === 'Aura' || isSelected) && (
                <circle cx="0" cy={-s*2} r={s*3} fill="none" stroke={secondary} strokeWidth="2" strokeDasharray="4 2" opacity="0.5">
                    <animateTransform attributeName="transform" type="rotate" from="0 0 -12" to="360 0 -12" dur="10s" repeatCount="indefinite" />
                </circle>
            )}
            {genes.accessory === 'Pipes' && (
                <Cube x={-s*0.8} y={0} z={s*3} size={s*0.3} color="#555" />
            )}
        </g>
    );
};

const BuildingModel: React.FC<{ assetId: string; color: string; tier: number }> = ({ assetId, color, tier }) => {
    const isIndustrial = assetId.includes('forge') || assetId.includes('mine') || assetId.includes('factory') || assetId.includes('scrap');
    const isNature = assetId.includes('lumber') || assetId.includes('grove') || assetId.includes('farm');
    const isArcane = assetId.includes('crystal') || assetId.includes('enchanter') || assetId.includes('siphon');
    const isVoid = assetId.includes('void');
    const isFortress = assetId.includes('bastion') || assetId.includes('citadel') || assetId.includes('vault');
    
    const wallColor = isIndustrial ? '#546E7A' : isNature ? '#5D4037' : isArcane ? '#4A148C' : '#d1d5db';
    
    return (
        <g transform="translate(50, 75)">
            <ellipse cx="0" cy="5" rx="35" ry="18" fill="black" opacity="0.2" />
            
            {/* Base Structure */}
            <Cube x={0} y={0} z={10} size={15} color={wallColor} />
            
            {/* TIER 2+ ADDITIONS */}
            {tier >= 2 && (
                <>
                    <Cube x={-15} y={5} z={5} size={8} color={wallColor} />
                    <Cube x={15} y={5} z={5} size={8} color={wallColor} />
                </>
            )}

            {/* SPECIALZATIONS */}
            {isIndustrial && <Cube x={10} y={0} z={25} size={5} color="#263238" />} {/* Smokestack */}
            {isNature && <Cube x={0} y={0} z={20} size={12} color="#2E7D32" />} {/* Foliage */}
            {isArcane && <Cube x={0} y={0} z={25} size={6} color="cyan" brightness={50} opacity={0.8} />} {/* Floating Crystal */}
            {isVoid && <Cube x={0} y={0} z={20} size={8} color="purple" opacity={0.6} />} {/* Void Rift */}
            {isFortress && <Cube x={0} y={0} z={25} size={8} color="#111" />} {/* Watchtower */}
            
            {/* Roof */}
            {!isArcane && !isVoid && <Cube x={0} y={0} z={22} size={14} color={color} />}
        </g>
    );
};

const ResourceModel: React.FC<{ assetId: string }> = ({ assetId }) => {
    return (
        <g transform="translate(50, 70)">
            <ellipse cx="0" cy="0" rx="20" ry="10" fill="black" opacity="0.2" />
            {assetId.includes('tree') && <Cube x={0} y={0} z={15} size={8} color="#2E7D32" />}
            {assetId.includes('ore') && <Cube x={0} y={0} z={5} size={6} color="#D32F2F" />}
            {assetId.includes('crystal') && <Cube x={0} y={0} z={10} size={6} color="#E040FB" brightness={30} />}
            {assetId.includes('void') && <Cube x={0} y={0} z={8} size={7} color="#000" />}
            {assetId.includes('gear') && <Cube x={0} y={0} z={5} size={6} color="#DAA520" />}
        </g>
    )
}

export const ProceduralAsset: React.FC<ProceduralAssetProps> = ({ assetId, factionId, isSelected, scale = 1, visualGenes }) => {
    const faction = factionId ? FACTIONS_MAP.get(factionId) : null;
    const factionColorHex = faction ? (FACTION_COLOR_HEX_MAP[faction.color] || '#9ca3af') : '#9ca3af';
    
    const isUnit = assetId.startsWith('unit_');
    const isInfra = assetId.startsWith('infra_') || assetId.startsWith('settlement_');
    const isResource = assetId.startsWith('resource_') || assetId.startsWith('asset_') || assetId.startsWith('discovery_');

    // Default Genes if not provided
    const genes: VisualGenes = visualGenes || {
        bodyColor: factionColorHex,
        secondaryColor: '#fff',
        bodyType: 'Humanoid',
        headType: 'Standard',
        weaponType: 'None',
        weaponColor: '#bdc3c7',
        sizeScale: 1,
        accessory: 'None'
    };

    let tier = 1;
    if (assetId.includes('town')) tier = 2;
    if (assetId.includes('city')) tier = 3;

    return (
        <svg 
            viewBox="0 0 100 100" 
            className={`overflow-visible transition-transform duration-200 ${isSelected ? 'drop-shadow-[0_0_5px_rgba(255,255,0,0.8)]' : ''}`}
            style={{ width: '100%', height: '100%', transform: `scale(${scale})` }}
        >
            {isUnit && <EntityRenderer genes={genes} isSelected={isSelected} />}
            {isInfra && <BuildingModel assetId={assetId} color={factionColorHex} tier={tier} />}
            {isResource && <ResourceModel assetId={assetId} />}
        </svg>
    );
};
