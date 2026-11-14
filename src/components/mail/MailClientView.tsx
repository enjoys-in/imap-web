'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useMailStore, useUiStore } from '@/stores';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { usePaneResize } from '@/hooks/usePaneResize';
import { ResizeHandle } from '@/components/ui/ResizeHandle';
import { FolderSidebar } from './folders';
import { MailList } from './list';
import { ReadingPane, ReadingPaneSkeleton } from './reading-pane';
import { PopoutReadingModal } from './reading-pane/PopoutReadingModal';
import { MailCommandBar } from './command-bar';
import { RightAppsRail } from '@/components/right-apps/RightAppsRail';
import { RightAppsPanel } from '@/components/right-apps/RightAppsPanel';
import { getAccountByUserIndex } from '@/lib/accountRouter';
import { folderIdToSlug } from '@/lib/folderSlugUtils';
import { cn } from '@/lib/utils';
import { saveOpenMailSession } from '@/lib/storage/mailSessionStorage';
import { ArrowLeft } from 'lucide-react';
import { useMailClientHashSync } from './useMailClientHashSync';

interface MailClientViewProps {
  userIndex?: number | string;
  currentFolderId?: string;
  currentMailId?: string;
}

export function MailClientView({ userIndex = 0, currentFolderId, currentMailId }: MailClientViewProps) {
  const parsedUserIndex = typeof userIndex === 'string' ? parseInt(userIndex, 10) || 0 : userIndex;
  const activeAccount = getAccountByUserIndex(parsedUserIndex);

  const selectedFolderId = useMailStore((s) => s.selectedFolderId);
  const selectedMailId = useMailStore((s) => s.selectedMailId);
  const setSelectedFolder = useMailStore((s) => s.setSelectedFolder);
  const setSelectedMail = useMailStore((s) => s.setSelectedMail);
  const setSelectedAccount = useMailStore((s) => s.setSelectedAccount);
  const setSelectedAccountIndex = useMailStore((s) => s.setSelectedAccountIndex);
  const fetchEmails = useMailStore((s) => s.fetchEmails);

  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { sidebarWidth, mailListWidth, handleSidebarResize, handleMailListResize, resetSidebar, resetMailList } = usePaneResize();

  const readingPaneLayout = useGeneralSettingsStore((s) => s.readingPaneLayout);
  const [popoutMailId, setPopoutMailId] = useState<string | null>(null);

  const activeFolderId = currentFolderId || selectedFolderId || 'fld-inbox';
  const hasSelectedMail = Boolean(currentMailId || selectedMailId);

  useEffect(() => {
    setSelectedAccount(activeAccount.id);
    setSelectedAccountIndex(parsedUserIndex);
    fetchEmails(activeFolderId, activeAccount.id);
  }, [activeAccount.id, parsedUserIndex, fetchEmails, setSelectedAccount, setSelectedAccountIndex, activeFolderId]);

  useMailClientHashSync(parsedUserIndex);

  const handleFolderChange = (folderId: string) => {
    const slug = folderIdToSlug(folderId);
    setSelectedFolder(folderId);
    setSelectedMail(null);
    saveOpenMailSession(parsedUserIndex, folderId, slug, null);
    if (isSidebarOpen) toggleSidebar();
    if (typeof window !== 'undefined') window.location.hash = `#${slug}`;
  };

  const handleMailChange = (mailId: string) => {
    if (readingPaneLayout === 'popoutOnly') {
      setPopoutMailId(mailId);
      return;
    }
    const slug = folderIdToSlug(activeFolderId);
    setSelectedMail(mailId);
    saveOpenMailSession(parsedUserIndex, activeFolderId, slug, mailId);
    if (typeof window !== 'undefined') window.location.hash = `#${slug}/${mailId}`;
  };

  const handleBackToList = () => {
    const slug = folderIdToSlug(activeFolderId);
    setSelectedMail(null);
    saveOpenMailSession(parsedUserIndex, activeFolderId, slug, null);
    if (typeof window !== 'undefined') window.location.hash = `#${slug}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative w-full">
      <MailCommandBar />
      <div className="flex-1 flex overflow-hidden relative w-full">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={toggleSidebar} />}

        <div className={cn('fixed inset-y-0 left-0 z-40 md:static md:z-auto transition-transform duration-200 ease-in-out md:translate-x-0', isSidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
          <FolderSidebar activeFolderId={activeFolderId} accountIndex={parsedUserIndex} onSelectFolder={handleFolderChange} width={sidebarWidth} />
        </div>
        <ResizeHandle onResize={handleSidebarResize} onDoubleClick={resetSidebar} className="hidden md:block" />

        <div
          className={cn(
            'flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 select-none transition-all',
            readingPaneLayout === 'fillScreen' && hasSelectedMail ? 'hidden' : 'w-full md:w-auto',
            hasSelectedMail ? 'hidden md:flex' : 'flex'
          )}
          style={{ width: readingPaneLayout === 'fillScreen' && hasSelectedMail ? 0 : mailListWidth }}
        >
          <MailList activeFolderId={activeFolderId} onSelectMail={handleMailChange} activeMailId={currentMailId || selectedMailId || undefined} />
        </div>

        {readingPaneLayout !== 'fillScreen' && (
          <ResizeHandle onResize={handleMailListResize} onDoubleClick={resetMailList} className="hidden md:block" />
        )}

        <div className={cn('flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-900', !hasSelectedMail ? 'hidden md:flex' : 'flex')}>
          <div className="md:hidden flex items-center gap-2 p-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850">
            <button onClick={handleBackToList} className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Messages</span>
            </button>
          </div>

          <Suspense fallback={<ReadingPaneSkeleton />}>
            <ReadingPane activeMailId={currentMailId || selectedMailId || undefined} onBack={handleBackToList} />
          </Suspense>
        </div>

        <RightAppsRail />
        <RightAppsPanel />
      </div>

      {popoutMailId && (
        <PopoutReadingModal mailId={popoutMailId} onClose={() => setPopoutMailId(null)} />
      )}
    </div>
  );
}
