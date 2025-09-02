import React from 'react';
import type { GameEvent } from '../types';
import { TICK_PER_YEAR, STARTING_YEAR } from '../constants';
import Icon from './Icon';

interface EventTickerProps {
  events: GameEvent[];
  onEventClick: (location: { x: number; y: number }) => void;
}

const getYearFromTick = (tick: number) => STARTING_YEAR + Math.floor(tick / TICK_PER_YEAR);

const EventTicker: React.FC<EventTickerProps> = ({ events, onEventClick }) => {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-24 bg-black/60 backdrop-blur-sm z-30 p-2 overflow-hidden flex flex-col">
       <h3 className="text-sm font-bold text-cyan-400 mb-1 pl-2">World Events</h3>
       <ul className="flex-1 overflow-y-auto pr-2">
            {events.map((event) => (
                <li 
                    key={event.id}
                    className="text-gray-300 text-xs sm:text-sm mb-1 p-1 rounded hover:bg-gray-700/80 cursor-pointer transition-colors flex items-center justify-between"
                    onClick={() => onEventClick(event.location)}
                    title={`Click to jump to location (${event.location.x}, ${event.location.y})`}
                >
                    <span className="flex-1">
                        <span className="font-mono text-cyan-500 mr-2">[{getYearFromTick(event.tick)}]</span>
                        {event.message}
                    </span>
                    <Icon name="cube" className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </li>
            ))}
       </ul>
    </div>
  );
};

export default EventTicker;