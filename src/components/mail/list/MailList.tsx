'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useMailStore } from '@/stores';
import { useAccountSettingsStore } from '@/stores/useAccountSettingsStore';
import { MailListItem } from './MailListItem';
import { MailListHeader } from './MailListHeader';
import { MailItemContextMenu } from './MailItemContextMenu';
import { MailThreadSubItems } from './MailThreadSubItems';
import { MOCK_THREAD_SUB_MESSAGES } from '@/lib/mock/emails';
import { MailMessage, MailMessageMetadata } from '@/types';
import { ChevronDown, Loader2, X } from 'lucide-react';
import { parseEmailSearchQuery, matchesEmailFilter } from '@/lib/searchParser';

interface MailListProps {
  activeFolderId?: string;
  activeMailId?: string;
  onSelectMail?: (mailId: string) => void;
  width?: number;
}

export function MailList({
  activeFolderId,
  activeMailId,
  onSelectMail,
  width,
}: MailListProps) {
  const localEmails = useMailStore((s) => s.localEmails);
  const serverSearchResults = useMailStore((s) => s.serverSearchResults);
  const isSearchingServer = useMailStore((s) => s.isSearchingServer);
  const clearSearch = useMailStore((s) => s.clearSearch);
  const selectedMailId = useMailStore((s) => s.selectedMailId);
  const selectedIds = useMailStore((s) => s.selectedIds);
  const searchQuery = useMailStore((s) => s.searchQuery);
  const filterTab = useMailStore((s) => s.filterTab);

  const setSelectedMail = useMailStore((s) => s.setSelectedMail);
  const toggleSelectId = useMailStore((s) => s.toggleSelectId);
  const toggleFlag = useMailStore((s) => s.toggleFlag);
  const togglePin = useMailStore((s) => s.togglePin);
  const markAsRead = useMailStore((s) => s.markAsRead);
  const deleteEmail = useMailStore((s) => s.deleteEmail);

  const selectedAccountId = useMailStore((s) => s.selectedAccountId);
  const getSettings = useAccountSettingsStore((s) => s.getSettings);
  const cardsRows = getSettings(selectedAccountId).appearance.cardsViewRows;

  const [contextMenu, setContextMenu] = useState<{
    email: MailMessageMetadata | MailMessage;
    position: { x: number; y: number };
  } | null>(null);

  const activeId = activeMailId || selectedMailId;

  const filteredEmails = useMemo(() => {
    const candidateList = serverSearchResults !== null ? serverSearchResults : localEmails;
    const parsedFilter = parseEmailSearchQuery(searchQuery);

    return candidateList.filter((email) => {
      if (!serverSearchResults && activeFolderId && activeFolderId !== 'fld-inbox' && email.folderId !== activeFolderId) {
        return false;
      }
      if (filterTab === 'unread' && email.isRead) return false;
      if (filterTab === 'flagged' && !email.isFlagged) return false;
      if (filterTab === 'pinned' && !email.isPinned) return false;
      if (filterTab === 'attachments' && !email.hasAttachments) return false;

      if (searchQuery.trim()) {
        return matchesEmailFilter(email, parsedFilter);
      }
      return true;
    });
  }, [localEmails, serverSearchResults, activeFolderId, filterTab, searchQuery]);

  const pinnedEmails = useMemo(() => filteredEmails.filter((e) => e.isPinned), [filteredEmails]);
  const unpinnedEmails = useMemo(() => filteredEmails.filter((e) => !e.isPinned), [filteredEmails]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const currentIds = useMemo(() => filteredEmails.map((e) => e.id), [filteredEmails]);

  const handleSelect = useCallback(
    (id: string) => {
      if (onSelectMail) onSelectMail(id);
      else setSelectedMail(id === activeId ? null : id);
    },
    [onSelectMail, setSelectedMail, activeId]
  );

  const [expandedThreadIds, setExpandedThreadIds] = useState<Set<string>>(new Set());

  const handleToggleThreadExpand = useCallback((id: string) => {
    setExpandedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleContextMenu = (e: React.MouseEvent, email: MailMessageMetadata | MailMessage) => {
    e.preventDefault();
    setContextMenu({ email, position: { x: e.clientX, y: e.clientY } });
  };

  return (
    <div
      style={{ width: width ? `${width}px` : undefined }}
      className="w-full md:w-80 lg:w-96 flex flex-col h-full border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1f1f1f] shrink-0 select-none transition-colors"
    >
      <MailListHeader totalEmailsCount={filteredEmails.length} currentEmailIds={currentIds} />

      {/* Active Search Filter Banner */}
      {searchQuery.trim() && (
        <div className="px-3 py-1.5 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
          <div className="flex items-center gap-1.5 truncate">
            {isSearchingServer ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
            ) : null}
            <span className="truncate">
              Search: <strong className="font-semibold">{searchQuery}</strong> ({filteredEmails.length} results)
            </span>
          </div>
          <button
            onClick={clearSearch}
            className="text-blue-700 dark:text-blue-400 hover:text-red-600 dark:hover:text-red-400 text-[11px] underline shrink-0 cursor-pointer ml-2"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Pinned Emails Section */}
        {pinnedEmails.length > 0 && (
          <div>
            {pinnedEmails.map((email) => (
              <MailListItem
                key={`pin-${email.id}`} email={email} isSelected={email.id === activeId}
                isChecked={selectedSet.has(email.id)} hasAnySelection={selectedIds.length > 0}
                cardsRows={cardsRows} onSelect={handleSelect} onToggleCheck={toggleSelectId}
                onToggleFlag={toggleFlag} onTogglePin={togglePin} onToggleRead={markAsRead}
                onDelete={deleteEmail} onContextMenu={handleContextMenu}
              />
            ))}
          </div>
        )}

        {/* This Month Grouping Header */}
        {unpinnedEmails.length > 0 && (
          <div>
            <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-white bg-neutral-100 dark:bg-[#252525] border-y border-neutral-200 dark:border-neutral-800">
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-300" />
              <span>This Month</span>
            </div>

            {unpinnedEmails.map((email) => {
              const isExpanded = expandedThreadIds.has(email.id);
              const mockSubEmails = MOCK_THREAD_SUB_MESSAGES[email.threadId || email.id] || [];
              const dynamicSubEmails = localEmails.filter(
                (e) => e.threadId === email.threadId && e.id !== email.id
              );
              const subEmails = dynamicSubEmails.length > 0 ? dynamicSubEmails : mockSubEmails;
              const hasThread = Boolean(email.isThread || subEmails.length > 0 || (email.threadCount && email.threadCount > 1));

              return (
                <React.Fragment key={email.id}>
                  <MailListItem
                    email={email} isSelected={email.id === activeId}
                    isChecked={selectedSet.has(email.id)} hasAnySelection={selectedIds.length > 0}
                    isThread={hasThread} isThreadExpanded={isExpanded} onToggleThreadExpand={handleToggleThreadExpand}
                    cardsRows={cardsRows} onSelect={handleSelect} onToggleCheck={toggleSelectId}
                    onToggleFlag={toggleFlag} onTogglePin={togglePin} onToggleRead={markAsRead}
                    onDelete={deleteEmail} onContextMenu={handleContextMenu}
                  />
                  {isExpanded && subEmails.length > 0 && (
                    <MailThreadSubItems
                      subEmails={subEmails} activeId={activeId} selectedIds={selectedIds}
                      onSelect={handleSelect} onToggleCheck={toggleSelectId}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {filteredEmails.length === 0 && (
          <div className="h-48 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 text-xs">
            <p>No messages found</p>
          </div>
        )}
      </div>

      {contextMenu && (
        <MailItemContextMenu
          email={contextMenu.email}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
