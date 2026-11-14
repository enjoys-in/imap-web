'use client';

import { create } from 'zustand';

export interface NotificationEntry {
  id: string;
  title: string;
  detail: string;
  time: string;
  isRead: boolean;
  type: 'mail' | 'calendar' | 'system';
  timestamp?: number;
}

interface NotificationCenterState {
  notifications: NotificationEntry[];
  addNotification: (entry: Omit<NotificationEntry, 'id' | 'isRead'>) => void;
  markAllRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationCenterStore = create<NotificationCenterState>((set) => ({
  notifications: [],

  addNotification: (entry) => {
    const newEntry: NotificationEntry = {
      ...entry,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isRead: false,
      timestamp: Date.now(),
    };
    set((state) => ({
      notifications: [newEntry, ...state.notifications].slice(0, 50),
    }));
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },
}));
