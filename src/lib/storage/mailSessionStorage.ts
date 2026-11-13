export interface OpenMailSessionData {
  userIndex: number;
  folderId: string;
  folderSlug: string;
  mailId: string | null;
  hash: string;
  timestamp: number;
}

const SESSION_PREFIX = 'airsend_open_mail_';
const LAST_ROUTE_KEY = 'airsend_last_mail_route';

export function saveOpenMailSession(
  userIndex: number | string,
  folderId: string,
  folderSlug: string,
  mailId: string | null
): void {
  if (typeof window === 'undefined') return;
  try {
    const idx = typeof userIndex === 'string' ? parseInt(userIndex, 10) || 0 : userIndex;
    const cleanHash = mailId ? `#${folderSlug}/${mailId}` : `#${folderSlug}`;
    const payload: OpenMailSessionData = {
      userIndex: idx,
      folderId,
      folderSlug,
      mailId,
      hash: cleanHash,
      timestamp: Date.now(),
    };
    window.sessionStorage.setItem(`${SESSION_PREFIX}${idx}`, JSON.stringify(payload));
    window.sessionStorage.setItem(LAST_ROUTE_KEY, `/mail/u/${idx}/${cleanHash}`);
  } catch {
    // Fallback if sessionStorage is restricted
  }
}

export function getOpenMailSession(userIndex: number | string): OpenMailSessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const idx = typeof userIndex === 'string' ? parseInt(userIndex, 10) || 0 : userIndex;
    const raw = window.sessionStorage.getItem(`${SESSION_PREFIX}${idx}`);
    if (!raw) return null;
    return JSON.parse(raw) as OpenMailSessionData;
  } catch {
    return null;
  }
}

export function getLastMailRoute(): string {
  if (typeof window === 'undefined') return '/mail/u/0/#inbox';
  try {
    return window.sessionStorage.getItem(LAST_ROUTE_KEY) || '/mail/u/0/#inbox';
  } catch {
    return '/mail/u/0/#inbox';
  }
}
