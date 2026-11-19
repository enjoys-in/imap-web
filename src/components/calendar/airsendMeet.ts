import { getAuthToken } from '@/lib/api/tokenStorage';

export const AIRSEND_MEET_BASE = 'https://meet.airsend.in';
export const AIRSEND_MEET_INSTANT_API = `${AIRSEND_MEET_BASE}/api/v1/instant`;

export interface InstantMeetingResponse {
  url?: string;
  meetingUrl?: string;
  meeting_url?: string;
  meetUrl?: string;
  joinUrl?: string;
  link?: string;
  roomId?: string;
  room_id?: string;
  roomCode?: string;
  room_code?: string;
  code?: string;
  id?: string;
  data?: any;
  result?: any;
  room?: any;
  [key: string]: any;
}

/**
 * Extracts a complete meeting URL from arbitrary API response schemas.
 */
export function extractMeetingUrl(data: any): string | null {
  if (!data) return null;

  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return `${AIRSEND_MEET_BASE}/${trimmed}`;
    }
    try {
      const parsed = JSON.parse(trimmed);
      return extractMeetingUrl(parsed);
    } catch {
      return null;
    }
  }

  const rawUrl =
    data.url ||
    data.meetingUrl ||
    data.meeting_url ||
    data.meetUrl ||
    data.joinUrl ||
    data.link ||
    data.data?.url ||
    data.data?.meetingUrl ||
    data.data?.meeting_url ||
    data.data?.link ||
    data.result?.url ||
    data.result?.meetingUrl ||
    data.result?.meeting_url ||
    data.result?.link ||
    data.room?.url;

  if (rawUrl && typeof rawUrl === 'string') {
    return rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl.replace(/^\/+/, '')}`;
  }

  const roomId =
    data.roomId ||
    data.room_id ||
    data.roomCode ||
    data.room_code ||
    data.code ||
    data.id ||
    data.data?.roomId ||
    data.data?.room_id ||
    data.result?.roomId ||
    data.result?.room_id ||
    data.room?.roomId ||
    data.room?.id;

  if (roomId && typeof roomId === 'string') {
    return `${AIRSEND_MEET_BASE}/${roomId.replace(/^\/+/, '')}`;
  }

  return null;
}

/**
 * Generates a pseudo-random room code in AirSend format (xxxx-xxxx-xxxx) for fallback dev usage.
 */
function generateFallbackRoomCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const seg = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg(4)}-${seg(4)}-${seg(4)}`;
}

/**
 * Checks if a given URL is an AirSend Meet link.
 */
export function isAirSendMeetUrl(url?: string | null): boolean {
  if (!url) return false;
  return /https?:\/\/(?:www\.)?meet\.airsend\.in/i.test(url.trim());
}

/**
 * Generates an instant meeting by calling meet.airsend.in/api/v1/instant.
 * Allowed origin: imap.airsend.in
 */
export async function createInstantMeeting(options?: { title?: string }): Promise<string> {
  const token = typeof window !== 'undefined' ? getAuthToken() : null;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isProductionImap =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'imap.airsend.in' || window.location.hostname.endsWith('.airsend.in'));

  try {
    // 1. Try POST request to meet.airsend.in/api/v1/instant
    const postRes = await fetch(AIRSEND_MEET_INSTANT_API, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: options?.title?.trim() || 'AirSend Meeting',
      }),
    });

    if (postRes.ok) {
      const data = await postRes.json().catch(() => null);
      const url = extractMeetingUrl(data);
      if (url) return url;
    } else if (postRes.status === 405) {
      // 2. If POST gives 405 Method Not Allowed, fallback to GET
      const getRes = await fetch(AIRSEND_MEET_INSTANT_API, {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (getRes.ok) {
        const data = await getRes.json().catch(() => null);
        const url = extractMeetingUrl(data);
        if (url) return url;
      }
    } else {
      let errMsg = `Failed to create meeting (${postRes.status})`;
      try {
        const errJson = await postRes.json();
        if (errJson?.error || errJson?.message) {
          errMsg = errJson.error || errJson.message;
        }
      } catch {}
      throw new Error(errMsg);
    }
  } catch (err: any) {
    console.warn('[AirSend Meet] Instant meeting API request failed:', err);

    // If running in development (e.g. localhost where origin is not imap.airsend.in),
    // and CORS/Network failed, provide a fallback AirSend Meet URL so dev workflows work seamlessly.
    if (!isProductionImap) {
      const fallbackUrl = `${AIRSEND_MEET_BASE}/${generateFallbackRoomCode()}`;
      console.info('[AirSend Meet] Generated local dev fallback link:', fallbackUrl);
      return fallbackUrl;
    }

    throw new Error(
      err?.message ||
        'Unable to generate instant meeting from meet.airsend.in. Please check your connection and account credentials.'
    );
  }

  throw new Error('meet.airsend.in did not return a valid meeting URL');
}
