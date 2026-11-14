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
  }
  return null;
}
