'use client';

import React from 'react';
import { Keyboard, X, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  items: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: 'Navigation & Triage',
    items: [
      { keys: ['J'], description: 'Next email in list' },
      { keys: ['K'], description: 'Previous email in list' },
      { keys: ['/'], description: 'Search emails' },
      { keys: ['Esc'], description: 'Close modals / Deselect' },
      { keys: ['?'], description: 'Show keyboard shortcuts cheatsheet' },
    ],
  },
  {
    title: 'Actions',
    items: [
      { keys: ['E'], description: 'Archive email' },
      { keys: ['#', 'Del'], description: 'Delete email' },
      { keys: ['S'], description: 'Toggle flag / star' },
      { keys: ['U'], description: 'Mark as unread / read' },
      { keys: ['H'], description: 'Snooze email' },
    ],
  },
  {
    title: 'Compose & Reply',
    items: [
      { keys: ['C'], description: 'Compose new message' },
      { keys: ['R'], description: 'Reply to sender' },
      { keys: ['A'], description: 'Reply all' },
      { keys: ['F'], description: 'Forward email' },
      { keys: ['Ctrl', 'Enter'], description: 'Send message' },
      { keys: ['Ctrl', 'Shift', 'Enter'], description: 'Send and archive' },
    ],
  },
];

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <span>Keyboard Shortcuts</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                  Superhuman Mode
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Speed up your email triage without touching your mouse
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="p-5 overflow-y-auto space-y-6">
          {SHORTCUT_CATEGORIES.map((cat) => (
            <div key={cat.title} className="space-y-2.5">
              <h4 className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {cat.title}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cat.items.map((item) => (
                  <div
                    key={item.description}
                    className="p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2 py-1 text-[11px] font-mono font-bold bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded border border-neutral-300 dark:border-neutral-600 shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 text-center">
          Press <kbd className="px-1.5 py-0.5 font-mono font-bold bg-white dark:bg-neutral-800 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">?</kbd> anywhere in the app to toggle this cheatsheet.
        </div>
      </div>
    </div>
  );
}
