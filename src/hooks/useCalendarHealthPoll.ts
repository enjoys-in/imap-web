'use client';

import { useEffect, useCallback } from 'react';
import { useCalendarsStore } from '@/stores/useCalendarsStore';

const POLL_INTERVAL_MS = 30000;
const RETRY_INTERVAL_MS = 10000;

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

    const tick = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        // Delay poll when backgrounded
        timer = setTimeout(tick, POLL_INTERVAL_MS * 2);
        return;
      }

      const ok = await pollHealth();
      if (!isCancelled) {
        timer = setTimeout(tick, ok ? POLL_INTERVAL_MS : RETRY_INTERVAL_MS);
      }
    };

    // Initial check
    void tick();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void pollHealth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pollHealth]);

  return { isHealthy, healthMessage, lastHealthCheck, checkNow };
}
