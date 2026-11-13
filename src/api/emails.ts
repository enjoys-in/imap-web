import { MailMessage, MailMessageMetadata, ThreadConversation } from '@/types';
import { MOCK_EMAILS } from '@/lib/mock';
import { getClientConfig, isLiveApiAvailable } from '@/config/clientConfig';
import { getCachedEmailBody, saveCachedEmailBody } from '@/lib/idb/mailCacheDb';

export interface SendEmailPayload {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  bodyHtml: string;
  attachments?: File[];
}

export interface DraftPayload {
  id?: string;
  to?: string;
  subject?: string;
  bodyHtml?: string;
}

export async function getEmailsMetadata(
  folderId: string,
  accountId?: string
): Promise<MailMessageMetadata[]> {
  if (!isLiveApiAvailable()) {
    return MOCK_EMAILS.filter((e) => {
      const matchFolder = e.folderId === folderId || folderId === 'fld-inbox';
      const matchAccount = !accountId || e.accountId === accountId;
      return matchFolder && matchAccount;
    }).map(({ bodyHtml, bodyText, ...meta }) => meta);
  }
  const { apiUrl } = getClientConfig();
  try {
    const url = `${apiUrl}/fetch-emails?folderId=${folderId}${accountId ? `&accountId=${accountId}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawList: MailMessage[] = Array.isArray(data)
      ? data
      : (data.emails || data.result?.emails || data.result || []);
    return rawList.map(({ bodyHtml, bodyText, ...meta }) => meta);
  } catch {
    return MOCK_EMAILS.filter((e) => {
      const matchFolder = e.folderId === folderId || folderId === 'fld-inbox';
      const matchAccount = !accountId || e.accountId === accountId;
      return matchFolder && matchAccount;
    }).map(({ bodyHtml, bodyText, ...meta }) => meta);
  }
}

export async function getEmailById(messageId: string): Promise<MailMessage | null> {
  const match = MOCK_EMAILS.find((e) => e.id === messageId);
  return match || null;
}

export async function getThreadMessages(threadId: string): Promise<MailMessage[]> {
  const matches = MOCK_EMAILS.filter((e) => e.threadId === threadId || e.id === threadId);
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getEmailConversation(threadIdOrMailId: string): Promise<ThreadConversation | null> {
  const root = MOCK_EMAILS.find((e) => e.id === threadIdOrMailId || e.threadId === threadIdOrMailId);
  if (!root) return null;
  const threadId = root.threadId || `thread-${root.id}`;
  const messages = await getThreadMessages(threadId);
  return {
    threadId,
    subject: root.subject,
    totalMessages: messages.length,
    unreadCount: messages.filter((m) => !m.isRead).length,
    messages,
    rootMessageId: messages[0]?.id || root.id,
    lastActivityDate: messages[messages.length - 1]?.date || root.date,
  };
}

export async function getEmailBody(
  messageId: string
): Promise<{ bodyHtml?: string; bodyText?: string }> {
  const cached = await getCachedEmailBody(messageId);
  if (cached && (cached.bodyHtml || cached.bodyText)) {
    return cached;
  }
  if (!isLiveApiAvailable()) {
    const match = MOCK_EMAILS.find((e) => e.id === messageId);
    const body = { bodyHtml: match?.bodyHtml, bodyText: match?.bodyText };
    saveCachedEmailBody(messageId, body);
    return body;
  }
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/fetch-email-body?messageId=${messageId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const body = data.bodyHtml !== undefined ? data : (data.result || data);
    saveCachedEmailBody(messageId, body);
    return body;
  } catch {
    const match = MOCK_EMAILS.find((e) => e.id === messageId);
    const body = { bodyHtml: match?.bodyHtml, bodyText: match?.bodyText };
    saveCachedEmailBody(messageId, body);
    return body;
  }
}

export async function sendEmail(payload: SendEmailPayload): Promise<{ success: boolean; id: string }> {
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { success: true, id: `sent-${Date.now()}` };
  }
}

export async function saveDraft(payload: DraftPayload): Promise<{ id: string }> {
  return { id: payload.id || `draft-${Date.now()}` };
}

export async function moveEmail(messageId: string, targetFolderId: string): Promise<boolean> {
  return true;
}

export async function bulkMoveEmails(messageIds: string[], folderId: string): Promise<boolean> {
  return true;
}

export async function bulkDeleteEmails(messageIds: string[]): Promise<boolean> {
  return true;
}

export async function bulkMarkAsRead(messageIds: string[], isRead: boolean): Promise<boolean> {
  return true;
}

export async function markAsRead(messageId: string, isRead: boolean): Promise<boolean> {
  return true;
}

export async function bulkToggleFlag(messageIds: string[], isFlagged: boolean): Promise<boolean> {
  return true;
}

export async function deleteEmail(messageId: string): Promise<boolean> {
  return true;
}
