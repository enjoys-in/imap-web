import { toFolderPath } from '@/lib/folders';
import type { StorageQuotaInfo } from './folderQuota';

export type FolderRef = string | undefined;

export interface TransferBody {
  uids: string[];
  current: string | undefined;
  target: string | undefined;
}

export interface FlagBody {
  uids: string[];
  addFlags?: string[];
  removeFlags?: string[];
  folder?: string;
}

export const toUid = (id: string): string => id.replace(/^msg-/, '');

export const toUids = (ids: readonly string[]): string[] => ids.map(toUid);

export const folderQuery = (folder: FolderRef): string => {
  const path = toFolderPath(folder);
  return path ? `folder=${encodeURIComponent(path)}` : '';
};

export const withQuery = (endpoint: string, ...parts: string[]): string => {
  const query = parts.filter(Boolean).join('&');
  return query ? `${endpoint}?${query}` : endpoint;
};

export const transferBody = (ids: readonly string[], target: FolderRef, current: FolderRef): TransferBody => ({
  uids: toUids(ids),
  current: toFolderPath(current),
  target: toFolderPath(target),
});

export const flagBody = (
  ids: readonly string[],
  folder: FolderRef,
  addFlags?: string[],
  removeFlags?: string[]
): FlagBody => ({
  uids: toUids(ids),
  addFlags,
  removeFlags,
  folder: toFolderPath(folder),
});

export interface MutationFolder {
  path: string;
  totalCount: number;
  unreadCount: number;
}

export interface MutationResult {
  folders: MutationFolder[];
  quota: StorageQuotaInfo | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isMutationFolder = (value: unknown): value is MutationFolder =>
  isRecord(value) &&
  typeof value.path === 'string' &&
  typeof value.totalCount === 'number' &&
  typeof value.unreadCount === 'number';

export const readMutationResult = (response: unknown): MutationResult => {
  const body = isRecord(response) ? response : {};
  return {
    folders: Array.isArray(body.folders) ? body.folders.filter(isMutationFolder) : [],
    quota: isRecord(body.quota) && isRecord(body.quota.storage) ? (body.quota as unknown as StorageQuotaInfo) : null,
  };
};

export async function mutate(request: () => Promise<unknown>): Promise<MutationResult | null> {
  try {
    return readMutationResult(await request());
  } catch {
    return null;
  }
}
