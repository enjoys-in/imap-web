'use client';

import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarAddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (project: { name: string; icon: string; color: string }) => void;
}

const COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-cyan-600',
];

const ICONS = ['Q', '★', '🔥', '🐟', '⚡', '🚀', '🎯', '📦'];

export function CalendarAddProjectModal({
  open,
  onClose,
  onAdd,
}: CalendarAddProjectModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
    });
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Add New Project
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design System 2.0"
              className="w-full h-9 px-3 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
              Badge Icon
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    'w-7 h-7 rounded-lg text-xs font-bold border transition-all flex items-center justify-center',
                    selectedIcon === icon
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 scale-105'
                      : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
              Color Theme
            </label>
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all cursor-pointer',
                    c,
                    selectedColor === c && 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-8 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
