
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
};

const EventTicker: React.FC<EventTickerProps> = ({ events, onEventClick }) => {
  if (events.length === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 bg-black/60 backdrop-blur-sm z-30 p-2 overflow-hidden flex flex-col">
       <h3 className="text-sm font-bold text-cyan-400 mb-1 pl-2">World Events</h3>
       <ul className="flex-1 overflow-y-auto pr-2">
            {events.map((event) => {
                const eventMeta = EVENT_ICONS[event.type] || { icon: 'cube', color: 'text-gray-400' };
                const canJump = event.location.x >= 0 && event.location.y >= 0;

                return (
                    <li 
                        key={event.id}
                        className={`text-gray-300 text-xs sm:text-sm mb-1 p-1 rounded transition-colors flex items-center justify-between ${canJump ? 'hover:bg-gray-700/80 cursor-pointer' : ''}`}
                        onClick={() => canJump && onEventClick(event.location)}
                        title={canJump ? `Click to jump to location (${event.location.x}, ${event.location.y})` : undefined}
                    >
                        <div className="flex items-center flex-1 min-w-0">
                            <Icon name={eventMeta.icon} className={`w-4 h-4 ${eventMeta.color} flex-shrink-0 mr-2`} />
                            <span className="truncate">
                                <span className="font-mono text-cyan-500 mr-2">[{getYearFromTick(event.tick)}]</span>
                                {event.message}
                            </span>
                        </div>
                    </li>
                );
            })}
       </ul>
    </div>
  );
};

export default EventTicker;