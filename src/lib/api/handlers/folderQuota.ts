import { apiClient } from '../client';

export interface StorageQuotaInfo {
  storage: {
    used: number;
    limit: number;
    percentage: number;
  };
  messages: {
    used: number;
    limit: number;
  };
}

/**
 * Retrieve storage quota info for a mailbox.
 */
export async function getQuota(folder = 'INBOX'): Promise<StorageQuotaInfo> {
  const data = await apiClient.get<any>(`/quota?folder=${encodeURIComponent(folder)}`);
  const quota = data?.quota || data?.result;
  if (!quota?.storage) {
    throw new Error('Quota information is not available for this mailbox.');
  }
  return quota;
}
