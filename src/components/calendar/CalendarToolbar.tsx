'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, Command, Globe, X, Link2, Video, Loader2 } from 'lucide-react';
import { CalendarViewMode } from './types';
import { useUserTimeInfo } from '@/hooks/useUserTimeInfo';
import { cn } from '@/lib/utils';
import { createInstantMeeting } from './airsendMeet';
import { useToastStore } from '@/stores/useToastStore';

interface CalendarToolbarProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  currentDate?: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewSchedule: () => void;
  onOpenBooking?: () => void;
  isViewOnly?: boolean;
  isHealthy?: boolean;
  healthMessage?: string | null;
}

export function CalendarToolbar({
  viewMode,
  onViewModeChange,
  currentDate,
  onPrev,
  onNext,
  onToday,
  searchQuery,
  onSearchChange,
  onNewSchedule,
  onOpenBooking,
  isViewOnly = false,
}: CalendarToolbarProps) {
  const timeInfo = useUserTimeInfo();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isStartingMeet, setIsStartingMeet] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleInstantMeet = async () => {
    setIsStartingMeet(true);
    try {
      const meetUrl = await createInstantMeeting({ title: 'Instant Meeting' });
      try {
        await navigator.clipboard.writeText(meetUrl);
        addToast({
          title: 'AirSend Meet Started',
          description: `Meeting link copied to clipboard: ${meetUrl}`,
          type: 'success',
        });
      } catch {
        addToast({
          title: 'AirSend Meet Started',
          description: meetUrl,
          type: 'success',
        });
      }
      window.open(meetUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      addToast({
        title: 'AirSend Meet Error',
        description: err?.message || 'Could not start instant meeting from meet.airsend.in',
        type: 'error',
      });
    } finally {
      setIsStartingMeet(false);
    }
  };

  if (mobileSearchOpen) {
    return (
      <div className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 flex items-center gap-2 shrink-0 select-none">
        <button
          type="button"
          onClick={() => setMobileSearchOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, events, or people"
            className="w-full h-8 pl-8 pr-8 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-3 shrink-0 select-none overflow-x-auto no-scrollbar">
      {/* Left: View Switcher (Day/Week/Month) & Date Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
        {/* View Mode Segmented Controls */}
        <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
          {(['Day', 'Week', 'Month'] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={cn(
                'h-7 px-2 sm:px-3 rounded-md text-xs font-semibold transition-all',
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
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={onPrev}
            title="Previous"
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onToday}
            className="h-7 sm:h-8 px-2 sm:px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Today
          </button>
          <button
            onClick={onNext}
            title="Next"
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Current Month & Year Header */}
        <h2 className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-100 px-1 shrink-0">
          {(currentDate || new Date()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>

        {/* User Timezone indicator - hidden on smaller screens */}
        {timeInfo && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 text-[11px] font-medium text-neutral-600 dark:text-neutral-300 shrink-0">
            <Globe className="w-3.5 h-3.5 text-[#0078d4]" />
            <span>{timeInfo.timeZone}</span>
            <span className="text-[10px] font-mono text-neutral-400">({timeInfo.tzAbbr})</span>
          </div>
        )}

        {isViewOnly && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
            View Only
          </span>
        )}
      </div>

      {/* Right: Search & "+ New Schedule" */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Mobile Search Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          title="Search"
          className="sm:hidden w-7 h-7 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Desktop / Tablet Search Input */}
        <div className="hidden sm:block relative w-36 md:w-52 lg:w-64">
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

        {onOpenBooking && (
          <button
            type="button"
            onClick={onOpenBooking}
            className="h-7 sm:h-8 px-2 sm:px-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer shrink-0"
            title="Personal booking page link"
          >
            <Link2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">Booking Page</span>
          </button>
        )}

        {/* meet.airsend.in Instant Meeting CTA */}
        <button
          type="button"
          onClick={handleInstantMeet}
          disabled={isStartingMeet}
          className="h-7 sm:h-8 px-2 sm:px-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          title="Instant meeting on meet.airsend.in"
        >
          {isStartingMeet ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
          ) : (
            <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          )}
          <span className="hidden md:inline">meet.airsend.in</span>
          <span className="md:hidden">Meet</span>
        </button>

        <button
          onClick={onNewSchedule}
          className="h-7 sm:h-8 px-2 sm:px-3.5 bg-[#0078d4] hover:bg-[#106ebe] active:bg-[#005a9e] text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New event</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>
    </div>
  );
}
