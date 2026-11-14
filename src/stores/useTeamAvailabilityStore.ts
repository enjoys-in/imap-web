'use client';

import { create } from 'zustand';
import {
  getAvailabilityShares,
  getAvailability,
  shareAvailability,
  revokeAvailabilityShare,
  getSharedCalendars,
  shareCalendar,
  revokeCalendarShare,
  type TeammateAvailability,
  type SharedCalendar,
  type AvailabilitySharesResult,
} from '@/lib/api/handlers/calendar';
import { getCachedTeamData, saveCachedTeamData } from '@/lib/idb/calendarCacheDb';

interface TeamAvailabilityState {
  sharedWithMe: AvailabilitySharesResult['shared_with_me'];
  sharedByMe: AvailabilitySharesResult['shared_by_me'];
  orgVisible: boolean;
  sharedCalendars: SharedCalendar[];
  teammateStatus: Record<string, TeammateAvailability>;
  isLoading: boolean;
  error: string | null;

  initFromCache: () => Promise<void>;
  loadTeamData: (options?: { force?: boolean }) => Promise<void>;
  updateTeammateFromSSE: (data: {
    email: string;
    name?: string;
    busy: boolean;
    busyStatus?: string;
    until?: string;
    nextBusyAt?: string;
  }) => void;
  shareWithUser: (email: string) => Promise<void>;
  revokeUserShare: (userId: number | string) => Promise<void>;
  shareCalendarWithUser: (calendarId: string, email: string) => Promise<void>;
  revokeSharedCalendar: (calendarId: string, userId: number | string) => Promise<void>;
}

let inflightTeamPromise: Promise<void> | null = null;
let lastTeamFetchTime = 0;
const TEAM_FRESHNESS_TTL_MS = 5 * 60 * 1000; // 5 minutes freshness

export const useTeamAvailabilityStore = create<TeamAvailabilityState>((set, get) => ({
  sharedWithMe: [],
  sharedByMe: [],
  orgVisible: false,
  sharedCalendars: [],
  teammateStatus: {},
  isLoading: false,
  error: null,

  initFromCache: async () => {
    try {
      const cached = await getCachedTeamData();
      if (cached) {
        set((prev) => ({
          sharedWithMe: prev.sharedWithMe.length > 0 ? prev.sharedWithMe : cached.shared_with_me,
          sharedByMe: prev.sharedByMe.length > 0 ? prev.sharedByMe : cached.shared_by_me,
          orgVisible: cached.org_visible ?? prev.orgVisible,
          sharedCalendars: prev.sharedCalendars.length > 0 ? prev.sharedCalendars : cached.shared_calendars,
          teammateStatus: Object.keys(prev.teammateStatus).length > 0 ? prev.teammateStatus : cached.teammate_status,
        }));
      }
    } catch (err) {
      console.warn('[TeamAvailability] initFromCache failed:', err);
    }
  },

  loadTeamData: async (options = {}) => {
    const now = Date.now();
    const hasData = get().sharedWithMe.length > 0 || Object.keys(get().teammateStatus).length > 0;
    const isFresh = now - lastTeamFetchTime < TEAM_FRESHNESS_TTL_MS;

    // Return immediately if not forced and data is already cached
    if (!options.force && hasData && isFresh) {
      return;
    }

    if (inflightTeamPromise) {
      return inflightTeamPromise;
    }

    set({ isLoading: true, error: null });

    inflightTeamPromise = (async () => {
      try {
        const [shares, sharedCals] = await Promise.all([
          getAvailabilityShares(),
          getSharedCalendars(),
        ]);

        const emailsToFetch = shares.shared_with_me.map((u) => u.email).filter(Boolean);
        let availabilityResults: TeammateAvailability[] = [];

        if (emailsToFetch.length > 0) {
          availabilityResults = await getAvailability(emailsToFetch);
        }

        const statusMap: Record<string, TeammateAvailability> = {};
        // Populate defaults for shared teammates
        shares.shared_with_me.forEach((u) => {
          statusMap[u.email.toLowerCase()] = {
            userId: u.user_id,
            email: u.email,
            name: u.name || u.email.split('@')[0],
            allowed: true,
            busy: false,
          };
        });

        // Merge real availability blocks
        availabilityResults.forEach((a) => {
          statusMap[a.email.toLowerCase()] = {
            ...statusMap[a.email.toLowerCase()],
            ...a,
          };
        });

        lastTeamFetchTime = Date.now();

        // Persist to IndexedDB
        void saveCachedTeamData({
          shared_by_me: shares.shared_by_me,
          shared_with_me: shares.shared_with_me,
          org_visible: shares.org_visible,
          shared_calendars: sharedCals,
          teammate_status: statusMap,
        });

        set({
          sharedWithMe: shares.shared_with_me,
          sharedByMe: shares.shared_by_me,
          orgVisible: shares.org_visible,
          sharedCalendars: sharedCals,
          teammateStatus: statusMap,
          isLoading: false,
        });
      } catch (err: any) {
        console.warn('[TeamAvailability] Failed to load team data:', err);
        set({ isLoading: false, error: err.message || 'Could not load team availability' });
      }
    })().finally(() => {
      inflightTeamPromise = null;
    });

    return inflightTeamPromise;
  },

  updateTeammateFromSSE: (data) => {
    if (!data.email) return;
    const key = data.email.toLowerCase();
    set((state) => {
      const existing = state.teammateStatus[key] || {
        email: data.email,
        name: data.name || data.email.split('@')[0],
        allowed: true,
      };

      return {
        teammateStatus: {
          ...state.teammateStatus,
          [key]: {
            ...existing,
            name: data.name || existing.name,
            allowed: (data as any).allowed !== undefined ? Boolean((data as any).allowed) : existing.allowed ?? true,
            busy: Boolean(data.busy),
            busyStatus: data.busyStatus as any,
            until: data.until,
            nextBusyAt: data.nextBusyAt,
          },
        },
      };
    });
  },

  shareWithUser: async (email: string) => {
    await shareAvailability(email);
    await get().loadTeamData();
  },

  revokeUserShare: async (userId: number | string) => {
    await revokeAvailabilityShare(userId);
    await get().loadTeamData();
  },

  shareCalendarWithUser: async (calendarId: string, email: string) => {
    await shareCalendar(calendarId, email);
    await get().loadTeamData();
  },

  revokeSharedCalendar: async (calendarId: string, userId: number | string) => {
    await revokeCalendarShare(calendarId, userId);
    await get().loadTeamData();
  },
}));
