import { IDB } from '@enjoys/react-api/idb';
import type { Table } from 'dexie';
import type { Account, MailFolder, MailMessageMetadata } from '@/types';

export interface CachedEmailMetadata extends MailMessageMetadata {
  cachedAt: number;
}

export interface CachedEmailBody {
  key: string;
  id: string;
  folderId: string;
  bodyHtml?: string;
  bodyText?: string;
  attachments?: any[];
  cachedAt: number;
}

export interface FolderSyncState {
  folderId: string;
  accountId: string;
  pagesLoaded: number;
  hasMore: boolean;
  totalCount: number;
  syncedAt: number;
}

type CachedFolder = MailFolder & { cachedAt: number };
type CachedAccount = Account & { cachedAt: number };

export type MailDbTables = {
  emails: Table<CachedEmailMetadata, [string, string]>;
  email_bodies: Table<CachedEmailBody, string>;
  folders: Table<CachedFolder, string>;
  accounts: Table<CachedAccount, string>;
  folder_sync: Table<FolderSyncState, string>;
};

const schema: any = {
  emails: '[folderId+id],id,folderId,accountId,threadId,cachedAt',
  email_bodies: 'key,cachedAt',
  folders: 'id,accountId',
  accounts: 'id',
  folder_sync: 'folderId,accountId',
};

const DB_NAME = 'airsend-mail-cache-v3';
const LEGACY_DB_NAMES = ['airsend-mail-cache', 'airsend-mail-cache-v2'];

let idbInstance: IDB<MailDbTables> | null = null;

function getIdb(): IDB<MailDbTables> | null {
  if (typeof window === 'undefined') return null;
  if (!idbInstance) {
    try {
      for (const legacy of LEGACY_DB_NAMES) {
        try {
          window.indexedDB?.deleteDatabase(legacy);
        } catch {}
      }
      idbInstance = new IDB<MailDbTables>(schema, DB_NAME, 2);
    } catch (err) {
      console.warn('[IndexedDB] Initialization failed:', err);
      return null;
    }
  }
  return idbInstance;
}

async function withDb<T>(
  run: (db: ReturnType<IDB<MailDbTables>['getRawDb']>) => Promise<T>,
  fallback: T
): Promise<T> {
  const idb = getIdb();
  if (!idb) return fallback;
  try {
    return await run(idb.getRawDb());
  } catch (err) {
    console.warn('[IndexedDB] Operation failed:', err);
    return fallback;
  }
}

function stripCachedAt<T extends { cachedAt: number }>(record: T): Omit<T, 'cachedAt'> {
  const copy: Partial<T> = { ...record };
  delete copy.cachedAt;
  return copy as Omit<T, 'cachedAt'>;
}

const bodyKey = (folderId: string, id: string) => `${folderId}::${id}`;

export async function saveCachedEmails(emails: MailMessageMetadata[]): Promise<void> {
  const now = Date.now();
  const records: CachedEmailMetadata[] = emails
    .filter((e) => e.id && e.folderId)
    .map((e) => {
      const meta: Partial<MailMessageMetadata> & { bodyHtml?: string; bodyText?: string } = { ...e };
      delete meta.bodyHtml;
      delete meta.bodyText;
      return { ...(meta as MailMessageMetadata), cachedAt: now };
    });
  if (records.length === 0) return;
  await withDb((db) => db.emails.bulkPut(records).then(() => undefined), undefined);
}

export async function getCachedEmails(folderId?: string, accountId?: string): Promise<MailMessageMetadata[]> {
  return withDb(async (db) => {
    const rows = folderId
      ? await db.emails.where('folderId').equals(folderId).toArray()
      : await db.emails.toArray();
    return rows
      .filter((e) => !accountId || !e.accountId || e.accountId === accountId)
      .map(stripCachedAt) as MailMessageMetadata[];
  }, []);
}

export async function getCachedEmailById(id: string): Promise<MailMessageMetadata | null> {
  return withDb(async (db) => {
    const record = await db.emails.where('id').equals(id).first();
    return record ? (stripCachedAt(record) as MailMessageMetadata) : null;
  }, null);
}

export async function getCachedThread(threadId: string): Promise<MailMessageMetadata[]> {
  if (!threadId) return [];
  return withDb(async (db) => {
    const rows = await db.emails.where('threadId').equals(threadId).toArray();
    return rows.map(stripCachedAt) as MailMessageMetadata[];
  }, []);
}

export async function saveCachedEmailBody(
  folderId: string,
  id: string,
  body: { bodyHtml?: string; bodyText?: string; attachments?: any[] }
): Promise<void> {
  await withDb(
    (db) =>
      db.email_bodies
        .put({ key: bodyKey(folderId, id), id, folderId, ...body, cachedAt: Date.now() })
        .then(() => undefined),
    undefined
  );
}

export async function getCachedEmailBody(
  folderId: string,
  id: string
): Promise<{ bodyHtml?: string; bodyText?: string; attachments?: any[] } | null> {
  return withDb(async (db) => {
    const record = await db.email_bodies.get(bodyKey(folderId, id));
    if (!record) return null;
    return { bodyHtml: record.bodyHtml, bodyText: record.bodyText, attachments: record.attachments };
  }, null);
}

export async function getCachedFolders(accountId: string): Promise<MailFolder[]> {
  return withDb(async (db) => {
    const rows = await db.folders.where('accountId').equals(accountId).toArray();
    return rows.map(stripCachedAt) as MailFolder[];
  }, []);
}

