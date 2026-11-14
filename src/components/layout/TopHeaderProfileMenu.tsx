'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User as UserIcon, HardDrive, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useSession } from '@/components/providers/SessionProvider';

export function TopHeaderProfileMenu() {
  const { user, account, logout } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="ml-1 md:ml-2 pl-1.5 md:pl-2 border-l border-white/20 flex items-center relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
        title={user?.email || account?.email || 'User profile'}
      >
        <Avatar
          name={user?.display_name || account?.displayName || user?.email || 'User'}
          size="sm"
          className="ring-2 ring-white/30 hover:ring-white/80 transition-all"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-3 z-50 text-xs text-neutral-800 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-neutral-200 dark:border-neutral-800">
            <Avatar
              name={user?.display_name || account?.displayName || user?.email || 'User'}
              size="md"
              className="shrink-0"
            />
            <div className="truncate">
              <p className="font-semibold text-neutral-900 dark:text-white truncate">
                {user?.display_name || account?.displayName || 'AirSend User'}
              </p>
              <p className="text-[11px] text-neutral-400 truncate">
                {user?.email || account?.email || ''}
              </p>
            </div>
          </div>

          <div className="py-1.5 space-y-0.5 border-b border-neutral-200 dark:border-neutral-800">
            <Link
              href="/settings/accounts"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Account Settings</span>
            </Link>
            <Link
              href="/settings/accounts/storage"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mailbox Storage</span>
            </Link>
          </div>

          <div className="pt-1.5">
            <button
              type="button"
              onClick={async () => {
                setIsOpen(false);
                await logout();
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer text-left font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
