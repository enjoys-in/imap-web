'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CalendarEvent } from './types';
import { CalendarEventCard } from './CalendarEventCard';
import { getUserTimeInfo, UserTimeInfo } from '@/lib/timezoneUtils';
import { Clock, Globe } from 'lucide-react';

interface CalendarDayViewProps {
  events: CalendarEvent[];
  activeDayIndex: number;
  onSlotClick: (dayIndex: number, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
}

// 24 full hours: 0:00 (12:00 AM) to 23:00 (11:00 PM)
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DAY_LABELS = [
  'Monday, Sept 13',
  'Tuesday, Sept 14 (Today)',
  'Wednesday, Sept 15',
  'Thursday, Sept 16',
  'Friday, Sept 17',
];

function formatHour(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const val = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${val < 10 ? `0${val}` : val}:00 ${ampm}`;
}

export function CalendarDayView({
  events,
  activeDayIndex,
  onSlotClick,
  onEventClick,
}: CalendarDayViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const dayEvents = events.filter((e) => e.dayIndex === activeDayIndex);
  const isToday = activeDayIndex === 1;

  // Live time info resolved from the user's system timezone (e.g. Asia/Kolkata / GMT+5:30)
  const [timeInfo, setTimeInfo] = useState<UserTimeInfo>(() => getUserTimeInfo());

  useEffect(() => {
    const update = () => setTimeInfo(getUserTimeInfo());
    update();
    const timer = setInterval(update, 10000); // refresh every 10s
    return () => clearInterval(timer);
  }, []);

  // Exact vertical position: 80px per hour starting at 0:00 (12:00 AM)
  const nowLineTop = timeInfo.decimalHour * 80;

  // Auto-scroll to current time position on mount
  useEffect(() => {
    if (!hasScrolled && scrollContainerRef.current) {
      const targetScroll = Math.max(0, nowLineTop - 180);
      scrollContainerRef.current.scrollTop = targetScroll;
      setHasScrolled(true);
    }
  }, [nowLineTop, hasScrolled]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-[#0e0e0e] select-none w-full scroll-smooth"
    >
      {/* Day Header Banner with Timezone Display */}
      <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-white dark:bg-[#0e0e0e] sticky top-0 z-40 backdrop-blur-md">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <span>{DAY_LABELS[activeDayIndex] || 'Day Schedule'}</span>
          {isToday && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
          )}
        </h3>

        <div className="flex items-center gap-3">
          {/* User Timezone indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
            <Globe className="w-3.5 h-3.5 text-[#0078d4]" />
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {timeInfo.timeZone}
            </span>
            <span className="font-mono text-[10px] text-neutral-400">
              ({timeInfo.tzAbbr})
            </span>
          </div>

          <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">|</span>

          <span className="hidden sm:inline text-xs text-neutral-500 font-medium">
            {dayEvents.length} events scheduled
          </span>
        </div>
      </div>

      {/* Full-width Calendar Canvas */}
      <div className="relative flex-1 flex min-h-[1920px] p-4 sm:p-6 w-full">
        {/* Time Scale Gutter */}
        <div className="w-20 sm:w-24 border-r border-neutral-200 dark:border-neutral-800 shrink-0 relative">
          {/* Gutter Header with Timezone Abbreviation */}
          <div className="h-6 -mt-3 flex items-center justify-end pr-3 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 font-mono tracking-wider">
            {timeInfo.tzAbbr}
          </div>

          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-20 text-xs font-medium text-neutral-400 dark:text-neutral-500 pr-3 pt-2 text-right border-b border-neutral-100 dark:border-neutral-850"
            >
              {formatHour(hour)}
            </div>
          ))}

          {/* Current Time Floating Pill Badge in Gutter */}
          {isToday && (
            <div
              className="absolute right-2 -translate-y-1/2 z-30 pointer-events-none"
              style={{ top: `${nowLineTop + 24}px` }}
            >
              <div className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold shadow-sm flex items-center gap-1">
                <span>{timeInfo.formattedTime}</span>
              </div>
            </div>
          )}
        </div>

        {/* Day Column (Full Width) */}
        <div className="flex-1 relative w-full pt-6">
          {/* Current Time Dotted Line with Live Glowing Dot */}
          {isToday && (
            <div
              className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
              style={{ top: `${nowLineTop + 24}px` }}
            >
              {/* Glowing Red Dot */}
              <div className="absolute -left-1.5 z-40 flex items-center justify-center">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 ring-2 ring-white dark:ring-[#0e0e0e] shadow-xs" />
                </span>
              </div>

              {/* Dotted horizontal line spanning across full day canvas */}
              <div className="w-full border-b-2 border-dotted border-red-500/90 dark:border-red-400/90 ml-1.5" />
            </div>
          )}

          {/* Hour slot background grid guidelines */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              onClick={() => onSlotClick(activeDayIndex, hour)}
              className="h-20 border-b border-neutral-100 dark:border-neutral-850 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors cursor-pointer"
            />
          ))}

          {/* Day Event Cards */}
          {dayEvents.map((evt) => (
            <CalendarEventCard
              key={evt.id}
              event={evt}
              startHourOffset={0}
              onClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
