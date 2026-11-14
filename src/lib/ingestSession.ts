import type { QueryClient } from '@tanstack/react-query';
import { useFolderStore } from '@/stores/useFolderStore';
import { groupFoldersByAccount, inboxQuotaFromPayload, normalizeMailboxes } from '@/lib/mailboxPayload';

/**
 * The backend sends the mailbox's folders (and, when it signs you in, the INBOX
 * quota) inside `/authenticate`, `/validate` and `/me`. Feed that payload in here
 * so the local database and the stores are updated from it, instead of asking
 * `/fetch-mailboxes` and `/quota` for the same data a moment later.
 *
 * - Folders: stored only if they differ from what is held (see
 *   `useFolderStore.applyServerFolders`): nothing for an unchanged list, just the
 *   counts when only counts moved, the whole list when folders changed.
 * - Quota: put in the query cache, so the quota widgets need no request.
 *
 * Never throws: a payload without a mailbox list simply changes nothing, and the
 * folder store falls back to asking the backend when it has nothing at all.
 */
export async function ingestSessionPayload(
  payload: unknown,
  options: { queryClient?: QueryClient; accountId?: string } = {}
): Promise<void> {
  try {
    const mailboxes = typeof payload === 'object' && payload !== null ? (payload as { mailboxes?: unknown }).mailboxes : undefined;
    const folders = normalizeMailboxes(mailboxes, options.accountId ?? '');
    const store = useFolderStore.getState();
    for (const [accountId, list] of groupFoldersByAccount(folders)) {
      if (accountId) await store.applyServerFolders(accountId, list);
    }

    const quota = inboxQuotaFromPayload(payload);
    if (quota && options.queryClient) {
      options.queryClient.setQueryData(['quota', 'INBOX'], quota);
    }
  } catch {
    // Local bookkeeping must never break signing in.
  }
}
