import { apiClient } from '../client';
import { MailFolder } from '@/types';
import { toFolderPath } from '@/lib/folders';

export { getQuota, type StorageQuotaInfo } from './folderQuota';

/**
 * Fetch all mailbox folders for a given account.
 */
export async function getFolders(accountId?: string): Promise<MailFolder[]> {
  const query = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  const data = await apiClient.get<any>(`/fetch-mailboxes${query}`);
  const list = Array.isArray(data?.result)
    ? data.result
    : Array.isArray(data)
    ? data
    : Array.isArray(data?.result?.mailboxes)
    ? data.result.mailboxes
    : data?.mailboxes;
  return Array.isArray(list) ? list : [];
}

/**
 * Fetch details of a single folder by ID.
 */
export async function getFolderById(folderId: string): Promise<MailFolder | null> {
  const folders = await getFolders();
  return folders.find((f) => f.id === folderId) || null;
}

/**
 * Create a new mailbox folder.
 */
export async function createFolder(
  accountId: string,
  name: string,
  parentFolderId?: string
): Promise<MailFolder> {
  const mailboxName = parentFolderId ? `${parentFolderId}/${name}` : name;
  const res = await apiClient.patch<any>('/handle-mailbox-events?type=create', {
    mailbox: mailboxName,
  });
  return (
    res?.result || {
      id: `fld-${mailboxName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      accountId,
      displayName: name,
      fullName: mailboxName,
      parentFullName: parentFolderId || null,
      special: 'None',
      unreadCount: 0,
      totalCount: 0,
      sortRank: 99,
    }
  );
}

/**
 * Rename an existing folder.
 */
export async function renameFolder(
  folderId: string,
  newName: string,
  currentFullName?: string
): Promise<boolean> {
  await apiClient.patch('/handle-mailbox-events?type=rename', {
    mailbox: currentFullName || folderId,
    targetMailbox: newName,
  });
  return true;
}

/**
 * Delete a custom folder.
 */
export async function deleteFolder(folderId: string, fullName?: string): Promise<boolean> {
  await apiClient.patch('/handle-mailbox-events?type=delete', {
    mailbox: fullName || folderId,
  });
  return true;
}

/**
 * Empty all emails inside a folder (e.g. Trash or Junk).
 */
export async function emptyFolder(
  folderId: string
): Promise<{ deletedCount?: number; jobId?: string; message: string; success: boolean }> {
  try {
    const res = await apiClient.post<any>(`/folders/${encodeURIComponent(toFolderPath(folderId) ?? folderId)}/empty`);
    return {
      success: res?.success ?? true,
      message: res?.message || 'Folder emptied successfully',
      deletedCount: res?.result?.deletedCount ?? res?.deletedCount ?? 0,
      jobId: res?.result?.jobId || res?.jobId,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to empty folder',
      deletedCount: 0,
    };
  }
}

/**
 * Fetch hierarchical mailbox tree.
 */
export async function getMailboxTree(): Promise<any> {
  try {
    const data = await apiClient.get<any>('/mailbox-tree');
    return data?.result || data;
  } catch {
    return null;
  }
}

/**
 * Trigger global sync of all mailboxes.
 */
export async function syncCompleteMailbox(): Promise<any> {
  try {
    const data = await apiClient.get<any>('/sync-all');
    return data?.result || data;
  } catch {
    return null;
  }
}

/**
 * Trigger sync of a single folder.
 */
export async function syncSingleFolder(folder: string): Promise<any> {
  try {
    const data = await apiClient.get<any>(`/fetch-mailbox?folder=${encodeURIComponent(toFolderPath(folder) ?? folder)}`);
    return data?.result || data;
  } catch {
    return null;
  }
}
