'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, Sun, Sunrise, Calendar, ChevronRight } from 'lucide-react';
import { useMailStore, useToastStore } from '@/stores';

interface SnoozeMenuProps {
  emailId: string;
  trigger?: React.ReactNode;
}

const SNOOZE_PRESETS = [
  { label: 'Later today', time: '6:00 PM', icon: Sun },
  { label: 'Tomorrow morning', time: 'Tomorrow 8:00 AM', icon: Sunrise },
  { label: 'This weekend', time: 'Saturday 8:00 AM', icon: Calendar },
  { label: 'Next week', time: 'Next Monday 8:00 AM', icon: Calendar },
];

export function SnoozeMenu({ emailId, trigger }: SnoozeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const snoozeEmail = useMailStore((s) => s.snoozeEmail);
  const undoLastAction = useMailStore((s) => s.undoLastAction);
  const addToast = useToastStore((s) => s.addToast);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSnooze = (preset: typeof SNOOZE_PRESETS[0]) => {
    setIsOpen(false);
    snoozeEmail(emailId, preset.time);
    addToast({
      title: 'Email Snoozed',
      description: `Snoozed until ${preset.time}. Click Undo to revert.`,
      type: 'info',
    });
  };

  return (
    <div ref={menuRef} className="relative inline-block">
      <div onClick={() => setIsOpen((v) => !v)}>
        {trigger || (
          <button
            type="button"
            className="h-7 px-2 rounded flex items-center gap-1.5 transition-colors text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
            title="Snooze / Remind me later"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Snooze</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl py-1 z-50 text-xs text-neutral-800 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 font-semibold text-[11px] text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800">
            Snooze until...
          </div>
          {SNOOZE_PRESETS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSnooze(p)}
                className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/80 flex items-center justify-between cursor-pointer transition-colors"
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
