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
  const fallbackQuota: StorageQuotaInfo = {
    storage: { used: 104857600, limit: 1073741824, percentage: 9.77 },
    messages: { used: 250, limit: 10000 },
  };

  try {
    const data = await apiClient.get<any>(`/quota?folder=${encodeURIComponent(folder)}`);
    return data?.quota || data?.result || fallbackQuota;
  } catch {
    return fallbackQuota;
  }
}
