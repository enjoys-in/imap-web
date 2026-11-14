'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, Sun, Sunrise, Calendar, ChevronDown } from 'lucide-react';
import { dispatchMailAction } from '@/lib/events/mailActionEvents';
import { cn } from '@/lib/utils';

export const SNOOZE_PRESETS = [
  { label: 'Later today', time: '6:00 PM', icon: Sun },
  { label: 'Tomorrow morning', time: 'Tomorrow 8:00 AM', icon: Sunrise },
  { label: 'This weekend', time: 'Saturday 8:00 AM', icon: Calendar },
  { label: 'Next week', time: 'Next Monday 8:00 AM', icon: Calendar },
];

interface MailCommandBarSnoozeMenuProps {
  enabled: boolean;
  className?: string;
  isOverflowItem?: boolean;
  onItemExecuted?: () => void;
}

export function MailCommandBarSnoozeMenu({
  enabled,
  className,
  isOverflowItem = false,
  onItemExecuted,
}: MailCommandBarSnoozeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleSelectTime = (time: string) => {
    setIsOpen(false);
    dispatchMailAction({
      action: 'snooze',
      snoozeUntil: time,
    });
    onItemExecuted?.();
  };

  if (isOverflowItem) {
    return (
      <div ref={containerRef} className="relative w-full">
        <button
          type="button"
          disabled={!enabled}
          onClick={() => setIsOpen((v) => !v)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer',
            enabled
              ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
              : 'opacity-40 text-neutral-400 cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Snooze until...</span>
          </div>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {isOpen && enabled && (
          <div className="pl-6 pr-2 py-1 space-y-0.5 bg-neutral-50 dark:bg-[#1a1a1a] border-y border-neutral-200 dark:border-neutral-800 animate-in fade-in duration-100">
            {SNOOZE_PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectTime(p.time)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-neutral-400" />
                    <span>{p.label}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">{p.time}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        disabled={!enabled}
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'h-7 px-2 rounded flex items-center gap-1.5 transition-colors text-xs whitespace-nowrap select-none',
          enabled
            ? 'hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 cursor-pointer active:scale-95'
            : 'opacity-35 text-neutral-400 dark:text-neutral-500 cursor-not-allowed pointer-events-none',
          className
        )}
        title={enabled ? 'Snooze / Remind me later' : 'Select an email'}
      >
        <Clock className={cn('w-3.5 h-3.5', enabled ? 'text-amber-500' : 'text-neutral-400')} />
        <span>Snooze</span>
      </button>

      {isOpen && enabled && (
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
                onClick={() => handleSelectTime(p.time)}
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
  );
}
