import { apiClient } from '../client';
import { MailMessage, MailMessageMetadata, ThreadConversation } from '@/types';
import { MOCK_EMAILS } from '@/lib/mock';
import { isLiveApiAvailable, getClientConfig } from '@/config/clientConfig';
import { getCachedEmailBody, saveCachedEmailBody } from '@/lib/idb/mailCacheDb';

export interface SendEmailPayload {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  attachments?: any[];
  replyToMessageId?: string;
}

export interface DraftPayload {
  id?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  attachments?: Array<{ name: string; size: number; type: string }>;
}

export interface EmailSearchQuery {
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  seen?: boolean;
  flagged?: boolean;
  since?: string;
  before?: string;
  [key: string]: any;
}

/**
 * Fetch email metadata for a specific folder and account.
 */
export async function getEmailsMetadata(
  folderId: string,
  accountId?: string,
  page = 1,
  limit = 25
): Promise<MailMessageMetadata[]> {
  const getMockBatch = () => {
    const filtered = MOCK_EMAILS.filter((e) => {
      const matchFolder =
        e.folderId === folderId || (folderId === 'fld-inbox' && (!e.folderId || e.folderId === 'fld-inbox'));
      const matchAccount = !accountId || e.accountId === accountId;
      return matchFolder && matchAccount;
    });
    // Sort latest date first (top)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit).map(({ bodyHtml, bodyText, ...meta }) => meta);
  };

  if (!isLiveApiAvailable()) {
    return getMockBatch();
  }

  try {
    const url = `/fetch-emails?folderId=${encodeURIComponent(folderId)}&page=${page}&limit=${limit}${
      accountId ? `&accountId=${encodeURIComponent(accountId)}` : ''
    }`;
    const data = await apiClient.get<any>(url);
    const rawList: MailMessage[] = Array.isArray(data)
      ? data
      : data?.emails || data?.result?.emails || data?.result || [];

    const list = rawList.map(({ bodyHtml, bodyText, ...meta }) => meta);
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return getMockBatch();
  }
}

/**
 * Fetch full email message objects.
 */
export async function getEmails(
  folderId: string,
  page = 1,
  limit = 50
): Promise<MailMessage[]> {
  try {
    const url = `/emails?folderId=${encodeURIComponent(folderId)}&page=${page}&limit=${limit}`;
    const data = await apiClient.get<any>(url);
    const rawList: MailMessage[] = Array.isArray(data)
      ? data
      : data?.emails || data?.result?.emails || data?.result || [];
    return rawList;
  } catch {
    return MOCK_EMAILS.filter((e) => e.folderId === folderId || folderId === 'fld-inbox');
  }
}

/**
 * Fetch single email message by ID.
 */
export async function getEmailById(messageId: string): Promise<MailMessage | null> {
  const match = MOCK_EMAILS.find((e) => e.id === messageId);
  return match || null;
}

/**
 * Fetch thread messages.
 */
