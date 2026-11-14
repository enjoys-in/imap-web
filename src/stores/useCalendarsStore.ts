'use client';

import { create } from 'zustand';
import {
  createCalendar, getCalendars, onboardCalendarUser,
  toCalendarServiceError, updateCalendar, CalendarServiceError,
  type NewCalendarInput, type UserCalendar,
} from '@/lib/api/handlers/calendar';
import { checkCalendarHealth } from '@/lib/api/handlers/calendarHealth';
import {
  getCachedCalendars, saveCachedCalendars,
  getAllCachedAccountStatuses, saveAccountCalendarStatus, getCachedCalendarHealth,
} from '@/lib/idb/calendarCacheDb';

export type CalendarsStatus = 'idle' | 'loading' | 'ready' | 'error';

interface CalendarsState {
  calendars: UserCalendar[];
  status: CalendarsStatus;
  error: string | null;
  isUserNotFound: boolean;
  isUnauthorized: boolean;
  tenantId: string | null;
  isHealthy: boolean;
  healthMessage: string | null;
  lastHealthCheck: number | null;
  accountCalendarStatus: Record<string, boolean>;

  initFromCache: () => Promise<void>;
  load: (options?: { force?: boolean }) => Promise<void>;
  create: (input: NewCalendarInput, accountEmail?: string) => Promise<UserCalendar>;
  update: (id: string, updates: Partial<UserCalendar>) => Promise<UserCalendar>;
  onboard: (email?: string, name?: string) => Promise<any>;
  pollHealth: () => Promise<boolean>;
  isCalendarAddedForAccount: (email?: string) => boolean;
}

let inflight: Promise<void> | null = null;

export const useCalendarsStore = create<CalendarsState>((set, get) => ({
  calendars: [],
  status: 'idle',
  error: null,
  isUserNotFound: false,
  isUnauthorized: false,
  tenantId: null,
  isHealthy: true,
  healthMessage: null,
  lastHealthCheck: null,
  accountCalendarStatus: {},

  initFromCache: async () => {
    try {
      const [cachedCals, cachedStatuses, cachedHealth] = await Promise.all([
        getCachedCalendars(), getAllCachedAccountStatuses(), getCachedCalendarHealth(),
      ]);
      const statusMap: Record<string, boolean> = {};
      cachedStatuses.forEach((s) => { statusMap[s.email] = s.hasCalendar; });

      set((prev) => ({
        calendars: prev.calendars.length > 0 ? prev.calendars : cachedCals,
        accountCalendarStatus: { ...statusMap, ...prev.accountCalendarStatus },
        isHealthy: cachedHealth?.isHealthy ?? prev.isHealthy,
        lastHealthCheck: cachedHealth?.lastChecked ?? prev.lastHealthCheck,
      }));
    } catch {}
  },

  load: (options = {}) => {
    if (inflight) return inflight;
    if (get().status === 'ready' && !options.force) return Promise.resolve();

    set({ status: 'loading', error: null });
    inflight = getCalendars()
      .then((calendars) => {
        void saveCachedCalendars(calendars);
        set((state) => {
          const nextStatuses = { ...state.accountCalendarStatus };
          calendars.forEach((c) => {
            if (c.ownerEmail) {
              const clean = c.ownerEmail.toLowerCase().trim();
              nextStatuses[clean] = true;
              void saveAccountCalendarStatus({ email: clean, hasCalendar: true, calendarId: c.id, calendarName: c.name });
            }
          });
          return {
            calendars,
            status: 'ready',
            error: null,
            isUserNotFound: false,
            isUnauthorized: false,
            accountCalendarStatus: nextStatuses,
          };
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
      .finally(() => { inflight = null; });
    return inflight;
  },

  create: async (input, accountEmail) => {
    if (get().calendars.length >= 1) {
      throw new CalendarServiceError('rejected', 'Only one calendar per email is allowed.');
    }
    const created = await createCalendar(input);
    const nextList = [...get().calendars.filter((c) => c.id !== created.id), created];
    void saveCachedCalendars(nextList);

    const email = accountEmail || created.ownerEmail;
    if (email) {
      const clean = email.toLowerCase().trim();
      void saveAccountCalendarStatus({ email: clean, hasCalendar: true, calendarId: created.id, calendarName: created.name });
      set((s) => ({ accountCalendarStatus: { ...s.accountCalendarStatus, [clean]: true } }));
    }

    set({ calendars: nextList, status: 'ready', error: null, isUserNotFound: false, isUnauthorized: false });
    return created;
  },

  update: async (id, updates) => {
    const updated = await updateCalendar(id, updates);
    const nextList = get().calendars.map((c) => (c.id === id ? { ...c, ...updated } : c));
    void saveCachedCalendars(nextList);
    set({ calendars: nextList, status: 'ready', error: null });
    return updated;
  },

  onboard: async (email?: string, name?: string) => {
    set({ status: 'loading', error: null });
    try {
      const res = await onboardCalendarUser(email, name);
      const targetEmail = (email || res?.email || '').trim();
      const domain = typeof res?.tenant_id === 'string' && res.tenant_id
        ? res.tenant_id
        : targetEmail.includes('@') ? targetEmail.split('@')[1].trim().toLowerCase() : null;

      if (targetEmail) {
        const clean = targetEmail.toLowerCase().trim();
        void saveAccountCalendarStatus({ email: clean, hasCalendar: true });
        set((s) => ({ accountCalendarStatus: { ...s.accountCalendarStatus, [clean]: true }, tenantId: domain }));
      } else if (domain) {
        set({ tenantId: domain });
      }

      set({ isUserNotFound: false, isUnauthorized: false, error: null });
      await get().load({ force: true });
      return res;
    } catch (error) {
      const err = toCalendarServiceError(error);
      set({ status: 'error', error: err.message, isUserNotFound: err.isUserNotFound, isUnauthorized: err.isUnauthorized });
      throw err;
    }
  },

  pollHealth: async () => {
    const prevHealthy = get().isHealthy;
    const res = await checkCalendarHealth();
    set({ isHealthy: res.isHealthy, healthMessage: res.message, lastHealthCheck: Date.now() });
    if (!prevHealthy && res.isHealthy) void get().load({ force: true });
    return res.isHealthy;
  },

  isCalendarAddedForAccount: (email?: string) => {
    const { calendars, accountCalendarStatus, isUserNotFound } = get();
    if (!email) return calendars.length > 0 && !isUserNotFound;
    const clean = email.toLowerCase().trim();
    if (accountCalendarStatus[clean] === true) return true;
    if (calendars.some((c) => c.ownerEmail?.toLowerCase().trim() === clean)) return true;
    return calendars.length > 0 && !isUserNotFound;
  },
}));
