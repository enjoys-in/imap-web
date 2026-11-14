import { apiClient } from '../client';
import { isLiveApiAvailable } from '@/config/clientConfig';

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
  if (!isLiveApiAvailable()) {
    return DEFAULT_MAIL;
  }
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

// ── Automatic Replies / Vacation Responder (RFC 3834 / RFC 5230) ──

export interface AutoReplySettings {
  isEnabled: boolean;
  onlyDuringPeriod: boolean;
  startTime?: string | null;
  endTime?: string | null;
  timeZone?: string;
  onlyContacts: boolean;
  replyOutsideOrg: boolean;
  messageText: string;
  messageHtml?: string | null;
  rateLimitDays?: number;
}

export const DEFAULT_AUTO_REPLIES: AutoReplySettings = {
  isEnabled: false,
  onlyDuringPeriod: false,
  startTime: null,
  endTime: null,
  timeZone: 'UTC',
  onlyContacts: false,
  replyOutsideOrg: true,
  messageText:
    'Hi,\n\nI am currently out of the office with limited access to email. I will respond to your message as soon as possible upon my return.\n\nBest regards,\nMulayam',
  rateLimitDays: 1,
};

export async function getAutoReplies(accountId?: string): Promise<AutoReplySettings> {
  const query = accountId ? `?accountEmail=${encodeURIComponent(accountId)}` : '';
  try {
    const data = await apiClient.get<any>(`/automatic-replies${query}`);
    const res = data?.result || data;
    if (!res) return DEFAULT_AUTO_REPLIES;
    return {
      isEnabled: Boolean(res.is_enabled ?? res.isEnabled),
      onlyDuringPeriod: Boolean(res.only_during_period ?? res.onlyDuringPeriod),
      startTime: res.start_time ?? res.startTime ?? null,
      endTime: res.end_time ?? res.endTime ?? null,
      timeZone: res.time_zone ?? res.timeZone ?? 'UTC',
      onlyContacts: Boolean(res.only_contacts ?? res.onlyContacts),
      replyOutsideOrg: Boolean(res.reply_outside_org ?? res.replyOutsideOrg ?? true),
      messageText: res.message_text ?? res.messageText ?? DEFAULT_AUTO_REPLIES.messageText,
      messageHtml: res.message_html ?? res.messageHtml ?? null,
      rateLimitDays: res.rate_limit_days ?? res.rateLimitDays ?? 1,
    };
  } catch {
    return DEFAULT_AUTO_REPLIES;
  }
}

export async function updateAutoReplies(
  accountId: string,
  settings: Partial<AutoReplySettings>
): Promise<AutoReplySettings> {
  try {
    const payload = {
      accountEmail: accountId,
      isEnabled: settings.isEnabled,
      onlyDuringPeriod: settings.onlyDuringPeriod,
      startTime: settings.startTime,
      endTime: settings.endTime,
      timeZone: settings.timeZone,
      onlyContacts: settings.onlyContacts,
      replyOutsideOrg: settings.replyOutsideOrg,
      messageText: settings.messageText,
      messageHtml: settings.messageHtml,
      rateLimitDays: settings.rateLimitDays,
    };
    const data = await apiClient.post<any>('/automatic-replies', payload);
    const res = data?.result || data;
    return {
      isEnabled: Boolean(res.is_enabled ?? res.isEnabled),
      onlyDuringPeriod: Boolean(res.only_during_period ?? res.onlyDuringPeriod),
      startTime: res.start_time ?? res.startTime ?? null,
      endTime: res.end_time ?? res.endTime ?? null,
      timeZone: res.time_zone ?? res.timeZone ?? 'UTC',
      onlyContacts: Boolean(res.only_contacts ?? res.onlyContacts),
      replyOutsideOrg: Boolean(res.reply_outside_org ?? res.replyOutsideOrg ?? true),
      messageText: res.message_text ?? res.messageText ?? '',
      messageHtml: res.message_html ?? res.messageHtml ?? null,
      rateLimitDays: res.rate_limit_days ?? res.rateLimitDays ?? 1,
    };
  } catch {
    return { ...DEFAULT_AUTO_REPLIES, ...settings } as AutoReplySettings;
  }
}

