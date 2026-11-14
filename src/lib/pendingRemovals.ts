/**
 * Messages the user deleted or moved whose request is still on its way (or only
 * just finished).
 *
 * A message list can be on the wire while the user acts: the server answered it
 * before it had processed the delete, so the answer still contains the message.
 * Without this guard that stale list would bring the message back, on screen and
 * in the local copy, even though the delete succeeded.
 *
 * Ids are IMAP uids, which a folder never reuses, so holding `folder + id` for a
 * short while cannot hide a different message.
 */

const held = new Map<string, number>(); // `${folderId}|${id}` -> expiry time (Infinity while the request is in flight)

/** How long a confirmed removal keeps filtering stale lists that were already on the wire. */
export const REMOVAL_GRACE_MS = 30_000;

const keyOf = (folderId: string, id: string) => `${folderId}|${id}`;

export function holdRemoval(folderId: string, ids: string[]): void {
  for (const id of ids) held.set(keyOf(folderId, id), Infinity);
}

/**
 * The request finished. When the server accepted it the messages stay filtered for
 * a grace period (a list fetched before the delete may still arrive); when it
 * refused, they are released at once so the server's list shows them again.
 */
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

/** `rows` without the messages that are being, or were just, deleted or moved away. */
export function withoutHeld<T extends { folderId: string; id: string }>(rows: T[], now = Date.now()): T[] {
  if (held.size === 0) return rows;
  return rows.filter((row) => !isRemovalHeld(row.folderId, row.id, now));
}

export function clearRemovalHolds(): void {
  held.clear();
}
