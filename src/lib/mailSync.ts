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

/**
 * Message-list sync policy ("fetch once, then read from the local copy"):
 *
 * - A folder is fetched from the backend the first time it is opened, then
 *   marked as fetched in IndexedDB. From then on it is served from IndexedDB
 *   with no request.
 * - Changes reach the local copy through the live event stream
 *   (`refreshFolderEmails`), a manual sync (`force`), or "load more" for older
 *   pages. The backend stays the source of truth: what it returns wins.
 * - Lists carry message metadata only; bodies are fetched separately, on demand.
 */

export const PAGE_SIZE = 25;

export interface FolderEmails {
  emails: MailMessageMetadata[];
  pagesLoaded: number;
  hasMore: boolean;
  /** True when no request was made. */
  fromCache: boolean;
}

export const newestFirst = (a: MailMessageMetadata, b: MailMessageMetadata) =>
  new Date(b.date).getTime() - new Date(a.date).getTime();

/**
 * The folder's first page(s). Served from the local copy when the folder was
 * fetched before; otherwise (or with `force`) from the backend, which then
 * replaces the local copy.
 */
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
        // Messages the user is deleting/moving right now stay off the list until the server answers.
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

/** An older page ("Load more"). It is added to the local copy so the next visit shows it without a request. */
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

/**
 * Live update (the event stream reported a change in this folder): fetch the
 * newest page and merge it into the local copy, keeping older pages already
 * stored. If the new page does not overlap what is stored (more arrived than
 * one page holds, so there would be a gap) the local copy is replaced instead.
 */
export async function refreshFolderEmails(
  folder: Pick<MailFolder, 'id' | 'fullName' | 'accountId' | 'totalCount'>,
  accountId: string | undefined
): Promise<FolderEmails> {
  const page = await emailsApi.getEmailsMetadata(folder, accountId, 1, PAGE_SIZE);
  const state = await getFolderSyncState(folder.id);
  const cached = state ? await getCachedEmails(folder.id, accountId) : [];

  // The page as the server sent it decides overlap and paging; what is stored/shown leaves out messages being deleted/moved.
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
