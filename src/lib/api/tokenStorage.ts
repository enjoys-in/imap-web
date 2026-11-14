const TOKEN_STORAGE_KEY = 'airsend_access_token';

let inMemoryToken: string | null = null;

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) return stored;
    } catch {}
  }
  return inMemoryToken;
}

export function setAuthToken(token: string): void {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {}
  }
}

export function clearAuthToken(): void {
  inMemoryToken = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
  }
}
