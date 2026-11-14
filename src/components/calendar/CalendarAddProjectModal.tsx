'use client';

import React, { useState } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import { DEFAULT_CALENDAR_COLOR } from '@/lib/calendarColors';
import type { NewCalendarInput } from '@/lib/api/handlers/calendar';
import { CalendarColorPicker } from './CalendarColorPicker';

interface CalendarAddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (calendar: NewCalendarInput) => Promise<void>;
}

export function CalendarAddProjectModal({
  open,
  onClose,
  onAdd,
}: CalendarAddProjectModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_CALENDAR_COLOR);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const close = () => {
    if (pending) return;
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || pending) return;

    setPending(true);
    setError(null);
    try {
      await onAdd({ name: trimmed, color });
      setName('');
      setColor(DEFAULT_CALENDAR_COLOR);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the calendar.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              New calendar
            </h3>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="new-calendar-name"
              className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1"
            >
              Calendar name
            </label>
            <input
              id="new-calendar-name"
              type="text"
              required
              autoFocus
              disabled={pending}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work, Family, Launch plan"
              className="w-full h-9 px-3 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
            />
          </div>

          <div>
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
              Color
            </span>
            <CalendarColorPicker value={color} onChange={setColor} disabled={pending} />
          </div>

          {error && (
            <p role="alert" className="text-[11px] text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="px-4 h-8 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || !name.trim()}
              className="px-4 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? 'Creating…' : 'Create calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
