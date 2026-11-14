'use client';

import React from 'react';
import { CalendarEvent } from './types';
import { cn } from '@/lib/utils';

interface CalendarMonthViewProps {
  events: CalendarEvent[];
  onSlotClick: (dayIndex: number, hour: number) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const MONTH_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarMonthView({
  events,
  onSlotClick,
  onEventClick,
}: CalendarMonthViewProps) {
  const today = new Date();
  const currentDayNum = today.getDate();

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-[#0e0e0e]">
      {/* Month Days Header */}
      <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="py-2.5 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider border-r border-neutral-200 dark:border-neutral-800 last:border-r-0"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* 30 Day Cells Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-[600px]">
        {MONTH_DAYS.map((dayNum) => {
          const isToday = dayNum === currentDayNum;
          // map events to days
          const dayEvents = events.filter((e) => {
            if (e.startUtc) {
              const d = new Date(e.startUtc);
              return d.getDate() === dayNum;
            }
            return (e.dayIndex + 9) === dayNum;
          });

          const targetDate = new Date(today.getFullYear(), today.getMonth(), dayNum);
          const jsDay = targetDate.getDay();
          const targetDayIndex = jsDay === 0 ? 6 : jsDay - 1;

          return (
            <div
              key={dayNum}
              onClick={() => onSlotClick(targetDayIndex, 9)}
              className={cn(
                'min-h-[100px] p-2 border-b border-r border-neutral-100 dark:border-neutral-800/80 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors flex flex-col cursor-pointer',
                isToday && 'bg-blue-50/20 dark:bg-blue-950/10'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                    isToday
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : 'text-neutral-700 dark:text-neutral-300'
                  )}
                >
                  {dayNum}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-neutral-400">
                    {dayEvents.length} items
                  </span>
                )}
              </div>

              {/* Event preview pills */}
              <div className="space-y-1 overflow-hidden">
                {dayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(evt);
                    }}
                    className="px-2 py-1 rounded-md text-[11px] font-semibold truncate bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:opacity-90 transition-opacity"
                  >
                    {evt.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
