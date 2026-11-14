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

type CachedFolder = MailFolder & { cachedAt: number };
type CachedAccount = Account & { cachedAt: number };

export type MailDbTables = {
  emails: Table<CachedEmailMetadata, [string, string]>;
  email_bodies: Table<CachedEmailBody, string>;
  folders: Table<CachedFolder, string>;
  accounts: Table<CachedAccount, string>;
};

const schema: any = {
  emails: '[folderId+id],id,folderId,accountId,threadId,cachedAt',
  email_bodies: 'key,cachedAt',
  folders: 'id,accountId',
  accounts: 'id',
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
      idbInstance = new IDB<MailDbTables>(schema, DB_NAME, 1);
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

export async function replaceCachedFolders(accountId: string, folders: MailFolder[]): Promise<void> {
  const now = Date.now();
  await withDb(
    (db) =>
      db.transaction('rw', db.folders, async () => {
        await db.folders.where('accountId').equals(accountId).delete();
        await db.folders.bulkPut(folders.map((f) => ({ ...f, cachedAt: now })));
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
      db.transaction('rw', db.emails, db.email_bodies, db.folders, db.accounts, async () => {
        await Promise.all([db.emails.clear(), db.email_bodies.clear(), db.folders.clear(), db.accounts.clear()]);
      }),
    undefined
  );
}
