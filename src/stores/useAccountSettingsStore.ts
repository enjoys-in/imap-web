'use client';

import { create } from 'zustand';
import { PerAccountSettings } from '@/types/perAccountSettings';
import { getDefaultPerAccountSettings } from '@/lib/accountSettingsDefaults';

const STORAGE_KEY = 'airsend_per_account_settings';

interface AccountSettingsStoreState {
  settingsByAccount: Record<string, PerAccountSettings>;
  getSettings: (accountId: string, email?: string) => PerAccountSettings;
  updateCategory: <K extends keyof PerAccountSettings>(
    accountId: string,
    category: K,
    updates: Partial<PerAccountSettings[K]>
  ) => void;
  saveFullSettings: (accountId: string, settings: PerAccountSettings) => void;
}

function loadPersistedSettings(): Record<string, PerAccountSettings> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistSettings(data: Record<string, PerAccountSettings>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const useAccountSettingsStore = create<AccountSettingsStoreState>((set, get) => ({
  settingsByAccount: loadPersistedSettings(),

  getSettings: (accountId: string, email = '') => {
    const existing = get().settingsByAccount[accountId];
    if (existing) return existing;
    const def = getDefaultPerAccountSettings(accountId, email);
    // Nothing to key the defaults on until the session has resolved an account.
    if (!accountId) return def;
    set((state) => {
      const next = { ...state.settingsByAccount, [accountId]: def };
      persistSettings(next);
      return { settingsByAccount: next };
    });
    return def;
  },

  updateCategory: (accountId, category, updates) => {
    set((state) => {
      const current = state.settingsByAccount[accountId] || getDefaultPerAccountSettings(accountId);
      const updatedCategory = typeof current[category] === 'object' && current[category] !== null
        ? { ...(current[category] as object), ...(updates as object) }
        : updates;

      const nextAccount = {
        ...current,
        [category]: updatedCategory,
      };

      const nextAll = { ...state.settingsByAccount, [accountId]: nextAccount as PerAccountSettings };
      persistSettings(nextAll);
      return { settingsByAccount: nextAll };
    });
  },

  saveFullSettings: (accountId, settings) => {
    set((state) => {
      const nextAll = { ...state.settingsByAccount, [accountId]: settings };
      persistSettings(nextAll);
      return { settingsByAccount: nextAll };
    });
  },
}));
