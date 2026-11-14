'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Trash2,
  Archive,
  FolderInput,
  AlertCircle,
  Clock,
  ShieldAlert,
  CornerUpLeft,
  ReplyAll,
  CornerUpRight,
  Mail,
  Flag,
  Undo2,
  X,
  ChevronDown,
  Sun,
  Sunrise,
  Calendar,
} from 'lucide-react';
import { useMailStore } from '@/stores';
import { useFolders } from '@/hooks/useEmailsQuery';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';
import { cn } from '@/lib/utils';

const DEFAULT_FOLDERS = [
  { id: 'fld-inbox', name: 'Inbox' },
  { id: 'fld-archive', name: 'Archive' },
  { id: 'fld-junk', name: 'Junk Email' },
  { id: 'fld-deleted', name: 'Deleted Items' },
  { id: 'fld-personal', name: 'Personal folder' },
];

const SNOOZE_PRESETS = [
  { label: 'Later today', time: '6:00 PM', icon: Sun },
  { label: 'Tomorrow morning', time: 'Tomorrow 8:00 AM', icon: Sunrise },
  { label: 'This weekend', time: 'Saturday 8:00 AM', icon: Calendar },
  { label: 'Next week', time: 'Next Monday 8:00 AM', icon: Calendar },
];

export function MailCommandBarActions() {
  const { selectedIds, selectedMailId, localEmails, lastSnapshot, selectedAccountId } = useMailStore();
  const { data: serverFolders } = useFolders(selectedAccountId || 'acc-1');
  const targetFolders = serverFolders && serverFolders.length > 0
    ? serverFolders.map((f: any) => ({ id: f.id, name: f.displayName || f.name }))
    : DEFAULT_FOLDERS;

  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);

  const moveRef = useRef<HTMLDivElement>(null);
  const snoozeRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moveRef.current && !moveRef.current.contains(e.target as Node)) {
        setIsMoveOpen(false);
      }
      if (snoozeRef.current && !snoozeRef.current.contains(e.target as Node)) {
        setIsSnoozeOpen(false);
      }
    }
    if (isMoveOpen || isSnoozeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMoveOpen, isSnoozeOpen]);

  const activeEmail = localEmails.find((e) => e.id === selectedMailId);
  const hasSelected = selectedIds.length > 0;
  const hasTarget = hasSelected || Boolean(activeEmail);
  const isSingle =
    (hasSelected && selectedIds.length === 1) || (!hasSelected && Boolean(activeEmail));
  const canUndo = lastSnapshot !== null;

  const btnClass = (enabled: boolean) =>
    cn(
      'h-7 px-2 rounded flex items-center gap-1.5 transition-colors text-xs whitespace-nowrap select-none',
      enabled
        ? 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer active:scale-95'
        : 'opacity-35 text-neutral-400 dark:text-neutral-500 cursor-not-allowed pointer-events-none'
    );

  return (
    <div className="flex items-center gap-0.5 shrink-0 text-xs">
      {/* 1. Delete */}
      <button
        disabled={!hasTarget}
        onClick={() => dispatchMailAction({ action: 'delete' })}
        className={btnClass(hasTarget)}
        title={hasTarget ? 'Delete' : 'Select an email'}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete</span>
      </button>

      {/* 2. Archive */}
      <button
        disabled={!hasTarget}
        onClick={() => dispatchMailAction({ action: 'archive' })}
        className={btnClass(hasTarget)}
        title={hasTarget ? 'Archive' : 'Select an email'}
      >
        <Archive className="w-3.5 h-3.5" />
        <span>Archive</span>
      </button>

      {/* 3. Move to */}
      <div ref={moveRef} className="relative">
        <button
          disabled={!hasTarget}
          onClick={() => {
            setIsMoveOpen((v) => !v);
            setIsSnoozeOpen(false);
          }}
          className={btnClass(hasTarget)}
          title={hasTarget ? 'Move to' : 'Select an email'}
        >
          <FolderInput className="w-3.5 h-3.5" />
          <span>Move to</span>
          <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
        </button>
        {isMoveOpen && hasTarget && (
          <div className="absolute left-0 top-full mt-1 w-44 bg-white dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            {targetFolders.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setIsMoveOpen(false);
                  dispatchMailAction({
                    action: 'move-to',
                    folderId: f.id,
                    folderName: f.name,
                  });
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                {f.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Report junk */}
      <button
        disabled={!hasTarget}
        onClick={() => dispatchMailAction({ action: 'report-junk' })}
        className={btnClass(hasTarget)}
        title={hasTarget ? 'Report junk' : 'Select an email'}
      >
        <AlertCircle
          className={cn('w-3.5 h-3.5', hasTarget ? 'text-amber-500' : 'text-neutral-400')}
        />
        <span>Report junk</span>
      </button>

      {/* 5. Snooze */}
      <div ref={snoozeRef} className="relative">
        <button
          disabled={!hasTarget}
          onClick={() => {
            setIsSnoozeOpen((v) => !v);
            setIsMoveOpen(false);
          }}
          className={btnClass(hasTarget)}
          title={hasTarget ? 'Snooze / Remind me later' : 'Select an email'}
        >
          <Clock
            className={cn('w-3.5 h-3.5', hasTarget ? 'text-amber-500' : 'text-neutral-400')}
          />
          <span>Snooze</span>
        </button>
        {isSnoozeOpen && hasTarget && (
          <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl py-1 z-50 text-xs text-neutral-800 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 font-semibold text-[10px] text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800">
              Snooze until...
            </div>
            {SNOOZE_PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setIsSnoozeOpen(false);
                    dispatchMailAction({
                      action: 'snooze',
                      snoozeUntil: p.time,
                    });
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{p.label}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">{p.time}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Report phishing */}
      <button
        disabled={!hasTarget}
        onClick={() => dispatchMailAction({ action: 'report-phishing' })}
        className={btnClass(hasTarget)}
        title={hasTarget ? 'Report phishing' : 'Select an email'}
      >
        <ShieldAlert
          className={cn('w-3.5 h-3.5', hasTarget ? 'text-red-500' : 'text-neutral-400')}
        />
        <span>Report phishing</span>
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700/80 mx-1 shrink-0" />

      {/* 7. Reply */}
      <button
        disabled={!isSingle}
        onClick={() => dispatchMailAction({ action: 'reply' })}
        className={btnClass(isSingle)}
        title={
          !hasTarget
            ? 'Select an email to reply'
            : !isSingle
            ? 'Reply not available for multiple conversations'
            : 'Reply'
        }
      >
        <CornerUpLeft
          className={cn('w-3.5 h-3.5', isSingle ? 'text-blue-500' : 'text-neutral-400')}
        />
        <span>Reply</span>
      </button>

      {/* 8. Reply all */}
      <button
        disabled={!isSingle}
        onClick={() => dispatchMailAction({ action: 'reply-all' })}
        className={btnClass(isSingle)}
        title={
          !hasTarget
            ? 'Select an email to reply all'
            : !isSingle
            ? 'Reply all not available for multiple conversations'
            : 'Reply all'
        }
      >
        <ReplyAll
          className={cn('w-3.5 h-3.5', isSingle ? 'text-purple-500' : 'text-neutral-400')}
        />
        <span>Reply all</span>
      </button>

      {/* 9. Forward */}
      <button
        disabled={!isSingle}
        onClick={() => dispatchMailAction({ action: 'forward' })}
        className={btnClass(isSingle)}
        title={
          !hasTarget
            ? 'Select an email to forward'
            : !isSingle
            ? 'Forward not available for multiple conversations'
            : 'Forward'
        }
      >
        <CornerUpRight
          className={cn('w-3.5 h-3.5', isSingle ? 'text-cyan-500' : 'text-neutral-400')}
        />
        <span>Forward</span>
      </button>

      {/* Divider */}
      <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700/80 mx-1 shrink-0" />

      {/* 10. Read / Unread */}
      <button
        disabled={!hasTarget}
        onClick={() => dispatchMailAction({ action: 'toggle-read' })}
        className={btnClass(hasTarget)}
        title={hasTarget ? 'Toggle Read / Unread' : 'Select an email'}
      >
        <Mail className="w-3.5 h-3.5" />
        <span>Read / Unread</span>
      </button>

      {/* 11. Flag */}
      <button
        disabled={!hasTarget}
        onClick={() => dispatchMailAction({ action: 'toggle-flag' })}
        className={btnClass(hasTarget)}
        title={hasTarget ? 'Toggle flag' : 'Select an email'}
      >
        <Flag
          className={cn(
            'w-3.5 h-3.5',
            hasTarget && activeEmail?.isFlagged ? 'text-amber-500 fill-amber-500' : ''
          )}
        />
        <span>Flag</span>
      </button>

      {/* 12. Undo */}
      <button
        disabled={!canUndo}
        onClick={() => dispatchMailAction({ action: 'undo' })}
        className={btnClass(canUndo)}
        title={canUndo ? 'Undo last action' : 'Nothing to undo'}
      >
        <Undo2 className="w-3.5 h-3.5" />
        <span>Undo</span>
      </button>

      {/* 13. Deselect */}
      <button
        disabled={!hasTarget}
        onClick={() => dispatchMailAction({ action: 'deselect' })}
        className={btnClass(hasTarget)}
        title={hasTarget ? 'Deselect conversation' : 'No selection'}
      >
        <X className="w-3.5 h-3.5" />
        <span>Deselect</span>
      </button>
    </div>
  );
}
