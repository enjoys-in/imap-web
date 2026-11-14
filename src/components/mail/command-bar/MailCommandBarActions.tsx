'use client';

import React, { useMemo } from 'react';
import { useMailStore } from '@/stores';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';
import { buildMailCommandBarActions } from './buildMailCommandBarActions';
import { MailCommandBarMoveMenu } from './MailCommandBarMoveMenu';
import { MailCommandBarSnoozeMenu } from './MailCommandBarSnoozeMenu';
import { MailCommandBarOverflowMenu } from './MailCommandBarOverflowMenu';
import { useCommandBarOverflow } from './useCommandBarOverflow';
import { cn } from '@/lib/utils';

export function MailCommandBarActions() {
  const selectedIds = useMailStore((s) => s.selectedIds);
  const selectedMailId = useMailStore((s) => s.selectedMailId);
  const localEmails = useMailStore((s) => s.localEmails);
  const lastSnapshot = useMailStore((s) => s.lastSnapshot);

  const activeEmail = localEmails.find((e) => e.id === selectedMailId);
  const hasSelected = selectedIds.length > 0;
  const hasTarget = hasSelected || Boolean(activeEmail);
  const isSingle = (hasSelected && selectedIds.length === 1) || (!hasSelected && Boolean(activeEmail));
  const canUndo = lastSnapshot !== null;

  const allActions = useMemo(
    () =>
      buildMailCommandBarActions({
        hasTarget,
        isSingle,
        canUndo,
        isFlagged: activeEmail?.isFlagged,
      }),
    [hasTarget, isSingle, canUndo, activeEmail?.isFlagged]
  );

  const { containerRef, visibleActions, overflowActions } = useCommandBarOverflow(allActions);

  return (
    <div ref={containerRef} className="flex items-center gap-0.5 min-w-0 flex-1 text-xs">
      {visibleActions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <React.Fragment key={action.id}>
            {action.dividerBefore && idx > 0 && (
              <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700/80 mx-1 shrink-0" />
            )}

            {action.isSpecial === 'move' ? (
              <MailCommandBarMoveMenu enabled={action.enabled} />
            ) : action.isSpecial === 'snooze' ? (
              <MailCommandBarSnoozeMenu enabled={action.enabled} />
            ) : (
              <button
                type="button"
                disabled={!action.enabled}
                onClick={() => dispatchMailAction({ action: action.id as any })}
                className={cn(
                  'h-7 px-2 rounded flex items-center gap-1.5 transition-colors text-xs whitespace-nowrap select-none shrink-0',
                  action.enabled
                    ? 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer active:scale-95'
                    : 'opacity-35 text-neutral-400 dark:text-neutral-500 cursor-not-allowed pointer-events-none'
                )}
                title={action.title}
              >
                <Icon className={cn('w-3.5 h-3.5', action.iconColor)} />
                <span>{action.label}</span>
              </button>
            )}
          </React.Fragment>
        );
      })}

      {overflowActions.length > 0 && (
        <MailCommandBarOverflowMenu actions={overflowActions} />
      )}
    </div>
  );
}
