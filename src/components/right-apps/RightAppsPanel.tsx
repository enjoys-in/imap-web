'use client';

import React from 'react';
import { X, Calendar, CheckSquare, FileText, Users } from 'lucide-react';
import { useRightAppsStore } from '@/stores/useRightAppsStore';
import { RightAppsCalendar } from './RightAppsCalendar';
import { RightAppsTodo } from './RightAppsTodo';
import { RightAppsNotes } from './RightAppsNotes';
import { RightAppsContacts } from './RightAppsContacts';

export function RightAppsPanel() {
  const activeApp = useRightAppsStore((s) => s.activeApp);
  const closeApp = useRightAppsStore((s) => s.closeApp);

  if (!activeApp) return null;

  const appInfo = {
    calendar: { title: 'Calendar / My Day', icon: Calendar },
    todo: { title: 'To Do', icon: CheckSquare },
    notes: { title: 'Sticky Notes', icon: FileText },
    contacts: { title: 'Contacts & People', icon: Users },
  }[activeApp];

  const Icon = appInfo.icon;

  return (
    <div className="w-80 md:w-88 flex flex-col h-full border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shrink-0 select-none transition-colors z-20 shadow-lg">
      {/* Panel Top Header */}
      <div className="h-10 px-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
          <Icon className="w-4 h-4 text-[#0078d4]" />
          <span>{appInfo.title}</span>
        </div>
        <button
          type="button"
          onClick={closeApp}
          className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Body Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeApp === 'calendar' && <RightAppsCalendar />}
        {activeApp === 'todo' && <RightAppsTodo />}
        {activeApp === 'notes' && <RightAppsNotes />}
        {activeApp === 'contacts' && <RightAppsContacts />}
      </div>
    </div>
  );
}
