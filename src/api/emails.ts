import { MailMessage, MailMessageMetadata } from '@/types';
import { MOCK_EMAILS } from '@/lib/mock';
import { getClientConfig, isLiveApiAvailable } from '@/config/clientConfig';

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

/**
 * Fetch email metadata list for a folder (lightweight without heavy body HTML).
 */
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
    const data: MailMessage[] = await res.json();
    return data.map(({ bodyHtml, bodyText, ...meta }) => meta);
  } catch {
    await new Promise((r) => setTimeout(r, 70));
    return MOCK_EMAILS.filter((e) => {
      const matchFolder = e.folderId === folderId || folderId === 'fld-inbox';
      const matchAccount = !accountId || e.accountId === accountId;
      return matchFolder && matchAccount;
    }).map(({ bodyHtml, bodyText, ...meta }) => meta);
  }
}

/**
 * Fetch email message detail by ID.
 */
export async function getEmailById(messageId: string): Promise<MailMessage | null> {
  const match = MOCK_EMAILS.find((e) => e.id === messageId);
  return match || null;
}

/**
 * Fetch full body HTML / text for a selected email message on demand.
 */
export async function getEmailBody(
  messageId: string
): Promise<{ bodyHtml?: string; bodyText?: string }> {
  if (!isLiveApiAvailable()) {
    const match = MOCK_EMAILS.find((e) => e.id === messageId);
    return { bodyHtml: match?.bodyHtml, bodyText: match?.bodyText };
  }
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/fetch-email-body?messageId=${messageId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    await new Promise((r) => setTimeout(r, 60));
    const match = MOCK_EMAILS.find((e) => e.id === messageId);
    return { bodyHtml: match?.bodyHtml, bodyText: match?.bodyText };
  }
}

/**
 * Send an email message.
 */
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

export async function bulkToggleFlag(messageIds: string[], isFlagged: boolean): Promise<boolean> {
  return true;
}

export async function deleteEmail(messageId: string): Promise<boolean> {
  return true;
}

export async function markAsRead(messageId: string, isRead: boolean): Promise<boolean> {
  return true;
}

export async function toggleFlag(messageId: string, isFlagged: boolean): Promise<boolean> {
  return true;
}

export async function togglePin(messageId: string, isPinned: boolean): Promise<boolean> {
  return true;
}

/**
 * Search emails by query.
 */
export async function searchEmails(query: string, folderId?: string): Promise<MailMessageMetadata[]> {
  const q = query.toLowerCase();
  return MOCK_EMAILS.filter(
    (e) =>
      (!folderId || e.folderId === folderId) &&
      (e.subject.toLowerCase().includes(q) ||
        e.fromName.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q))
  ).map(({ bodyHtml, bodyText, ...meta }) => meta);
}
