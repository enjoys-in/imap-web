'use client';

import { useEffect, useCallback } from 'react';
import { useCalendarNotificationStore } from '@/stores';
import { calendarApi } from '@/lib/api';
import { requestWebPushPermission } from '@/lib/notificationDispatcher';

export function useCalendarNotifications() {
  const triggerReminder = useCalendarNotificationStore((s) => s.triggerReminder);
  const simulateUpcomingReminder = useCalendarNotificationStore(
    (s) => s.simulateUpcomingReminder
  );

  // Periodically check appointments for upcoming meetings
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkUpcomingMeetings = async () => {
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
        // Silently handle offline/mock state
      }
    };

    // Check on mount and every 60 seconds
    checkUpcomingMeetings();
    timer = setInterval(checkUpcomingMeetings, 60000);

    return () => clearInterval(timer);
  }, [triggerReminder]);

  const requestPermission = useCallback(async () => {
    return await requestWebPushPermission();
  }, []);

  return {
    requestPermission,
    simulateUpcomingReminder,
  };
}
