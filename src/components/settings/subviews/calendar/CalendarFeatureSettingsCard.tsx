"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { CalendarColorPicker } from "@/components/calendar/CalendarColorPicker";
import { DEFAULT_CALENDAR_COLOR } from "@/lib/calendarColors";
import type { UserCalendar } from "@/lib/api/handlers/calendar";
import { useCalendarsStore } from "@/stores/useCalendarsStore";
import { useToastStore } from "@/stores/useToastStore";
import {
  getCachedCalendarTimezone,
  saveCachedCalendarTimezone,
} from "@/lib/idb/calendarCacheDb";

const cardClass =
  "p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] space-y-3";
const inputClass =
  "w-full h-8 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 text-xs focus:outline-none focus:border-[#0078d4] transition-colors disabled:opacity-60";

export function CalendarFeatureSettingsCard({
  calendar,
  onConfigureSmtp,
}: {
  calendar: UserCalendar;
  onConfigureSmtp?: (calendar: UserCalendar) => void;
}) {
  const update = useCalendarsStore((s) => s.update);
  const addToast = useToastStore((s) => s.addToast);

  const [name, setName] = useState(calendar.name);
  const [description, setDescription] = useState(calendar.description || "");
  const [color, setColor] = useState(calendar.color || DEFAULT_CALENDAR_COLOR);
  const [timezone, setTimezone] = useState(calendar.timezone || "UTC");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(calendar.name);
    setDescription(calendar.description || "");
    setColor(calendar.color || DEFAULT_CALENDAR_COLOR);
    if (!calendar.timezone || calendar.timezone === "UTC") {
      void getCachedCalendarTimezone().then((tz) => setTimezone(tz));
    } else {
      setTimezone(calendar.timezone);
    }
  }, [calendar]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending) return;

    setPending(true);
    setError(null);
    try {
      await saveCachedCalendarTimezone(timezone);
      await update(calendar.id, {
        name: trimmed,
        description: description.trim() || undefined,
        color,
        timezone,
      });
      addToast({
        title: "Feature settings saved",
        description: `Calendar "${trimmed}" settings have been updated.`,
        type: "success",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save calendar feature settings.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSave} className={cardClass}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              Calendar Feature Settings
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              1 Calendar per Email
            </span>
          </div>
          <p className="text-neutral-500 mt-0.5 text-xs">
            Per email only one calendar is supported. Detected default timezone
            is cached locally.
          </p>
        </div>
        <Link
          href="/calendar"
          className="h-8 px-3.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs text-xs"
        >
          Open Calendar
        </Link>
      </div>

      <div>
        <label
          htmlFor="cal-feat-name"
          className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 text-xs"
        >
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
        <label
          htmlFor="cal-feat-description"
          className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 text-xs"
        >
          Description{" "}
          <span className="font-normal text-neutral-500">(optional)</span>
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
        <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5 text-xs">
          Color Accent
        </span>
        <CalendarColorPicker
          value={color}
          onChange={setColor}
          disabled={pending}
        />
      </div>

      <div>
        <label
          htmlFor="cal-feat-timezone"
          className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 text-xs"
        >
          Timezone (Auto-detected from browser)
        </label>
        <input
          id="cal-feat-timezone"
          type="text"
          disabled={pending}
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          placeholder="e.g. Asia/Kolkata, America/New_York"
          className={`${inputClass} sm:w-80`}
        />
      </div>

      {/* Outbound Email & RSVP (BYO SMTP) Section */}
      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 block text-xs">
              Outbound Email &amp; Invitations (SMTP)
            </span>
            <p className="text-neutral-500 text-[11px] max-w-lg">
              {calendar.hasByoSmtp
                ? `Active: sending meeting requests from ${calendar.byoSmtpFrom || 'configured address'}. External guests receive .ics invites with 1-click RSVP.`
                : 'No SMTP configured for this calendar. Meeting invitations and RSVP updates cannot be sent to attendees until SMTP is set up.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {calendar.hasByoSmtp ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Configured</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Missing SMTP</span>
              </span>
            )}

            {onConfigureSmtp && (
              <button
                type="button"
                onClick={() => onConfigureSmtp(calendar)}
                className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                  calendar.hasByoSmtp
                    ? 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{calendar.hasByoSmtp ? 'Manage SMTP' : 'Configure SMTP'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-red-600 dark:text-red-400 text-xs">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 text-xs"
        >
          <span>{pending ? "Saving…" : "Save Feature Settings"}</span>
        </button>
      </div>
    </form>
  );
}
