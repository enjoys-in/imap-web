import { MOCK_ACCOUNTS } from '@/lib/mock';
import { Account } from '@/types';

/**
 * Resolves an account from a numerical user index (e.g. 0, 1, 2)
 * matching modern multi-account URL paths like /mail/u/0/ or /mail/u/1/.
 */
export function getAccountByUserIndex(userIndex: number | string | undefined): Account {
  const parsed = typeof userIndex === 'string' ? parseInt(userIndex, 10) : userIndex;
  const idx = isNaN(parsed as number) || (parsed as number) < 0 ? 0 : (parsed as number);
  return MOCK_ACCOUNTS[idx] || MOCK_ACCOUNTS[0];
}

/**
 * Finds the numerical index of an account by its ID.
 */
export function getUserIndexByAccountId(accountId: string): number {
  const index = MOCK_ACCOUNTS.findIndex((a) => a.id === accountId);
  return index >= 0 ? index : 0;
}

/**
 * Generates an account-scoped mail URL matching modern web mail structure.
 * e.g. /mail/u/0/#inbox or /mail/u/1/#inbox/msg-jeelan
 */
export function getAccountMailPath(
  userIndex: number | string = 0,
  folderSlug = 'inbox',
  mailId?: string | null
): string {
  const parsed = typeof userIndex === 'string' ? parseInt(userIndex, 10) : userIndex;
  const idx = isNaN(parsed) || parsed < 0 ? 0 : parsed;
  const hashPart = mailId ? `#${folderSlug}/${mailId}` : `#${folderSlug}`;
  return `/mail/u/${idx}/${hashPart}`;
}
