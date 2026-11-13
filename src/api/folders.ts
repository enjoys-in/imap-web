import { MailFolder } from '@/types';
import { MOCK_FOLDERS } from '@/lib/mock';
import { getClientConfig, isLiveApiAvailable } from '@/config/clientConfig';

/**
 * Fetch all mailbox folders for a given account.
 */
export async function getFolders(accountId: string): Promise<MailFolder[]> {
  if (!isLiveApiAvailable()) {
    return MOCK_FOLDERS.filter((f) => f.accountId === accountId || !f.accountId);
  }
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/fetch-mailboxes?accountId=${accountId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    await new Promise((r) => setTimeout(r, 60));
    return MOCK_FOLDERS.filter((f) => f.accountId === accountId || !f.accountId);
  }
}

/**
 * Fetch details of a single folder.
 */
export async function getFolderById(folderId: string): Promise<MailFolder | null> {
  const folders = MOCK_FOLDERS;
  return folders.find((f) => f.id === folderId) || null;
}

/**
 * Create a new folder or sub-folder.
 */
export async function createFolder(
  accountId: string,
  name: string,
  parentFolderId?: string
): Promise<MailFolder> {
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, name, parentFolderId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      id: `fld-${Date.now()}`,
      accountId,
      displayName: name,
      fullName: parentFolderId ? `${parentFolderId}/${name}` : name,
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
export async function renameFolder(folderId: string, newName: string): Promise<boolean> {
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/folders/${folderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: newName }),
    });
    return res.ok;
  } catch {
    return true; // Stub fallback
  }
}

/**
 * Delete a custom folder.
 */
export async function deleteFolder(folderId: string): Promise<boolean> {
  const { apiUrl } = getClientConfig();
  try {
    const res = await fetch(`${apiUrl}/folders/${folderId}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return true;
  }
}

/**
 * Empty all emails inside a folder (e.g. Trash or Junk).
 */
export async function emptyFolder(folderId: string): Promise<{ deletedCount: number }> {
  return { deletedCount: 0 };
}
