'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, Moon, Sun, Settings, Send, MailPlus } from 'lucide-react';
import { useUiStore, useMailStore, useComposeStore } from '@/stores';
import { Avatar } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { CalendarNotificationBell } from '@/components/notifications/CalendarNotificationBell';

export function TopHeader() {
  const { theme, toggleTheme, toggleSidebar } = useUiStore();
  const searchQuery = useMailStore((s) => s.searchQuery);
  const setSearchQuery = useMailStore((s) => s.setSearchQuery);
  const openNew = useComposeStore((s) => s.openNew);

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

        <button
          onClick={openNew}
          className="h-7 px-2.5 bg-white/15 hover:bg-white/25 text-white font-medium text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20 shadow-xs ml-1"
          title="Compose New Mail"
        >
          <MailPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New mail</span>
        </button>
      </div>

      <div className="flex-1 max-w-xl mx-2 md:mx-4 z-10">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full h-8 pl-8 pr-3 rounded bg-black/20 hover:bg-black/30 text-white text-xs md:text-sm placeholder:text-neutral-300 focus:outline-none focus:bg-white focus:text-neutral-900 focus:placeholder:text-neutral-400 transition-colors border border-white/10"
          />
        </div>
      </div>

      <div className="flex items-center gap-0.5 md:gap-1 shrink-0 relative">
        <button
          onClick={toggleTheme}
          className="p-1.5 hover:bg-white/15 rounded text-white transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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

        <div className="ml-1 md:ml-2 pl-1.5 md:pl-2 border-l border-white/20 flex items-center">
          <Avatar name="Mulayam" size="sm" className="ring-2 ring-white/30" />
        </div>
      </div>
    </header>
  );
}
