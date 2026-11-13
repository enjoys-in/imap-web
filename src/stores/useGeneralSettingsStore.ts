'use client';

import { create } from 'zustand';

const STORAGE_KEY = 'airsend_general_settings';

export interface GeneralSettingsState {
  timeZone: string;
  dateFormat: string;
  language: string;
  firstDayOfWeek: 'Sunday' | 'Monday';
  desktopNotifications: boolean;
  soundAlerts: boolean;
  emailSignature: string;
  emailThreading: boolean;
  downloadInlineImages: boolean;
  undoSendDelaySeconds: number;
  emptyDeletedOnLogout: boolean;
  updateSettings: (partial: Partial<Omit<GeneralSettingsState, 'updateSettings'>>) => void;
}

const DEFAULT_SETTINGS = {
  timeZone: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
  dateFormat: 'M/d/yyyy',
  language: 'English (United States)',
  firstDayOfWeek: 'Sunday' as const,
  desktopNotifications: true,
  soundAlerts: true,
  emailSignature: 'Best regards,\nMulayam | AirSend Team\nmullayam06@airsend.in',
  emailThreading: true,
  downloadInlineImages: true,
  undoSendDelaySeconds: 5,
  emptyDeletedOnLogout: false,
};

function loadSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const useGeneralSettingsStore = create<GeneralSettingsState>((set) => ({
  ...loadSettings(),

  updateSettings: (partial) => {
    set((state) => {
      const next = { ...state, ...partial };
      if (typeof window !== 'undefined') {
        const { updateSettings, ...toSave } = next;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      }
      return next;
    });
  },
}));
