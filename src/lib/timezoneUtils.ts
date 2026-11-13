/**
 * Timezone and local time formatting utility for AirSend.
 * Resolves user's system timezone and provides live time calculations.
 */

export function getUserTimeZone(): string {
  if (typeof window === 'undefined') return 'Asia/Kolkata';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) return tz;
  } catch {}
  return 'Asia/Kolkata';
}

export interface UserTimeInfo {
  timeZone: string;
  tzAbbr: string;
  hour: number;
  minute: number;
  decimalHour: number;
  formattedTime: string;
}

export function getUserTimeInfo(overrideTz?: string): UserTimeInfo {
  const timeZone = overrideTz || getUserTimeZone();
  const now = new Date();

  let formattedTime = '';
  try {
    formattedTime = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(now);
  } catch {
    formattedTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  let tzAbbr = 'GMT';
  try {
    const tzParts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(now);
    tzAbbr = tzParts.find((p) => p.type === 'timeZoneName')?.value || 'GMT';
  } catch {
    tzAbbr = 'GMT';
  }

  let hour = now.getHours();
  let minute = now.getMinutes();
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(now);
    let h = parseInt(parts.find((p) => p.type === 'hour')?.value || `${hour}`, 10);
    if (h === 24) h = 0;
    hour = h;
    minute = parseInt(parts.find((p) => p.type === 'minute')?.value || `${minute}`, 10);
  } catch {}

  const decimalHour = hour + minute / 60;

  return {
    timeZone,
    tzAbbr,
    hour,
    minute,
    decimalHour,
    formattedTime,
  };
}
