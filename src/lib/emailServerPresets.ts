import { TransportSecurity, AccountProviderType } from '@/types';

export interface EmailServerPreset {
  provider: AccountProviderType;
  imapHost: string;
  imapPort: number;
  imapSecurity: TransportSecurity;
  smtpHost: string;
  smtpPort: number;
  smtpSecurity: TransportSecurity;
}

export const PRESETS: Record<string, EmailServerPreset> = {
  'outlook.com': {
    provider: 'Outlook.com',
    imapHost: 'outlook.office365.com',
    imapPort: 993,
    imapSecurity: 'SslOnConnect',
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    smtpSecurity: 'StartTls',
  },
  'hotmail.com': {
    provider: 'Outlook.com',
    imapHost: 'outlook.office365.com',
    imapPort: 993,
    imapSecurity: 'SslOnConnect',
    smtpHost: 'smtp.office365.com',
    smtpPort: 587,
    smtpSecurity: 'StartTls',
  },
  'airsend.in': {
    provider: 'IMAP',
    imapHost: 'imap.airsend.in',
    imapPort: 993,
    imapSecurity: 'SslOnConnect',
    smtpHost: 'smtp.airsend.in',
    smtpPort: 587,
    smtpSecurity: 'StartTls',
  },
  'gmail.com': {
    provider: 'IMAP',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSecurity: 'SslOnConnect',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecurity: 'StartTls',
  },
};

export function detectPresetByEmail(email: string): EmailServerPreset {
  const domain = email.includes('@') ? email.split('@')[1]?.toLowerCase().trim() : '';

  if (domain && PRESETS[domain]) {
    return PRESETS[domain];
  }

  const cleanDomain = domain || 'domain.com';
  return {
    provider: 'IMAP',
    imapHost: `imap.${cleanDomain}`,
    imapPort: 993,
    imapSecurity: 'SslOnConnect',
    smtpHost: `smtp.${cleanDomain}`,
    smtpPort: 587,
    smtpSecurity: 'StartTls',
  };
}
