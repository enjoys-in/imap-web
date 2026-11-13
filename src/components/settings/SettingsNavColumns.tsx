'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  X,
  Users,
  Database,
  Settings,
  Mail,
  Calendar,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subcategories: { id: string; label: string; href: string }[];
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'accounts', label: 'Accounts', href: '/settings/accounts', icon: Users,
    subcategories: [
      { id: 'your-accounts', label: 'Your accounts', href: '/settings/accounts' },
      { id: 'general', label: 'General & server', href: '/settings/accounts/general' },
      { id: 'signatures', label: 'Signatures', href: '/settings/accounts/signatures' },
      { id: 'auto-replies', label: 'Automatic replies', href: '/settings/accounts/auto-replies' },
      { id: 'categories', label: 'Categories', href: '/settings/accounts/categories' },
      { id: 'storage', label: 'Storage', href: '/settings/accounts/storage' },
    ],
  },
  {
    id: 'general', label: 'General', href: '/settings/general', icon: Settings,
    subcategories: [
      { id: 'appearance', label: 'Appearance', href: '/settings/general' },
      { id: 'notifications', label: 'Notifications', href: '/settings/general/notifications' },
      { id: 'language', label: 'Language & time', href: '/settings/general/language' },
    ],
  },
  {
    id: 'mail', label: 'Mail', href: '/settings/mail', icon: Mail,
    subcategories: [
      { id: 'compose', label: 'Compose and reply', href: '/settings/mail' },
      { id: 'rules', label: 'Rules & filters', href: '/settings/mail/rules' },
      { id: 'junk', label: 'Junk email', href: '/settings/mail/junk' },
    ],
  },
  {
    id: 'data-files', label: 'Data files', href: '/settings/accounts/storage', icon: Database,
    subcategories: [{ id: 'storage-info', label: 'Storage & files', href: '/settings/accounts/storage' }],
  },
  {
    id: 'calendar', label: 'Calendar', href: '/settings/general/language', icon: Calendar,
    subcategories: [{ id: 'time-prefs', label: 'Time & calendar', href: '/settings/general/language' }],
  },
  {
    id: 'people', label: 'People', href: '/settings/mail/junk', icon: UserCheck,
    subcategories: [{ id: 'safe-contacts', label: 'Safe & blocked', href: '/settings/mail/junk' }],
  },
];

export function SettingsNavColumns() {
  const pathname = usePathname();
  const [search, setSearch] = useState('');

  const activeCategory =
    CATEGORIES.find(
      (cat) => pathname.startsWith(cat.href) || cat.subcategories.some((s) => s.href === pathname)
    ) || CATEGORIES[0];

  const filteredCategories = CATEGORIES.filter((cat) =>
    cat.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col sm:flex-row shrink-0 border-b sm:border-b-0 sm:border-r border-neutral-200 dark:border-[#2b2b2b] select-none transition-colors">
      {/* Column 1: Main Categories */}
      <div className="w-full sm:w-48 bg-neutral-100 dark:bg-[#161616] p-2.5 flex flex-col gap-1.5 shrink-0 border-b sm:border-b-0 sm:border-r border-neutral-200 dark:border-[#2b2b2b] transition-colors">
        {/* Search Input */}
        <div className="relative mb-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search settings"
            className="w-full h-7 pl-8 pr-7 bg-white dark:bg-[#222222] border border-neutral-300 dark:border-neutral-700/80 rounded text-xs text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-[#0078d4] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Categories List */}
        <div className="space-y-0.5 overflow-y-auto">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory.id === cat.id;

            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-[#0078d4] font-semibold bg-[#c7e0f4]/50 dark:text-white dark:bg-[#252525]'
                    : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-[#202020]'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#0078d4] rounded-r" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0078d4]' : 'text-neutral-500 dark:text-neutral-400'}`} />
                <span>{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Column 2: Sub-categories */}
      <div className="w-full sm:w-44 bg-neutral-50 dark:bg-[#1b1b1b] p-2 flex flex-col gap-0.5 shrink-0 transition-colors">
        <div className="hidden sm:block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-3 py-1 mb-0.5">
          {activeCategory.label}
        </div>
        <div className="flex sm:flex-col gap-0.5 overflow-x-auto sm:overflow-x-visible">
          {activeCategory.subcategories.map((sub) => {
            const isSubActive =
              pathname === sub.href ||
              (sub.href === '/settings/general' && pathname === '/settings/general/appearance') ||
              (sub.href === '/settings/mail' && pathname === '/settings/mail/compose');
            return (
              <Link
                key={sub.id}
                href={sub.href}
                className={`relative flex items-center px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap ${
                  isSubActive
                    ? 'text-[#0078d4] font-semibold bg-[#c7e0f4]/50 dark:text-white dark:bg-[#252525]'
                    : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-[#222222]'
                }`}
              >
                {isSubActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#0078d4] rounded-r" />
                )}
                <span>{sub.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
