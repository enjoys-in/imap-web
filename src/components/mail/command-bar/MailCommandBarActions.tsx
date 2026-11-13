'use client';

import React, { useState } from 'react';
import {
  Trash2, Archive, FolderInput, AlertOctagon, ShieldAlert,
  CornerUpLeft, ReplyAll, CornerUpRight, Mail, Flag, Undo2, ChevronDown
} from 'lucide-react';
import { useMailStore, useComposeStore, useToastStore } from '@/stores';
import { emailsApi, foldersApi } from '@/api';
import { cn } from '@/lib/utils';

const FOLDERS = [
  { id: 'fld-inbox', name: 'Inbox' },
  { id: 'fld-archive', name: 'Archive' },
  { id: 'fld-junk', name: 'Junk Email' },
  { id: 'fld-deleted', name: 'Deleted Items' },
];

interface CommandActionsProps {
  isAllSelected: boolean;
  folderId: string;
}

export function MailCommandBarActions({ isAllSelected, folderId }: CommandActionsProps) {
  const selectedIds = useMailStore((s) => s.selectedIds);
  const selectedMailId = useMailStore((s) => s.selectedMailId);
  const localEmails = useMailStore((s) => s.localEmails);
  const bulkDelete = useMailStore((s) => s.bulkDelete);
  const bulkMarkAsRead = useMailStore((s) => s.bulkMarkAsRead);
  const bulkMoveToFolder = useMailStore((s) => s.bulkMoveToFolder);
  const bulkToggleFlag = useMailStore((s) => s.bulkToggleFlag);
  const emptyFolder = useMailStore((s) => s.emptyFolder);
  const markAsRead = useMailStore((s) => s.markAsRead);
  const toggleFlag = useMailStore((s) => s.toggleFlag);
  const deleteEmail = useMailStore((s) => s.deleteEmail);
  const moveEmailToFolder = useMailStore((s) => s.moveEmailToFolder);

  const openReply = useComposeStore((s) => s.openReply);
  const openForward = useComposeStore((s) => s.openForward);
  const addToast = useToastStore((s) => s.addToast);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const activeEmail = localEmails.find((e) => e.id === selectedMailId);
  const hasSelectedEmails = selectedIds.length > 0;
  const hasEmailTarget = hasSelectedEmails || Boolean(activeEmail);
  const isSingleEmail = (hasSelectedEmails && selectedIds.length === 1) || (!hasSelectedEmails && Boolean(activeEmail));
  const isMultiEmail = selectedIds.length > 1;

  const btnClass = (enabled: boolean) =>
    cn(
      'h-7 px-2 rounded flex items-center gap-1 transition-colors text-xs',
      enabled
        ? 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer'
        : 'opacity-35 text-neutral-400 dark:text-neutral-600 cursor-not-allowed pointer-events-none'
    );

  const handleDelete = () => {
    if (!hasEmailTarget) return;
    if (hasSelectedEmails) {
      const ids = [...selectedIds];
      bulkDelete();
      emailsApi.bulkDeleteEmails(ids);
      addToast({ title: 'Deleted', description: `${ids.length} conversations deleted`, type: 'info' });
    } else if (activeEmail) {
      deleteEmail(activeEmail.id);
      emailsApi.deleteEmail(activeEmail.id);
      addToast({ title: 'Deleted', description: 'Conversation deleted', type: 'info' });
    }
  };

  const handleMoveSelect = (targetId: string, name: string) => {
    setIsMoveOpen(false);
    if (!hasEmailTarget) return;
    if (hasSelectedEmails) {
      const ids = [...selectedIds];
      bulkMoveToFolder(targetId);
      emailsApi.bulkMoveEmails(ids, targetId);
      addToast({ title: 'Moved', description: `Moved ${ids.length} items to ${name}`, type: 'success' });
    } else if (activeEmail) {
      moveEmailToFolder(activeEmail.id, targetId);
      emailsApi.moveEmail(activeEmail.id, targetId);
      addToast({ title: 'Moved', description: `Moved to ${name}`, type: 'success' });
    }
  };

  const handleRead = () => {
    if (!hasEmailTarget) return;
    if (hasSelectedEmails) {
      bulkMarkAsRead(false);
      emailsApi.bulkMarkAsRead(selectedIds, false);
      addToast({ title: 'Marked unread', description: `${selectedIds.length} items marked unread`, type: 'info' });
    } else if (activeEmail) {
      markAsRead(activeEmail.id, !activeEmail.isRead);
      emailsApi.markAsRead(activeEmail.id, !activeEmail.isRead);
    }
  };

  const handleFlag = () => {
    if (!hasEmailTarget) return;
    if (hasSelectedEmails) {
      bulkToggleFlag(true);
    } else if (activeEmail) {
      toggleFlag(activeEmail.id);
    }
  };

  const handleEmpty = () => {
    emptyFolder(folderId);
    foldersApi.emptyFolder(folderId);
    addToast({ title: 'Folder emptied', description: 'All items deleted.', type: 'info' });
  };

  if (isAllSelected) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={handleEmpty} className="h-7 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded flex items-center gap-1 text-red-600 dark:text-red-400 font-medium cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" /><span>Empty folder</span><ChevronDown className="w-3 h-3 opacity-60" />
        </button>
        <button onClick={handleDelete} className={btnClass(true)} title="Delete all"><Trash2 className="w-3.5 h-3.5" /><span>Delete</span></button>
        <button onClick={() => handleMoveSelect('fld-archive', 'Archive')} className={btnClass(true)} title="Archive all"><Archive className="w-3.5 h-3.5" /><span>Archive</span></button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button disabled={!hasEmailTarget} onClick={handleDelete} className={btnClass(hasEmailTarget)} title={hasEmailTarget ? 'Delete' : 'Select an email to delete'}>
        <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
      </button>
      <button disabled={!hasEmailTarget} onClick={() => handleMoveSelect('fld-archive', 'Archive')} className={btnClass(hasEmailTarget)} title={hasEmailTarget ? 'Archive' : 'Select an email to archive'}>
        <Archive className="w-3.5 h-3.5" /><span>Archive</span>
      </button>
      <div className="relative">
        <button disabled={!hasEmailTarget} onClick={() => setIsMoveOpen((v) => !v)} className={btnClass(hasEmailTarget)} title={hasEmailTarget ? 'Move to' : 'Select an email to move'}>
          <FolderInput className="w-3.5 h-3.5" /><span>Move to</span><ChevronDown className="w-3 h-3 opacity-60" />
        </button>
        {isMoveOpen && hasEmailTarget && (
          <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 rounded shadow-lg py-1 z-50">
            {FOLDERS.map((f) => (
              <button key={f.id} onClick={() => handleMoveSelect(f.id, f.name)} className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">{f.name}</button>
            ))}
          </div>
        )}
      </div>
      <button disabled={!hasEmailTarget} onClick={() => handleMoveSelect('fld-junk', 'Junk Email')} className={btnClass(hasEmailTarget)} title={hasEmailTarget ? 'Report junk' : 'Select an email to report'}>
        <AlertOctagon className={cn('w-3.5 h-3.5', hasEmailTarget && 'text-amber-500')} /><span className="hidden sm:inline">Report junk</span>
      </button>
      <button disabled={!hasEmailTarget} onClick={() => addToast({ title: 'Reported', description: 'Phishing reported', type: 'warning' })} className={btnClass(hasEmailTarget)} title={hasEmailTarget ? 'Report phishing' : 'Select an email to report'}>
        <ShieldAlert className={cn('w-3.5 h-3.5', hasEmailTarget && 'text-red-500')} /><span className="hidden sm:inline">Report phishing</span>
      </button>
      <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />
      <div className="flex items-center gap-1">
        <button disabled={!isSingleEmail} onClick={() => activeEmail && openReply(activeEmail, false)} className={btnClass(isSingleEmail)} title={isSingleEmail ? 'Reply' : isMultiEmail ? 'Cannot reply to multiple' : 'Select an email to reply'}>
          <CornerUpLeft className={cn('w-3.5 h-3.5', isSingleEmail && 'text-blue-500')} /><span className="hidden md:inline">Reply</span>
        </button>
        <button disabled={!isSingleEmail} onClick={() => activeEmail && openReply(activeEmail, true)} className={btnClass(isSingleEmail)} title={isSingleEmail ? 'Reply all' : isMultiEmail ? 'Cannot reply to multiple' : 'Select an email to reply'}>
          <ReplyAll className={cn('w-3.5 h-3.5', isSingleEmail && 'text-purple-500')} /><span className="hidden md:inline">Reply all</span>
        </button>
        <button disabled={!isSingleEmail} onClick={() => activeEmail && openForward(activeEmail)} className={btnClass(isSingleEmail)} title={isSingleEmail ? 'Forward' : isMultiEmail ? 'Cannot forward multiple' : 'Select an email to forward'}>
          <CornerUpRight className={cn('w-3.5 h-3.5', isSingleEmail && 'text-cyan-500')} /><span className="hidden md:inline">Forward</span>
        </button>
      </div>
      <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />
      <button disabled={!hasEmailTarget} onClick={handleRead} className={btnClass(hasEmailTarget)} title={hasEmailTarget ? 'Read / Unread' : 'Select an email'}><Mail className="w-3.5 h-3.5" /><span className="hidden lg:inline">Read / Unread</span></button>
      <button disabled={!hasEmailTarget} onClick={handleFlag} className={btnClass(hasEmailTarget)} title={hasEmailTarget ? 'Flag' : 'Select an email'}><Flag className="w-3.5 h-3.5" /><span className="hidden lg:inline">Flag</span></button>
      <button onClick={() => addToast({ title: 'Undo', description: 'Action undone', type: 'info' })} className="h-7 px-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded flex items-center gap-1 cursor-pointer" title="Undo"><Undo2 className="w-3.5 h-3.5" /><span className="hidden xl:inline">Undo</span></button>
    </div>
  );
}
