'use client';

import { create } from 'zustand';
import {
  createCalendar,
  getCalendars,
  onboardCalendarUser,
  toCalendarServiceError,
  updateCalendar,
  CalendarServiceError,
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
  isUserNotFound: boolean;
  isUnauthorized: boolean;
  load: (options?: LoadOptions) => Promise<void>;
  create: (input: NewCalendarInput) => Promise<UserCalendar>;
  update: (id: string, updates: Partial<UserCalendar>) => Promise<UserCalendar>;
  onboard: (email?: string, name?: string) => Promise<void>;
}

let inflight: Promise<void> | null = null;

export const useCalendarsStore = create<CalendarsState>((set, get) => ({
  calendars: [],
  status: 'idle',
  error: null,
  isUserNotFound: false,
  isUnauthorized: false,

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
        set({
          calendars,
          status: 'ready',
          error: null,
          isUserNotFound: false,
          isUnauthorized: false,
        });
      })
      .catch((error: unknown) => {
        const err = toCalendarServiceError(error);
        set({
          status: 'error',
          error: err.message,
          isUserNotFound: err.isUserNotFound,
          isUnauthorized: err.isUnauthorized,
        });
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  },

  create: async (input) => {
    if (get().calendars.length >= 1) {
      throw new CalendarServiceError('rejected', 'Only one calendar per email is allowed.');
    }
    try {
      const created = await createCalendar(input);
      set((state) => ({
        calendars: [...state.calendars.filter((c) => c.id !== created.id), created],
        status: 'ready',
        error: null,
        isUserNotFound: false,
        isUnauthorized: false,
      }));
      return created;
    } catch (error) {
      throw toCalendarServiceError(error);
    }
  },

  update: async (id, updates) => {
    try {
      const updated = await updateCalendar(id, updates);
      set((state) => ({
        calendars: state.calendars.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        status: 'ready',
        error: null,
      }));
      return updated;
    } catch (error) {
      throw toCalendarServiceError(error);
    }
  },

  onboard: async (email?: string, name?: string) => {
    set({ status: 'loading', error: null });
    try {
      await onboardCalendarUser(email, name);
      set({ isUserNotFound: false, isUnauthorized: false, error: null });
      await get().load({ force: true });
    } catch (error) {
      const err = toCalendarServiceError(error);
      set({
        status: 'error',
        error: err.message,
        isUserNotFound: err.isUserNotFound,
        isUnauthorized: err.isUnauthorized,
      });
      throw err;
    }
  },
}));
