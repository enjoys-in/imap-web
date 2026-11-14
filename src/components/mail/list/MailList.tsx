'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useMailStore } from '@/stores';
import { useAccountSettingsStore } from '@/stores/useAccountSettingsStore';
import { MailListItem } from './MailListItem';
import { MailListHeader } from './MailListHeader';
import { MailItemContextMenu } from './MailItemContextMenu';
import { MailThreadSubItems } from './MailThreadSubItems';
import { useSession } from '@/components/providers/SessionProvider';
import { MailMessage, MailMessageMetadata } from '@/types';
import { ChevronDown, Loader2 } from 'lucide-react';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { useMailListFilterSort } from './useMailListFilterSort';

interface MailListProps {
  activeFolderId?: string;
  activeMailId?: string;
  onSelectMail?: (mailId: string) => void;
  width?: number;
  isWideLayout?: boolean;
}

export function MailList({ activeFolderId, activeMailId, onSelectMail, width, isWideLayout }: MailListProps) {
  const generalReadingLayout = useGeneralSettingsStore((s) => s.readingPaneLayout);
  const effectiveIsWide = isWideLayout ?? (
    generalReadingLayout === 'fillScreen' || generalReadingLayout === 'popoutOnly' ||
    generalReadingLayout === 'bottom' || (typeof width === 'number' && width >= 480)
  );

  const {
    selectedMailId, selectedIds, searchQuery, isSearchingServer, clearSearch,
    setSelectedMail, toggleSelectId, selectedAccountId, localEmails,
    hasMoreEmails, isLoadingMore, loadMoreEmails,
  } = useMailStore();

  const getSettings = useAccountSettingsStore((s) => s.getSettings);
  const { account } = useSession();
  const cardsRows = getSettings(selectedAccountId, account?.email).appearance.cardsViewRows;

  const [contextMenu, setContextMenu] = useState<{
    email: MailMessageMetadata | MailMessage;
    position: { x: number; y: number };
  } | null>(null);

  const activeId = activeMailId || selectedMailId;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const { filteredEmails, pinnedEmails, unpinnedEmails, currentIds } = useMailListFilterSort(activeFolderId);

  const [expandedThreadIds, setExpandedThreadIds] = useState<Set<string>>(new Set());

  const handleToggleThreadExpand = useCallback((id: string) => {
    setExpandedThreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (id: string) => (onSelectMail ? onSelectMail(id) : setSelectedMail(id === activeId ? null : id)),
    [onSelectMail, setSelectedMail, activeId]
  );

  return (
    <div
      style={{ width: width ? `${width}px` : undefined }}
      className="w-full flex-1 flex flex-col h-full bg-white dark:bg-[#1f1f1f] select-none transition-colors overflow-hidden min-w-0"
    >
      <MailListHeader totalEmailsCount={filteredEmails.length} currentEmailIds={currentIds} isWideLayout={effectiveIsWide} />

      {searchQuery.trim() && (
        <div className="px-3 py-1.5 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
          <div className="flex items-center gap-1.5 truncate">
            {isSearchingServer && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />}
            <span className="truncate">Search: <strong className="font-semibold">{searchQuery}</strong> ({filteredEmails.length})</span>
          </div>
          <button onClick={clearSearch} className="text-blue-700 dark:text-blue-400 hover:text-red-600 text-[11px] underline shrink-0 cursor-pointer ml-2">Clear</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {pinnedEmails.length > 0 && (
          <div>
            {pinnedEmails.map((email) => (
              <MailListItem
                key={`pin-${email.id}`} email={email} isSelected={email.id === activeId}
                isChecked={selectedSet.has(email.id)} hasAnySelection={selectedIds.length > 0}
                isWideLayout={effectiveIsWide} cardsRows={cardsRows} onSelect={handleSelect}
                onToggleCheck={toggleSelectId} onToggleFlag={(id) => dispatchMailAction({ action: 'toggle-flag', targetEmailId: id })}
                onTogglePin={(id) => dispatchMailAction({ action: 'toggle-pin', targetEmailId: id })}
                onToggleRead={(id) => dispatchMailAction({ action: 'toggle-read', targetEmailId: id })}
                onDelete={(id) => dispatchMailAction({ action: 'delete', targetEmailId: id })}
                onContextMenu={(e, em) => { e.preventDefault(); setContextMenu({ email: em, position: { x: e.clientX, y: e.clientY } }); }}
              />
            ))}
          </div>
        )}

        {unpinnedEmails.length > 0 && (
          <div>
            <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-white bg-neutral-100 dark:bg-[#252525] border-y border-neutral-200 dark:border-neutral-800">
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-300" />
              <span>Messages</span>
            </div>

            {unpinnedEmails.map((email) => {
              const isExpanded = expandedThreadIds.has(email.id);
              const subEmails = localEmails.filter((e) => e.threadId === email.threadId && e.id !== email.id);
              const hasThread = Boolean(email.isThread || subEmails.length > 0 || (email.threadCount && email.threadCount > 1));

              return (
                <React.Fragment key={email.id}>
                  <MailListItem
                    email={email} isSelected={email.id === activeId}
                    isChecked={selectedSet.has(email.id)} hasAnySelection={selectedIds.length > 0}
                    isThread={hasThread} isThreadExpanded={isExpanded} onToggleThreadExpand={handleToggleThreadExpand}
                    isWideLayout={effectiveIsWide} cardsRows={cardsRows} onSelect={handleSelect}
                    onToggleCheck={toggleSelectId} onToggleFlag={(id) => dispatchMailAction({ action: 'toggle-flag', targetEmailId: id })}
                    onTogglePin={(id) => dispatchMailAction({ action: 'toggle-pin', targetEmailId: id })}
                    onToggleRead={(id) => dispatchMailAction({ action: 'toggle-read', targetEmailId: id })}
                    onDelete={(id) => dispatchMailAction({ action: 'delete', targetEmailId: id })}
                    onContextMenu={(e, em) => { e.preventDefault(); setContextMenu({ email: em, position: { x: e.clientX, y: e.clientY } }); }}
                  />
                  {subEmails.length > 0 && (
                    <MailThreadSubItems
                      subEmails={subEmails} activeId={activeId} selectedIds={selectedIds}
                      isExpanded={isExpanded} onSelect={handleSelect} onToggleCheck={toggleSelectId}
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

        {/* Load More Pagination */}
        {hasMoreEmails && (
          <div className="p-3 flex justify-center border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => loadMoreEmails()}
              disabled={isLoadingMore}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0078d4]" />
                  <span>Loading older messages...</span>
                </>
              ) : (
                <span>Load next 25 messages</span>
              )}
            </button>
          </div>
        )}

        {!hasMoreEmails && filteredEmails.length > 0 && (
          <div className="py-3 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
            All messages loaded ({filteredEmails.length})
          </div>
        )}
      </div>

      {contextMenu && (
        <MailItemContextMenu email={contextMenu.email} position={contextMenu.position} onClose={() => setContextMenu(null)} />
      )}
    </div>
  );
}
