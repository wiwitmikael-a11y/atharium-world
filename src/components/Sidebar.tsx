import React, { useMemo } from 'react';
// FIX: Import Faction and FactionEffectType to be used in getFactionModifier helper function.
import type { TileData, GameState, DiplomaticStatus, UnitInstance, SoundManager, ResourceTier, Faction, FactionEffectType } from '../types';
import { BIOMES_MAP, RESOURCES_MAP, UNITS_MAP, FACTIONS_MAP, INFRASTRUCTURE_MAP, WORLD_EVENTS_MAP, UNIT_TRAITS_MAP, UNITS } from '../constants';
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

// FIX: Add getFactionModifier helper function to calculate faction-based stat modifications.
// This function was missing, causing errors in UnitDetailView.
const getFactionModifier = (factionInfo: Faction, effectType: FactionEffectType, filter?: any): number => {
    let modifier = 0;
    if (!factionInfo.traits) return 0;
    for (const trait of factionInfo.traits) {
        for (const effect of trait.effects) {
            if (effect.type === effectType) {
                // Apply filters for specificity
                if (filter?.unitRole && effect.unitRole && filter.unitRole !== effect.unitRole) continue;
                if (filter?.stat && effect.stat && filter.stat !== effect.stat) continue;
                modifier += effect.value;
            }
        }
    }
    return modifier;
};

const getStatusStyles = (status: DiplomaticStatus): { color: string, icon: string } => {
    switch (status) {
        case 'War': return { color: 'text-red-400', icon: 'war' };
        case 'Alliance': return { color: 'text-green-400', icon: 'alliance' };
        default: return { color: 'text-gray-400', icon: '' };
    }
}

