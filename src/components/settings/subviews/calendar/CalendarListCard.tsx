'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import type { UserCalendar } from '@/lib/api/handlers/calendar';
import type { CalendarsStatus } from '@/stores/useCalendarsStore';

interface CalendarListCardProps {
  calendars: UserCalendar[];
  selectedEmail: string;
  status: CalendarsStatus;
  error: string | null;
  isUserNotFound: boolean;
  onRefresh: () => void;
  onOnboard: () => void;
  onboardingLoading: boolean;
}

export function CalendarListCard({
  calendars,
  selectedEmail,
  status,
  error,
  isUserNotFound,
  onRefresh,
  onOnboard,
  onboardingLoading,
}: CalendarListCardProps) {
  // Filter calendars belonging to selected account or generic default
  const filteredCalendars = calendars.filter((c) => {
    if (!c.ownerEmail || !selectedEmail) return true;
    return c.ownerEmail.toLowerCase().trim() === selectedEmail.toLowerCase().trim();
  });

  const loading = (status === 'idle' || status === 'loading') && calendars.length === 0;

  return (
    <section className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
          Your Calendars
        </h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            disabled={status === 'loading'}
            className="flex items-center gap-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-60 cursor-pointer text-xs"
          >
            <RefreshCw className={`w-3 h-3 ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link href="/calendar" className="text-[#0078d4] hover:underline font-medium text-xs">
            Open calendar
          </Link>
        </div>
      </div>

      {status === 'error' && (
        <div
          role="alert"
          className={`p-3 rounded border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs ${
            isUserNotFound
              ? 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
              : 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isUserNotFound ? (
              <button
                type="button"
                disabled={onboardingLoading}
                onClick={onOnboard}
                className="px-3.5 py-1.5 rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
              >
                {onboardingLoading ? 'Connecting...' : 'Start Using Calendar'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onRefresh}
                className="px-2.5 h-6 rounded-md font-semibold bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 transition-colors cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {loading && <p className="text-neutral-500 text-xs">Loading calendars…</p>}

      {!loading && filteredCalendars.length === 0 && (
        <p className="text-neutral-500 text-xs">
          No calendar configured for {selectedEmail || 'this account'}. Click &ldquo;Add me to Calendar&rdquo; above to provision one.
        </p>
      )}

      {filteredCalendars.length > 0 && (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {filteredCalendars.map((calendar) => (
            <li key={calendar.id} className="flex items-center gap-3 py-2 text-xs">
              <span
                aria-hidden
                style={{ backgroundColor: calendar.color }}
                className="w-3 h-3 rounded-full shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {calendar.name}
                  </span>
                  {calendar.isDefault && (
                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                      Default
                    </span>
                  )}
                </div>
                {calendar.description && (
                  <p className="text-neutral-500 truncate text-[11px]">{calendar.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
