'use client';

import { useMemo } from 'react';
import { useMailStore } from '@/stores/useMailStore';

export interface MailContact {
  id: string;
  name: string;
  email: string;
}

/**
 * Contacts are the people found in the signed-in user's own mail: every
 * distinct sender in the currently loaded messages, sorted by name.
 */
export function useMailContacts(): MailContact[] {
  const localEmails = useMailStore((s) => s.localEmails);

  return useMemo(() => {
    const byAddress = new Map<string, MailContact>();
    for (const m of localEmails) {
      const email = (m.fromAddress || '').trim().toLowerCase();
      if (!email || byAddress.has(email)) continue;
      byAddress.set(email, { id: email, name: (m.fromName || '').trim() || email, email });
    }
    return Array.from(byAddress.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [localEmails]);
}