const UnitDetailView: React.FC<{unit: UnitInstance, onBack: () => void}> = ({ unit, onBack }) => {
    const unitDef = UNITS_MAP.get(unit.unitId);
    const faction = FACTIONS_MAP.get(unit.factionId);
    if (!unitDef || !faction) return null;
    const isHostile = faction.id === 'neutral_hostile';

    const maxHp = useMemo(() => {
        const factionInfo = FACTIONS_MAP.get(unit.factionId);
        if (!factionInfo) return unitDef.hp;
        
        // FIX: Replaced incorrect HP calculation with a call to getFactionModifier to correctly calculate max HP based on faction traits.
        const hpMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { unitRole: unitDef.role, stat: 'hp' });
        const totalHpMod = getFactionModifier(factionInfo, 'UNIT_STAT_MOD', { stat: 'hp' });
        return Math.floor(unitDef.hp * (1 + hpMod + totalHpMod));
    }, [unit.factionId, unitDef]);


    return (
        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 h-full flex flex-col">
            <div className="flex justify-between items-center border-b-2 pb-2 mb-3" style={{borderColor: isHostile ? '#6b7280' : FACTIONS_MAP.get(faction.id)?.color.replace('-500', '-600').replace('-600', '-700').replace('-400', '-500')}}>
                 <h3 className="text-xl font-bold text-red-400">Unit Details</h3>
                 <button onClick={onBack} className="text-sm text-cyan-400 hover:text-cyan-300">← Back to Tile</button>
            </div>
            
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">{unitDef.name}</h2>
                <p className={`text-lg font-semibold text-${faction.color}`}>{faction.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                    <p className="text-sm text-gray-400">HP</p>
                    <p className="text-xl font-mono font-bold">{Math.ceil(unit.hp)} / {maxHp}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-400">Attack</p>
                    <p className="text-xl font-mono font-bold">{unitDef.atk}</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-400">Role</p>
                    <p className="text-xl font-bold">{unitDef.role}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Kills</p>
                    <p className="text-xl font-mono font-bold">{unit.killCount}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-2 space-y-4">
                {unitDef.traitIds && unitDef.traitIds.length > 0 && (
                    <div>
                        <h4 className="text-lg font-bold text-cyan-300 mb-2">Traits</h4>
                        <ul className="space-y-3">
                            {unitDef.traitIds.map(traitId => {
                                const trait = UNIT_TRAITS_MAP.get(traitId);
                                if (!trait) return null;
                                return (
                                    <li key={traitId} className="bg-black/20 p-2 rounded">
                                        <strong className="text-cyan-400">{trait.name}:</strong>
                                        <p className="text-gray-300 text-sm ml-1">{trait.description}</p>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}
                 {unit.combatLog && unit.combatLog.length > 0 && (
                    <div className="pt-3 border-t border-gray-700">
                        <h4 className="text-lg font-bold text-cyan-300 mb-2">Battle Log</h4>
                        <ul className="space-y-2 text-sm">
                            {unit.combatLog.map((log, index) => {
                                const opponentDef = UNITS_MAP.get(log.opponentUnitId);
                                if (!opponentDef) return null;

                                return (
                                    <li key={index} className="bg-black/20 p-2 rounded">
                                        <div className="flex justify-between items-center text-gray-400 text-xs mb-1">
                                            <span>vs. {opponentDef.name}</span>
                                            <span>Tick {log.tick}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p>
                                                <span className="text-red-400 font-semibold">Dealt {log.damageDealt} dmg.</span>
                                                {log.isFatalToOpponent && <span className="text-red-500 font-bold ml-1">(Defeated!)</span>}
                                            </p>
                                            <p>
                                                <span className="text-yellow-400 font-semibold">Took {log.damageTaken} dmg.</span>
                                                {log.isFatalToSelf && <span className="text-yellow-500 font-bold ml-1">(Fallen)</span>}
                                            </p>
                                        </div>
                                    </li>
                                )
                            })}
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
            if (leaderUnit) {
                leaderLocation = { x: leaderUnit.x, y: leaderUnit.y };
            }
        }
    } else { // 'settled'
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
                    <h3 className={`text-lg font-bold border-b-2 border-${ownerFaction.color} mb-2 pb-1 text-${ownerFaction.color}`}>
                      Owner: {ownerFaction.name}
                    </h3>
                    
                    {ownerFaction.traits.map(trait => (
                      <div key={trait.name} className="mb-2">
                        <h4 className="font-semibold text-gray-300">{trait.name}</h4>
                        <p className="text-sm text-gray-400">{trait.description}</p>
                      </div>
                    ))}
                    
                     {isSettlement && (
                        <div className="text-sm my-2">
                            <span>Population: </span>
                            <span className="font-mono">{ownerFactionState.population} / {infrastructure?.populationCapacity || 0}</span>
                        </div>
                    )}
                    {isSettlement && ownerFactionState.storage ? (
                        <div className="space-y-2">
                            {Object.entries(ownerFactionState.storage).map(([tier, data]) => {
                                if (data.capacity === 0) return null;
                                const percentage = data.capacity > 0 ? (data.current / data.capacity) * 100 : 0;
                                const isNearCapacity = percentage > 90;
                                const tierName = TIER_NAMES[tier as ResourceTier];
                                return (
                                <div key={tier}>
                                    <h4 className="font-semibold text-gray-300 flex justify-between">
                                        <span>{tierName}</span>
                                        <span className={`font-mono ${isNearCapacity ? 'text-yellow-400' : ''}`}>{Math.floor(data.current)} / {data.capacity}</span>
                                    </h4>
                                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                        <div className={`h-1.5 rounded-full ${isNearCapacity ? 'bg-yellow-500' : 'bg-cyan-500'}`} style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <ul className="text-xs text-gray-400 mt-1 pl-2">
                                        {Object.entries(ownerFactionState.resources)
                                            .filter(([resId]) => RESOURCES_MAP.get(resId)?.tier === tier && ownerFactionState.resources[resId] > 0)
                                            .map(([resId, amount]) => (
                                                <li key={resId} className="flex justify-between">
                                                    <span>{RESOURCES_MAP.get(resId)?.name}</span>
                                                    <span>{Math.floor(amount)}</span>
                                                </li>
                                        ))}
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
                                {notableCharacters.map(char => (
                                    <li key={char.name}>
                                        <button 
                                            onClick={() => onPanToLocation(char.location)} 
                                            onMouseEnter={() => soundManager?.playUIHoverSFX()}
                                            className="text-cyan-400 hover:text-cyan-200 hover:underline text-left"
                                        >
                                            {char.isLeader && '⭐ '}
                                            {char.name}
                                        </button>
                                    </li>
                                ))}
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
                                            <span className={`font-semibold ${color}`}>
                                              {relation.status}
                                            </span>
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
                 {worldEvent && (
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-bold text-purple-400 mb-1">{worldEvent.type}: {worldEvent.name}</h3>
                        <p className="text-sm text-gray-400">{worldEvent.description}</p>
                    </div>
                )}
                 {infrastructure && (
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-bold text-cyan-300 mb-1">
                            {isSettlement ? `Settlement (Tier ${infrastructure.tier})` : 'Infrastructure'}
                        </h3>
                        <p className="text-md">{infrastructure.name}</p>
                        <p className="text-sm text-gray-400">{infrastructure.description}</p>

                        {isSettlement && infrastructure.upgradesTo && infrastructure.upgradeCost && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                                <h4 className="font-semibold text-gray-300 text-sm">Upgrade to {INFRASTRUCTURE_MAP.get(infrastructure.upgradesTo)?.name}</h4>
                                <p className="text-xs text-gray-500 mb-1">Increases population and storage capacity.</p>
                                <ul className="text-xs text-gray-400">
                                    {Object.entries(infrastructure.upgradeCost).map(([id, amount]) => {
                                        const res = RESOURCES_MAP.get(id);
                                        return <li key={id}>- {amount} {res?.name || id}</li>
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                 {resource && (
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-bold text-yellow-400 mb-1">Resource Deposit</h3>
                    <p className="text-md">{resource.name} <span className="text-xs text-gray-400">({resource.tier} - {resource.rarity})</span></p>
                  </div>
                )}
                 {selectedTile.units.length > 0 && (
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-bold text-red-400 mb-2">Units ({selectedTile.units.length})</h3>
                    <ul className="space-y-2">
                      {selectedTile.units.map((unit) => {
                        const isSelected = gameState.selectedUnitId === unit.id;
                        return (
                          <UnitListItem
                            key={unit.id}
                            unit={unit}
                            isSelected={isSelected}
                            onClick={() => {
                              onSelectUnit(unit.id);
                              soundManager?.playSFX('ui_click_subtle');
                            }}
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
            <button 
                onClick={() => {
                    onToggleMinimize();
                    soundManager?.playSFX('ui_click_subtle');
                }} 
                className="w-full h-full bg-gray-800/90 hover:bg-cyan-800/90 rounded-l-lg flex items-center justify-center transition-colors duration-200"
                aria-label={isMinimized ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                <Icon name={isMinimized ? 'chevron-left' : 'chevron-right'} className="w-6 h-6 text-cyan-300" />
            </button>
        </div>
        
        <div className={`h-full w-full overflow-hidden transition-opacity duration-200 ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="p-4 h-full w-80 overflow-y-auto text-white">
                {renderContent()}
            </div>
        </div>
    </aside>
  );
};

export default Sidebar;
