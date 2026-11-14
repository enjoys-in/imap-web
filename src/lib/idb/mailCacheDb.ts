import { IDB } from '@enjoys/react-api/idb';
import type { Table } from 'dexie';
import type { Account, MailFolder, MailMessageMetadata } from '@/types';

/**
 * Local copy of server data. The backend is the source of truth: every sync
 * replaces what is stored here, and this copy only provides instant first paint
 * and offline reading.
 *
 * - emails: message METADATA only (never a body), keyed by folder + id because
 *   an IMAP uid ("msg-1") is only unique within one folder.
 * - email_bodies: bodies, stored only after the user opened the message.
 * - folders / accounts: the lists the backend returned.
 * - folder_sync: per-folder marker saying "this folder was fetched from the
 *   backend". While it exists the folder is served from here without a request;
 *   it is removed (so the next open fetches) when the backend reports a change.
 */

export interface CachedEmailMetadata extends MailMessageMetadata {
  cachedAt: number;
}

export interface CachedEmailBody {
  key: string; // `${folderId}::${id}`
  id: string;
  folderId: string;
  bodyHtml?: string;
  bodyText?: string;
  attachments?: any[];
  cachedAt: number;
}

/** Written when a folder's messages were fetched from the backend. */
export interface FolderSyncState {
  folderId: string;
  accountId: string;
  /** How many 25-message pages are stored locally. */
  pagesLoaded: number;
  /** Whether the backend has older messages beyond the stored pages. */
  hasMore: boolean;
  /** The folder's message count when it was fetched; a different count later means it changed. */
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
// Earlier builds used these databases (one was seeded with mock mail); drop them.
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

/** Runs `run` against the database; any failure (or no IndexedDB) yields `fallback`. */
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

// ── Message metadata ─────────────────────────────────────────────────────────

export async function saveCachedEmails(emails: MailMessageMetadata[]): Promise<void> {
  const now = Date.now();
  const records: CachedEmailMetadata[] = emails
    .filter((e) => e.id && e.folderId)
    .map((e) => {
      // Metadata only: a list never stores (or sends) a body.
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

// ── Message bodies (only after the user requested them) ──────────────────────

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

// ── Folders & accounts (backend list replaces the stored copy) ───────────────

export async function getCachedFolders(accountId: string): Promise<MailFolder[]> {
  return withDb(async (db) => {
    const rows = await db.folders.where('accountId').equals(accountId).toArray();
    return rows.map(stripCachedAt) as MailFolder[];
  }, []);
}

/**
 * Replaces an account's folders with the backend list. Messages cached for a
 * folder the backend no longer has, or whose UIDVALIDITY changed (every stored
 * uid is meaningless after that), are discarded in the same transaction.
 * Returns the ids of the folders whose messages were discarded.
 */
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

// ── Per-folder sync state & message maintenance ──────────────────────────────

export async function getFolderSyncState(folderId: string): Promise<FolderSyncState | null> {
  return withDb(async (db) => (await db.folder_sync.get(folderId)) ?? null, null);
}

export async function getFolderSyncStates(accountId: string): Promise<FolderSyncState[]> {
  return withDb((db) => db.folder_sync.where('accountId').equals(accountId).toArray(), []);
}

export async function saveFolderSyncState(state: FolderSyncState): Promise<void> {
  await withDb((db) => db.folder_sync.put(state).then(() => undefined), undefined);
}

/** Stores a freshly fetched folder: its messages replace what was stored and the folder is marked as fetched. */
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

/** Updates fields of one stored message (e.g. read/flagged after a server event); no-op if it is not stored. */
export async function patchCachedEmail(
  folderId: string,
  id: string,
  patch: Partial<MailMessageMetadata>
): Promise<void> {
  await withDb(
    (db) => db.emails.where('[folderId+id]').equals([folderId, id]).modify(patch).then(() => undefined),
    undefined
  );
}

/** Forgets that a folder was fetched, so the next open asks the backend again. */
export async function invalidateFolderSync(folderId: string): Promise<void> {
  if (!folderId) return;
  await withDb((db) => db.folder_sync.delete(folderId), undefined);
}

/** Drops a folder's stored messages and its fetched marker. */
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

// ── Housekeeping ─────────────────────────────────────────────────────────────

export async function getCachedCount(): Promise<number> {
  return withDb((db) => db.emails.count(), 0);
}

/** Clears the whole local copy (used on logout and from the offline settings). */
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
