
const held = new Map<string, number>();

export const REMOVAL_GRACE_MS = 30_000;

const keyOf = (folderId: string, id: string) => `${folderId}|${id}`;

export function holdRemoval(folderId: string, ids: string[]): void {
  for (const id of ids) held.set(keyOf(folderId, id), Infinity);
}

export function settleRemoval(folderId: string, ids: string[], accepted: boolean, now = Date.now()): void {
  for (const id of ids) {
    if (accepted) held.set(keyOf(folderId, id), now + REMOVAL_GRACE_MS);
    else held.delete(keyOf(folderId, id));
  }
}

export function isRemovalHeld(folderId: string, id: string, now = Date.now()): boolean {
  const key = keyOf(folderId, id);
  const expiry = held.get(key);
  if (expiry === undefined) return false;
  if (expiry <= now) {
    held.delete(key);
    return false;
  }
  return true;
}

export function withoutHeld<T extends { folderId: string; id: string }>(rows: T[], now = Date.now()): T[] {
  if (held.size === 0) return rows;
  return rows.filter((row) => !isRemovalHeld(row.folderId, row.id, now));
}

export function clearRemovalHolds(): void {
  held.clear();
}
