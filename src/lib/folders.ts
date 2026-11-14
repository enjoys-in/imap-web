import type { MailFolder, SpecialFolder } from '@/types';

export function folderLabel(name: string | undefined | null): string {
  const lower = (name ?? '').trim().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

const registry = new Map<string, MailFolder>();

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

export function toFolderPath(idOrPath?: string | null): string | undefined {
  if (!idOrPath) return undefined;
  return registry.get(idOrPath)?.fullName ?? idOrPath;
}

export function listRegisteredFolders(accountId?: string): MailFolder[] {
  return Array.from(registry.values()).filter((f) => !accountId || f.accountId === accountId);
}

export function findRegisteredFolderByPath(path: string, accountId?: string): MailFolder | undefined {
  for (const folder of registry.values()) {
    if (folder.fullName === path && (!accountId || folder.accountId === accountId)) return folder;
  }
  return undefined;
}

export function findRegisteredSpecialFolder(
  special: SpecialFolder,
  accountId?: string
): MailFolder | undefined {
  for (const folder of registry.values()) {
    if (folder.special === special && (!accountId || folder.accountId === accountId)) return folder;
  }
  return undefined;
}

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

const slugify = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function folderSlug(folder: Pick<MailFolder, 'id' | 'special' | 'fullName' | 'displayName'>): string {
  if (folder.special && !isCustomFolder(folder as Pick<MailFolder, 'special'>)) {
    return folder.special.toLowerCase();
  }
  return slugify(folder.fullName || folder.displayName || '') || folder.id.toLowerCase();
}

const SPECIAL_ALIASES: Record<string, SpecialFolder> = {
  'sent items': 'Sent',
  'deleted': 'Trash',
  'deleted items': 'Trash',
  'junk email': 'Junk',
  'spam': 'Junk',
};

export function findFolderBySlug(
  folders: readonly MailFolder[] | undefined,
  rawSlug: string | null | undefined
): MailFolder | undefined {
  if (!folders?.length || !rawSlug) return undefined;

  let wanted = rawSlug;
  try {
    wanted = decodeURIComponent(rawSlug);
  } catch {
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

export function legacyFolderParamToSlug(param?: string | null): string {
  return (param || 'inbox').replace(/^fld-/, '') || 'inbox';
}
