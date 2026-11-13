'use client';

import React, { useState } from 'react';
import {
  Trash2, Archive, FolderInput, AlertCircle, ShieldAlert,
  CornerUpLeft, ReplyAll, CornerUpRight, Mail, Flag, Undo2, ChevronDown
} from 'lucide-react';
import { useMailStore, useComposeStore, useToastStore } from '@/stores';
import { emailsApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { SnoozeMenu } from '../SnoozeMenu';

const FOLDERS = [
  { id: 'fld-inbox', name: 'Inbox' },
  { id: 'fld-archive', name: 'Archive' },
  { id: 'fld-junk', name: 'Junk Email' },
  { id: 'fld-deleted', name: 'Deleted Items' },
];

export function MailCommandBarActions() {
  const { selectedIds, selectedMailId, localEmails, lastSnapshot } = useMailStore();
  const { bulkDelete, bulkMarkAsRead, bulkMoveToFolder, bulkToggleFlag } = useMailStore();
  const { markAsRead, toggleFlag, deleteEmail, moveEmailToFolder, undoLastAction } = useMailStore();
  const { openReply, openForward } = useComposeStore();
  const addToast = useToastStore((s) => s.addToast);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

  const activeEmail = localEmails.find((e) => e.id === selectedMailId);
  const hasSelected = selectedIds.length > 0;
  const hasTarget = hasSelected || Boolean(activeEmail);
  const isSingle = (hasSelected && selectedIds.length === 1) || (!hasSelected && Boolean(activeEmail));
  const canUndo = lastSnapshot !== null;

  const btnClass = (enabled: boolean) =>
    cn(
      'h-7 px-2 rounded flex items-center gap-1.5 transition-colors text-xs whitespace-nowrap select-none',
      enabled
        ? 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer active:scale-95'
        : 'opacity-35 text-neutral-400 dark:text-neutral-500 cursor-not-allowed pointer-events-none'
    );

  const handleDelete = () => {
    if (!hasTarget) return;
    if (hasSelected) {
      bulkDelete();
      emailsApi.bulkDeleteEmails([...selectedIds]);
      addToast({ title: 'Deleted', description: `${selectedIds.length} conversations deleted`, type: 'info' });
    } else if (activeEmail) {
      deleteEmail(activeEmail.id);
      emailsApi.deleteEmail(activeEmail.id);
      addToast({ title: 'Deleted', description: 'Conversation deleted', type: 'info' });
    }
  };

  const handleMoveSelect = (targetId: string, name: string) => {
    setIsMoveOpen(false);
    if (!hasTarget) return;
    if (hasSelected) {
      bulkMoveToFolder(targetId);
      emailsApi.bulkMoveEmails([...selectedIds], targetId);
      addToast({ title: 'Moved', description: `Moved ${selectedIds.length} items to ${name}`, type: 'success' });
    } else if (activeEmail) {
      moveEmailToFolder(activeEmail.id, targetId);
      emailsApi.moveEmail(activeEmail.id, targetId);
      addToast({ title: 'Moved', description: `Moved to ${name}`, type: 'success' });
    }
  };

  const handleRead = () => {
    if (!hasTarget) return;
    if (hasSelected) {
      bulkMarkAsRead(false);
      emailsApi.bulkMarkAsRead(selectedIds, false);
      addToast({ title: 'Marked unread', description: `${selectedIds.length} items marked unread`, type: 'info' });
    } else if (activeEmail) {
      markAsRead(activeEmail.id, !activeEmail.isRead);
      emailsApi.markAsRead(activeEmail.id, !activeEmail.isRead);
    }
  };

  const handleFlag = () => {
    if (!hasTarget) return;
    if (hasSelected) {
      bulkToggleFlag(true);
      addToast({ title: 'Flagged', description: `${selectedIds.length} items flagged`, type: 'info' });
    } else if (activeEmail) toggleFlag(activeEmail.id);
  };

  const handleUndo = () => {
    if (undoLastAction()) addToast({ title: 'Undone', description: 'Restored previous mail state', type: 'info' });
    else addToast({ title: 'Nothing to undo', description: 'No recent actions to revert', type: 'info' });
  };

  return (
    <div className="flex items-center gap-0.5 shrink-0 text-xs">
      <button disabled={!hasTarget} onClick={handleDelete} className={btnClass(hasTarget)} title={hasTarget ? 'Delete' : 'Select an email'}>
        <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
      </button>
      <button disabled={!hasTarget} onClick={() => handleMoveSelect('fld-archive', 'Archive')} className={btnClass(hasTarget)} title={hasTarget ? 'Archive' : 'Select an email'}>
        <Archive className="w-3.5 h-3.5" /><span>Archive</span>
      </button>

      <div className="relative">
        <button disabled={!hasTarget} onClick={() => setIsMoveOpen((v) => !v)} className={btnClass(hasTarget)} title={hasTarget ? 'Move to' : 'Select an email'}>
          <FolderInput className="w-3.5 h-3.5" /><span>Move to</span><ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
        </button>
        {isMoveOpen && hasTarget && (
          <div className="absolute left-0 top-full mt-1 w-44 bg-white dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl py-1 z-50">
            {FOLDERS.map((f) => (
              <button key={f.id} onClick={() => handleMoveSelect(f.id, f.name)} className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                {f.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <button disabled={!hasTarget} onClick={() => { handleMoveSelect('fld-junk', 'Junk Email'); addToast({ title: 'Reported Junk', description: 'Moved to junk & trained spam filter', type: 'warning' }); }} className={btnClass(hasTarget)} title={hasTarget ? 'Report junk' : 'Select an email'}>
        <AlertCircle className={cn('w-3.5 h-3.5', hasTarget ? 'text-amber-500' : 'text-neutral-400')} /><span>Report junk</span>
      </button>
      {hasTarget && activeEmail && <SnoozeMenu emailId={activeEmail.id} />}
      <button disabled={!hasTarget} onClick={() => { handleMoveSelect('fld-junk', 'Junk Email'); addToast({ title: 'Reported Phishing', description: 'Phishing alert sent & sender blocked', type: 'warning' }); }} className={btnClass(hasTarget)} title={hasTarget ? 'Report phishing' : 'Select an email'}>
        <ShieldAlert className={cn('w-3.5 h-3.5', hasTarget ? 'text-red-500' : 'text-neutral-400')} /><span>Report phishing</span>
      </button>

      <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700/80 mx-1 shrink-0" />

      <button disabled={!isSingle} onClick={() => activeEmail && openReply(activeEmail, false)} className={btnClass(isSingle)} title={!hasTarget ? 'Select an email to reply' : !isSingle ? 'Reply not available for multiple conversations' : 'Reply'}>
        <CornerUpLeft className={cn('w-3.5 h-3.5', isSingle ? 'text-blue-500' : 'text-neutral-400')} /><span>Reply</span>
      </button>
      <button disabled={!isSingle} onClick={() => activeEmail && openReply(activeEmail, true)} className={btnClass(isSingle)} title={!hasTarget ? 'Select an email to reply all' : !isSingle ? 'Reply all not available for multiple conversations' : 'Reply all'}>
        <ReplyAll className={cn('w-3.5 h-3.5', isSingle ? 'text-purple-500' : 'text-neutral-400')} /><span>Reply all</span>
      </button>
      <button disabled={!isSingle} onClick={() => activeEmail && openForward(activeEmail)} className={btnClass(isSingle)} title={!hasTarget ? 'Select an email to forward' : !isSingle ? 'Forward not available for multiple conversations' : 'Forward'}>
        <CornerUpRight className={cn('w-3.5 h-3.5', isSingle ? 'text-cyan-500' : 'text-neutral-400')} /><span>Forward</span>
      </button>

      <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700/80 mx-1 shrink-0" />

      <button disabled={!hasTarget} onClick={handleRead} className={btnClass(hasTarget)} title={hasTarget ? 'Read / Unread' : 'Select an email'}>
        <Mail className="w-3.5 h-3.5" /><span>Read / Unread</span>
      </button>
      <button disabled={!hasTarget} onClick={handleFlag} className={btnClass(hasTarget)} title={hasTarget ? 'Toggle flag' : 'Select an email'}>
        <Flag className={cn('w-3.5 h-3.5', hasTarget && activeEmail?.isFlagged ? 'text-amber-500 fill-amber-500' : '')} /><span>Flag</span>
      </button>
      <button disabled={!canUndo} onClick={handleUndo} className={btnClass(canUndo)} title={canUndo ? 'Undo last action' : 'Nothing to undo'}>
        <Undo2 className="w-3.5 h-3.5" /><span>Undo</span>
      </button>
    </div>
  );
}
