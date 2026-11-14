import { create } from 'zustand';
import { dispatchNotification } from '@/lib/notificationDispatcher';

export interface CalendarReminder {
  id: string;
  appointmentId: string;
  title: string;
  timeStr: string;
  location?: string;
  isRead: boolean;
  snoozedUntil?: number | null;
}

interface CalendarNotificationState {
  reminders: CalendarReminder[];
  dismissReminder: (id: string) => void;
  snoozeReminder: (id: string, minutes: number) => void;
  markAllRead: () => void;
  triggerReminder: (data: {
    appointmentId: string;
    title: string;
    timeStr: string;
    location?: string;
  }) => void;
}

const INITIAL_REMINDERS: CalendarReminder[] = [];

export const useCalendarNotificationStore = create<CalendarNotificationState>((set, get) => ({
  reminders: INITIAL_REMINDERS,

  dismissReminder: (id) => {
    set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) }));
  },

  snoozeReminder: (id, minutes) => {
    const snoozedUntil = Date.now() + minutes * 60 * 1000;
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id ? { ...r, snoozedUntil, isRead: true } : r
      ),
    }));
  },

  markAllRead: () => {
    set((s) => ({
      reminders: s.reminders.map((r) => ({ ...r, isRead: true })),
    }));
  },

  triggerReminder: ({ appointmentId, title, timeStr, location }) => {
    const id = `rem-${appointmentId}-${Date.now()}`;
    const newRem: CalendarReminder = {
      id,
      appointmentId,
      title,
      timeStr,
      location,
      isRead: false,
    };

    set((s) => ({
      // Deduplicate by appointmentId if already exists and not read
      reminders: [newRem, ...s.reminders.filter((r) => r.appointmentId !== appointmentId)],
    }));

    dispatchNotification({
      title: `Calendar Reminder: ${title}`,
      body: `${timeStr}${location ? ` • ${location}` : ''}`,
      type: 'info',
    });
  },
}));
