'use client';

import React, { useEffect, useState } from 'react';
import { useCalendarsStore } from '@/stores/useCalendarsStore';
import { useAccounts } from '@/hooks/useEmailsQuery';
import type { UserCalendar } from '@/lib/api/handlers/calendar';
import { CalendarSmtpModal } from '@/components/calendar/CalendarSmtpModal';
import { CalendarAccountSelector } from './calendar/CalendarAccountSelector';
import { AddMeToCalendarSection } from './calendar/AddMeToCalendarSection';
import { CalendarListCard } from './calendar/CalendarListCard';
import { CalendarFeatureSettingsCard } from './calendar/CalendarFeatureSettingsCard';
import { WeekStartCard } from './calendar/WeekStartCard';

export function CalendarSettingsView() {
  const { data: accounts } = useAccounts();
  const load = useCalendarsStore((s) => s.load);
  const calendars = useCalendarsStore((s) => s.calendars);
  const isUserNotFound = useCalendarsStore((s) => s.isUserNotFound);
  const status = useCalendarsStore((s) => s.status);
  const isCalendarAddedForAccount = useCalendarsStore((s) => s.isCalendarAddedForAccount);
  const onboard = useCalendarsStore((s) => s.onboard);

  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [smtpModalCal, setSmtpModalCal] = useState<UserCalendar | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedEmail) {
      setSelectedEmail(accounts[0].email);
    }
  }, [accounts, selectedEmail]);

  const activeEmail = selectedEmail || (accounts && accounts.length > 0 ? accounts[0].email : '');
  const activeAccount = accounts?.find((a) => a.email.toLowerCase() === activeEmail.toLowerCase());
  const isConnected = isCalendarAddedForAccount(activeEmail);

  // Find calendar belonging to this account
  const accountCalendar = calendars.find((c) => {
    if (!c.ownerEmail || !activeEmail) return true;
    return c.ownerEmail.toLowerCase().trim() === activeEmail.toLowerCase().trim();
  }) || (isConnected && calendars.length > 0 ? calendars[0] : null);

  const handleOnboard = async () => {
    if (!activeEmail) return;
    setOnboardingLoading(true);
    try {
      await onboard(activeEmail, activeAccount?.displayName);
    } finally {
      setOnboardingLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 pb-12">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Calendars</h2>
        <p className="text-neutral-500 mt-0.5">
          Manage your calendar, customize feature settings, and configure week scheduling.
        </p>
      </div>

      {/* Account Select Box */}
      <CalendarAccountSelector
        accounts={accounts || []}
        selectedEmail={activeEmail}
        onSelectEmail={setSelectedEmail}
        isConnected={isConnected}
      />

      {/* "Add me to Calendar" Banner: If connected then dont show */}
      <AddMeToCalendarSection
        email={activeEmail}
        displayName={activeAccount?.displayName}
        isConnected={isConnected}
      />

      {/* Calendar List for the selected account */}
      <CalendarListCard
        calendars={calendars}
        selectedEmail={activeEmail}
        status={status}
        error={useCalendarsStore.getState().error}
        isUserNotFound={isUserNotFound}
        onRefresh={() => void load({ force: true })}
        onOnboard={() => void handleOnboard()}
        onboardingLoading={onboardingLoading}
        onConfigureSmtp={(cal) => setSmtpModalCal(cal)}
      />

      {/* Feature Settings Card for the account's calendar */}
      {accountCalendar && (
        <CalendarFeatureSettingsCard
          calendar={accountCalendar}
          onConfigureSmtp={(cal) => setSmtpModalCal(cal)}
        />
      )}

      <WeekStartCard />

      {/* BYO SMTP Modal for configuring outbound email & RSVP */}
      <CalendarSmtpModal
        open={Boolean(smtpModalCal)}
        calendar={smtpModalCal ? calendars.find((c) => c.id === smtpModalCal.id) || smtpModalCal : null}
        onClose={() => setSmtpModalCal(null)}
      />
    </div>
  );
}
