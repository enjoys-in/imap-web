'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent } from './types';
import { CalendarEventCard } from './CalendarEventCard';
import { getUserTimeInfo } from '@/lib/timezoneUtils';
import { cn } from '@/lib/utils';

interface CalendarWeekGridProps {
  events: CalendarEvent[];
  onSlotClick: (dayIndex: number, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
  onSelectDayHeader?: (dayIndex: number) => void;
}

const DAYS = [
  { dayIndex: 0, label: '13 Mon', isToday: false },
  { dayIndex: 1, label: '14 Tue', isToday: true },
  { dayIndex: 2, label: '15 Wed', isToday: false },
  { dayIndex: 3, label: '16 Thu', isToday: false },
  { dayIndex: 4, label: '17 Fri', isToday: false },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const val = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${val < 10 ? `0${val}` : val}:00 ${ampm}`;
}

export function CalendarWeekGrid({
  events,
  onSlotClick,
  onEventClick,
  onSelectDayHeader,
}: CalendarWeekGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [timeInfo, setTimeInfo] = useState(() => getUserTimeInfo());

  useEffect(() => {
    const update = () => setTimeInfo(getUserTimeInfo());
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  const nowLineTop = timeInfo.decimalHour * 80;

  useEffect(() => {
    const scroll = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = Math.max(0, nowLineTop - 180);
      }
    };
    scroll();
    const raf = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(raf);
  }, [nowLineTop]);

  return (
    <div ref={scrollContainerRef} className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-[#0e0e0e] select-none scroll-smooth">
      {/* Day Headers */}
      <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 flex shrink-0 sticky top-0 bg-white/95 dark:bg-[#0e0e0e]/95 backdrop-blur-xs z-30">
        <div className="w-20 sm:w-24 border-r border-neutral-200 dark:border-neutral-800 shrink-0 flex items-center justify-center text-[10px] font-mono font-bold text-neutral-400 dark:text-neutral-500">
          {timeInfo.tzAbbr}
        </div>
        <div className="flex-1 grid grid-cols-5">
          {DAYS.map((day) => (
            <button
              key={day.dayIndex}
              onClick={() => onSelectDayHeader?.(day.dayIndex)}
              className={cn(
                'flex items-center justify-center text-xs font-semibold border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 cursor-pointer hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition-colors',
                day.isToday ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20' : 'text-neutral-600 dark:text-neutral-400'
              )}
            >
              <span className={cn('px-3 py-1 rounded-full transition-all', day.isToday && 'border border-blue-500 bg-white dark:bg-neutral-900 shadow-2xs font-bold')}>
                {day.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Canvas with Time Slots */}
      <div className="relative flex min-h-[1920px]">
        {/* Time Scale Column */}
        <div className="w-20 sm:w-24 border-r border-neutral-200 dark:border-neutral-800 shrink-0 relative">
          {HOURS.map((hour) => (
            <div key={hour} className="h-20 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 pr-3 pt-2 text-right border-b border-neutral-100 dark:border-neutral-850">
              {formatHour(hour)}
            </div>
          ))}
          {/* Current Time Floating Pill Badge */}
          <div className="absolute right-2 -translate-y-1/2 z-30 pointer-events-none" style={{ top: `${nowLineTop}px` }}>
            <div className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{timeInfo.formattedTime}</span>
            </div>
          </div>
        </div>

        {/* 5 Day Columns Canvas */}
        <div className="flex-1 grid grid-cols-5 relative">
          {/* Current Live Time Indicator Across the 5 Days */}
          <div className="absolute left-0 right-0 z-20 pointer-events-none grid grid-cols-5" style={{ top: `${nowLineTop}px` }}>
            {DAYS.map((day) => (
              <div key={day.dayIndex} className="relative flex items-center h-0">
                {day.isToday ? (
                  <div className="w-full relative flex items-center">
                    <div className="absolute -left-1.5 z-30 flex items-center justify-center">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 ring-2 ring-white dark:ring-[#0e0e0e] shadow-sm" />
                      </span>
                    </div>
                    <div className="w-full border-b-[3px] border-solid border-red-600 dark:border-red-500 shadow-sm" />
                  </div>
                ) : (
                  <div className="w-full border-b-2 border-dotted border-red-500/40 dark:border-red-400/40" />
                )}
              </div>
            ))}
          </div>

          {DAYS.map((day) => {
            const dayEvents = events.filter((e) => e.dayIndex === day.dayIndex);
            return (
              <div
                key={day.dayIndex}
                className={cn('relative border-r border-neutral-200 dark:border-neutral-800 last:border-r-0', day.isToday && 'bg-blue-50/20 dark:bg-blue-950/10')}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => onSlotClick(day.dayIndex, hour)}
                    className="h-20 border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors cursor-pointer"
                  />
                ))}
                {dayEvents.map((evt) => (
                  <CalendarEventCard key={evt.id} event={evt} startHourOffset={0} onClick={onEventClick} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
