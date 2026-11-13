import { getClientConfig, isLiveApiAvailable } from '@/config/clientConfig';

export interface GeneralSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  dateFormat: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface MailSettings {
  defaultSenderEmail: string;
  signatureHtml: string;
  composeFormat: 'html' | 'text';
  readingPanePosition: 'right' | 'bottom' | 'off';
  markAsReadDelaySeconds: number;
}

export interface MailRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: string;
  action: string;
}

const DEFAULT_GENERAL: GeneralSettings = {
  theme: 'dark',
  language: 'en-US',
  dateFormat: 'MMM d, yyyy h:mm a',
  notificationsEnabled: true,
  soundEnabled: true,
};

const DEFAULT_MAIL: MailSettings = {
  defaultSenderEmail: 'mullayam06@outlook.com',
  signatureHtml: '<p>--<br/>Sent via AirSend Web</p>',
  composeFormat: 'html',
  readingPanePosition: 'right',
  markAsReadDelaySeconds: 3,
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  if (!isLiveApiAvailable()) {
    return DEFAULT_GENERAL;
  }
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/settings/general`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return DEFAULT_GENERAL;
  }
}

export async function updateGeneralSettings(data: Partial<GeneralSettings>): Promise<GeneralSettings> {
  return { ...DEFAULT_GENERAL, ...data };
}

export async function getMailSettings(): Promise<MailSettings> {
  if (!isLiveApiAvailable()) {
    return DEFAULT_MAIL;
  }
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/settings/mail`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return DEFAULT_MAIL;
  }
}

export async function updateMailSettings(data: Partial<MailSettings>): Promise<MailSettings> {
  return { ...DEFAULT_MAIL, ...data };
}

export async function getMailRules(): Promise<MailRule[]> {
  return [
    {
      id: 'rule-1',
      name: 'Archive Newsletters',
      enabled: true,
      condition: 'from contains newsletter',
      action: 'move to Archive',
    },
  ];
}

export async function createMailRule(rule: Omit<MailRule, 'id'>): Promise<MailRule> {
  return { id: `rule-${Date.now()}`, ...rule };
}

export async function deleteMailRule(ruleId: string): Promise<boolean> {
  return true;
}
