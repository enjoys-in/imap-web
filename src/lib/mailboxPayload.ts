import type { MailFolder, SpecialFolder } from '@/types';
import type { StorageQuotaInfo } from '@/lib/api/handlers/folderQuota';

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw => typeof value === 'object' && value !== null;
const text = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : value === undefined || value === null ? fallback : String(value);
const count = (value: unknown): number => Number(value) || 0;

export function normalizeMailbox(raw: unknown, fallbackAccountId = ''): MailFolder | null {
  if (!isRecord(raw) || raw.id === undefined || raw.id === null) return null;
  const fullName = text(raw.fullName ?? raw.path ?? raw.name);
  return {
    id: text(raw.id),
    accountId: raw.accountId ? text(raw.accountId) : fallbackAccountId,
    fullName,
    displayName: text(raw.displayName ?? raw.name, fullName),
    parentFullName: raw.parentFullName == null ? null : text(raw.parentFullName),
    special: text(raw.special, 'Custom') as SpecialFolder,
    uidValidity: raw.uidValidity == null ? undefined : count(raw.uidValidity),
    unreadCount: count(raw.unreadCount ?? raw.unseen_count),
    totalCount: count(raw.totalCount ?? raw.total_count),
    lastSyncedAt: raw.lastSyncedAt == null ? undefined : text(raw.lastSyncedAt),
    sortRank: count(raw.sortRank) || 99,
  };
}

export function normalizeMailboxes(raw: unknown, fallbackAccountId = ''): MailFolder[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeMailbox(item, fallbackAccountId)).filter((f): f is MailFolder => f !== null);
}

export function inboxQuotaFromPayload(payload: unknown): StorageQuotaInfo | null {
  if (!isRecord(payload) || !isRecord(payload.quota)) return null;
  const inbox = payload.quota.inbox;
  if (!isRecord(inbox) || !isRecord(inbox.storage)) return null;
  if (typeof inbox.storage.used !== 'number' || typeof inbox.storage.limit !== 'number') return null;
  return inbox as unknown as StorageQuotaInfo;
}

export function groupFoldersByAccount(folders: MailFolder[]): Map<string, MailFolder[]> {
  const groups = new Map<string, MailFolder[]>();
  for (const folder of folders) {
    const list = groups.get(folder.accountId);
    if (list) list.push(folder);
    else groups.set(folder.accountId, [folder]);
  }
  return groups;
}
