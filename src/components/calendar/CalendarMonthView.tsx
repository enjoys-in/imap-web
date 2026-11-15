'use client';

import React from 'react';
import { CalendarEvent } from './types';
import { cn } from '@/lib/utils';

interface CalendarMonthViewProps {
  events: CalendarEvent[];
  currentDate?: Date;
  onSlotClick: (dayIndex: number, hour: number, date?: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarMonthView({
  events,
  currentDate = new Date(),
  onSlotClick,
  onEventClick,
}: CalendarMonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // 1st day of month (0=Sun, 1=Mon, ..., 6=Sat)
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  // We want Mon=0 ... Sun=6
  const leadingPaddingCount = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const cells = React.useMemo(() => {
    const list: Array<{
      date: Date;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      dayIndex: number; // 0=Mon ... 6=Sun
    }> = [];

    const today = new Date();
    const isSameDate = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    // 1. Leading padding days from previous month
    for (let i = leadingPaddingCount - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      const jsDay = d.getDay();
      list.push({
        date: d,
        dayNum,
        isCurrentMonth: false,
        isToday: isSameDate(d, today),
        dayIndex: jsDay === 0 ? 6 : jsDay - 1,
      });
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const jsDay = d.getDay();
      list.push({
        date: d,
        dayNum,
        isCurrentMonth: true,
        isToday: isSameDate(d, today),
        dayIndex: jsDay === 0 ? 6 : jsDay - 1,
      });
    }

    // 3. Trailing padding days to fill full rows
    const rem = list.length % 7 === 0 ? 0 : 7 - (list.length % 7);
    for (let dayNum = 1; dayNum <= rem; dayNum++) {
      const d = new Date(year, month + 1, dayNum);
      const jsDay = d.getDay();
      list.push({
        date: d,
        dayNum,
        isCurrentMonth: false,
        isToday: isSameDate(d, today),
        dayIndex: jsDay === 0 ? 6 : jsDay - 1,
      });
    }

    return list;
  }, [year, month, daysInMonth, daysInPrevMonth, leadingPaddingCount]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-[#0e0e0e]">
      {/* Weekdays Header */}
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

      {/* Month Day Cells Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr min-h-[600px]">
        {cells.map((cell, idx) => {
          const dayEvents = events.filter((e) => {
            if (e.startUtc) {
              const d = new Date(e.startUtc);
              return (
                d.getFullYear() === cell.date.getFullYear() &&
                d.getMonth() === cell.date.getMonth() &&
                d.getDate() === cell.date.getDate()
              );
            }
            return cell.isCurrentMonth && e.dayIndex === cell.dayIndex;
          });

          return (
            <div
              key={`${cell.date.toISOString()}-${idx}`}
              onClick={() => onSlotClick(cell.dayIndex, 9, cell.date)}
              className={cn(
                'min-h-[100px] p-2 border-b border-r border-neutral-100 dark:border-neutral-800/80 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors flex flex-col cursor-pointer',
                cell.isToday && 'bg-blue-50/20 dark:bg-blue-950/10',
                !cell.isCurrentMonth && 'bg-neutral-50/40 dark:bg-neutral-900/40'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                    cell.isToday
                      ? 'bg-blue-600 text-white font-bold shadow-2xs'
                      : cell.isCurrentMonth
                      ? 'text-neutral-700 dark:text-neutral-300'
                      : 'text-neutral-400 dark:text-neutral-600'
                  )}
                >
                  {cell.dayNum}
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
