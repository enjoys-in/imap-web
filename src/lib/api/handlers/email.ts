import { apiClient } from '../client';
import { MailFolder, MailMessage, MailMessageMetadata, ThreadConversation } from '@/types';
import { getClientConfig } from '@/config/clientConfig';
import { toFolderPath, getRegisteredFolder, findRegisteredSpecialFolder } from '@/lib/folders';
import { flagBody, folderQuery, mutate, toUids, transferBody, withQuery, type MutationResult } from './messageRequest';
import {
  getCachedEmailBody,
  saveCachedEmailBody,
  getCachedEmailById,
  getCachedThread,
} from '@/lib/idb/mailCacheDb';

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

export async function getEmailsMetadata(
  folder: Pick<MailFolder, 'id' | 'fullName'>,
  accountId?: string,
  page = 1,
  limit = 25
): Promise<MailMessageMetadata[]> {
  const url = `/fetch-emails?folder=${encodeURIComponent(folder.fullName)}&page=${page}&limit=${limit}${
    accountId ? `&accountId=${encodeURIComponent(accountId)}` : ''
  }`;
  const data = await apiClient.get<any>(url);
  const rawList: MailMessage[] = Array.isArray(data?.result)
    ? data.result
    : Array.isArray(data)
    ? data
    : data?.result?.emails || data?.emails || [];

  const list: MailMessageMetadata[] = rawList.map(({ bodyHtml, bodyText, ...meta }) => ({
    ...meta,
    folderId: folder.id,
  }));
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Fetch full email message objects.
 */
export async function getEmails(
  folderId: string,
  page = 1,
  limit = 50
): Promise<MailMessage[]> {
  const folder = encodeURIComponent(toFolderPath(folderId) ?? folderId);
  const url = `/emails?folder=${folder}&page=${page}&limit=${limit}`;
  const data = await apiClient.get<any>(url);
  const rawList: MailMessage[] = Array.isArray(data?.result)
    ? data.result
    : Array.isArray(data)
    ? data
    : data?.result?.emails || data?.emails || [];
  return rawList;
}

export async function getEmailById(messageId: string): Promise<MailMessage | null> {
  const meta = await getCachedEmailById(messageId);
  if (!meta) return null;
  const body = await getCachedEmailBody(meta.folderId, messageId);
  return { ...meta, bodyHtml: body?.bodyHtml, bodyText: body?.bodyText };
}

export async function getThreadMessages(threadId: string): Promise<MailMessage[]> {
  const matches = await getCachedThread(threadId);
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Fetch threaded conversation structure.
 */
export async function getEmailConversation(
  threadIdOrMailId: string
): Promise<ThreadConversation | null> {
  const root = await getEmailById(threadIdOrMailId);
  const threadId = root?.threadId || threadIdOrMailId;
  const messages = await getThreadMessages(threadId);
  const first = messages[0] || root;
  if (!first) return null;

  return {
    threadId,
    subject: first.subject,
    totalMessages: messages.length,
    unreadCount: messages.filter((m) => !m.isRead).length,
    messages,
    rootMessageId: first.id,
    lastActivityDate: messages[messages.length - 1]?.date || first.date,
  };
}

export async function getEmailBody(
  messageId: string,
  folderId?: string
): Promise<{ bodyHtml?: string; bodyText?: string; attachments?: any[] }> {
  const cacheFolder = folderId ?? '';
  const cached = await getCachedEmailBody(cacheFolder, messageId);
  if (cached && (cached.bodyHtml || cached.bodyText)) {
    return cached;
  }

  const uid = messageId.startsWith('msg-') ? messageId.replace('msg-', '') : messageId;
  const path = toFolderPath(folderId);
  const folderParam = path ? `&folder=${encodeURIComponent(path)}` : '';
  const data = await apiClient.get<any>(`/fetch-email-body?uid=${uid}${folderParam}`);
  const body = data?.result || data;

  const result = {
    bodyHtml: body?.bodyHtml || '',
    bodyText: body?.bodyText || '',
    attachments: body?.attachments || [],
  };

  saveCachedEmailBody(cacheFolder, messageId, result);
  return result;
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
): Promise<{ success: boolean; message: string; result?: any; id?: string; messageId?: string }> {
  try {
    const res = await apiClient.post<any>('/send-email', payload);
    const result = res?.result || res;
    return {
      success: res?.success ?? true,
      message: res?.message || 'Email sent successfully',
      result,
      id: result?.messageId || result?.id || res?.messageId || `sent-${Date.now()}`,
      messageId: result?.messageId || result?.id || res?.messageId,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to send email',
      id: `sent-${Date.now()}`,
    };
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
      mailbox: findRegisteredSpecialFolder('Drafts')?.fullName ?? 'Drafts',
      rawMessage: raw,
      flags: ['\\Draft', '\\Seen'],
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

export const moveEmail = (messageId: string, targetFolderId: string, currentFolder = 'INBOX'): Promise<MutationResult | null> =>
  bulkMoveEmails([messageId], targetFolderId, currentFolder);

export const bulkMoveEmails = (
  messageIds: readonly string[],
  targetFolderId: string,
  currentFolder = 'INBOX'
): Promise<MutationResult | null> =>
  mutate(() => apiClient.patch('/move-email', transferBody(messageIds, targetFolderId, currentFolder)));

export const copyEmail = (messageId: string, targetFolderId: string, currentFolder = 'INBOX'): Promise<MutationResult | null> =>
  mutate(() => apiClient.patch('/copy-email', transferBody([messageId], targetFolderId, currentFolder)));

export const bulkDeleteEmails = (messageIds: readonly string[], folder?: string): Promise<MutationResult | null> =>
  mutate(() =>
    apiClient.delete(withQuery('/delete-email', folderQuery(folder)), {
      body: JSON.stringify({ uids: toUids(messageIds) }),
    })
  );

export const deleteEmail = (messageId: string, folder?: string): Promise<MutationResult | null> =>
  bulkDeleteEmails([messageId], folder);

const patchFlag = (flag: string, messageIds: readonly string[], folder?: string): Promise<MutationResult | null> =>
  mutate(() =>
    apiClient.patch(withQuery('/handle-flags', `flag=${flag}`, folderQuery(folder)), {
      uids: toUids(messageIds),
    })
  );

export const markAsRead = (messageId: string, isRead: boolean, folder?: string): Promise<MutationResult | null> =>
  patchFlag(isRead ? 'mark_as_read' : 'mark_as_unread', [messageId], folder);

export const bulkMarkAsRead = (messageIds: readonly string[], isRead: boolean, folder?: string): Promise<MutationResult | null> =>
  patchFlag(isRead ? 'mark_as_read' : 'mark_as_unread', messageIds, folder);

export const markAllAsRead = (folder: string): Promise<MutationResult | null> => patchFlag('mark_all_as_read', [], folder);

export const toggleFlag = (messageId: string, isFlagged: boolean, folder?: string): Promise<MutationResult | null> =>
  patchFlag(isFlagged ? 'flag' : 'unflag', [messageId], folder);

export const bulkToggleFlag = (messageIds: readonly string[], isFlagged: boolean, folder?: string): Promise<MutationResult | null> =>
  patchFlag(isFlagged ? 'flag' : 'unflag', messageIds, folder);

export const handleCustomFlags = (
  messageIds: readonly string[],
  addFlags?: string[],
  removeFlags?: string[],
  folder?: string
): Promise<MutationResult | null> =>
  mutate(() => apiClient.patch('/custom-flags', flagBody(messageIds, folder, addFlags, removeFlags)));

/**
 * Search emails by IMAP search criteria or structured query string.
 * Supports: from:, to:, subject:, body:, has:attachment, file:, is:unread, is:flagged
 */
export async function searchEmails(
  query: string | EmailSearchQuery,
  folder = 'INBOX'
): Promise<{ emails: MailMessageMetadata[]; totalCount: number }> {
  try {
    const folderPath = toFolderPath(folder) ?? folder;
    const payload = typeof query === 'string' ? { q: query, folder: folderPath } : { query, folder: folderPath };
    const data = await apiClient.post<any>('/search-emails', payload);
    const result = data?.result || data;
    const emails: MailMessageMetadata[] = Array.isArray(result)
      ? result
      : Array.isArray(result?.emails)
      ? result.emails
      : Array.isArray(data?.emails)
      ? data.emails
      : [];
    const totalCount = result?.totalCount ?? data?.totalCount ?? emails.length;
    const searched = getRegisteredFolder(folder);
    return {
      emails: searched ? emails.map((e) => ({ ...e, folderId: searched.id })) : emails,
      totalCount,
    };
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
  const url = `/fetch-headers?folder=${encodeURIComponent(toFolderPath(folder) ?? folder)}&uid=${cleanUid}${keysParam}`;
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
  const url = `/download-attachment?folder=${encodeURIComponent(toFolderPath(folder) ?? folder)}&uid=${cleanUid}&part=${encodeURIComponent(part)}`;
  const { apiUrl } = getClientConfig();
  const cleanApiUrl = apiUrl.replace(/\/+$/, '');
  const res = await fetch(`${cleanApiUrl}${url}`, { credentials: 'include' });
  return res.blob();
}
