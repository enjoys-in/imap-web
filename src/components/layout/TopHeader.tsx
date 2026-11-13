'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, Moon, Sun, Settings, Send, RefreshCw } from 'lucide-react';
import { useUiStore, useMailStore, useToastStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { CalendarNotificationBell } from '@/components/notifications/CalendarNotificationBell';

export function TopHeader() {
  const { theme, toggleTheme, toggleSidebar } = useUiStore();
  const searchQuery = useMailStore((s) => s.searchQuery);
  const setSearchQuery = useMailStore((s) => s.setSearchQuery);
  const fetchEmails = useMailStore((s) => s.fetchEmails);
  const selectedFolderId = useMailStore((s) => s.selectedFolderId);
  const selectedAccountId = useMailStore((s) => s.selectedAccountId);
  const addToast = useToastStore((s) => s.addToast);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetchEmails(selectedFolderId || 'fld-inbox', selectedAccountId || undefined);
      addToast({
        title: 'Mailbox Synced',
        description: 'Folder updated with latest messages from IMAP server.',
        type: 'success',
      });
    } catch {
      addToast({
        title: 'Sync Failed',
        description: 'Failed to synchronize with IMAP server.',
        type: 'error',
      });
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  return (
    <header className="h-12 bg-gradient-to-r from-[#004578] via-[#005a9e] to-[#003056] dark:from-[#092244] dark:via-[#0c3160] dark:to-[#091e38] text-white flex items-center justify-between px-2.5 md:px-3 shrink-0 select-none shadow-sm z-40 relative">
      {/* Blueprint background grid accent */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] overflow-hidden" 
        aria-hidden="true" 
      />

      <div className="flex items-center gap-2 md:gap-3 shrink-0 z-10">
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-white/15 rounded transition-colors text-white md:hidden cursor-pointer"
          title="Toggle folders"
          aria-label="Toggle folders"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/mail" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-6 h-6 rounded-md bg-[#0078d4] flex items-center justify-center shrink-0 shadow-sm border border-white/20">
            <Send className="w-3.5 h-3.5 text-white transform -rotate-12" />
          </div>
          <span className="font-semibold text-sm md:text-base tracking-tight text-white drop-shadow-sm">
            AirSend
          </span>
        </Link>
      </div>

      <div className="flex-1 max-w-xl mx-2 md:mx-4 z-10">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mail or press Ctrl+K..."
            className="w-full h-8 pl-8 pr-16 rounded bg-black/20 hover:bg-black/30 text-white text-xs md:text-sm placeholder:text-neutral-300 focus:outline-none focus:bg-white focus:text-neutral-900 focus:placeholder:text-neutral-400 transition-colors border border-white/10"
          />
          <kbd
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/80 border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
            title="Open Command Palette"
          >
            Ctrl+K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-0.5 md:gap-1 shrink-0 relative">
        {/* Theme Switch */}
        <button
          onClick={toggleTheme}
          className="p-1.5 hover:bg-white/15 rounded text-white transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Sync Button: Placed beside right of theme switch and left of calendar notification */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="p-1.5 hover:bg-white/15 rounded text-white transition-colors cursor-pointer disabled:opacity-50"
          title="Check for new mail & sync folder with IMAP server"
          aria-label="Sync Mailbox"
        >
          <RefreshCw className={cn('w-4 h-4', isSyncing && 'animate-spin')} />
        </button>

        {/* Calendar Notification Bell */}
        <CalendarNotificationBell />
        <NotificationCenter />

        <Link
          href="/settings/accounts"
          className="p-1.5 hover:bg-white/15 rounded text-white transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        <div className="ml-1 md:ml-2 pl-1.5 md:pl-2 border-l border-white/20 flex items-center">
          <Avatar name="Mulayam" size="sm" className="ring-2 ring-white/30" />
        </div>
      </div>
    </header>
  );
}
