'use client';

import React, { useState } from 'react';
import { MailWarning, Settings, X } from 'lucide-react';
import type { UserCalendar } from '@/lib/api/handlers/calendar';

interface CalendarSmtpBannerProps {
  calendar: UserCalendar | null;
  onConfigureSmtp: (calendarId: string) => void;
}

export function CalendarSmtpBanner({
  calendar,
  onConfigureSmtp,
}: CalendarSmtpBannerProps) {
  const [dismissedForId, setDismissedForId] = useState<string | null>(null);

  // If no calendar, or calendar already has BYO SMTP, or user dismissed for this calendar, do not show banner
  if (!calendar || calendar.hasByoSmtp || dismissedForId === calendar.id) {
    return null;
  }

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 px-4 py-2 text-xs border-b bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-900 animate-in fade-in duration-200"
    >
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 font-bold shrink-0">
          <MailWarning className="w-3.5 h-3.5" />
        </span>
        <div>
          <span className="font-semibold">
            Outgoing invitations disabled for &ldquo;{calendar.name}&rdquo;
          </span>
          <span className="text-amber-700 dark:text-amber-300 ml-1.5 hidden sm:inline">
            — Configure custom SMTP to deliver email invitations &amp; RSVP links to external guests.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onConfigureSmtp(calendar.id)}
          className="px-3 py-1 rounded-md font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configure SMTP</span>
        </button>
        <button
          type="button"
          onClick={() => setDismissedForId(calendar.id)}
          title="Dismiss banner"
          className="p-1 rounded-md text-amber-500 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
