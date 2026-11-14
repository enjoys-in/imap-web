import { apiClient } from '../client';

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
  defaultSenderEmail: '',
  signatureHtml: '<p>--<br/>Sent via AirSend Web</p>',
  composeFormat: 'html',
  readingPanePosition: 'right',
  markAsReadDelaySeconds: 3,
};

export async function getGeneralSettings(): Promise<GeneralSettings> {
  try {
    const data = await apiClient.get<any>('/settings/general');
    return data?.result || data || DEFAULT_GENERAL;
  } catch {
    return DEFAULT_GENERAL;
  }
}

export async function updateGeneralSettings(data: Partial<GeneralSettings>): Promise<GeneralSettings> {
  try {
    const res = await apiClient.patch<any>('/settings/general', data);
    return res?.result || { ...DEFAULT_GENERAL, ...data };
  } catch {
    return { ...DEFAULT_GENERAL, ...data };
  }
}

export async function getMailSettings(): Promise<MailSettings> {
  try {
    const data = await apiClient.get<any>('/settings/mail');
    return data?.result || data || DEFAULT_MAIL;
  } catch {
    return DEFAULT_MAIL;
  }
}

export async function updateMailSettings(data: Partial<MailSettings>): Promise<MailSettings> {
  try {
    const res = await apiClient.patch<any>('/settings/mail', data);
    return res?.result || { ...DEFAULT_MAIL, ...data };
  } catch {
    return { ...DEFAULT_MAIL, ...data };
  }
}

export async function getMailRules(accountId?: string): Promise<MailRule[]> {
  const query = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  const data = await apiClient.get<any>(`/settings/rules${query}`);
  const list = Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : data?.result?.rules;
  return Array.isArray(list) ? list : [];
}

export {
  type AutoReplySettings,
  DEFAULT_AUTO_REPLIES,
  getAutoReplies,
  updateAutoReplies,
} from './autoReplies';

