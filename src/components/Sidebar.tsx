import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { TileData, GameState, DiplomaticStatus, UnitInstance, SoundManager, ResourceTier, Faction, FactionEffectType, ItemDefinition, StatEffect, EquipmentSlot } from '../types';
import { BIOMES_MAP, RESOURCES_MAP, UNITS_MAP, FACTIONS_MAP, INFRASTRUCTURE_MAP, WORLD_EVENTS_MAP, UNIT_TRAITS_MAP, UNITS, XP_PER_LEVEL, STAT_INCREASE_PER_LEVEL, RARITY_COLORS } from '../constants';
import Icon from './Icon';
import UnitListItem from './UnitListItem';

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

const getFactionModifier = (factionInfo: Faction, effectType: FactionEffectType, filter?: any): number => {
    let modifier = 0;
    if (!factionInfo.traits) return 0;
    for (const trait of factionInfo.traits) {
        for (const effect of trait.effects) {
            if (effect.type === effectType) {
                if (filter?.unitRole && effect.unitRole && filter.unitRole !== effect.unitRole) continue;
                if (filter?.stat && effect.stat && filter.stat !== effect.stat) continue;
                modifier += effect.value;
            }
        }
    }
    return modifier;
};

const ItemTooltip: React.FC<{item: ItemDefinition, targetRef: React.RefObject<HTMLElement>}> = ({ item, targetRef }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: -9999, left: 0 });

    useEffect(() => {
        if (targetRef.current && tooltipRef.current) {
            const targetRect = targetRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const sidebar = targetRef.current.closest('aside');
            if (!sidebar) return;

            const sidebarRect = sidebar.getBoundingClientRect();

            let top = targetRect.top;
            let left = sidebarRect.left - tooltipRect.width - 10;
            if (left < 10) {
                left = sidebarRect.right + 10;
            }

            setPosition({ top, left });
        }
    }, [targetRef]);

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
        <div ref={tooltipRef} className="fixed z-50 w-64 p-3 bg-gray-900/80 backdrop-blur-md border border-cyan-500/50 rounded-lg shadow-xl pop-in" style={{...position}}>
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
    const [hoveredItem, setHoveredItem] = useState<ItemDefinition | null>(null);
    const itemRefs = useRef<Record<string, HTMLElement | null>>({});

    if (!unitDef || !faction) return null;

    const { maxHp, attack, defense, bonusHp, bonusAtk, bonusDef } = useMemo(() => {
        const unitDef = UNITS_MAP.get(unit.unitId)!;
        const factionInfo = FACTIONS_MAP.get(unit.factionId)!;
    
        let baseHp = unitDef.hp;
        let baseAtk = unitDef.atk;
        let baseDef = unitDef.defense;
    
        // Apply Faction Traits
        const hpFactionMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { unitRole: unitDef.role, stat: 'hp' });
        const totalHpFactionMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { stat: 'hp' });
        baseHp *= (1 + hpFactionMod + totalHpFactionMod);
    
        const atkFactionMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { unitRole: unitDef.role, stat: 'atk' });
        const totalAtkFactionMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { stat: 'atk' });
        baseAtk *= (1 + atkFactionMod + totalAtkFactionMod);
        
        // Apply Level Bonus
        const level = unit.level || 1;
        if (level > 1) {
            const bonus = 1 + (level - 1) * STAT_INCREASE_PER_LEVEL;
            baseHp *= bonus;
            baseAtk *= bonus;
        }

        const statBonuses = {
            flatHp: 0, flatAtk: 0, flatDef: 0,
            percentHp: 0, percentAtk: 0, percentDef: 0
        };

        const allEquipment = Object.values(unit.equipment).filter(Boolean) as ItemDefinition[];
        for (const item of allEquipment) {
            for (const effect of item.effects) {
                switch(effect.type) {
                    case 'HP_FLAT': statBonuses.flatHp += effect.value; break;
                    case 'ATTACK_FLAT': statBonuses.flatAtk += effect.value; break;
                    case 'DEFENSE_FLAT': statBonuses.flatDef += effect.value; break;
                    case 'HP_PERCENT': statBonuses.percentHp += effect.value; break;
                    case 'ATTACK_PERCENT': statBonuses.percentAtk += effect.value; break;
                    case 'DEFENSE_PERCENT': statBonuses.percentDef += effect.value; break;
                }
            }
        }
    
        const finalMaxHp = Math.floor((baseHp + statBonuses.flatHp) * (1 + statBonuses.percentHp));
        const finalAttack = Math.floor((baseAtk + statBonuses.flatAtk) * (1 + statBonuses.percentAtk));
        const finalDefense = Math.floor((baseDef + statBonuses.flatDef) * (1 + statBonuses.percentDef));
        
        const baseStatsAfterMods = {
            hp: Math.floor(baseHp),
            atk: Math.floor(baseAtk),
            def: Math.floor(baseDef)
        };

        return {
            maxHp: finalMaxHp,
            attack: finalAttack,
            defense: finalDefense,
            bonusHp: finalMaxHp - baseStatsAfterMods.hp,
            bonusAtk: finalAttack - baseStatsAfterMods.atk,
            bonusDef: finalDefense - baseStatsAfterMods.def,
        };
    }, [unit]);

    const xpPercentage = (unit.xp / XP_PER_LEVEL) * 100;
    
    const equipmentSlots: { slot: EquipmentSlot; icon: string }[] = [
        { slot: 'Weapon', icon: 'sword' },
        { slot: 'Armor', icon: 'shield' },
        { slot: 'Accessory', icon: 'ring' },
    ];

    return (
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 h-full flex flex-col">
            {hoveredItem && itemRefs.current[hoveredItem.id] && <ItemTooltip item={hoveredItem} targetRef={{ current: itemRefs.current[hoveredItem.id] }} />}

            <div className="flex justify-between items-center border-b-2 pb-2 mb-3" style={{borderColor: `rgba(var(--selection-glow-rgb), 0.5)`}}>
                 <h3 className="text-xl font-bold" style={{color: `rgba(var(--selection-glow-rgb), 1)`}}>Unit Details</h3>
                 <button onClick={onBack} className="text-sm text-cyan-400 hover:text-cyan-300">← Back to Tile</button>
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
                    <p className="text-sm text-gray-400">HP</p>
                    <p className="text-lg font-mono font-bold">{Math.ceil(unit.hp)} / {maxHp} {bonusHp !== 0 && <span className={bonusHp > 0 ? "text-green-400" : "text-red-400"}>({bonusHp > 0 ? `+${bonusHp}`: bonusHp})</span>}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Attack</p>
                    <p className="text-lg font-mono font-bold">{attack} {bonusAtk > 0 && <span className="text-green-400">(+{bonusAtk})</span>}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Defense</p>
                    <p className="text-lg font-mono font-bold">{defense}% {bonusDef > 0 && <span className="text-green-400">(+{bonusDef}%)</span>}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-2 space-y-4">
                <div className="pt-3 border-t border-gray-700">
                    <h4 className="text-lg font-bold text-cyan-300 mb-2">Equipment</h4>
                    <div className="space-y-2">
                        {equipmentSlots.map(({ slot, icon }) => {
                            const item = unit.equipment[slot];
                            return (
                                <div key={slot} className="flex items-center bg-black/20 p-2 rounded">
                                    <Icon name={icon} className="w-6 h-6 text-cyan-400 mr-3" />
                                    <div 
                                        ref={el => { itemRefs.current[item?.id || slot] = el; }}
                                        onMouseEnter={() => item && setHoveredItem(item)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className="flex-1"
                                    >
                                        <p className="font-semibold">{slot}</p>
                                        {item ? <p className={`text-sm ${RARITY_COLORS[item.rarity]}`}>{item.name}</p> : <p className="text-sm text-gray-500 italic">Empty</p>}
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
                            {unit.inventory.map((item, index) => (
                                <li 
                                    key={`${item.id}-${index}`} 
                                    ref={el => { itemRefs.current[`inv-${item.id}-${index}`] = el; }}
                                    onMouseEnter={() => setHoveredItem(item)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className={`bg-black/20 p-2 rounded ${RARITY_COLORS[item.rarity]}`}
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
    Raw: 'Raw Materials',
    Processed: 'Processed Goods',
    Component: 'Components',
    Exotic: 'Exotic Materials',
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
            <div className="flex flex-col items-center justify-center text-center h-full">
                <Icon name="cube" className="w-16 h-16 text-gray-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-300">Select a Tile</h2>
                <p className="text-gray-400">Click on the map to inspect a tile and its contents.</p>
            </div>
        );
    }
    
    const biome = BIOMES_MAP.get(selectedTile.biomeId);
    const resource = selectedTile.resourceId ? RESOURCES_MAP.get(selectedTile.resourceId) : null;
    const infrastructure = selectedTile.infrastructureId ? INFRASTRUCTURE_MAP.get(selectedTile.infrastructureId) : null;
    const worldEvent = selectedTile.worldEventId ? WORLD_EVENTS_MAP.get(selectedTile.worldEventId) : null;
    const isSettlement = infrastructure?.id.startsWith('settlement_');

    return (
        <>
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Tile ({selectedTile.x}, {selectedTile.y})</h2>
                <p className={`text-lg font-semibold ${biome ? 'text-green-400' : ''}`}>{biome?.name || 'Unknown Biome'}</p>
            </div>
            <div className="space-y-4">
                 {biome && biome.terrainEffects.length > 0 && (
                     <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                         <h3 className="text-lg font-bold text-cyan-300 mb-2">Terrain Effects</h3>
                         <ul className="space-y-1 text-sm">
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
                    <h3 className={`text-lg font-bold border-b-2 border-${ownerFaction.color} mb-2 pb-1 text-${ownerFaction.color}`}>Owner: {ownerFaction.name}</h3>
                    {ownerFaction.traits.map(trait => (<div key={trait.name} className="mb-2"><h4 className="font-semibold text-gray-300">{trait.name}</h4><p className="text-sm text-gray-400">{trait.description}</p></div>))}
                     {isSettlement && (<div className="text-sm my-2"><span>Population: </span><span className="font-mono">{ownerFactionState.population} / {infrastructure?.populationCapacity || 0}</span></div>)}
                    {isSettlement && ownerFactionState.storage ? (
                        <div className="space-y-2">
                            {Object.entries(ownerFactionState.storage).map(([tier, data]) => {
                                if (data.capacity === 0) return null;
                                const percentage = data.capacity > 0 ? (data.current / data.capacity) * 100 : 0;
                                const isNearCapacity = percentage > 90;
                                const tierName = TIER_NAMES[tier as ResourceTier];
                                return (
                                <div key={tier}>
                                    <h4 className="font-semibold text-gray-300 flex justify-between"><span>{tierName}</span><span className={`font-mono ${isNearCapacity ? 'text-yellow-400' : ''}`}>{Math.floor(data.current)} / {data.capacity}</span></h4>
                                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1"><div className={`h-1.5 rounded-full ${isNearCapacity ? 'bg-yellow-500' : 'bg-cyan-500'}`} style={{ width: `${percentage}%` }}></div></div>
                                    <ul className="text-xs text-gray-400 mt-1 pl-2">
                                        {Object.entries(ownerFactionState.resources).filter(([resId]) => RESOURCES_MAP.get(resId)?.tier === tier && ownerFactionState.resources[resId] > 0).map(([resId, amount]) => (<li key={resId} className="flex justify-between"><span>{RESOURCES_MAP.get(resId)?.name}</span><span>{Math.floor(amount)}</span></li>))}
                                    </ul>
                                </div>
                                );
                            })}
                        </div>
                    ) : ( null )}
                    {notableCharacters.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                            <h4 className="font-semibold text-gray-300 flex items-center"><Icon name="user" className="w-4 h-4 mr-2" />Notable Characters:</h4>
                            <ul className="text-sm space-y-1 mt-1">
                                {notableCharacters.map(char => (<li key={char.name}><button onClick={() => onPanToLocation(char.location)} onMouseEnter={() => soundManager?.playUIHoverSFX()} className="text-cyan-400 hover:text-cyan-200 hover:underline text-left">{char.isLeader && '⭐ '}{char.name}</button></li>))}
                            </ul>
                        </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-gray-600">
                         <h4 className="font-semibold text-gray-300">Diplomacy:</h4>
                         <ul className="text-sm space-y-1 mt-1">
                            {Object.entries(ownerFactionState.diplomacy).sort(([aId], [bId]) => FACTIONS_MAP.get(aId)!.name.localeCompare(FACTIONS_MAP.get(bId)!.name)).map(([id, relation]) => {
                                const otherFaction = FACTIONS_MAP.get(id);
                                if (!otherFaction) return null;
                                const { color, icon } = getStatusStyles(relation.status);
                                return (
                                     <li key={id} className="flex justify-between items-center">
                                        <span>{otherFaction.name}</span>
                                        <div className="flex items-center space-x-2">
                                            <span className={`font-semibold ${color}`}>{relation.status}</span>
                                            {icon && <Icon name={icon} className={`w-4 h-4 ${color}`} />}
                                            <span className="font-mono text-xs w-8 text-right">({Math.round(relation.opinion)})</span>
                                        </div>
                                    </li>
                                )
                            })}
                         </ul>
                    </div>
                  </div>
                )}
                 {worldEvent && (<div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700"><h3 className="text-lg font-bold text-purple-400 mb-1">{worldEvent.type}: {worldEvent.name}</h3><p className="text-sm text-gray-400">{worldEvent.description}</p></div>)}
                 {infrastructure && (
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-bold text-cyan-300 mb-1">{isSettlement ? `Settlement (Tier ${infrastructure.tier})` : 'Infrastructure'}</h3>
                        <p className="text-md">{infrastructure.name}</p>
                        <p className="text-sm text-gray-400">{infrastructure.description}</p>
                        
                        {infrastructure.addsStorage && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                                <h4 className="font-semibold text-gray-300 text-sm">Storage Bonus:</h4>
                                <ul className="text-xs text-gray-400 list-disc list-inside ml-4">
                                    {Object.entries(infrastructure.addsStorage).map(([tier, amount]) => (
                                        <li key={tier}>
                                            + {amount} {TIER_NAMES[tier as ResourceTier]} Capacity
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {isSettlement && infrastructure.upgradesTo && infrastructure.upgradeCost && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                                <h4 className="font-semibold text-gray-300 text-sm">Upgrade to {INFRASTRUCTURE_MAP.get(infrastructure.upgradesTo)?.name}</h4>
                                <p className="text-xs text-gray-500 mb-1">Increases population and storage capacity.</p>
                                <ul className="text-xs text-gray-400">{Object.entries(infrastructure.upgradeCost).map(([id, amount]) => (<li key={id}>- {amount} {RESOURCES_MAP.get(id)?.name || id}</li>))}</ul>
                            </div>
                        )}
                    </div>
                )}
                 {resource && (<div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700"><h3 className="text-lg font-bold text-yellow-400 mb-1">Resource Deposit</h3><p className="text-md">{resource.name} <span className="text-xs text-gray-400">({resource.tier} - {resource.rarity})</span></p></div>)}
                 {selectedTile.units.length > 0 && (
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-bold text-red-400 mb-2">Units ({selectedTile.units.length})</h3>
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
        </>
    );
  }

  return (
    <aside className={`absolute top-0 right-0 h-full flex flex-col transition-all duration-300 ease-in-out ${isMinimized ? 'w-4' : 'w-80'} bg-gray-900/70 backdrop-blur-md border-l-2 border-cyan-400 shadow-2xl shadow-cyan-400/30 z-40`}>
        <div className="absolute top-1/2 -translate-y-1/2 w-8 h-14 -left-4 flex items-center z-20">
            <button onClick={() => { onToggleMinimize(); soundManager?.playSFX('ui_click_subtle'); }} className="w-full h-full bg-gray-800/90 hover:bg-cyan-800/90 rounded-l-lg flex items-center justify-center transition-colors duration-200" aria-label={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}>
                <Icon name={isMinimized ? 'chevron-left' : 'chevron-right'} className="w-6 h-6 text-cyan-300" />
            </button>
        </div>
        <div className={`h-full w-full overflow-hidden transition-opacity duration-200 ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="p-4 h-full w-80 overflow-y-auto text-white">{renderContent()}</div>
        </div>
    </aside>
  );
};

export default Sidebar;