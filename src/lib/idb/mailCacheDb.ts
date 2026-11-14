import { IDB, type TableSchema } from '@enjoys/react-api/idb';
import { type EntityTable } from 'dexie';
import { MailMessageMetadata } from '@/types';

export interface CachedEmailMetadata extends MailMessageMetadata {
  cachedAt: number;
}

export interface CachedEmailBody {
  id: string;
  bodyHtml?: string;
  bodyText?: string;
  cachedAt: number;
}

export type MailDbTables = {
  emails: EntityTable<CachedEmailMetadata, 'id'>;
  email_bodies: EntityTable<CachedEmailBody, 'id'>;
};

const schema: any = {
  emails: 'id,folderId,accountId,cachedAt',
  email_bodies: 'id,cachedAt',
};

let idbInstance: IDB<MailDbTables> | null = null;

function getIdb(): IDB<MailDbTables> | null {
  if (typeof window === 'undefined') return null;
  if (!idbInstance) {
    try {
      idbInstance = new IDB<MailDbTables>(schema, 'airsend-mail-cache', 1);
    } catch (err) {
      console.warn('[IndexedDB] Initialization failed:', err);
      return null;
    }
  }
  return idbInstance;
}

export async function saveCachedEmails(emails: MailMessageMetadata[]): Promise<void> {
  const idb = getIdb();
  if (!idb || emails.length === 0) return;
  try {
    const now = Date.now();
    const records: CachedEmailMetadata[] = emails.map((e) => ({ ...e, cachedAt: now }));
    await idb.bulkPutItems('emails', records);
  } catch (err) {
    console.warn('[IndexedDB] Failed to save emails:', err);
  }
}

export async function getCachedEmails(folderId?: string, accountId?: string): Promise<MailMessageMetadata[]> {
  const idb = getIdb();
  if (!idb) return [];
  try {
    const all = await idb.getAllItems('emails');
    return (all as unknown as CachedEmailMetadata[]).filter((e) => {
      const matchFolder = !folderId || folderId === 'fld-inbox' ? !e.folderId || e.folderId === 'fld-inbox' : e.folderId === folderId;
      const matchAccount = !accountId || !e.accountId || e.accountId === accountId;
      return matchFolder && matchAccount;
    });
  } catch (err) {
    console.warn('[IndexedDB] Failed to retrieve cached emails:', err);
    return [];
  }
}

export async function saveCachedEmailBody(id: string, body: { bodyHtml?: string; bodyText?: string }): Promise<void> {
  const idb = getIdb();
  if (!idb) return;
  try {
    await idb.putItem('email_bodies', { id, ...body, cachedAt: Date.now() });
  } catch (err) {
    console.warn('[IndexedDB] Failed to save email body:', err);
  }
}

export async function getCachedEmailBody(id: string): Promise<{ bodyHtml?: string; bodyText?: string } | null> {
  const idb = getIdb();
  if (!idb) return null;
  try {
    const record = await idb.getItemByKey('email_bodies', id);
    if (!record) return null;
    return { bodyHtml: record.bodyHtml, bodyText: record.bodyText };
  } catch (err) {
    console.warn('[IndexedDB] Failed to get cached email body:', err);
    return null;
  }
}

export async function getCachedCount(): Promise<number> {
  const idb = getIdb();
  if (!idb) return 0;
  try {
    return await idb.countItems('emails');
  } catch {
    return 0;
  }
}

export async function clearCachedEmails(): Promise<void> {
  const idb = getIdb();
  if (!idb) return;
  try {
    await idb.clearTable('emails');
    await idb.clearTable('email_bodies');
  } catch (err) {
    console.warn('[IndexedDB] Failed to clear cached emails:', err);
  }
}

