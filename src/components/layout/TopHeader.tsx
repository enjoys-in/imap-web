'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Send, Settings, Sun, Moon, RefreshCw } from 'lucide-react';
import { useUiStore } from '@/stores';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { CalendarNotificationBell } from '@/components/notifications/CalendarNotificationBell';
import { useSyncManager } from '@/hooks/useSyncManager';
import { useGeneralSettingsStore, HeaderTheme } from '@/stores/useGeneralSettingsStore';
import { TopHeaderSearchBar } from './TopHeaderSearchBar';
import { TopHeaderProfileMenu } from './TopHeaderProfileMenu';

const HEADER_THEME_GRADIENTS: Record<HeaderTheme, string> = {
  classic: 'from-[#004578] via-[#005a9e] to-[#003056] dark:from-[#092244] dark:via-[#0c3160] dark:to-[#091e38]',
  sunset: 'from-[#782800] via-[#9e3f00] to-[#560020] dark:from-[#4a1800] dark:via-[#5c1c08] dark:to-[#380410]',
  ocean: 'from-[#004d61] via-[#006680] to-[#002f3d] dark:from-[#052833] dark:via-[#0a3847] dark:to-[#041c24]',
  circuit: 'from-[#1f242b] via-[#2a303c] to-[#14171c] dark:from-[#111317] dark:via-[#191c22] dark:to-[#0c0d10]',
  aurora: 'from-[#004d40] via-[#00695c] to-[#00332c] dark:from-[#002e26] dark:via-[#003d33] dark:to-[#00211b]',
};

export function TopHeader() {
  const { theme, toggleTheme, toggleSidebar } = useUiStore();
  const headerTheme = useGeneralSettingsStore((s) => s.headerTheme || 'classic');
  const { isSyncing, isBlocked, formattedCooldown, triggerManualSync } = useSyncManager();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeGradient = HEADER_THEME_GRADIENTS[headerTheme] || HEADER_THEME_GRADIENTS.classic;

  return (
    <header className={cn('h-12 bg-gradient-to-r text-white flex items-center justify-between px-2.5 md:px-3 shrink-0 select-none shadow-sm z-40 relative transition-colors duration-300', themeGradient)}>
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
          title={mounted && theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          aria-label={mounted && theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
              : 'Check for new mail & sync folder with IMAP server (Auto-syncs every 30 min)'
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
