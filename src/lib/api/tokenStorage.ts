import { STORAGE_KEYS } from '@/constants';

let inMemoryToken: string | null = null;

export const TOKEN_STORAGE_KEYS = [
  STORAGE_KEYS.AUTH_TOKEN,
  'accesstoken',
  'access_token',
  'token',
  'jwt',
] as const;

export const TOKEN_COOKIE_NAMES = [
  'accesstoken',
  'access_token',
  'token',
  'airsend_access_token',
  'jwt',
] as const;

/**
 * Retrieves a cookie value by name in a browser environment.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const c = cookies[i].trim();
    const eqIdx = c.indexOf('=');
    if (eqIdx !== -1) {
      const key = c.substring(0, eqIdx).trim();
      if (key === name) {
        const val = c.substring(eqIdx + 1).trim();
        try {
          return decodeURIComponent(val);
        } catch {
          return val;
        }
      }
    }
  }
  return null;
}

/**
 * Sets a cookie with standard Lax same-site attribute and 30-day default expiration.
 */
export function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Robustly clears a cookie across all common paths and domain scopes.
 */
export function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;

  const pastDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const paths = ['/', '/login', '/mail', ''];
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const domains = ['', host, `.${host}`];

  for (const path of paths) {
    const pathAttr = path ? `path=${path}; ` : '';
    document.cookie = `${name}=; expires=${pastDate}; ${pathAttr}SameSite=Lax;`;
    document.cookie = `${name}=; expires=${pastDate}; ${pathAttr}`;
    for (const domain of domains) {
      if (domain) {
        document.cookie = `${name}=; expires=${pastDate}; ${pathAttr}domain=${domain}; SameSite=Lax;`;
        document.cookie = `${name}=; expires=${pastDate}; ${pathAttr}domain=${domain};`;
      }
    }
  }
}

/**
 * Checks whether an auth token exists in memory, localStorage, or cookies.
 */
export function hasAuthToken(): boolean {
  return Boolean(getAuthToken());
}

/**
 * Retrieves the authentication token from localStorage, cookies, or in-memory cache.
 * Automatically synchronizes discovered cookie tokens to localStorage for subsequent fast reads.
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    try {
      // 1. Primary localStorage key
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (stored) {
        inMemoryToken = stored;
        return stored;
      }

      // 2. Alternate localStorage keys
      for (const key of TOKEN_STORAGE_KEYS) {
        const altStored = localStorage.getItem(key);
        if (altStored) {
          inMemoryToken = altStored;
          try {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, altStored);
          } catch {}
          return altStored;
        }
      }

      // 3. Check cookies (e.g. accesstoken, access_token)
      for (const name of TOKEN_COOKIE_NAMES) {
        const cookieVal = getCookie(name);
        if (cookieVal) {
          inMemoryToken = cookieVal;
          try {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, cookieVal);
          } catch {}
          return cookieVal;
        }
      }
    } catch {}
  }
  return inMemoryToken;
}

/**
 * Persists the authentication token to memory, localStorage, and browser cookies.
 */
export function setAuthToken(token: string): void {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      setCookie('accesstoken', token);
    } catch {}
  }
}

/**
 * Clears the authentication token from memory, localStorage keys, and all browser cookies.
 */
export function clearAuthToken(): void {
  inMemoryToken = null;
  if (typeof window !== 'undefined') {
    try {
      for (const key of TOKEN_STORAGE_KEYS) {
        localStorage.removeItem(key);
      }
    } catch {}
    for (const name of TOKEN_COOKIE_NAMES) {
      clearCookie(name);
    }
  }
}
