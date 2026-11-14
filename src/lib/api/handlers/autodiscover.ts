import { apiClient } from '../client';

export interface AutodiscoverResult {
  success: boolean;
  source: 'preset' | 'thunderbird' | 'outlook' | 'mx' | 'heuristic';
  domain: string;
  email: string;
  displayName?: string;
  imap: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
  };
}

/**
 * Asks the server to autodiscover IMAP and SMTP settings for an email address
 * (public `GET /autodiscover?email=...` on the base URL).
 *
 * Resolves with the discovered settings only when the server answers
 * `success: true`. Anything else (`success: false` / HTTP 404 for an unknown
 * domain, or a network error) resolves to null so the UI shows nothing.
 */
export async function autodiscover(email: string): Promise<AutodiscoverResult | null> {
  const cleanEmail = email.trim();
  if (!cleanEmail.includes('@')) return null;

  try {
    const res = await apiClient.get<any>(
      `/autodiscover?email=${encodeURIComponent(cleanEmail)}`,
      { skipAuth: true }
    );
    const result = res?.result;
    if (res?.success === true && result?.imap && result?.smtp) {
      return { ...result, success: true };
    }
  } catch {
    // success: false (HTTP 404) or unreachable server: nothing discovered.
  }
  return null;
}
