'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Send, Settings, Sun, Moon, RefreshCw } from 'lucide-react';
import { useUiStore } from '@/stores';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { CalendarNotificationBell } from '@/components/notifications/CalendarNotificationBell';
import { useSyncManager } from '@/hooks/useSyncManager';
import { TopHeaderSearchBar } from './TopHeaderSearchBar';
import { TopHeaderProfileMenu } from './TopHeaderProfileMenu';

export function TopHeader() {
  const { theme, toggleTheme, toggleSidebar } = useUiStore();
  const { isSyncing, isBlocked, formattedCooldown, triggerManualSync } = useSyncManager();

  return (
    <header className="h-12 bg-gradient-to-r from-[#004578] via-[#005a9e] to-[#003056] dark:from-[#092244] dark:via-[#0c3160] dark:to-[#091e38] text-white flex items-center justify-between px-2.5 md:px-3 shrink-0 select-none shadow-sm z-40 relative">
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

      <TopHeaderSearchBar />

      <div className="flex items-center gap-0.5 md:gap-1 shrink-0 relative">
        <button
          onClick={toggleTheme}
          className="p-1.5 hover:bg-white/15 rounded text-white transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Sync Button: 2-minute cooldown block on manual click + auto-sync every 5 minutes */}
        <button
          onClick={triggerManualSync}
          disabled={isBlocked || isSyncing}
          className={cn(
            'p-1.5 rounded text-white transition-all flex items-center gap-1.5 cursor-pointer select-none',
            isBlocked
              ? 'opacity-65 cursor-not-allowed bg-black/25 hover:bg-black/25'
              : 'hover:bg-white/15'
          )}
          title={
            isBlocked
              ? `Sync cooldown active: blocked for 2 minutes (${formattedCooldown} remaining)`
              : isSyncing
              ? 'Synchronizing mailbox with IMAP server...'
              : 'Check for new mail & sync folder with IMAP server (Auto-syncs every 5 min)'
          }
          aria-label="Sync Mailbox"
        >
          <RefreshCw className={cn('w-4 h-4 shrink-0', isSyncing && 'animate-spin')} />
          {isBlocked && (
            <span className="text-[10px] font-mono font-semibold text-white/95 leading-none pr-0.5">
              {formattedCooldown}
            </span>
          )}
        </button>

        <CalendarNotificationBell />
        <NotificationCenter />

        <Link
          href="/settings/accounts"
          className="p-1.5 hover:bg-white/15 rounded text-white transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        <TopHeaderProfileMenu />
      </div>
    </header>
  );
}
