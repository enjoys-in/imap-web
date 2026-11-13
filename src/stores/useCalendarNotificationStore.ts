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
  simulateUpcomingReminder: () => void;
}

const INITIAL_REMINDERS: CalendarReminder[] = [
  {
    id: 'rem-1',
    appointmentId: 'apt-1',
    title: 'Sprint Planning & Backlog Grooming',
    timeStr: 'In 15 minutes (2:00 PM)',
    location: 'Microsoft Teams Meeting',
    isRead: false,
  },
  {
    id: 'rem-2',
    appointmentId: 'apt-2',
    title: 'Architecture Sync: IMAP IDLE',
    timeStr: 'Today at 3:30 PM',
    location: 'Conference Room 4B / Hybrid',
    isRead: false,
  },
];

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
    const id = `rem-${Date.now()}`;
    const newRem: CalendarReminder = {
      id,
      appointmentId,
      title,
      timeStr,
      location,
      isRead: false,
    };

    set((s) => ({ reminders: [newRem, ...s.reminders] }));

    dispatchNotification({
      title: `Calendar Reminder: ${title}`,
      body: `${timeStr}${location ? ` • ${location}` : ''}`,
      type: 'info',
    });
  },

  simulateUpcomingReminder: () => {
    const titles = [
      'Sprint Review & Retrospective',
      '1:1 Sync with Engineering Lead',
      'Frontend Team Standup',
      'Client Presentation: AirSend Architecture',
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    get().triggerReminder({
      appointmentId: `apt-${Date.now()}`,
      title: randomTitle,
      timeStr: 'Starts in 10 minutes',
      location: 'Microsoft Teams Meeting',
    });
  },
}));
