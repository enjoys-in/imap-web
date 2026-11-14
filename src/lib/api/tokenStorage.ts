import { STORAGE_KEYS } from '@/constants';

let inMemoryToken: string | null = null;

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (stored) return stored;
    } catch {}
  }
  return inMemoryToken;
}

export function setAuthToken(token: string): void {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch {}
  }
}

export function clearAuthToken(): void {
  inMemoryToken = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch {}
  }
}
