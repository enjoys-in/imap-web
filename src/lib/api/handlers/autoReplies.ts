import { apiClient } from '../client';

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
    'Hi,\n\nI am currently out of the office with limited access to email. I will respond to your message as soon as possible upon my return.\n\nBest regards,',
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
