'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, RefreshCw } from 'lucide-react';
import { CalendarColorPicker } from '@/components/calendar/CalendarColorPicker';
import { DEFAULT_CALENDAR_COLOR } from '@/lib/calendarColors';
import type { UserCalendar } from '@/lib/api/handlers/calendar';
import { useCalendarsStore } from '@/stores/useCalendarsStore';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useToastStore } from '@/stores/useToastStore';

type FirstDayOfWeek = 'Sunday' | 'Monday';

const WEEK_START_OPTIONS: readonly FirstDayOfWeek[] = ['Sunday', 'Monday'];

const cardClass =
  'p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] space-y-3';

const inputClass =
  'w-full h-8 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none focus:border-[#0078d4] transition-colors disabled:opacity-60';

function CalendarList() {
  const calendars = useCalendarsStore((s) => s.calendars);
  const status = useCalendarsStore((s) => s.status);
  const error = useCalendarsStore((s) => s.error);
  const isUserNotFound = useCalendarsStore((s) => s.isUserNotFound);
  const load = useCalendarsStore((s) => s.load);
  const onboard = useCalendarsStore((s) => s.onboard);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const loading = (status === 'idle' || status === 'loading') && calendars.length === 0;

  const handleOnboard = async () => {
    setOnboardingLoading(true);
    try {
      await onboard();
    } catch (err) {
      console.error('Failed to connect to calendar service:', err);
    } finally {
      setOnboardingLoading(false);
    }
  };

  return (
    <section className={cardClass} aria-labelledby="your-calendars-heading">
      <div className="flex items-center justify-between">
        <h3 id="your-calendars-heading" className="font-semibold text-neutral-900 dark:text-neutral-100">
          Your calendars
        </h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void load({ force: true })}
            disabled={status === 'loading'}
            className="flex items-center gap-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link href="/calendar" className="text-[#0078d4] hover:underline font-medium">
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
            {isUserNotFound && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold shrink-0">
                ℹ
              </span>
            )}
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isUserNotFound ? (
              <button
                type="button"
                disabled={onboardingLoading}
                onClick={() => void handleOnboard()}
                className="px-3.5 py-1.5 rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
              >
                {onboardingLoading ? 'Connecting...' : 'Start Using Calendar'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void load({ force: true })}
                className="px-2.5 h-6 rounded-md font-semibold bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 transition-colors cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {loading && <p className="text-neutral-500">Loading calendars…</p>}

      {status === 'ready' && calendars.length === 0 && (
        <p className="text-neutral-500">You don&apos;t have any calendars yet. Create one below.</p>
      )}

      {calendars.length > 0 && (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {calendars.map((calendar) => (
            <li key={calendar.id} className="flex items-center gap-3 py-2">
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
                  {calendar.isReadOnly && (
                    <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300">
                      Read-only
                    </span>
                  )}
                </div>
                {calendar.description && (
                  <p className="text-neutral-500 truncate">{calendar.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CalendarFeatureSettingsCard({ calendar }: { calendar: UserCalendar }) {
  const update = useCalendarsStore((s) => s.update);
  const addToast = useToastStore((s) => s.addToast);

  const [name, setName] = useState(calendar.name);
  const [description, setDescription] = useState(calendar.description || '');
  const [color, setColor] = useState(calendar.color || DEFAULT_CALENDAR_COLOR);
  const [timezone, setTimezone] = useState(calendar.timezone || 'UTC');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(calendar.name);
    setDescription(calendar.description || '');
    setColor(calendar.color || DEFAULT_CALENDAR_COLOR);
    setTimezone(calendar.timezone || 'UTC');
  }, [calendar]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending) return;

    setPending(true);
    setError(null);
    try {
      await update(calendar.id, {
        name: trimmed,
        description: description.trim() || undefined,
        color,
        timezone,
      });
      addToast({
        title: 'Feature settings saved',
        description: `Calendar "${trimmed}" feature settings have been updated.`,
        type: 'success',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save calendar feature settings.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSave} className={cardClass} aria-labelledby="calendar-features-heading">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 id="calendar-features-heading" className="font-semibold text-neutral-900 dark:text-neutral-100">
              Calendar Feature Settings
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              1 Calendar per Email
            </span>
          </div>
          <p className="text-neutral-500 mt-0.5">
            Per email only one calendar is supported. Customize your features and preferences below.
          </p>
        </div>
        <Link
          href="/calendar"
          className="h-8 px-3.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <span>Start Using Calendar</span>
        </Link>
      </div>

      <div>
        <label htmlFor="cal-feat-name" className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
          Calendar Name
        </label>
        <input
          id="cal-feat-name"
          type="text"
          required
          disabled={pending}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My Calendar"
          className={`${inputClass} sm:w-80`}
        />
      </div>

      <div>
        <label htmlFor="cal-feat-description" className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
          Description <span className="font-normal text-neutral-500">(optional)</span>
        </label>
        <input
          id="cal-feat-description"
          type="text"
          disabled={pending}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Work, meetings, and personal schedule"
          className={inputClass}
        />
      </div>

      <div>
        <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">Color Accent</span>
        <CalendarColorPicker value={color} onChange={setColor} disabled={pending} />
      </div>

      <div>
        <label htmlFor="cal-feat-timezone" className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
          Timezone
        </label>
        <input
          id="cal-feat-timezone"
          type="text"
          disabled={pending}
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="e.g. UTC, Asia/Kolkata, America/New_York"
          className={`${inputClass} sm:w-80`}
        />
      </div>

      {error && (
        <p role="alert" className="text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>{pending ? 'Saving…' : 'Save Feature Settings'}</span>
        </button>
        <Link
          href="/calendar"
          className="h-8 px-3.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 flex items-center transition-colors"
        >
          Open Calendar
        </Link>
      </div>
    </form>
  );
}

function CreateCalendarForm() {
  const create = useCalendarsStore((s) => s.create);
  const addToast = useToastStore((s) => s.addToast);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DEFAULT_CALENDAR_COLOR);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending) return;

    setPending(true);
    setError(null);
    try {
      const created = await create({
        name: trimmed,
        description: description.trim() || undefined,
        color,
      });
      addToast({
        title: 'Calendar created',
        description: `"${created.name}" is now in your calendar.`,
        type: 'success',
      });
      setName('');
      setDescription('');
      setColor(DEFAULT_CALENDAR_COLOR);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the calendar.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cardClass} aria-labelledby="create-calendar-heading">
      <h3 id="create-calendar-heading" className="font-semibold text-neutral-900 dark:text-neutral-100">
        Create a calendar
      </h3>

      <div>
        <label htmlFor="calendar-name" className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
          Name
        </label>
        <input
          id="calendar-name"
          type="text"
          required
          disabled={pending}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Work, Family, Launch plan"
          className={`${inputClass} sm:w-80`}
        />
      </div>

      <div>
        <label htmlFor="calendar-description" className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
          Description <span className="font-normal text-neutral-500">(optional)</span>
        </label>
        <input
          id="calendar-description"
          type="text"
          disabled={pending}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">Color</span>
        <CalendarColorPicker value={color} onChange={setColor} disabled={pending} />
      </div>

      {error && (
        <p role="alert" className="text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <CalendarPlus className="w-3.5 h-3.5" />
        <span>{pending ? 'Creating…' : 'Create calendar'}</span>
      </button>
    </form>
  );
}

function WeekStartCard() {
  const firstDayOfWeek = useGeneralSettingsStore((s) => s.firstDayOfWeek);
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  return (
    <section className={cardClass} aria-labelledby="week-start-heading">
      <h3 id="week-start-heading" className="font-semibold text-neutral-900 dark:text-neutral-100">
        Week
      </h3>
      <div>
        <label htmlFor="first-day-of-week" className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
          First day of week
        </label>
        <select
          id="first-day-of-week"
          value={firstDayOfWeek}
          onChange={(e) => updateSettings({ firstDayOfWeek: e.target.value as FirstDayOfWeek })}
          className={`${inputClass} sm:w-80 cursor-pointer`}
        >
          {WEEK_START_OPTIONS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <p className="text-neutral-500 mt-1">Saved automatically.</p>
      </div>
    </section>
  );
}

export function CalendarSettingsView() {
  const load = useCalendarsStore((s) => s.load);
  const calendars = useCalendarsStore((s) => s.calendars);
  const isUserNotFound = useCalendarsStore((s) => s.isUserNotFound);
  const status = useCalendarsStore((s) => s.status);

  useEffect(() => {
    void load();
  }, [load]);

  const hasCalendar = calendars.length > 0;

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 pb-12">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Calendars</h2>
        <p className="text-neutral-500 mt-0.5">
          Manage your calendar, customize feature settings, and configure week scheduling.
        </p>
      </div>

      <CalendarList />
      {hasCalendar ? (
        <CalendarFeatureSettingsCard calendar={calendars[0]} />
      ) : (
        !isUserNotFound && status === 'ready' && <CreateCalendarForm />
      )}
      <WeekStartCard />
    </div>
  );
}
