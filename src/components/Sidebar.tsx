
import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { TileData, GameState, DiplomaticStatus, UnitInstance, SoundManager, ResourceTier, ItemDefinition, StatEffect, StorageTierData, DiplomaticRelation } from '../types';
import { BIOMES_MAP, RESOURCES_MAP, UNITS_MAP, FACTIONS_MAP, INFRASTRUCTURE_MAP, WORLD_EVENTS_MAP, UNITS, XP_PER_LEVEL, RARITY_COLORS } from '../constants';
import Icon from './Icon';
import UnitListItem from './UnitListItem';
import { getUnitStats } from '../utils/unit';

interface SidebarProps {
  selectedTile: TileData | null;
  gameState: GameState;
  onSelectUnit: (unitId: number | null) => void;
  onPanToLocation: (location: { x: number; y: number }) => void;
  soundManager: SoundManager | null;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const getStatusStyles = (status: DiplomaticStatus): { color: string, icon: string } => {
    switch (status) {
        case 'War': return { color: 'text-red-400', icon: 'war' };
        case 'Alliance': return { color: 'text-green-400', icon: 'alliance' };
        default: return { color: 'text-gray-400', icon: '' };
    }
}

const ItemTooltip: React.FC<{item: ItemDefinition, targetElement: HTMLElement}> = ({ item, targetElement }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: -9999, left: 0 });

    useEffect(() => {
        if (targetElement && tooltipRef.current) {
            const targetRect = targetElement.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            
            // Basic smart positioning
            let top = targetRect.top - tooltipRect.height - 10;
            let left = targetRect.left;
            
            // Adjust if out of bounds
            if (top < 10) top = targetRect.bottom + 10;
            if (left + tooltipRect.width > window.innerWidth) left = window.innerWidth - tooltipRect.width - 10;

            setPosition({ top, left });
        }
    }, [targetElement]);

    const formatEffect = (type: StatEffect, value: number): string => {
        const sign = value > 0 ? '+' : '';
        switch(type) {
            case 'HP_FLAT': return `${sign}${value} HP`;
            case 'ATTACK_FLAT': return `${sign}${value} Attack`;
            case 'DEFENSE_FLAT': return `${sign}${value} Defense`;
            case 'HP_PERCENT': return `${sign}${value * 100}% HP`;
            case 'ATTACK_PERCENT': return `${sign}${value * 100}% Attack`;
            case 'DEFENSE_PERCENT': return `${sign}${value * 100}% Defense`;
            case 'HP_REGEN': return `+${value} HP/tick`;
            default: return `${type.replace(/_/g, ' ')}: ${value}`;
        }
    };

    return (
        <div ref={tooltipRef} className="fixed z-[100] w-64 p-3 bg-gray-900/95 backdrop-blur-md border border-cyan-500/50 rounded-lg shadow-xl pop-in" style={{top: position.top, left: position.left}}>
            <h4 className={`font-bold ${RARITY_COLORS[item.rarity]} mb-1`}>{item.name}</h4>
            <p className="text-xs text-gray-400 mb-2 italic">"{item.description}"</p>
            <ul className="text-sm space-y-1">
                {item.effects.map((effect, i) => (
                    <li key={i} className="text-green-400">{formatEffect(effect.type, effect.value)}</li>
                ))}
            </ul>
        </div>
    );
};


