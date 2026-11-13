'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mail,
  Calendar,
  Users,
  MessageSquare,
  HardDrive,
  Bell,
  CheckSquare,
  FileText,
  LayoutGrid,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLastMailRoute } from '@/lib/storage/mailSessionStorage';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'mail', label: 'Mail', href: '/mail', icon: Mail },
  { id: 'calendar', label: 'Calendar', href: '/calendar', icon: Calendar },
  { id: 'people', label: 'People', href: '/people', icon: Users },
  { id: 'chat', label: 'Chat', href: '/chat', icon: MessageSquare },
  { id: 'files', label: 'Files', href: '/files', icon: HardDrive },
  { id: 'activity', label: 'Activity', href: '/activity', icon: Bell },
  { id: 'todo', label: 'To Do', href: '/todo', icon: CheckSquare },
  { id: 'notes', label: 'Notes', href: '/notes', icon: FileText },
  { id: 'apps', label: 'More apps', href: '/apps', icon: LayoutGrid },
];

export function LeftNavigationRail() {
  const pathname = usePathname();
  const [mailHref, setMailHref] = useState('/mail/u/0');

  useEffect(() => {
    const route = getLastMailRoute();
    if (route) setMailHref(route);
  }, [pathname]);

  return (
    <aside className="hidden md:flex w-12 bg-neutral-100 dark:bg-[#181818] border-r border-neutral-200 dark:border-neutral-800 flex-col items-center py-2 shrink-0 select-none">
      <div className="flex-1 flex flex-col items-center gap-1.5 w-full">
        {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => {
          const targetHref = id === 'mail' ? mailHref : href;
          const isActive = pathname.startsWith(href) || (id === 'mail' && pathname.startsWith('/mail'));
          return (
            <Link
              key={id}
              href={targetHref}
              title={label}
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded transition-colors relative group cursor-pointer',
                isActive
                  ? 'text-[#0078d4] bg-neutral-200 dark:bg-neutral-800/80 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/60'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#0078d4] rounded-r" />
              )}
              <Icon className="w-4 h-4" />
            </Link>
          );
        })}
      </div>

      <div className="w-full flex flex-col items-center pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <Link
          href="/settings/accounts"
          title="Settings"
          className={cn(
            'w-9 h-9 flex items-center justify-center rounded transition-colors cursor-pointer',
            pathname.startsWith('/settings')
              ? 'text-[#0078d4] bg-neutral-200 dark:bg-neutral-800 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 dark:text-neutral-400 dark:hover:text-white'
          )}
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
