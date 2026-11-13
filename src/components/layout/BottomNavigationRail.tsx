'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Calendar, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
];

export function BottomNavigationRail() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden h-14 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around px-2 shrink-0 select-none z-30">
      {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={id}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors text-xs font-medium',
              isActive
                ? 'text-[#0078d4] dark:text-blue-400 font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
            )}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
