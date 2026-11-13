'use client';

import React from 'react';
import { CalendarEvent } from './types';
import { CalendarEventCard } from './CalendarEventCard';

interface CalendarDayViewProps {
  events: CalendarEvent[];
  activeDayIndex: number;
  onSlotClick: (dayIndex: number, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const DAY_LABELS = ['Monday, Sept 13', 'Tuesday, Sept 14 (Today)', 'Wednesday, Sept 15', 'Thursday, Sept 16', 'Friday, Sept 17'];

function formatHour(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const val = h > 12 ? h - 12 : h;
  return `${val < 10 ? `0${val}` : val}:00 ${ampm}`;
}

export function CalendarDayView({
  events,
  activeDayIndex,
  onSlotClick,
  onEventClick,
}: CalendarDayViewProps) {
  const dayEvents = events.filter((e) => e.dayIndex === activeDayIndex);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-[#0e0e0e] select-none">
      <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 px-6 flex items-center justify-between shrink-0 bg-white dark:bg-[#0e0e0e]">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          {DAY_LABELS[activeDayIndex] || 'Day Schedule'}
        </h3>
        <span className="text-xs text-neutral-500">
          {dayEvents.length} events scheduled
        </span>
      </div>

      <div className="relative flex min-h-[800px] p-4 max-w-3xl">
        {/* Time Scale */}
        <div className="w-24 border-r border-neutral-200 dark:border-neutral-800 shrink-0">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-20 text-xs font-medium text-neutral-400 dark:text-neutral-500 pr-3 pt-2 text-right border-b border-neutral-100 dark:border-neutral-850"
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Day Column */}
        <div className="flex-1 relative">
          {HOURS.map((hour) => (
            <div
              key={hour}
              onClick={() => onSlotClick(activeDayIndex, hour)}
              className="h-20 border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors cursor-pointer"
            />
          ))}

          {dayEvents.map((evt) => (
            <CalendarEventCard
              key={evt.id}
              event={evt}
              onClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
