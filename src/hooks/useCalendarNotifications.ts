'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useCalendarNotificationStore } from '@/stores';
import { calendarApi } from '@/lib/api';
import { subscribeCalendarEvents } from '@/lib/api/handlers/calendar';
import { requestWebPushPermission } from '@/lib/notificationDispatcher';
import { useNotificationCenterStore } from '@/stores/useNotificationCenterStore';

const REMINDER_POLL_MS = 60_000;
const REMINDER_POLL_MAX_MS = 15 * 60_000;

export function useCalendarNotifications() {
  const triggerReminder = useCalendarNotificationStore((s) => s.triggerReminder);
  const notifiedAptsRef = useRef<Map<string, number>>(new Map());

  const checkUpcomingMeetings = useCallback(async () => {
    try {
      const appointments = await calendarApi.getAppointments();
      if (!Array.isArray(appointments) || appointments.length === 0) return true;

      const now = Date.now();
      const thresholdAhead = 15 * 60 * 1000; // 15 minutes ahead
      const thresholdPast = 5 * 60 * 1000;   // up to 5 minutes after start

      for (const apt of appointments) {
        if (!apt.startUtc) continue;
        const startTime = new Date(apt.startUtc).getTime();
        const diff = startTime - now;

        // If starting within next 15 minutes or started up to 5 minutes ago
        if (diff >= -thresholdPast && diff <= thresholdAhead) {
          const existingRem = useCalendarNotificationStore
            .getState()
            .reminders.find((r) => r.appointmentId === apt.id);
          const lastNotified = notifiedAptsRef.current.get(apt.id);

          // If reminder was snoozed, respect snooze timer
          if (existingRem?.snoozedUntil) {
            if (now < existingRem.snoozedUntil) {
              continue; // Still snoozed
            }
            // Snooze expired, allow re-trigger
            existingRem.snoozedUntil = null;
          } else if (lastNotified && now - lastNotified < 15 * 60 * 1000) {
            // Don't re-trigger within 15 minutes for the same non-snoozed appointment
            continue;
          }

          notifiedAptsRef.current.set(apt.id, now);

          let timeStr = 'Starting now';
          if (diff > 60_000) {
            const minutesLeft = Math.ceil(diff / 60_000);
            timeStr = `Starts in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`;
          } else if (diff > 0) {
            timeStr = 'Starts in less than 1 minute';
          }

          const title = apt.title || 'Untitled Meeting';
          const meetUrl =
            apt.location && /https?:\/\//i.test(apt.location)
              ? apt.location
              : apt.notes && /https?:\/\/[^\s]+/i.test(apt.notes)
              ? apt.notes.match(/https?:\/\/[^\s]+/i)?.[0]
              : undefined;

          triggerReminder({
            appointmentId: apt.id,
            title,
            timeStr,
            location: apt.location,
            meetUrl,
          });

          useNotificationCenterStore.getState().addNotification({
            title: `Upcoming: ${title}`,
            detail: `${timeStr}${apt.location ? ` • ${apt.location}` : ''}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'calendar',
          });
        }
      }
      return true;
    } catch {
      return false;
    }
  }, [triggerReminder]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let delay = REMINDER_POLL_MS;

    const runCheck = async () => {
      const succeeded = await checkUpcomingMeetings();
      if (cancelled) return;
      delay = succeeded ? REMINDER_POLL_MS : Math.min(delay * 2, REMINDER_POLL_MAX_MS);
      timer = setTimeout(runCheck, delay);
    };

    // Initial check on mount
    void runCheck();

    // Wire to Real Calendar SSE Stream: whenever CalDev pushes a change, immediately re-check!
    const unsubscribeSSE = subscribeCalendarEvents(() => {
      if (!cancelled) {
        void checkUpcomingMeetings();
      }
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsubscribeSSE();
    };
  }, [checkUpcomingMeetings]);

  const requestPermission = useCallback(async () => {
    return await requestWebPushPermission();
  }, []);

  const checkNow = useCallback(async () => {
    await checkUpcomingMeetings();
  }, [checkUpcomingMeetings]);

  return {
    requestPermission,
    checkNow,
  };
}
