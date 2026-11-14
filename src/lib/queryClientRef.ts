import type { QueryClient } from '@tanstack/react-query';
import type { StorageQuotaInfo } from '@/lib/api/handlers/folderQuota';

const INBOX_QUOTA_KEY = ['quota', 'INBOX'] as const;

let client: QueryClient | null = null;

export function registerQueryClient(next: QueryClient): void {
  client = next;
}

export function setInboxQuota(quota: StorageQuotaInfo | null | undefined): void {
  if (quota?.storage) client?.setQueryData(INBOX_QUOTA_KEY, quota);
}

export function invalidateQuota(): void {
  void client?.invalidateQueries({ queryKey: ['quota'] });
}
