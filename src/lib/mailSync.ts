import { emailsApi } from '@/lib/api';
import {
  getCachedEmails,
  getFolderSyncState,
  replaceFolderEmails,
  saveCachedEmails,
  saveFolderSyncState,
} from '@/lib/idb/mailCacheDb';
import { withoutHeld } from '@/lib/pendingRemovals';
import type { MailFolder, MailMessageMetadata } from '@/types';

export const PAGE_SIZE = 25;

export interface FolderEmails {
  emails: MailMessageMetadata[];
  pagesLoaded: number;
  hasMore: boolean;
  fromCache: boolean;
}

export const newestFirst = (a: MailMessageMetadata, b: MailMessageMetadata) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

export async function loadFolderEmails(
  folder: Pick<MailFolder, 'id' | 'fullName' | 'accountId' | 'totalCount'>,
  accountId: string | undefined,
  options: { force?: boolean } = {}
): Promise<FolderEmails> {
  if (!options.force) {
    const state = await getFolderSyncState(folder.id);
    if (state) {
      const cached = await getCachedEmails(folder.id, accountId);
      return {
        emails: withoutHeld(cached).sort(newestFirst),
        pagesLoaded: state.pagesLoaded,
        hasMore: state.hasMore,
        fromCache: true,
      };
    }
  }

  const page = await emailsApi.getEmailsMetadata(folder, accountId, 1, PAGE_SIZE);
  const hasMore = page.length >= PAGE_SIZE;
  const fresh = withoutHeld(page);
  await replaceFolderEmails(folder.id, fresh, {
    folderId: folder.id,
    accountId: folder.accountId,
    pagesLoaded: 1,
    hasMore,
    totalCount: Number(folder.totalCount) || 0,
    syncedAt: Date.now(),
  });
  return { emails: fresh, pagesLoaded: 1, hasMore, fromCache: false };
}

export async function loadMoreFolderEmails(
  folder: Pick<MailFolder, 'id' | 'fullName' | 'accountId' | 'totalCount'>,
  accountId: string | undefined,
  page: number
): Promise<{ fresh: MailMessageMetadata[]; hasMore: boolean }> {
  const olderPage = await emailsApi.getEmailsMetadata(folder, accountId, page, PAGE_SIZE);
  const hasMore = olderPage.length >= PAGE_SIZE;
  const fresh = withoutHeld(olderPage);
  await saveCachedEmails(fresh);

  const state = await getFolderSyncState(folder.id);
  await saveFolderSyncState({
    folderId: folder.id,
    accountId: folder.accountId,
    totalCount: Number(folder.totalCount) || 0,
    ...state,
    pagesLoaded: page,
    hasMore,
    syncedAt: Date.now(),
  });
  return { fresh, hasMore };
}

export async function refreshFolderEmails(
  folder: Pick<MailFolder, 'id' | 'fullName' | 'accountId' | 'totalCount'>,
  accountId: string | undefined
): Promise<FolderEmails> {
  const page = await emailsApi.getEmailsMetadata(folder, accountId, 1, PAGE_SIZE);
  const state = await getFolderSyncState(folder.id);
  const cached = state ? await getCachedEmails(folder.id, accountId) : [];

  const storedIds = new Set(cached.map((e) => e.id));
  const overlaps = cached.length === 0 || page.some((e) => storedIds.has(e.id));
  const fresh = withoutHeld(page);

  if (!state || !overlaps) {
    const hasMore = page.length >= PAGE_SIZE;
    await replaceFolderEmails(folder.id, fresh, {
      folderId: folder.id,
      accountId: folder.accountId,
      pagesLoaded: 1,
      hasMore,
      totalCount: Number(folder.totalCount) || 0,
      syncedAt: Date.now(),
    });
    return { emails: fresh, pagesLoaded: 1, hasMore, fromCache: false };
  }

  await saveCachedEmails(fresh);
  await saveFolderSyncState({ ...state, totalCount: Number(folder.totalCount) || 0, syncedAt: Date.now() });
  const merged = await getCachedEmails(folder.id, accountId);
  return {
    emails: withoutHeld(merged).sort(newestFirst),
    pagesLoaded: state.pagesLoaded,
    hasMore: state.hasMore,
    fromCache: false,
  };
}
