import type { QueryClient } from '@tanstack/react-query';
import { useFolderStore } from '@/stores/useFolderStore';
import { groupFoldersByAccount, inboxQuotaFromPayload, normalizeMailboxes } from '@/lib/mailboxPayload';

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
  }
}
