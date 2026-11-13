'use client';

import React from 'react';
import { Search, CheckCheck, Bell } from 'lucide-react';

interface ActivityHeaderProps {
  unreadCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onMarkAllRead: () => void;
}

export function ActivityHeader({
  unreadCount,
  searchQuery,
  onSearchChange,
  onMarkAllRead,
}: ActivityHeaderProps) {
  return (
    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1c1c1c] flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#0078d4]/10 text-[#0078d4]">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-neutral-900 dark:text-white">Activity Feed</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0078d4] text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500">Mentions, calendar invitations, shared files, and email events</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-56">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search activity..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#202020] text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
          />
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#202020] text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#0078d4]" />
            <span>Mark all read</span>
          </button>
        )}
      </div>
    </div>
  );
}
