import { create } from 'zustand';
import { dispatchNotification } from '@/lib/notificationDispatcher';
import { ToastAction } from '@/stores/useToastStore';

export interface CalendarReminder {
  id: string;
  appointmentId: string;
  title: string;
  timeStr: string;
  location?: string;
  meetUrl?: string;
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
    meetUrl?: string;
  }) => void;
}

const INITIAL_REMINDERS: CalendarReminder[] = [];

export const useCalendarNotificationStore = create<CalendarNotificationState>((set, get) => ({
  reminders: INITIAL_REMINDERS,

  dismissReminder: (id) => {
    set((s) => ({
      reminders: s.reminders.filter((r) => r.id !== id && r.appointmentId !== id),
    }));
  },

  snoozeReminder: (id, minutes) => {
    const snoozedUntil = Date.now() + minutes * 60 * 1000;
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id || r.appointmentId === id ? { ...r, snoozedUntil, isRead: true } : r
      ),
    }));
  },

  markAllRead: () => {
    set((s) => ({
      reminders: s.reminders.map((r) => ({ ...r, isRead: true })),
    }));
  },

  triggerReminder: ({ appointmentId, title, timeStr, location, meetUrl }) => {
    const id = `rem-${appointmentId}-${Date.now()}`;
    const newRem: CalendarReminder = {
      id,
      appointmentId,
      title,
      timeStr,
      location,
      meetUrl,
      isRead: false,
    };

    set((s) => ({
      // Deduplicate by appointmentId if already exists and not read
      reminders: [newRem, ...s.reminders.filter((r) => r.appointmentId !== appointmentId)],
    }));

    const actions: ToastAction[] = [
      {
        label: 'Snooze 5m',
        onClick: () => {
          get().snoozeReminder(appointmentId, 5);
        },
      },
      {
        label: 'Dismiss',
        onClick: () => {
          get().dismissReminder(id);
        },
      },
    ];

    const onlineUrl = meetUrl || (location && /(https?:\/\/[^\s]+)/i.test(location) ? location.match(/(https?:\/\/[^\s]+)/i)?.[0] : undefined);
    if (onlineUrl) {
      actions.unshift({
        label: 'Join',
        variant: 'primary',
        onClick: () => {
          window.open(onlineUrl, '_blank', 'noopener,noreferrer');
        },
      });
    }

    dispatchNotification({
      title: `Meeting Alert: ${title}`,
      body: `${timeStr}${location ? ` • ${location}` : ''}`,
      type: 'info',
      tag: `calendar-${appointmentId}`,
      isDirect: true,
      isHighPriority: true,
      actions,
      duration: 15000,
      alwaysShowToast: true,
      onClick: () => {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/calendar')) {
          window.location.href = '/calendar';
        }
      },
    });
  },
}));