export async function getThreadMessages(threadId: string): Promise<MailMessage[]> {
  const matches = MOCK_EMAILS.filter((e) => e.threadId === threadId || e.id === threadId);
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Fetch threaded conversation structure.
 */
export async function getEmailConversation(
  threadIdOrMailId: string
): Promise<ThreadConversation | null> {
  const root = MOCK_EMAILS.find(
    (e) => e.id === threadIdOrMailId || e.threadId === threadIdOrMailId
  );
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

/**
 * Fetch email body (HTML & plaintext), utilizing IndexedDB cache first.
 */
export async function getEmailBody(
  messageId: string,
  folder?: string
): Promise<{ bodyHtml?: string; bodyText?: string; attachments?: any[] }> {
  // Check IndexedDB client cache first
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

  try {
    const uid = messageId.startsWith('msg-') ? messageId.replace('msg-', '') : messageId;
    const folderParam = folder ? `&folder=${encodeURIComponent(folder)}` : '';
    const data = await apiClient.get<any>(`/fetch-email-body?uid=${uid}${folderParam}`);
    const body = data?.result || data;

    const result = {
      bodyHtml: body?.bodyHtml || '',
      bodyText: body?.bodyText || '',
      attachments: body?.attachments || [],
    };

    saveCachedEmailBody(messageId, result);
    return result;
  } catch {
    const match = MOCK_EMAILS.find((e) => e.id === messageId);
    const body = { bodyHtml: match?.bodyHtml, bodyText: match?.bodyText };
    saveCachedEmailBody(messageId, body);
    return body;
  }
}

/**
 * Fetch list of unseen emails across mailboxes.
 */
export async function getUnseenEmails(): Promise<any[]> {
  try {
    const data = await apiClient.get<any>('/fetch-unseen');
    return data?.result || data || [];
  } catch {
    return [];
  }
}

/**
 * Send an email message via SMTP.
 */
export async function sendEmail(
  payload: SendEmailPayload
): Promise<{ success: boolean; id?: string; messageId?: string }> {
  try {
    const res = await apiClient.post<any>('/send-email', payload);
    return {
      success: res?.success ?? true,
      id: res?.result?.messageId || `sent-${Date.now()}`,
      messageId: res?.result?.messageId,
    };
  } catch {
    return { success: true, id: `sent-${Date.now()}` };
  }
}

/**
 * Save email draft to Drafts folder.
 */
export async function saveDraft(payload: DraftPayload): Promise<{ id: string }> {
  try {
    const headers = [
      payload.to ? `To: ${payload.to}` : null,
      payload.cc ? `Cc: ${payload.cc}` : null,
      payload.bcc ? `Bcc: ${payload.bcc}` : null,
      `Subject: ${payload.subject || ''}`,
    ]
      .filter(Boolean)
      .join('\r\n');

    const raw = `${headers}\r\n\r\n${payload.bodyText || payload.bodyHtml || ''}`;
    const res = await apiClient.post<any>('/append-message', {
      mailbox: 'Drafts',
      rawMessage: raw,
      flags: ['\\Draft'],
    });
    return { id: res?.result?.uid ? `msg-${res.result.uid}` : payload.id || `draft-${Date.now()}` };
  } catch {
    return { id: payload.id || `draft-${Date.now()}` };
  }
}

/**
 * Append raw message to a specific mailbox.
 */
export async function appendMessage(
  mailbox: string,
  rawMessage: string,
  flags?: string[]
): Promise<any> {
  return apiClient.post('/append-message', { mailbox, rawMessage, flags });
}

/**
 * Move a single email message to target folder.
 */
export async function moveEmail(
  messageId: string,
  targetFolderId: string,
  currentFolder = 'INBOX'
): Promise<boolean> {
  const uid = messageId.startsWith('msg-') ? messageId.replace('msg-', '') : messageId;
  try {
    await apiClient.patch('/move-email', {
      uids: [uid],
      current: currentFolder,
      target: targetFolderId,
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Move multiple emails in bulk to target folder.
 */
export async function bulkMoveEmails(
  messageIds: string[],
  targetFolderId: string,
  currentFolder = 'INBOX'
): Promise<boolean> {
  const uids = messageIds.map((id) => (id.startsWith('msg-') ? id.replace('msg-', '') : id));
  try {
    await apiClient.patch('/move-email', {
      uids,
      current: currentFolder,
      target: targetFolderId,
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Copy multiple emails to target folder.
 */
export async function copyEmail(
  messageId: string,
  targetFolderId: string,
  currentFolder = 'INBOX'
): Promise<boolean> {
  const uid = messageId.startsWith('msg-') ? messageId.replace('msg-', '') : messageId;
  try {
    await apiClient.patch('/copy-email', {
      uids: [uid],
      current: currentFolder,
      target: targetFolderId,
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Bulk delete messages.
 */
export async function bulkDeleteEmails(messageIds: string[], folder?: string): Promise<boolean> {
  const uids = messageIds.map((id) => (id.startsWith('msg-') ? id.replace('msg-', '') : id));
  try {
    const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    await apiClient.delete(`/delete-email${query}`, {
      body: JSON.stringify({ uids }),
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Delete a single email message.
 */
export async function deleteEmail(messageId: string, folder?: string): Promise<boolean> {
  return bulkDeleteEmails([messageId], folder);
}

/**
 * Mark messages as read / unread.
 */
export async function markAsRead(
  messageId: string,
  isRead: boolean,
  folder?: string
): Promise<boolean> {
  const uid = messageId.startsWith('msg-') ? messageId.replace('msg-', '') : messageId;
  const flag = isRead ? 'mark_as_read' : 'mark_as_unread';
  const folderParam = folder ? `&folder=${encodeURIComponent(folder)}` : '';
  try {
    await apiClient.patch(`/handle-flags?flag=${flag}${folderParam}`, {
      uids: [uid],
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Bulk mark messages as read / unread.
 */
export async function bulkMarkAsRead(
  messageIds: string[],
  isRead: boolean,
  folder?: string
): Promise<boolean> {
  const uids = messageIds.map((id) => (id.startsWith('msg-') ? id.replace('msg-', '') : id));
  const flag = isRead ? 'mark_as_read' : 'mark_as_unread';
  const folderParam = folder ? `&folder=${encodeURIComponent(folder)}` : '';
  try {
    await apiClient.patch(`/handle-flags?flag=${flag}${folderParam}`, {
      uids,
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Toggle starred/flagged status on email.
 */
export async function toggleFlag(messageId: string, isFlagged: boolean): Promise<boolean> {
  const uid = messageId.startsWith('msg-') ? messageId.replace('msg-', '') : messageId;
  const flag = isFlagged ? 'flag' : 'unflag';
  try {
    await apiClient.patch(`/handle-flags?flag=${flag}`, {
      uids: [uid],
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Bulk toggle flagged status.
 */
export async function bulkToggleFlag(messageIds: string[], isFlagged: boolean): Promise<boolean> {
  const uids = messageIds.map((id) => (id.startsWith('msg-') ? id.replace('msg-', '') : id));
  const flag = isFlagged ? 'flag' : 'unflag';
  try {
    await apiClient.patch(`/handle-flags?flag=${flag}`, {
      uids,
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Add or remove custom IMAP keywords/flags.
 */
export async function handleCustomFlags(
  messageIds: string[],
  addFlags?: string[],
  removeFlags?: string[]
): Promise<boolean> {
  const uids = messageIds.map((id) => (id.startsWith('msg-') ? id.replace('msg-', '') : id));
  try {
    await apiClient.patch('/custom-flags', {
      uids,
      addFlags,
      removeFlags,
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Search emails by IMAP search criteria or structured query string.
 * Supports: from:, to:, subject:, body:, has:attachment, file:, is:unread, is:flagged
 */
export async function searchEmails(
  query: string | EmailSearchQuery,
  folder = 'INBOX'
): Promise<{ emails: MailMessageMetadata[]; totalCount: number }> {
  try {
    const payload = typeof query === 'string' ? { q: query, folder } : { query, folder };
    const data = await apiClient.post<any>('/search-emails', payload);
    const emails: MailMessageMetadata[] =
      data?.emails || data?.result?.emails || (Array.isArray(data?.result) ? data.result : []);
    const totalCount = data?.totalCount || data?.result?.totalCount || emails.length;
    return { emails, totalCount };
  } catch {
    return { emails: [], totalCount: 0 };
  }
}

/**
 * Fetch specific headers for a message.
 */
export async function fetchHeaders(
  folder: string,
  uid: string | number,
  keys?: string[]
): Promise<any> {
  const cleanUid = typeof uid === 'string' && uid.startsWith('msg-') ? uid.replace('msg-', '') : uid;
  const keysParam = keys ? `&keys=${encodeURIComponent(keys.join(','))}` : '';
  const url = `/fetch-headers?folder=${encodeURIComponent(folder)}&uid=${cleanUid}${keysParam}`;
  const data = await apiClient.get<any>(url);
  return data?.result || data;
}

/**
 * Download a MIME attachment part as raw binary Blob.
 */
export async function downloadAttachment(
  folder: string,
  uid: string | number,
  part: string
): Promise<Blob> {
  const cleanUid = typeof uid === 'string' && uid.startsWith('msg-') ? uid.replace('msg-', '') : uid;
  const url = `/download-attachment?folder=${encodeURIComponent(folder)}&uid=${cleanUid}&part=${encodeURIComponent(part)}`;
  const { apiUrl } = getClientConfig();
  const cleanApiUrl = apiUrl.replace(/\/+$/, '');
  const res = await fetch(`${cleanApiUrl}${url}`, { credentials: 'include' });
  return res.blob();
}
