'use client';

import { create } from 'zustand';
import { STORAGE_KEYS, SYNC_CONFIG } from '@/constants';

export const MANUAL_SYNC_COOLDOWN_MS = SYNC_CONFIG.MANUAL_COOLDOWN_MS; // 2 minutes (120,000 ms)
export const AUTO_SYNC_INTERVAL_MS = SYNC_CONFIG.AUTO_SYNC_INTERVAL_MS; // 30 minutes (1,800,000 ms)

function getStoredTimestamp(key: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = window.sessionStorage.getItem(key);
    if (!val) return null;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

function setStoredTimestamp(key: string, timestamp: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, String(timestamp));
  } catch {
    // sessionStorage restricted
  }
}

interface SyncState {
  isSyncing: boolean;
  lastManualSyncTime: number | null;
  lastAutoSyncTime: number | null;
  cooldownRemaining: number; // remaining seconds (0 to 120)
  isBlocked: boolean; // true while cooldownRemaining > 0 or isSyncing

  setIsSyncing: (isSyncing: boolean) => void;
  recordManualSync: () => void;
  recordAutoSync: () => void;
  updateCooldown: () => void;
}

export const useSyncStore = create<SyncState>((set, get) => {
  return {
    isSyncing: false,
    lastManualSyncTime: getStoredTimestamp(STORAGE_KEYS.LAST_MANUAL_SYNC),
    // Initialize to stored timestamp or current time on mount so it waits a full 30 minutes before firing
    lastAutoSyncTime: getStoredTimestamp(STORAGE_KEYS.LAST_AUTO_SYNC) ?? (typeof window !== 'undefined' ? Date.now() : null),
    cooldownRemaining: 0,
    isBlocked: false,

    setIsSyncing: (isSyncing) => set({ isSyncing }),

    recordManualSync: () => {
      const now = Date.now();
      setStoredTimestamp(STORAGE_KEYS.LAST_MANUAL_SYNC, now);
      set({
        lastManualSyncTime: now,
        cooldownRemaining: Math.ceil(MANUAL_SYNC_COOLDOWN_MS / 1000), // 120 seconds
        isBlocked: true,
      });
    },

    recordAutoSync: () => {
      const now = Date.now();
      setStoredTimestamp(STORAGE_KEYS.LAST_AUTO_SYNC, now);
      set({ lastAutoSyncTime: now });
    },

    updateCooldown: () => {
      const state = get();
      const stored = state.lastManualSyncTime ?? getStoredTimestamp(STORAGE_KEYS.LAST_MANUAL_SYNC);

      let cooldownRemaining = 0;
      let isBlocked = state.isSyncing;
      if (stored) {
        const elapsed = Date.now() - stored;
        if (elapsed < MANUAL_SYNC_COOLDOWN_MS) {
          cooldownRemaining = Math.max(0, Math.ceil((MANUAL_SYNC_COOLDOWN_MS - elapsed) / 1000));
          isBlocked = true;
        }
      }

      const sameTimestamp = stored ? state.lastManualSyncTime === stored : true;
      if (state.cooldownRemaining === cooldownRemaining && state.isBlocked === isBlocked && sameTimestamp) {
        return;
      }
      set({ cooldownRemaining, isBlocked, ...(stored ? { lastManualSyncTime: stored } : {}) });
    },
  };
});
