'use client';

import React from 'react';
import { CalendarEvent } from './types';
import { cn } from '@/lib/utils';

interface CalendarEventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  startHourOffset?: number;
}

const COLOR_STYLES: Record<
  string,
  { bg: string; border: string; text: string; darkBg: string }
> = {
  blue: {
    bg: 'bg-[#e7f0fe]',
    border: 'border-[#bcd7fe]',
    text: 'text-[#1e40af]',
    darkBg: 'dark:bg-blue-950/70 dark:border-blue-800 dark:text-blue-300',
  },
  green: {
    bg: 'bg-[#e7f7ed]',
    border: 'border-[#baf0cb]',
    text: 'text-[#166534]',
    darkBg: 'dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-300',
  },
  peach: {
    bg: 'bg-[#ffefe6]',
    border: 'border-[#ffdecb]',
    text: 'text-[#9a3412]',
    darkBg: 'dark:bg-amber-950/70 dark:border-amber-800 dark:text-amber-300',
  },
  yellow: {
    bg: 'bg-[#fef9c3]',
    border: 'border-[#fef08a]',
    text: 'text-[#854d0e]',
    darkBg: 'dark:bg-yellow-950/70 dark:border-yellow-800 dark:text-yellow-300',
  },
  purple: {
    bg: 'bg-[#f3e8ff]',
    border: 'border-[#e9d5ff]',
    text: 'text-[#6b21a8]',
    darkBg: 'dark:bg-purple-950/70 dark:border-purple-800 dark:text-purple-300',
  },
  cyan: {
    bg: 'bg-[#cffafe]',
    border: 'border-[#a5f3fc]',
    text: 'text-[#155e75]',
    darkBg: 'dark:bg-cyan-950/70 dark:border-cyan-800 dark:text-cyan-300',
  },
  pink: {
    bg: 'bg-[#fce7f3]',
    border: 'border-[#fbcfe8]',
    text: 'text-[#9d174d]',
    darkBg: 'dark:bg-pink-950/70 dark:border-pink-800 dark:text-pink-300',
  },
  salmon: {
    bg: 'bg-[#ffe4e6]',
    border: 'border-[#fecdd3]',
    text: 'text-[#9f1239]',
    darkBg: 'dark:bg-rose-950/70 dark:border-rose-800 dark:text-rose-300',
  },
};

export function CalendarEventCard({ event, onClick, startHourOffset = 8 }: CalendarEventCardProps) {
  const styles = COLOR_STYLES[event.color] || COLOR_STYLES.blue;

  return (
    <div
      onClick={() => onClick(event)}
      className={cn(
        'absolute left-1 right-1 rounded-xl p-2.5 border transition-all cursor-pointer shadow-2xs hover:shadow-sm overflow-hidden flex flex-col justify-between group',
        styles.bg,
        styles.border,
        styles.text,
        styles.darkBg,
        event.striped && 'calendar-striped-bg'
      )}
      style={{
        top: `${(event.startHour - startHourOffset) * 80 + 2}px`,
        height: `${event.durationHours * 80 - 4}px`,
      }}
    >
      {/* Title & Time */}
      <div>
        <h4 className="text-xs font-bold leading-snug line-clamp-2">
          {event.title}
        </h4>
        <span className="text-[11px] font-medium opacity-80 block mt-0.5">
          {event.startTime} - {event.endTime}
        </span>
      </div>

      {/* Footer Attendees Avatars & Count */}
      <div className="flex items-center justify-between pt-1 mt-auto">
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {event.participants.map((p) =>
            p.avatar ? (
              <img
                key={p.id}
                src={p.avatar}
                alt={p.name}
                title={p.name}
                className="w-5 h-5 rounded-full border border-white dark:border-neutral-900 object-cover"
              />
            ) : (
              <div
                key={p.id}
                title={p.name}
                className="w-5 h-5 rounded-full border border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-[9px] font-bold flex items-center justify-center shrink-0 uppercase"
              >
                {p.name.charAt(0) || 'U'}
              </div>
            )
          )}
          {event.extraAttendeesCount && (
            <div className="h-5 px-1.5 rounded-full bg-white/90 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-[10px] font-bold text-neutral-700 dark:text-neutral-200 flex items-center justify-center shadow-2xs">
              {event.extraAttendeesCount}+
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
