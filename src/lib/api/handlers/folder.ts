import { apiClient } from '../client';
import { MailFolder } from '@/types';
import { MOCK_FOLDERS } from '@/lib/mock';
import { isLiveApiAvailable } from '@/config/clientConfig';

export { getQuota, type StorageQuotaInfo } from './folderQuota';

/**
 * Fetch all mailbox folders for a given account.
 */
export async function getFolders(accountId?: string): Promise<MailFolder[]> {
  if (!isLiveApiAvailable()) {
    return MOCK_FOLDERS.filter((f) => !accountId || f.accountId === accountId || !f.accountId);
  }

  try {
    const query = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
    const data = await apiClient.get<any>(`/fetch-mailboxes${query}`);
    const list = Array.isArray(data?.result)
      ? data.result
      : Array.isArray(data)
      ? data
      : Array.isArray(data?.result?.mailboxes)
      ? data.result.mailboxes
      : data?.mailboxes || MOCK_FOLDERS;
    return list;
  } catch {
    return MOCK_FOLDERS.filter((f) => !accountId || f.accountId === accountId || !f.accountId);
  }
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
  try {
    const res = await apiClient.patch<any>('/handle-mailbox-events?type=create', {
      mailbox: mailboxName,
    });
    return (
      res?.result || {
        id: `fld-${Date.now()}`,
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
  } catch {
    return {
      id: `fld-${Date.now()}`,
      accountId,
      displayName: name,
      fullName: mailboxName,
      parentFullName: parentFolderId || null,
      special: 'None',
      unreadCount: 0,
      totalCount: 0,
      sortRank: 99,
    };
  }
}

/**
 * Rename an existing folder.
 */
export async function renameFolder(
  folderId: string,
  newName: string,
  currentFullName?: string
): Promise<boolean> {
  try {
    await apiClient.patch('/handle-mailbox-events?type=rename', {
      mailbox: currentFullName || folderId,
      targetMailbox: newName,
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Delete a custom folder.
 */
export async function deleteFolder(folderId: string, fullName?: string): Promise<boolean> {
  try {
    await apiClient.patch('/handle-mailbox-events?type=delete', {
      mailbox: fullName || folderId,
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Empty all emails inside a folder (e.g. Trash or Junk).
 */
export async function emptyFolder(
  folderId: string
): Promise<{ deletedCount?: number; jobId?: string; message: string; success: boolean }> {
  try {
    const res = await apiClient.post<any>(`/folders/${encodeURIComponent(folderId)}/empty`);
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
    const data = await apiClient.get<any>(`/fetch-mailbox?folder=${encodeURIComponent(folder)}`);
    return data?.result || data;
  } catch {
    return null;
  }
}