export async function replaceCachedFolders(
  accountId: string,
  folders: MailFolder[]
): Promise<{ dropped: string[] }> {
  const now = Date.now();
  return withDb(
    (db) =>
      db.transaction('rw', db.folders, db.emails, db.folder_sync, async () => {
        const previous = await db.folders.where('accountId').equals(accountId).toArray();
        const incoming = new Map(folders.map((f) => [f.id, f]));

        const dropped: string[] = [];
        for (const old of previous) {
          const current = incoming.get(old.id);
          if (!current || old.uidValidity !== current.uidValidity) dropped.push(old.id);
        }
        for (const id of dropped) {
          await db.emails.where('folderId').equals(id).delete();
          await db.folder_sync.delete(id);
        }

        await db.folders.where('accountId').equals(accountId).delete();
        await db.folders.bulkPut(folders.map((f) => ({ ...f, cachedAt: now })));
        return { dropped };
      }),
    { dropped: [] as string[] }
  );
}

export async function getFolderSyncState(folderId: string): Promise<FolderSyncState | null> {
  return withDb(async (db) => (await db.folder_sync.get(folderId)) ?? null, null);
}

export async function getFolderSyncStates(accountId: string): Promise<FolderSyncState[]> {
  return withDb((db) => db.folder_sync.where('accountId').equals(accountId).toArray(), []);
}

export async function saveFolderSyncState(state: FolderSyncState): Promise<void> {
  await withDb((db) => db.folder_sync.put(state).then(() => undefined), undefined);
}

export async function replaceFolderEmails(
  folderId: string,
  emails: MailMessageMetadata[],
  state: FolderSyncState
): Promise<void> {
  const now = Date.now();
  const records: CachedEmailMetadata[] = emails
    .filter((e) => e.id)
    .map((e) => {
      const meta: Partial<MailMessageMetadata> & { bodyHtml?: string; bodyText?: string } = { ...e, folderId };
      delete meta.bodyHtml;
      delete meta.bodyText;
      return { ...(meta as MailMessageMetadata), cachedAt: now };
    });
  await withDb(
    (db) =>
      db.transaction('rw', db.emails, db.folder_sync, async () => {
        await db.emails.where('folderId').equals(folderId).delete();
        await db.emails.bulkPut(records);
        await db.folder_sync.put(state);
      }),
    undefined
  );
}

export async function deleteCachedEmails(folderId: string, ids: string[]): Promise<void> {
  if (!folderId || ids.length === 0) return;
  await withDb((db) => db.emails.bulkDelete(ids.map((id) => [folderId, id] as [string, string])), undefined);
}

export async function patchCachedEmail(
  folderId: string,
  id: string,
  patch: Partial<MailMessageMetadata>
): Promise<void> {
  await withDb((db) => db.emails.update([folderId, id], patch).then(() => undefined), undefined);
}

export async function shiftFolderSyncTotal(folderId: string, delta: number): Promise<void> {
  if (!folderId || !delta) return;
  await withDb(
    (db) =>
      db.folder_sync
        .where('folderId')
        .equals(folderId)
        .modify((state) => {
          state.totalCount = Math.max(0, (Number(state.totalCount) || 0) + delta);
        })
        .then(() => undefined),
    undefined
  );
}

export async function invalidateFolderSync(folderId: string): Promise<void> {
  if (!folderId) return;
  await withDb((db) => db.folder_sync.delete(folderId), undefined);
}

export async function clearFolderCache(folderId: string): Promise<void> {
  if (!folderId) return;
  await withDb(
    (db) =>
      db.transaction('rw', db.emails, db.folder_sync, async () => {
        await db.emails.where('folderId').equals(folderId).delete();
        await db.folder_sync.delete(folderId);
      }),
    undefined
  );
}

export async function updateCachedFolderCounts(
  changes: Array<Pick<MailFolder, 'id' | 'unreadCount' | 'totalCount' | 'lastSyncedAt'>>
): Promise<void> {
  if (changes.length === 0) return;
  const now = Date.now();
  await withDb(
    (db) =>
      db.transaction('rw', db.folders, async () => {
        for (const { id, unreadCount, totalCount, lastSyncedAt } of changes) {
          await db.folders.update(id, {
            unreadCount,
            totalCount,
            ...(lastSyncedAt ? { lastSyncedAt } : {}),
            cachedAt: now,
          });
        }
      }),
    undefined
  );
}

export async function getCachedAccounts(): Promise<Account[]> {
  return withDb(async (db) => (await db.accounts.toArray()).map(stripCachedAt) as Account[], []);
}

export async function replaceCachedAccounts(accounts: Account[]): Promise<void> {
  const now = Date.now();
  await withDb(
    (db) =>
      db.transaction('rw', db.accounts, async () => {
        await db.accounts.clear();
        await db.accounts.bulkPut(accounts.map((a) => ({ ...a, cachedAt: now })));
      }),
    undefined
  );
}

export async function getCachedCount(): Promise<number> {
  return withDb((db) => db.emails.count(), 0);
}

export async function clearCachedEmails(): Promise<void> {
  await withDb(
    (db) =>
      db.transaction('rw', db.emails, db.email_bodies, db.folders, db.accounts, db.folder_sync, async () => {
        await Promise.all([
          db.emails.clear(),
          db.email_bodies.clear(),
          db.folders.clear(),
          db.accounts.clear(),
          db.folder_sync.clear(),
        ]);
      }),
    undefined
  );
}
