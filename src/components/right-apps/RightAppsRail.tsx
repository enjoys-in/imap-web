'use client';

import React from 'react';
import { Calendar, CheckSquare, FileText, Users } from 'lucide-react';
import { useRightAppsStore, RightAppId } from '@/stores/useRightAppsStore';
import { cn } from '@/lib/utils';

interface RightAppItem {
  id: RightAppId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const APPS: RightAppItem[] = [
  { id: 'calendar', label: 'Calendar / My Day', icon: Calendar },
  { id: 'todo', label: 'To Do', icon: CheckSquare },
  { id: 'notes', label: 'Sticky Notes', icon: FileText },
  { id: 'contacts', label: 'Contacts', icon: Users },
];

export function RightAppsRail() {
  const activeApp = useRightAppsStore((s) => s.activeApp);
  const toggleApp = useRightAppsStore((s) => s.toggleApp);

  return (
    <aside className="w-10 bg-neutral-100 dark:bg-[#181818] border-l border-neutral-200 dark:border-neutral-800 flex flex-col items-center py-2 shrink-0 select-none transition-colors z-20">
      <div className="flex flex-col items-center gap-2 w-full">
        {APPS.map(({ id, label, icon: Icon }) => {
          const isActive = activeApp === id;
          return (
            <button
              key={id}
              onClick={() => toggleApp(id)}
              title={label}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded transition-colors relative cursor-pointer group',
                isActive
                  ? 'text-[#0078d4] bg-neutral-200 dark:bg-neutral-800 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/60'
              )}
            >
              {isActive && (
                <span className="absolute right-0 top-1 bottom-1 w-0.5 bg-[#0078d4] rounded-l" />
              )}
              <Icon className="w-4 h-4 transition-transform group-hover:scale-105" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
