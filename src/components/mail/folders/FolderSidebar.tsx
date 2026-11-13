'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Plus, User } from 'lucide-react';
import { useMailStore } from '@/stores';
import { useFolders, useAccounts } from '@/hooks/useEmailsQuery';
import { FolderItem } from './FolderItem';
import { FolderContextMenu } from './FolderContextMenu';
import { SidebarQuota } from './SidebarQuota';
import { MailFolder } from '@/types';
import { useToastStore } from '@/stores/useToastStore';
import { getClientConfig } from '@/config/clientConfig';

interface FolderSidebarProps {
  activeFolderId?: string;
  accountIndex?: number;
  onSelectFolder?: (folderId: string) => void;
  width?: number;
}

export function FolderSidebar({
  activeFolderId,
  accountIndex = 0,
  onSelectFolder,
  width,
}: FolderSidebarProps) {
  const selectedAccountId = useMailStore((s) => s.selectedAccountId);
  const storeFolderId = useMailStore((s) => s.selectedFolderId);
  const setStoreFolder = useMailStore((s) => s.setSelectedFolder);
  const moveEmailToFolder = useMailStore((s) => s.moveEmailToFolder);
  const addToast = useToastStore((s) => s.addToast);

  const [contextMenu, setContextMenu] = useState<{ folder: MailFolder; position: { x: number; y: number }; isFav: boolean } | null>(null);
  const [isFavOpen, setIsFavOpen] = useState(true);
  const [isPrimaryOpen, setIsPrimaryOpen] = useState(true);

  const currentFolder = activeFolderId || storeFolderId;
  const handleSelect = onSelectFolder || setStoreFolder;
  const { data: accounts } = useAccounts();

  const userIdx = typeof accountIndex === 'number' ? accountIndex : 0;
  const primaryAccount = accounts?.[userIdx] || accounts?.[0] || { id: 'acc-1', email: 'mullayam06@outlook.com' };
  const otherAccounts = accounts?.filter((_, idx) => idx !== userIdx) || [];
  const appVersion = getClientConfig().appVersion || '1.0.0';

  const activeAccId = primaryAccount.id || selectedAccountId;
  const { data: folders } = useFolders(activeAccId);
  const localEmails = useMailStore((s) => s.localEmails);

  const foldersWithCounts = useMemo(() => {
    if (!folders) return [];
    return folders.map((f) => {
      const isInbox = f.id === 'fld-inbox' || f.special === 'Inbox';
      const fEmails = localEmails.filter((e) => {
        const matchesFolder = e.folderId === f.id || (isInbox && (!e.folderId || e.folderId === 'fld-inbox'));
        const matchesAcc = !e.accountId || e.accountId === activeAccId;
        return matchesFolder && matchesAcc;
      });
      const dynamicUnread = fEmails.filter((e) => !e.isRead).length;
      return { ...f, unreadCount: isInbox || fEmails.length > 0 ? dynamicUnread : f.unreadCount };
    });
  }, [folders, localEmails, activeAccId]);

  const notesFolder = foldersWithCounts.find((f) => f.displayName === 'Notes');

  const handleContextMenu = (e: React.MouseEvent, folder: MailFolder, isFav = false) => {
    e.preventDefault();
    setContextMenu({ folder, position: { x: e.clientX, y: e.clientY }, isFav });
  };

  const handleDropEmail = (emailId: string, folderId: string) => {
    moveEmailToFolder(emailId, folderId);
    const target = folders?.find((f) => f.id === folderId);
    addToast({ title: 'Email Moved', description: `Moved to ${target?.displayName || 'folder'}.`, type: 'success' });
  };

  return (
    <div
      style={{ width: width ? `${width}px` : undefined }}
      className="w-64 bg-[#f8f8f8] dark:bg-[#1f1f1f] text-neutral-700 dark:text-neutral-300 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full shrink-0 select-none transition-colors"
    >
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Favorites Section */}
        <div>
          <button
            onClick={() => setIsFavOpen((v) => !v)}
            className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {isFavOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span>Favorites</span>
            </div>
          </button>

          {isFavOpen && notesFolder && (
            <div className="space-y-0.5 mt-1 pl-2">
              <FolderItem
                folder={notesFolder}
                isSelected={currentFolder === notesFolder.id}
                onSelect={handleSelect}
                onContextMenu={(e, f) => handleContextMenu(e, f, true)}
                onDropEmail={handleDropEmail}
              />
            </div>
          )}
        </div>

        {/* Primary Account & Folder Tree */}
        <div>
          <button
            onClick={() => setIsPrimaryOpen((v) => !v)}
            className="w-full flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white truncate transition-colors"
          >
            {isPrimaryOpen ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
            <span className="truncate">{primaryAccount.email}</span>
          </button>

          {isPrimaryOpen && (
            <div className="space-y-0.5 mt-1 pl-2">
              {foldersWithCounts.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  isSelected={currentFolder === folder.id}
                  onSelect={handleSelect}
                  onContextMenu={(e, f) => handleContextMenu(e, f, false)}
                  onDropEmail={handleDropEmail}
                />
              ))}
            </div>
          )}
        </div>

        {/* Secondary Accounts List */}
        <div className="space-y-1 pt-2 border-t border-neutral-200 dark:border-neutral-800/80">
          {otherAccounts.map((acc) => {
            const accIdx = accounts?.findIndex((a) => a.id === acc.id) ?? 0;
            return (
              <Link
                key={acc.id}
                href={`/mail/u/${accIdx}/#inbox`}
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{acc.email}</span>
                </div>
                <User className="w-3.5 h-3.5 shrink-0 ml-1 text-neutral-400 dark:text-neutral-500" />
              </Link>
            );
          })}
        </div>

        {/* Add Account Button */}
        <div className="pt-2">
          <Link href="/settings/accounts" className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add account</span>
          </Link>
        </div>
      </div>

      {/* Docked Quota Section: Just above version footer */}
      <SidebarQuota />

      {/* Docked Bottom Version Footer */}
      <div title="AirSend IMAP Web v 1.0.0" className="py-2 px-3 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500 shrink-0 select-none bg-neutral-200/40 dark:bg-[#1a1a1a]/40">
        <span className="font-medium text-neutral-600 dark:text-neutral-400 tracking-tight">AirSend IMAP Web</span>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700/60">
          v 1.0.0
        </span>
      </div>

      {contextMenu && (
        <FolderContextMenu
          folder={contextMenu.folder}
          position={contextMenu.position}
          isFavorite={contextMenu.isFav}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
