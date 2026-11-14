import { apiClient } from '../client';
import { detectPresetByEmail } from '@/lib/emailServerPresets';

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
 * Autodiscovers IMAP and SMTP server parameters using:
 * 1. Direct Base URL public autodiscover endpoint (/autodiscover?email=...)
 * 2. Fallback to /autodiscover.json or /.well-known/autoconfig/mail/config-v1.1.xml
 * 3. Client provider presets
 */
export async function autodiscover(email: string): Promise<AutodiscoverResult> {
  const cleanEmail = email.trim();
  const domain = cleanEmail.includes('@')
    ? cleanEmail.split('@')[1]?.toLowerCase().trim()
    : '';

  // 1. Try public GET /autodiscover (routed to direct base URL)
  try {
    const res = await apiClient.get<any>(
      `/autodiscover?email=${encodeURIComponent(cleanEmail)}`,
      { skipAuth: true }
    );
    if (res?.result?.imap && res?.result?.smtp) {
      return res.result;
    }
    if (res?.imap && res?.smtp) {
      return res;
    }
  } catch {
    // Probe alternative direct base URL autodiscover route
  }

  // 2. Try public GET /autodiscover.json (routed to direct base URL)
  try {
    const res = await apiClient.get<any>(
      `/autodiscover.json?email=${encodeURIComponent(cleanEmail)}`,
      { skipAuth: true }
    );
    if (res?.result?.imap && res?.result?.smtp) {
      return res.result;
    }
    if (res?.imap && res?.smtp) {
      return res;
    }
  } catch {
    // Fallback to client preset heuristics
  }

  // 3. Fallback to known presets
  const preset = detectPresetByEmail(cleanEmail);
  return {
    success: true,
    source: 'preset',
    domain: domain || 'domain.com',
    email: cleanEmail,
    imap: {
      host: preset.imapHost,
      port: preset.imapPort,
      secure: preset.imapSecurity === 'SslOnConnect',
      username: cleanEmail,
    },
    smtp: {
      host: preset.smtpHost,
      port: preset.smtpPort,
      secure: preset.smtpSecurity === 'SslOnConnect',
      username: cleanEmail,
    },
  };
}
