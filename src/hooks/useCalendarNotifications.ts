'use client';

import { useEffect, useCallback } from 'react';
import { useCalendarNotificationStore } from '@/stores';
import { calendarApi } from '@/lib/api';
import { requestWebPushPermission } from '@/lib/notificationDispatcher';

const REMINDER_POLL_MS = 60_000;
const REMINDER_POLL_MAX_MS = 30 * 60_000;

export function useCalendarNotifications() {
  const triggerReminder = useCalendarNotificationStore((s) => s.triggerReminder);
  const simulateUpcomingReminder = useCalendarNotificationStore(
    (s) => s.simulateUpcomingReminder
  );

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delay = REMINDER_POLL_MS;

    const checkUpcomingMeetings = async () => {
      let succeeded = true;
      try {
        const appointments = await calendarApi.getAppointments();
        const now = Date.now();
        const threshold = 15 * 60 * 1000; // 15 minutes

        for (const apt of appointments) {
          const startTime = new Date(apt.startUtc).getTime();
          const diff = startTime - now;

          // If starting within next 15 minutes and in the future
          if (diff > 0 && diff <= threshold) {
            const minutesLeft = Math.ceil(diff / 60000);
            triggerReminder({
              appointmentId: apt.id,
              title: apt.title,
              timeStr: `Starts in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`,
              location: apt.location,
            });
            break;
          }
        }
      } catch {
        succeeded = false;
      }

      if (cancelled) return;
      delay = succeeded ? REMINDER_POLL_MS : Math.min(delay * 2, REMINDER_POLL_MAX_MS);
      timer = setTimeout(checkUpcomingMeetings, delay);
    };

    checkUpcomingMeetings();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [triggerReminder]);

  const requestPermission = useCallback(async () => {
    return await requestWebPushPermission();
  }, []);

  return {
    requestPermission,
    simulateUpcomingReminder,
  };
}