const UnitDetailView: React.FC<{unit: UnitInstance, onBack: () => void}> = ({ unit, onBack }) => {
    const unitDef = UNITS_MAP.get(unit.unitId);
    const faction = FACTIONS_MAP.get(unit.factionId);
    const [hoveredItem, setHoveredItem] = useState<{ item: ItemDefinition; element: HTMLElement } | null>(null);

    if (!unitDef || !faction) return null;

    const { maxHp, attack, defense, bonusHp, bonusAtk, bonusDef } = useMemo(() => getUnitStats(unit), [unit]);
    const xpPercentage = (unit.xp / XP_PER_LEVEL) * 100;
    
    const equipmentSlots: { slot: 'Weapon' | 'Armor' | 'Accessory'; icon: string }[] = [
        { slot: 'Weapon', icon: 'sword' },
        { slot: 'Armor', icon: 'shield' },
        { slot: 'Accessory', icon: 'ring' },
    ];

    return (
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 h-full flex flex-col overflow-y-auto">
            {hoveredItem && <ItemTooltip item={hoveredItem.item} targetElement={hoveredItem.element} />}

            <div className="flex justify-between items-center border-b-2 pb-2 mb-3" style={{borderColor: `rgba(var(--selection-glow-rgb), 0.5)`}}>
                 <h3 className="text-xl font-bold" style={{color: `rgba(var(--selection-glow-rgb), 1)`}}>Unit Details</h3>
                 <button onClick={onBack} className="text-sm text-cyan-400 hover:text-cyan-300 bg-gray-800 px-2 py-1 rounded">← Back</button>
            </div>
            
            <div className="text-center mb-2">
                <h2 className="text-2xl font-bold">{unitDef.name}</h2>
                <p className="text-lg font-semibold" style={{color: `rgba(var(--selection-glow-rgb), 0.9)`}}>{faction.name}</p>
                 <p className="text-sm text-gray-400 capitalize">Activity: {unit.currentActivity}</p>
            </div>

             <div className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                    <p className="text-sm font-bold">Level {unit.level}</p>
                    <p className="text-xs font-mono text-gray-400">{unit.xp} / {XP_PER_LEVEL} XP</p>
                </div>
                <div className="w-full bg-gray-900/50 rounded-full h-2 border border-gray-700">
                    <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div>
                    <p className="text-xs text-gray-400">HP</p>
                    <p className="text-md font-mono font-bold">{Math.ceil(unit.hp)} / {maxHp} {bonusHp !== 0 && <span className={bonusHp > 0 ? "text-green-400" : "text-red-400"}>({bonusHp > 0 ? `+${bonusHp}`: bonusHp})</span>}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">ATK</p>
                    <p className="text-md font-mono font-bold">{attack} {bonusAtk > 0 && <span className="text-green-400">(+{bonusAtk})</span>}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">DEF</p>
                    <p className="text-md font-mono font-bold">{defense} {bonusDef > 0 && <span className="text-green-400">(+{bonusDef})</span>}</p>
                </div>
            </div>

            <div className="mt-2 space-y-4 pb-12">
                <div className="pt-3 border-t border-gray-700">
                    <h4 className="text-lg font-bold text-cyan-300 mb-2">Equipment</h4>
                    <div className="space-y-2">
                        {equipmentSlots.map(({ slot, icon }) => {
                            const item = unit.equipment[slot];
                            return (
                                <div key={slot} className="flex items-center bg-black/20 p-2 rounded">
                                    <Icon name={icon} className="w-6 h-6 text-cyan-400 mr-3 flex-shrink-0" />
                                    <div 
                                        onClick={(e) => item && setHoveredItem({ item, element: e.currentTarget as HTMLElement })}
                                        className="flex-1 overflow-hidden"
                                    >
                                        <p className="font-semibold text-xs">{slot}</p>
                                        {item ? <p className={`text-sm truncate ${RARITY_COLORS[item.rarity]}`}>{item.name}</p> : <p className="text-sm text-gray-500 italic">Empty</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {unit.inventory && unit.inventory.length > 0 && (
                    <div className="pt-3 border-t border-gray-700">
                        <h4 className="text-lg font-bold text-cyan-300 mb-2 flex items-center"><Icon name="briefcase" className="w-5 h-5 mr-2" />Inventory</h4>
                        <ul className="space-y-1 text-sm">
                            {unit.inventory.map((item: ItemDefinition, index) => (
                                <li 
                                    key={`${item.id}-${index}`} 
                                    onClick={(e) => setHoveredItem({ item, element: e.currentTarget as HTMLElement })}
                                    className={`bg-black/20 p-2 rounded ${RARITY_COLORS[item.rarity]} truncate`}
                                >
                                    {item.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

const TIER_NAMES: Record<ResourceTier, string> = {
    Scrap: 'Scrap',
    Raw: 'Raw',
    Refined: 'Refined',
    Atharium: 'Atharium',
    Artifact: 'Artifact',
};

const Sidebar: React.FC<SidebarProps> = ({ selectedTile, gameState, onSelectUnit, onPanToLocation, soundManager, isMinimized, onToggleMinimize }) => {
  const { selectedUnitId } = gameState;
  
  const selectedUnit = useMemo(() => {
    if (!selectedUnitId) return null;
    return gameState.world.flat().flatMap(t => t.units).find(u => u.id === selectedUnitId) || null;
  }, [selectedUnitId, gameState.world]);

  const ownerFaction = selectedTile?.ownerFactionId ? FACTIONS_MAP.get(selectedTile.ownerFactionId) : null;
  const ownerFactionState = ownerFaction ? gameState.factions[ownerFaction.id] : null;

  const notableCharacters = useMemo(() => {
    if (!ownerFaction || !ownerFactionState) return [];
    
    const characters: { name: string; isLeader: boolean; location: {x: number, y: number} }[] = [];
    const leader = ownerFactionState.leader;
    let leaderLocation: {x: number, y: number} | null = null;
    
    if (ownerFactionState.leaderStatus === 'adventuring') {
        const heroDef = UNITS.find(u => u.factionId === ownerFaction.id && u.role === 'Hero');
        if (heroDef) {
            const leaderUnit = gameState.world.flat().flatMap(t => t.units).find(u => u.unitId === heroDef.id);
            if (leaderUnit) leaderLocation = { x: leaderUnit.x, y: leaderUnit.y };
        }
    } else {
        const settlements = gameState.world.flat().filter(t => t.ownerFactionId === ownerFaction.id && t.infrastructureId?.startsWith('settlement_'));
        if (settlements.length > 0) {
            settlements.sort((a,b) => (INFRASTRUCTURE_MAP.get(b.infrastructureId!)?.tier || 0) - (INFRASTRUCTURE_MAP.get(a.infrastructureId!)?.tier || 0));
            leaderLocation = { x: settlements[0].x, y: settlements[0].y };
        }
    }
    if (leader && leaderLocation) {
        characters.push({ name: leader.name, isLeader: true, location: leaderLocation });
    }
    return characters;
}, [ownerFaction, ownerFactionState, gameState.world]);

const renderContent = () => {
    if (selectedUnit) {
      return <UnitDetailView unit={selectedUnit} onBack={() => onSelectUnit(null)} />;
    }

    if (!selectedTile) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-full opacity-60">
                <Icon name="cube" className="w-16 h-16 text-gray-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-300">Select a Tile</h2>
                <p className="text-gray-400">Inspect map contents.</p>
            </div>
        );
    }
    
    const biome = BIOMES_MAP.get(selectedTile.biomeId);
    const resource = selectedTile.resourceId ? RESOURCES_MAP.get(selectedTile.resourceId) : null;
    const infrastructure = selectedTile.infrastructureId ? INFRASTRUCTURE_MAP.get(selectedTile.infrastructureId) : null;
    const worldEvent = selectedTile.worldEventId ? WORLD_EVENTS_MAP.get(selectedTile.worldEventId) : null;
    const isSettlement = infrastructure?.id.startsWith('settlement_');

    return (
        <div className="space-y-4 pb-16">
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold">Tile ({selectedTile.x}, {selectedTile.y})</h2>
                <p className={`text-md font-semibold ${biome ? 'text-green-400' : ''}`}>{biome?.name || 'Unknown Biome'}</p>
            </div>
            
             {biome && biome.terrainEffects.length > 0 && (
                 <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                     <h3 className="text-sm font-bold text-cyan-300 mb-1">Terrain Effects</h3>
                     <ul className="space-y-1 text-xs">
                         {biome.terrainEffects.map(effect => {
                            const isBonus = effect.effects.every(e => e.modifier >= 0);
                            const isPenalty = !isBonus && effect.effects.every(e => e.modifier <= 0);
                            const colorClass = isBonus ? 'text-green-400' : isPenalty ? 'text-red-400' : 'text-gray-300';
                            return (
                                <li key={effect.description} className={`${colorClass} flex items-start`}>
                                    <span className="mr-2">{isBonus ? '⊕' : isPenalty ? '⊖' : '•'}</span>
                                    <span>{effect.description}</span>
                                </li>
                            )
                         })}
                     </ul>
                 </div>
             )}

             {ownerFaction && ownerFactionState && (
              <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <h3 className={`text-lg font-bold border-b-2 border-${ownerFaction.color} mb-2 pb-1 text-${ownerFaction.color}`}>{ownerFaction.name}</h3>
                
                 {isSettlement && (<div className="text-sm my-2"><span>Pop: </span><span className="font-mono">{ownerFactionState.population} / {infrastructure?.populationCapacity || 0}</span></div>)}
                {isSettlement && ownerFactionState.storage ? (
                    <div className="space-y-2">
                        {(Object.entries(ownerFactionState.storage) as [string, StorageTierData][]).map(([tier, data]) => {
                            if (data.capacity === 0) return null;
                            const percentage = data.capacity > 0 ? (data.current / data.capacity) * 100 : 0;
                            const isNearCapacity = percentage > 90;
                            const tierName = TIER_NAMES[tier as ResourceTier];
                            return (
                            <div key={tier}>
                                <h4 className="font-semibold text-gray-300 flex justify-between text-xs"><span>{tierName}</span><span className={`font-mono ${isNearCapacity ? 'text-yellow-400' : ''}`}>{Math.floor(data.current)}/{data.capacity}</span></h4>
                                <div className="w-full bg-gray-700 rounded-full h-1 mt-0.5"><div className={`h-1 rounded-full ${isNearCapacity ? 'bg-yellow-500' : 'bg-cyan-500'}`} style={{ width: `${percentage}%` }}></div></div>
                            </div>
                            );
                        })}
                    </div>
                ) : ( null )}
                
                {notableCharacters.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-600">
                        <h4 className="font-semibold text-gray-300 text-sm">Key Figures:</h4>
                        <ul className="text-xs space-y-1 mt-1">
                            {notableCharacters.map(char => (<li key={char.name}><button onClick={() => onPanToLocation(char.location)} onMouseEnter={() => soundManager?.playUIHoverSFX()} className="text-cyan-400 hover:text-cyan-200 hover:underline text-left">{char.isLeader && '⭐ '}{char.name}</button></li>))}
                        </ul>
                    </div>
                )}
              </div>
            )}
             {worldEvent && (<div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700"><h3 className="text-md font-bold text-purple-400 mb-1">{worldEvent.type}: {worldEvent.name}</h3><p className="text-xs text-gray-400">{worldEvent.description}</p></div>)}
             {infrastructure && (
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <h3 className="text-md font-bold text-cyan-300 mb-1">{isSettlement ? `Settlement (Tier ${infrastructure.tier})` : 'Infrastructure'}</h3>
                    <p className="text-sm font-semibold">{infrastructure.name}</p>
                    <p className="text-xs text-gray-400 mb-2">{infrastructure.description}</p>
                    {isSettlement && infrastructure.upgradesTo && infrastructure.upgradeCost && (
                        <div className="pt-2 border-t border-gray-700">
                            <h4 className="font-semibold text-gray-300 text-xs">Next Upgrade:</h4>
                            <ul className="text-xs text-gray-400">{Object.entries(infrastructure.upgradeCost).map(([id, amount]) => (<li key={id}>- {amount as number} {RESOURCES_MAP.get(id)?.name || id}</li>))}</ul>
                        </div>
                    )}
                </div>
            )}
             {resource && (<div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700"><h3 className="text-md font-bold text-yellow-400 mb-1">Resource</h3><p className="text-sm">{resource.name} <span className="text-xs text-gray-400">({resource.tier} - {resource.rarity})</span></p></div>)}
             {selectedTile.units.length > 0 && (
              <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <h3 className="text-md font-bold text-red-400 mb-2">Units ({selectedTile.units.length})</h3>
                <ul className="space-y-2">
                  {selectedTile.units.map((unit) => {
                    const isSelected = gameState.selectedUnitId === unit.id;
                    return (
                      <UnitListItem
                        key={unit.id} unit={unit} isSelected={isSelected}
                        onClick={() => { onSelectUnit(unit.id); soundManager?.playSFX('ui_click_subtle'); }}
                        onMouseEnter={() => soundManager?.playUIHoverSFX()}
                      />
                    );
                  })}
                </ul>
              </div>
            )}
        </div>
    );
  }

  // Determine styles for Desktop vs Mobile
  const containerClasses = "fixed z-40 bg-gray-900/90 backdrop-blur-md shadow-2xl transition-all duration-300 ease-in-out border-cyan-400";
  
  // Desktop: Right side vertical sidebar
  const desktopClasses = `hidden md:flex flex-col top-0 right-0 h-full border-l-2 ${isMinimized ? 'w-4' : 'w-80'}`;
  
  // Mobile: Bottom sheet
  // If minimized on mobile, it's a small bar at the bottom. If expanded, it covers 50% height.
  const mobileClasses = `flex md:hidden flex-col bottom-0 left-0 w-full border-t-2 ${isMinimized ? 'h-8' : 'h-[60vh]'}`;

  return (
    <aside className={`${containerClasses} ${desktopClasses} ${mobileClasses}`}>
        {/* Toggle Button */}
        <button 
            onClick={() => { onToggleMinimize(); soundManager?.playSFX('ui_click_subtle'); }} 
            className={`
                absolute flex items-center justify-center bg-gray-800/90 hover:bg-cyan-800/90 transition-colors
                /* Desktop Position */
                md:top-1/2 md:-translate-y-1/2 md:-left-4 md:w-4 md:h-16 md:rounded-l-lg
                /* Mobile Position */
                top-0 left-1/2 -translate-x-1/2 -translate-y-full w-16 h-6 rounded-t-lg
            `}
            aria-label={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
        >
            <div className="md:rotate-0 -rotate-90">
                <Icon name={isMinimized ? 'chevron-left' : 'chevron-right'} className="w-4 h-4 text-cyan-300" />
            </div>
        </button>

        <div className={`h-full w-full overflow-hidden transition-opacity duration-200 ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="p-4 h-full overflow-y-auto text-white scrollbar-thin scrollbar-thumb-cyan-700 scrollbar-track-transparent">
                {renderContent()}
            </div>
        </div>
    </aside>
  );
};

export default Sidebar;
