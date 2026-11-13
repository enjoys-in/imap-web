'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, Command } from 'lucide-react';
import { CalendarViewMode } from './types';
import { cn } from '@/lib/utils';

interface CalendarToolbarProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewSchedule: () => void;
}

export function CalendarToolbar({
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  searchQuery,
  onSearchChange,
  onNewSchedule,
}: CalendarToolbarProps) {
  return (
    <div className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 flex items-center justify-between gap-3 shrink-0 select-none">
      {/* Left: View Switcher (Day/Week/Month) & Date Navigation */}
      <div className="flex items-center gap-3">
        {/* View Mode Segmented Controls */}
        <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          {(['Day', 'Week', 'Month'] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={cn(
                'h-7 px-3 rounded-md text-xs font-semibold transition-all',
                viewMode === mode
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Date Paging Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            title="Previous"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToday}
            className="h-8 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Today
          </button>
          <button
            onClick={onNext}
            title="Next"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Search & "+ New Schedule" */}
      <div className="flex items-center gap-3">
        <div className="relative w-64 md:w-80">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, events, or people"
            className="w-full h-8 pl-8 pr-8 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute right-2.5 top-2 text-[10px] text-neutral-400 flex items-center">
            <Command className="w-2.5 h-2.5 mr-0.5" />F
          </span>
        </div>

        <button
          onClick={onNewSchedule}
          className="h-8 px-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Schedule</span>
        </button>
      </div>
    </div>
  );
}
