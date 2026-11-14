'use client';

import { useEffect, useCallback } from 'react';
import { useCalendarsStore } from '@/stores/useCalendarsStore';
import { STORAGE_KEYS, CALENDAR_HEALTH_CONFIG } from '@/constants';

function getSessionHealthTimestamp(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEYS.LAST_CALENDAR_HEALTH);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

export function useCalendarHealthPoll() {
  const isHealthy = useCalendarsStore((s) => s.isHealthy);
  const healthMessage = useCalendarsStore((s) => s.healthMessage);
  const lastHealthCheck = useCalendarsStore((s) => s.lastHealthCheck);
  const pollHealth = useCalendarsStore((s) => s.pollHealth);

  const checkNow = useCallback(() => {
    void pollHealth();
  }, [pollHealth]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let isCancelled = false;

    const scheduleNext = (delayMs: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void tick();
      }, delayMs);
    };

    const tick = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        scheduleNext(CALENDAR_HEALTH_CONFIG.NORMAL_POLL_INTERVAL_MS);
        return;
      }

      const ok = await pollHealth();
      if (!isCancelled) {
        const nextDelay = ok
          ? CALENDAR_HEALTH_CONFIG.NORMAL_POLL_INTERVAL_MS
          : CALENDAR_HEALTH_CONFIG.RETRY_INTERVAL_MS;
        scheduleNext(nextDelay);
      }
    };

    // On mount: check session storage; if last check > 30s ago (or never), fetch now
    const lastSession = getSessionHealthTimestamp();
    const now = Date.now();
    if (!lastSession || now - lastSession >= CALENDAR_HEALTH_CONFIG.REFOCUS_THRESHOLD_MS) {
      void tick();
    } else {
      const elapsed = now - lastSession;
      const initialDelay = Math.max(1000, CALENDAR_HEALTH_CONFIG.NORMAL_POLL_INTERVAL_MS - elapsed);
      scheduleNext(initialDelay);
    }

    // Refocus handler: on window focus or visibility change to visible
    const handleRefocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      const lastCheck = getSessionHealthTimestamp();
      const current = Date.now();

      // Refocus within 30 seconds: ignore. More than 30 seconds: fetch
      if (lastCheck && current - lastCheck < CALENDAR_HEALTH_CONFIG.REFOCUS_THRESHOLD_MS) {
        return;
      }
      void pollHealth();
    };

    window.addEventListener('focus', handleRefocus);
    document.addEventListener('visibilitychange', handleRefocus);

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener('focus', handleRefocus);
      document.removeEventListener('visibilitychange', handleRefocus);
    };
  }, [pollHealth]);

  return { isHealthy, healthMessage, lastHealthCheck, checkNow };
}
