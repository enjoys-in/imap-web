'use client';

import { useMemo } from 'react';
import { useMailStore } from '@/stores';
import { parseEmailSearchQuery, matchesEmailFilter } from '@/lib/searchParser';
import { MailMessageMetadata } from '@/types';

export function useMailListFilterSort(activeFolderId?: string) {
  const localEmails = useMailStore((s) => s.localEmails);
  const serverSearchResults = useMailStore((s) => s.serverSearchResults);
  const searchQuery = useMailStore((s) => s.searchQuery);
  const filterTab = useMailStore((s) => s.filterTab);
  const sortField = useMailStore((s) => s.sortField);
  const sortDirection = useMailStore((s) => s.sortDirection);

  const filteredEmails = useMemo(() => {
    const list = serverSearchResults !== null ? serverSearchResults : localEmails;
    const filter = parseEmailSearchQuery(searchQuery);

    const filtered = list.filter((e) => {
      if (!serverSearchResults && activeFolderId && activeFolderId !== 'fld-inbox' && e.folderId !== activeFolderId) {
        return false;
      }
      if (filterTab === 'unread' && e.isRead) return false;
      if (filterTab === 'flagged' && !e.isFlagged) return false;
      if (filterTab === 'pinned' && !e.isPinned) return false;
      if (filterTab === 'attachments' && !e.hasAttachments) return false;
      return searchQuery.trim() ? matchesEmailFilter(e, filter) : true;
    });

    // Sort: Default latest date first (top)
    return filtered.slice().sort((a, b) => {
      if (sortField === 'from') {
        const fromA = a.fromName || a.fromAddress;
        const fromB = b.fromName || b.fromAddress;
        return sortDirection === 'desc' ? fromB.localeCompare(fromA) : fromA.localeCompare(fromB);
      }
      if (sortField === 'subject') {
        const subjA = a.subject || '';
        const subjB = b.subject || '';
        return sortDirection === 'desc' ? subjB.localeCompare(subjA) : subjA.localeCompare(subjB);
      }
      if (sortField === 'size') {
        const sizeA = a.size || 0;
        const sizeB = b.size || 0;
        return sortDirection === 'asc' ? sizeA - sizeB : sizeB - sizeA;
      }
      // Default: By Date
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }, [localEmails, serverSearchResults, activeFolderId, filterTab, searchQuery, sortField, sortDirection]);

  const pinnedEmails = useMemo(() => filteredEmails.filter((e) => e.isPinned), [filteredEmails]);
  const unpinnedEmails = useMemo(() => filteredEmails.filter((e) => !e.isPinned), [filteredEmails]);
  const currentIds = useMemo(() => filteredEmails.map((e) => e.id), [filteredEmails]);

  return {
    filteredEmails,
    pinnedEmails,
    unpinnedEmails,
    currentIds,
  };
}
