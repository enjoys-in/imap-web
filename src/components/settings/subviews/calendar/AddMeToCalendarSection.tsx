'use client';

import React, { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { useCalendarsStore } from '@/stores/useCalendarsStore';
import { useToastStore } from '@/stores/useToastStore';
import { getSignedInEmail } from '@/lib/api/handlers/calendar';

interface AddMeToCalendarSectionProps {
  email: string;
  displayName?: string;
  isConnected: boolean;
}

export function AddMeToCalendarSection({
  email,
  displayName,
  isConnected,
}: AddMeToCalendarSectionProps) {
  // If already connected for this account, strictly do not show
  if (isConnected || !email) return null;

  const onboard = useCalendarsStore((s) => s.onboard);
  const status = useCalendarsStore((s) => s.status);
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);

  // The calendar service only adds the account the session is signed in with.
  const signedIn = getSignedInEmail();
  const isOtherAccount = Boolean(signedIn) && signedIn !== email.trim().toLowerCase();

  const handleOnboard = async () => {
    setLoading(true);
    try {
      await onboard(email, displayName);
      addToast({
        title: 'Calendar Connected',
        description: `Successfully provisioned calendar for ${email}.`,
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Connection Failed',
        description: err instanceof Error ? err.message : 'Could not connect to calendar service.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-4 border border-blue-200 dark:border-blue-900 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <CalendarPlus className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-950 dark:text-blue-100 text-sm">
            Add me to Calendar
          </h3>
          <p className="text-blue-900/80 dark:text-blue-200/80 mt-0.5">
            {isOtherAccount
              ? `A calendar can only be added for the account you're signed in with (${signedIn}). Sign in as ${email} to add one for it.`
              : `Connect your IMAP email account (${email}) to the calendar service to automatically provision your calendar and sync events.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={loading || status === 'loading' || isOtherAccount}
          onClick={() => void handleOnboard()}
          className="h-8 px-4 rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>{loading ? 'Connecting...' : 'Add me to Calendar'}</span>
        </button>
      </div>
    </section>
  );
}
