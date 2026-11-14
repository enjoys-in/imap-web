'use client';

import React from 'react';
import { CalendarPlus } from 'lucide-react';

interface CalendarMissingBannerProps {
  isCalendarAdded: boolean;
  activeEmail?: string;
  isUserNotFound: boolean;
  calendarsError: string | null;
  onboardingLoading: boolean;
  onOnboardUser: () => void;
  onReload: () => void;
}

export function CalendarMissingBanner({
  isCalendarAdded,
  activeEmail,
  isUserNotFound,
  calendarsError,
  onboardingLoading,
  onOnboardUser,
}: CalendarMissingBannerProps) {
  // If calendar is already added/configured for this account, DO NOT SHOW missing banner!
  if (isCalendarAdded) {
    return null;
  }

  // Only show when calendar is missing or user needs onboarding
  if (!isUserNotFound && !calendarsError) {
    return null;
  }

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs border-b bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-900 animate-in fade-in duration-200"
    >
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold shrink-0">
          <CalendarPlus className="w-3.5 h-3.5" />
        </span>
        <div>
          <span className="font-semibold">
            {activeEmail ? `No calendar configured for ${activeEmail}` : 'Calendar Setup Required'}
          </span>
          <span className="text-blue-700 dark:text-blue-300 ml-1.5 hidden sm:inline">
            — Add a calendar to create schedules, meetings, and sync events.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={onboardingLoading}
          onClick={onOnboardUser}
          className="px-3.5 py-1.5 rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
        >
          {onboardingLoading ? 'Adding...' : 'Add to Calendar'}
        </button>
      </div>
    </div>
  );
}
