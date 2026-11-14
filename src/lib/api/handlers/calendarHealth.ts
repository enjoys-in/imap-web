import { getCalendarBaseUrl } from './calendar';
import { saveCachedCalendarHealth } from '@/lib/idb/calendarCacheDb';

export interface CalendarHealthStatus {
  isHealthy: boolean;
  message: string;
  status: 'ok' | 'degraded' | 'unreachable';
  timestamp: string;
  latencyMs: number;
}

/**
 * Checks the health status of the calendar service via public GET /health.
 * Requires no authentication tokens or custom headers.
 */
export async function checkCalendarHealth(): Promise<CalendarHealthStatus> {
  const url = `${getCalendarBaseUrl()}/health`;
  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      const status: CalendarHealthStatus = {
        isHealthy: false,
        message: `Calendar server returned HTTP ${res.status}`,
        status: 'degraded',
        timestamp: new Date().toISOString(),
        latencyMs,
      };
      void saveCachedCalendarHealth(false, status.message);
      return status;
    }

    const data = await res.json().catch(() => null);
    const isOk = data?.result?.status === 'ok' || data?.success === true;

    const status: CalendarHealthStatus = {
      isHealthy: isOk,
      message: data?.message || (isOk ? 'Calendar service is healthy' : 'Unhealthy status'),
      status: isOk ? 'ok' : 'degraded',
      timestamp: data?.result?.time || new Date().toISOString(),
      latencyMs,
    };

    void saveCachedCalendarHealth(isOk, status.message);
    return status;
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    const message = err?.name === 'AbortError' ? 'Calendar health check timed out' : 'Calendar service unreachable';

    const status: CalendarHealthStatus = {
      isHealthy: false,
      message,
      status: 'unreachable',
      timestamp: new Date().toISOString(),
      latencyMs,
    };

    void saveCachedCalendarHealth(false, message);
    return status;
  }
}
