'use client';

import React from 'react';
import { Check, Plus, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkspaceItem {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

interface CalendarWorkspaceMenuProps {
  open: boolean;
  onClose: () => void;
  workspaces: WorkspaceItem[];
  onSelect: (id: string) => void;
  onNewWorkspace: () => void;
}

export function CalendarWorkspaceMenu({
  open,
  onClose,
  workspaces,
  onSelect,
  onNewWorkspace,
}: CalendarWorkspaceMenuProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute left-3 top-13 z-50 w-64 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-2 space-y-1 animate-in fade-in zoom-in-95 select-none">
        <div className="px-2 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          Workspaces
        </div>

        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => {
              onSelect(ws.id);
              onClose();
            }}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left',
              ws.active
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                {ws.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="truncate max-w-[140px]">{ws.name}</span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-normal">
                  {ws.role}
                </span>
              </div>
            </div>
            {ws.active && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
          </button>
        ))}

        <div className="pt-1.5 border-t border-neutral-100 dark:border-neutral-800 space-y-0.5">
          <button
            onClick={() => {
              onNewWorkspace();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-neutral-400" />
            <span>Create Workspace</span>
          </button>
          <button
            onClick={onClose}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-400" />
            <span>Workspace Settings</span>
          </button>
        </div>
      </div>
    </>
  );
}
