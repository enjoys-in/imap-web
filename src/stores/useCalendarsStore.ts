'use client';

import { create } from 'zustand';
import {
  createCalendar,
  getCalendars,
  toCalendarServiceError,
  type NewCalendarInput,
  type UserCalendar,
} from '@/lib/api/handlers/calendar';

export type CalendarsStatus = 'idle' | 'loading' | 'ready' | 'error';

interface LoadOptions {
  force?: boolean;
}

interface CalendarsState {
  calendars: UserCalendar[];
  status: CalendarsStatus;
  error: string | null;
  load: (options?: LoadOptions) => Promise<void>;
  create: (input: NewCalendarInput) => Promise<UserCalendar>;
}

let inflight: Promise<void> | null = null;

export const useCalendarsStore = create<CalendarsState>((set, get) => ({
  calendars: [],
  status: 'idle',
  error: null,

  load: (options = {}) => {
    if (inflight) {
      return inflight;
    }
    if (get().status === 'ready' && !options.force) {
      return Promise.resolve();
    }

    set({ status: 'loading', error: null });
    inflight = getCalendars()
      .then((calendars) => {
        set({ calendars, status: 'ready', error: null });
      })
      .catch((error: unknown) => {
        set({ status: 'error', error: toCalendarServiceError(error).message });
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  },

  create: async (input) => {
    try {
      const created = await createCalendar(input);
      set((state) => ({
        calendars: [...state.calendars.filter((c) => c.id !== created.id), created],
        status: 'ready',
        error: null,
      }));
      return created;
    } catch (error) {
      throw toCalendarServiceError(error);
    }
  },
}));
