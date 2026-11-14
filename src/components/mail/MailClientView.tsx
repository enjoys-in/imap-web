'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMailStore } from '@/stores';
import { useUiStore } from '@/stores/useUiStore';
import { useGeneralSettingsStore } from '@/stores/useGeneralSettingsStore';
import { usePaneResize } from '@/hooks/usePaneResize';
import { getAccountByUserIndex } from '@/lib/accountRouter';
import { useSession } from '@/components/providers/SessionProvider';
import { findFolderBySlug, findSpecialFolder, folderSlug } from '@/lib/folders';
import { useFolders } from '@/hooks/useEmailsQuery';
import { MailCommandBar } from './command-bar/MailCommandBar';
import { FolderSidebar } from './folders/FolderSidebar';
import { RightAppsRail } from '@/components/right-apps/RightAppsRail';
import { RightAppsPanel } from '@/components/right-apps/RightAppsPanel';
import { PopoutReadingModal } from './reading-pane/PopoutReadingModal';
import { ResizeHandle } from '@/components/ui/ResizeHandle';
import { useMailClientHashSync } from './useMailClientHashSync';
import { MailClientLayoutContent } from './layout/MailClientLayoutContent';
import { cn } from '@/lib/utils';

interface MailClientViewProps {
  userIndex?: number | string;
  currentFolderId?: string;
  currentMailId?: string;
}

export function MailClientView({
  userIndex = 0,
  currentFolderId,
  currentMailId,
}: MailClientViewProps) {
  const parsedUserIndex = typeof userIndex === 'string' ? parseInt(userIndex, 10) || 0 : userIndex;
  const { accounts } = useSession();
  const activeAccount = getAccountByUserIndex(accounts, parsedUserIndex);
  const activeAccountId = activeAccount?.id ?? '';

  const selectedFolderId = useMailStore((s) => s.selectedFolderId);
  const selectedMailId = useMailStore((s) => s.selectedMailId);
  const setSelectedAccount = useMailStore((s) => s.setSelectedAccount);
  const setSelectedAccountIndex = useMailStore((s) => s.setSelectedAccountIndex);
  const setSelectedFolder = useMailStore((s) => s.setSelectedFolder);
  const setSelectedMail = useMailStore((s) => s.setSelectedMail);
  const fetchEmails = useMailStore((s) => s.fetchEmails);

  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const {
    sidebarWidth, mailListWidth, mailListHeight,
    handleSidebarResize, handleMailListResize, handleMailListVerticalResize,
    resetSidebar, resetMailList, resetMailListHeight,
  } = usePaneResize();

  const readingPaneLayout = useGeneralSettingsStore((s) => s.readingPaneLayout);
  const [popoutMailId, setPopoutMailId] = useState<string | null>(null);

  // The backend owns folder identity: local copy first, backend list replaces it.
  const { data: folders } = useFolders(activeAccountId);

  // Always one of the backend's folders: the one in the URL, else the selected one, else its Inbox.
  const activeFolder = useMemo(() => {
    if (!folders?.length) return undefined;
    const fromUrl = currentFolderId ? findFolderBySlug(folders, currentFolderId) : undefined;
    return (
      fromUrl ??
      folders.find((f) => f.id === selectedFolderId) ??
      findSpecialFolder(folders, 'Inbox') ??
      folders[0]
    );
  }, [folders, currentFolderId, selectedFolderId]);
  const activeFolderId = activeFolder?.id ?? '';

  useEffect(() => {
    // Nothing to load until the account and its folder list are known.
    if (!activeAccountId || !activeFolderId) return;
    setSelectedAccount(activeAccountId);
    setSelectedAccountIndex(parsedUserIndex);
    setSelectedFolder(activeFolderId);
    fetchEmails(activeFolderId, activeAccountId);
  }, [activeAccountId, parsedUserIndex, fetchEmails, setSelectedAccount, setSelectedAccountIndex, setSelectedFolder, activeFolderId]);

  useMailClientHashSync(parsedUserIndex, folders);

  useEffect(() => {
    const handleOpenPopout = (e: CustomEvent<{ mailId: string }>) => {
      if (e.detail?.mailId) setPopoutMailId(e.detail.mailId);
    };
    window.addEventListener('airsend:open-mail-popout', handleOpenPopout as EventListener);
    return () => window.removeEventListener('airsend:open-mail-popout', handleOpenPopout as EventListener);
  }, []);

  const hasSelectedMail = Boolean(currentMailId || selectedMailId);

  const handleBackToList = () => {
    setSelectedMail(null);
    if (activeFolder && typeof window !== 'undefined') window.location.hash = `#${folderSlug(activeFolder)}`;
  };

  const handleMailChange = (mailId: string) => {
    setSelectedMail(mailId);
    if (readingPaneLayout === 'popoutOnly') setPopoutMailId(mailId);
  };

  const handleFolderChange = (folderId: string) => {
    setSelectedFolder(folderId);
    setSelectedMail(null);
    const target = folders?.find((f) => f.id === folderId);
    if (target && typeof window !== 'undefined') window.location.hash = `#${folderSlug(target)}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative w-full h-full">
      <MailCommandBar />
      <div className="flex-1 flex overflow-hidden relative w-full h-full">
        {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={toggleSidebar} />}

        <div className={cn(
          'fixed inset-y-0 left-0 z-40 md:static md:z-auto transition-transform duration-200 ease-in-out md:translate-x-0 shrink-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <FolderSidebar activeFolderId={activeFolderId} accountIndex={parsedUserIndex} onSelectFolder={handleFolderChange} width={sidebarWidth} />
        </div>

        <ResizeHandle orientation="vertical" onResize={handleSidebarResize} onDoubleClick={resetSidebar} className="hidden md:block" />

        <MailClientLayoutContent
          readingPaneLayout={readingPaneLayout}
          hasSelectedMail={hasSelectedMail}
          activeFolderId={activeFolderId}
          activeMailId={currentMailId || selectedMailId || undefined}
          mailListWidth={mailListWidth}
          mailListHeight={mailListHeight}
          onSelectMail={handleMailChange}
          onBackToList={handleBackToList}
          onMailListResize={handleMailListResize}
          onMailListVerticalResize={handleMailListVerticalResize}
          onResetMailList={resetMailList}
          onResetMailListHeight={resetMailListHeight}
        />

        <RightAppsRail />
        <RightAppsPanel />
      </div>

      {popoutMailId && <PopoutReadingModal mailId={popoutMailId} onClose={() => setPopoutMailId(null)} />}
    </div>
  );
}
