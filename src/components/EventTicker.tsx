import React from 'react';
import { GameEvent, GameEventType } from '../types';
import { TICK_PER_YEAR, STARTING_YEAR } from '../constants';
import Icon from './Icon';

interface EventTickerProps {
  events: GameEvent[];
  onEventClick: (location: { x: number; y: number }) => void;
}

const getYearFromTick = (tick: number) => STARTING_YEAR + Math.floor(tick / TICK_PER_YEAR);

const EVENT_ICONS: Record<GameEventType, { icon: string; color: string; }> = {
  [GameEventType.BATTLE]: { icon: 'war', color: 'text-red-400' },
  [GameEventType.LOOT]: { icon: 'briefcase', color: 'text-yellow-400' },
  [GameEventType.UPGRADE]: { icon: 'crystal', color: 'text-cyan-400' },
  [GameEventType.LEVEL_MILESTONE]: { icon: 'user', color: 'text-green-400' },
  [GameEventType.FACTION_ELIMINATED]: { icon: 'fire', color: 'text-gray-400' },
  [GameEventType.WAR_DECLARED]: { icon: 'war', color: 'text-orange-400' },
  [GameEventType.ALLIANCE_FORMED]: { icon: 'alliance', color: 'text-green-400' },
  [GameEventType.BIOME_CHANGE]: { icon: 'mountain', color: 'text-purple-400' },
  [GameEventType.WEATHER_CHANGE]: { icon: 'leaf', color: 'text-blue-400' },
  [GameEventType.STARFALL]: { icon: 'sun', color: 'text-purple-500' },
};

const EventTicker: React.FC<EventTickerProps> = ({ events, onEventClick }) => {
  if (events.length === 0) return null;

  return (
    <div className="absolute bottom-8 left-0 right-0 h-16 md:h-20 bg-black/40 backdrop-blur-sm z-20 pointer-events-none flex flex-col justify-end">
       <div className="pointer-events-auto w-full md:w-1/3 bg-black/70 p-2 rounded-tr-lg border-t border-r border-cyan-900/50 max-h-full overflow-y-auto scrollbar-thin">
           <ul className="flex flex-col-reverse">
                {events.slice(0, 3).map((event) => {
                    const eventMeta = EVENT_ICONS[event.type] || { icon: 'cube', color: 'text-gray-400' };
                    const canJump = event.location.x >= 0 && event.location.y >= 0;

                    return (
                        <li 
                            key={event.id}
                            className={`text-gray-300 text-[10px] md:text-xs mb-1 last:mb-0 p-1 rounded transition-colors flex items-center justify-between ${canJump ? 'hover:bg-gray-700/80 cursor-pointer' : ''}`}
                            onClick={() => canJump && onEventClick(event.location)}
                        >
                            <div className="flex items-center flex-1 min-w-0">
                                <Icon name={eventMeta.icon} className={`w-3 h-3 ${eventMeta.color} flex-shrink-0 mr-1.5`} />
                                <span className="truncate">
                                    <span className="font-mono text-cyan-500 mr-1">[{getYearFromTick(event.tick)}]</span>
                                    {event.message}
                                </span>
                            </div>
                        </li>
                    );
                })}
           </ul>
       </div>
    </div>
  );
};

export default EventTicker;