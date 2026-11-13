import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { SettingsNavColumns } from '@/components/settings/SettingsNavColumns';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-100 dark:bg-[#202020] select-none overflow-hidden transition-colors">
      {/* Settings Top Bar */}
      <div className="h-11 bg-neutral-50 dark:bg-[#181818] border-b border-neutral-200 dark:border-[#2b2b2b] px-4 flex items-center justify-between shrink-0 transition-colors">
        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          Settings
        </span>
        <Link
          href="/mail"
          className="w-7 h-7 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
          title="Close Settings"
        >
          <X className="w-4 h-4" />
        </Link>
      </div>

      {/* 3-Column Settings Body */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        <SettingsNavColumns />
        <main className="flex-1 overflow-y-auto p-5 sm:p-8 bg-white dark:bg-[#202020] transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
