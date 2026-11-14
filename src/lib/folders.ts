import type { MailFolder, SpecialFolder } from '@/types';

/**
 * Folder helpers. The backend is the single source of truth for folder ids,
 * paths and classification (`special`); nothing here assumes a particular id.
 */

// ── Display label ─────────────────────────────────────────────────────────────

/**
 * Display label only (never use it as an id or path): lowercase everything,
 * then capitalize once. "INBOX" -> "Inbox", "SENT ITEMS" -> "Sent items".
 */
export function folderLabel(name: string | undefined | null): string {
  const lower = (name ?? '').trim().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// ── Registry (plain module so non-React code, e.g. API handlers, can resolve folders) ──

const registry = new Map<string, MailFolder>();

/** Replaces everything known about one account's folders (the backend list wins). */
export function replaceRegisteredFolders(accountId: string, folders: MailFolder[]): void {
  for (const [id, folder] of registry) {
    if (folder.accountId === accountId) registry.delete(id);
  }
  for (const folder of folders) registry.set(folder.id, folder);
}

export function clearRegisteredFolders(): void {
  registry.clear();
}

export function getRegisteredFolder(id?: string | null): MailFolder | undefined {
  return id ? registry.get(id) : undefined;
}

/**
 * Turns a folder id into the IMAP path the backend expects. Anything that is
 * not a known id (e.g. a path that is already a path) is returned unchanged.
 */
export function toFolderPath(idOrPath?: string | null): string | undefined {
  if (!idOrPath) return undefined;
  return registry.get(idOrPath)?.fullName ?? idOrPath;
}

/** Every folder the backend listed for an account (all accounts when omitted), in server order. */
export function listRegisteredFolders(accountId?: string): MailFolder[] {
  return Array.from(registry.values()).filter((f) => !accountId || f.accountId === accountId);
}

/** The folder an event refers to by IMAP path (e.g. the event stream's `path`). */
export function findRegisteredFolderByPath(path: string, accountId?: string): MailFolder | undefined {
  for (const folder of registry.values()) {
    if (folder.fullName === path && (!accountId || folder.accountId === accountId)) return folder;
  }
  return undefined;
}

/** First registered folder with this classification, optionally limited to an account. */
export function findRegisteredSpecialFolder(
  special: SpecialFolder,
  accountId?: string
): MailFolder | undefined {
  for (const folder of registry.values()) {
    if (folder.special === special && (!accountId || folder.accountId === accountId)) return folder;
  }
  return undefined;
}

// ── Classification helpers ───────────────────────────────────────────────────

export function findSpecialFolder(
  folders: readonly MailFolder[] | undefined,
  special: SpecialFolder
): MailFolder | undefined {
  return folders?.find((f) => f.special === special);
}

export const isTrashOrJunkFolder = (folder?: Pick<MailFolder, 'special'> | null): boolean =>
  folder?.special === 'Trash' || folder?.special === 'Junk';

export const isCustomFolder = (folder: Pick<MailFolder, 'special'>): boolean =>
  folder.special === 'Custom' || folder.special === 'None';

// ── URL slugs (derived from backend data, e.g. #inbox, #sent, #my-projects) ───

const slugify = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function folderSlug(folder: Pick<MailFolder, 'id' | 'special' | 'fullName' | 'displayName'>): string {
  if (folder.special && !isCustomFolder(folder as Pick<MailFolder, 'special'>)) {
    return folder.special.toLowerCase();
  }
  return slugify(folder.fullName || folder.displayName || '') || folder.id.toLowerCase();
}

// Names older links and other clients use for the standard folders.
const SPECIAL_ALIASES: Record<string, SpecialFolder> = {
  'sent items': 'Sent',
  'deleted': 'Trash',
  'deleted items': 'Trash',
  'junk email': 'Junk',
  'spam': 'Junk',
};

/** Resolves a URL slug (or legacy folder name) to a folder from the backend list. */
export function findFolderBySlug(
  folders: readonly MailFolder[] | undefined,
  rawSlug: string | null | undefined
): MailFolder | undefined {
  if (!folders?.length || !rawSlug) return undefined;

  let wanted = rawSlug;
  try {
    wanted = decodeURIComponent(rawSlug);
  } catch {
    // keep the raw value
  }
  wanted = wanted.trim().toLowerCase().replace(/^fld-/, '');
  if (!wanted) return undefined;

  const alias = SPECIAL_ALIASES[wanted];
  return (
    folders.find((f) => folderSlug(f) === wanted) ??
    folders.find((f) => f.id.toLowerCase().replace(/^fld-/, '') === wanted) ??
    folders.find((f) => slugify(f.fullName) === slugify(wanted)) ??
    (alias ? findSpecialFolder(folders, alias) : undefined)
  );
}

/** Legacy `/mail?folder=` values to a slug the client can resolve. */
export function legacyFolderParamToSlug(param?: string | null): string {
  return (param || 'inbox').replace(/^fld-/, '') || 'inbox';
}
