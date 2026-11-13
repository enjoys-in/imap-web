'use client';

import React from 'react';
import { CalendarEvent } from './types';
import { CalendarEventCard } from './CalendarEventCard';
import { cn } from '@/lib/utils';

interface CalendarWeekGridProps {
  events: CalendarEvent[];
  onSlotClick: (dayIndex: number, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const DAYS = [
  { dayIndex: 0, label: '13 Mon', isToday: false },
  { dayIndex: 1, label: '14 Tue', isToday: true },
  { dayIndex: 2, label: '15 Wed', isToday: false },
  { dayIndex: 3, label: '16 Thu', isToday: false },
  { dayIndex: 4, label: '17 Fri', isToday: false },
];

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15];

function formatHour(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const val = h > 12 ? h - 12 : h;
  return `${val < 10 ? `0${val}` : val}:00 ${ampm}`;
}

export function CalendarWeekGrid({
  events,
  onSlotClick,
  onEventClick,
}: CalendarWeekGridProps) {
  // Current time marker position at ~10:30 (approx (10.5 - 8) * 80px = 200px)
  const nowLineTop = (10.5 - 8) * 80;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-[#0e0e0e] select-none">
      {/* Day Headers */}
      <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 flex shrink-0 sticky top-0 bg-white/95 dark:bg-[#0e0e0e]/95 backdrop-blur-xs z-10">
        <div className="w-20 border-r border-neutral-200 dark:border-neutral-800 shrink-0" />
        <div className="flex-1 grid grid-cols-5">
          {DAYS.map((day) => (
            <div
              key={day.dayIndex}
              className={cn(
                'flex items-center justify-center text-xs font-semibold border-r border-neutral-200 dark:border-neutral-800 last:border-r-0',
                day.isToday
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'text-neutral-600 dark:text-neutral-400'
              )}
            >
              <span
                className={cn(
                  'px-3 py-1 rounded-full',
                  day.isToday && 'border border-blue-500 bg-white dark:bg-neutral-900 shadow-2xs font-bold'
                )}
              >
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Canvas with Time Slots */}
      <div className="relative flex min-h-[640px]">
        {/* Time Scale Column */}
        <div className="w-20 border-r border-neutral-200 dark:border-neutral-800 shrink-0">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-20 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 pr-3 pt-2 text-right border-b border-neutral-100 dark:border-neutral-850"
            >
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* 5 Day Columns Canvas */}
        <div className="flex-1 grid grid-cols-5 relative">
          {/* Current Live Time Indicator Line */}
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: `${nowLineTop}px` }}
          >
            <div className="-ml-16 px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-xs">
              10:30 PM
            </div>
            <div className="flex-1 border-b-2 border-dashed border-blue-500/80 ml-1" />
          </div>

          {DAYS.map((day) => {
            const dayEvents = events.filter((e) => e.dayIndex === day.dayIndex);
            return (
              <div
                key={day.dayIndex}
                className={cn(
                  'relative border-r border-neutral-200 dark:border-neutral-800 last:border-r-0',
                  day.isToday && 'bg-blue-50/20 dark:bg-blue-950/10'
                )}
              >
                {/* Horizontal hour guidelines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => onSlotClick(day.dayIndex, hour)}
                    className="h-20 border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors cursor-pointer"
                  />
                ))}

                {/* Day's Event Cards */}
                {dayEvents.map((evt) => (
                  <CalendarEventCard
                    key={evt.id}
                    event={evt}
                    onClick={onEventClick}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
