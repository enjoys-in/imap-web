'use client';

import React, { Suspense, useEffect, useCallback } from 'react';
import { useMailStore, useUiStore } from '@/stores';
import { usePaneResize } from '@/hooks/usePaneResize';
import { ResizeHandle } from '@/components/ui/ResizeHandle';
import { FolderSidebar } from './folders';
import { MailList } from './list';
import { ReadingPane, ReadingPaneSkeleton } from './reading-pane';
import { MailCommandBar, ImapSyncStatusWidget } from './command-bar';
import { RightAppsRail } from '@/components/right-apps/RightAppsRail';
import { RightAppsPanel } from '@/components/right-apps/RightAppsPanel';
import { getAccountByUserIndex } from '@/lib/accountRouter';
import { folderIdToSlug, slugToFolderId } from '@/lib/folderSlugUtils';
import { emailsApi, foldersApi } from '@/api';
import { cn } from '@/lib/utils';

interface MailClientViewProps {
  userIndex?: number | string;
  currentFolderId?: string;
  currentMailId?: string;
}

function parseMailHash(rawHash: string) {
  const clean = rawHash.replace(/^#\/?/, '').trim();
  if (!clean) return { folderSlug: 'inbox', mailId: null };
  const parts = clean.split('/');
  if (parts.length >= 2) return { folderSlug: parts[0], mailId: parts[1] };
  if (parts[0].startsWith('msg-')) return { folderSlug: 'inbox', mailId: parts[0] };
  return { folderSlug: parts[0], mailId: null };
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
  const addOrSelectEmail = useMailStore((s) => s.addOrSelectEmail);

  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { sidebarWidth, mailListWidth, handleSidebarResize, handleMailListResize, resetSidebar, resetMailList } = usePaneResize();

  const activeFolderId = currentFolderId || selectedFolderId || 'fld-inbox';
  const hasSelectedMail = Boolean(currentMailId || selectedMailId);

  // Sync account identity for this tab
  useEffect(() => {
    setSelectedAccount(activeAccount.id);
    setSelectedAccountIndex(parsedUserIndex);
    fetchEmails(activeFolderId, activeAccount.id);
  }, [activeAccount.id, parsedUserIndex, fetchEmails, setSelectedAccount, setSelectedAccountIndex, activeFolderId]);

  // Handle URL hash changes (#inbox, #inbox/msg-jeelan, or missing/removed hash)
  const syncFromHash = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const clean = window.location.hash.replace(/^#\/?/, '').trim();

    // If no hash or folder removed (e.g. /mail/u/0): check all mailboxes, resolve Inbox, and default open
    if (!clean) {
      const mailboxes = await foldersApi.getFolders(activeAccount.id);
      const inboxBox = mailboxes.find((f) => f.special === 'Inbox' || f.id === 'fld-inbox') || mailboxes[0];
      const targetFolderId = inboxBox?.id || 'fld-inbox';
      const targetSlug = folderIdToSlug(targetFolderId);

      setSelectedFolder(targetFolderId);
      window.history.replaceState(null, '', `#${targetSlug}`);

      const list = await emailsApi.getEmailsMetadata(targetFolderId, activeAccount.id);
      if (list.length > 0) setSelectedMail(list[0].id);
      return;
    }

    const { folderSlug, mailId } = parseMailHash(window.location.hash);
    const targetFolderId = slugToFolderId(folderSlug);
    setSelectedFolder(targetFolderId);

    if (mailId) {
      const exists = useMailStore.getState().localEmails.some((e) => e.id === mailId);
      if (exists) {
        setSelectedMail(mailId);
      } else {
        const fetched = await emailsApi.getEmailById(mailId);
        if (fetched) {
          addOrSelectEmail(fetched);
        } else {
          window.location.hash = `#${folderSlug}`;
          setSelectedMail(null);
        }
      }
    } else {
      const storeList = useMailStore.getState().localEmails;
      const folderList = storeList.filter((e) =>
        targetFolderId === 'fld-inbox' ? (!e.folderId || e.folderId === 'fld-inbox') : e.folderId === targetFolderId
      );
      if (folderList.length > 0) {
        setSelectedMail(folderList[0].id);
      } else {
        const list = await emailsApi.getEmailsMetadata(targetFolderId, activeAccount.id);
        if (list.length > 0) setSelectedMail(list[0].id);
      }
    }
  }, [activeAccount.id, setSelectedFolder, setSelectedMail, addOrSelectEmail]);

  useEffect(() => {
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [syncFromHash]);

  const handleFolderChange = (folderId: string) => {
    const slug = folderIdToSlug(folderId);
    setSelectedFolder(folderId);
    setSelectedMail(null);
    if (isSidebarOpen) toggleSidebar();
    if (typeof window !== 'undefined') window.location.hash = `#${slug}`;
  };

  const handleMailChange = (mailId: string) => {
    const slug = folderIdToSlug(activeFolderId);
    setSelectedMail(mailId);
    if (typeof window !== 'undefined') window.location.hash = `#${slug}/${mailId}`;
  };

  const handleBackToList = () => {
    const slug = folderIdToSlug(activeFolderId);
    setSelectedMail(null);
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

        <ResizeHandle onResize={handleSidebarResize} onDoubleClick={resetSidebar} title="Drag to resize folders (double-click to reset)" />

        <div className={cn('flex-1 md:flex-initial h-full', hasSelectedMail ? 'hidden md:flex' : 'flex')}>
          <MailList activeFolderId={activeFolderId} activeMailId={currentMailId || selectedMailId || undefined} onSelectMail={handleMailChange} width={mailListWidth} />
        </div>

        <ResizeHandle onResize={handleMailListResize} onDoubleClick={resetMailList} title="Drag to resize inbox list (double-click to reset)" />

        <div className={cn('flex-1 h-full overflow-hidden', !hasSelectedMail ? 'hidden md:flex' : 'flex')}>
          <Suspense fallback={<ReadingPaneSkeleton />}>
            <ReadingPane activeMailId={currentMailId || selectedMailId || undefined} onBack={handleBackToList} />
          </Suspense>
        </div>

        <RightAppsPanel />
        <RightAppsRail />
        <ImapSyncStatusWidget />
      </div>
    </div>
  );
}
