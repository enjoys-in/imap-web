'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckSquare, FileText, Users } from 'lucide-react';
import { useRightAppsStore } from '@/stores/useRightAppsStore';
import { cn } from '@/lib/utils';
import { RightAppsCalendar } from './RightAppsCalendar';
import { RightAppsTodo } from './RightAppsTodo';
import { RightAppsNotes } from './RightAppsNotes';
import { RightAppsContacts } from './RightAppsContacts';

export function RightAppsPanel() {
  const activeApp = useRightAppsStore((s) => s.activeApp);
  const closeApp = useRightAppsStore((s) => s.closeApp);

  // Keep track of the last active app so contents stay intact during closing transition
  const [displayedApp, setDisplayedApp] = useState(activeApp);

  useEffect(() => {
    if (activeApp) {
      setDisplayedApp(activeApp);
    }
  }, [activeApp]);

  const isOpen = Boolean(activeApp);
  const currentApp = activeApp || displayedApp;

  const appInfo = currentApp
    ? {
        calendar: { title: 'Calendar / My Day', icon: Calendar },
        todo: { title: 'To Do', icon: CheckSquare },
        notes: { title: 'Sticky Notes', icon: FileText },
        contacts: { title: 'Contacts & People', icon: Users },
      }[currentApp]
    : null;

  const Icon = appInfo?.icon || Calendar;

  return (
    <aside
      aria-label="Side app panel"
      className={cn(
        'hidden md:flex h-full flex-col shrink-0 z-20 bg-white dark:bg-[#1a1a1a] overflow-hidden',
        'transition-all duration-300 ease-in-out',
        isOpen
          ? 'w-80 md:w-88 border-l border-neutral-200 dark:border-neutral-800 shadow-lg opacity-100'
          : 'w-0 border-l-0 shadow-none opacity-0 pointer-events-none'
      )}
    >
      <div
        className={cn(
          'w-80 md:w-88 h-full flex flex-col shrink-0 min-w-[320px] md:min-w-[352px] transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-4'
        )}
      >
        {/* Panel Top Header */}
        <div className="h-10 px-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
            <Icon className="w-4 h-4 text-[#0078d4]" />
            <span>{appInfo?.title || 'App Panel'}</span>
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
        <div
          key={currentApp}
          className="flex-1 flex flex-col min-h-0 overflow-hidden animate-in fade-in duration-150"
        >
          {currentApp === 'calendar' && <RightAppsCalendar />}
          {currentApp === 'todo' && <RightAppsTodo />}
          {currentApp === 'notes' && <RightAppsNotes />}
          {currentApp === 'contacts' && <RightAppsContacts />}
        </div>
      </div>
    </aside>
  );
}
