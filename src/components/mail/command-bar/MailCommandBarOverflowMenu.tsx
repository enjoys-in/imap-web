'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { CommandBarActionItem } from './commandBarTypes';
import { MailCommandBarMoveMenu } from './MailCommandBarMoveMenu';
import { MailCommandBarSnoozeMenu } from './MailCommandBarSnoozeMenu';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';
import { useAnchoredPosition } from '@/hooks/useAnchoredPosition';
import { cn } from '@/lib/utils';

const MENU_WIDTH = 208;

interface MailCommandBarOverflowMenuProps {
  actions: CommandBarActionItem[];
}

export function MailCommandBarOverflowMenu({ actions }: MailCommandBarOverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { anchorRef, menuStyle, measure } = useAnchoredPosition<HTMLButtonElement>({
    width: MENU_WIDTH,
    isOpen,
  });

  const handleToggle = () => {
    if (!isOpen) measure();
    setIsOpen((v) => !v);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (actions.length === 0) return null;

  return (
    <div ref={containerRef} className="relative inline-block shrink-0">
      <button
        ref={anchorRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          'h-7 w-7 rounded flex items-center justify-center transition-colors cursor-pointer select-none',
          isOpen
            ? 'bg-neutral-300/80 dark:bg-neutral-700 text-neutral-900 dark:text-white'
            : 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
        )}
        title="More actions"
        aria-label="More actions"
        aria-expanded={isOpen}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div style={menuStyle} className="bg-white dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl py-1 z-50 text-xs text-neutral-800 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 font-semibold text-[10px] text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800">
            More actions
          </div>

          <div className="py-1 max-h-[360px] overflow-y-auto">
            {actions.map((action, idx) => {
              if (action.isSpecial === 'move') {
                return (
                  <React.Fragment key={action.id}>
                    {action.dividerBefore && idx > 0 && (
                      <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                    )}
                    <MailCommandBarMoveMenu
                      enabled={action.enabled}
                      isOverflowItem={true}
                      onItemExecuted={() => setIsOpen(false)}
                    />
                  </React.Fragment>
                );
              }

              if (action.isSpecial === 'snooze') {
                return (
                  <React.Fragment key={action.id}>
                    {action.dividerBefore && idx > 0 && (
                      <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                    )}
                    <MailCommandBarSnoozeMenu
                      enabled={action.enabled}
                      isOverflowItem={true}
                      onItemExecuted={() => setIsOpen(false)}
                    />
                  </React.Fragment>
                );
              }

              const Icon = action.icon;
              return (
                <React.Fragment key={action.id}>
                  {action.dividerBefore && idx > 0 && (
                    <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1" />
                  )}
                  <button
                    type="button"
                    disabled={!action.enabled}
                    onClick={() => {
                      setIsOpen(false);
                      dispatchMailAction({ action: action.id as any });
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left transition-colors cursor-pointer',
                      action.enabled
                        ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                        : 'opacity-40 text-neutral-400 dark:text-neutral-500 cursor-not-allowed pointer-events-none'
                    )}
                    title={action.title}
                  >
                    <Icon
                      className={cn(
                        'w-3.5 h-3.5 shrink-0',
                        action.iconColor || 'text-neutral-500 dark:text-neutral-400'
                      )}
                    />
                    <span className="truncate">{action.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
