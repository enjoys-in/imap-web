'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, Moon, Sun, Settings, Send, RefreshCw, X, Loader2, Sparkles } from 'lucide-react';
import { useUiStore, useMailStore, useToastStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { CalendarNotificationBell } from '@/components/notifications/CalendarNotificationBell';
import { SEARCH_OPERATOR_HINTS } from '@/lib/searchParser';

export function TopHeader() {
  const { theme, toggleTheme, toggleSidebar } = useUiStore();
  const searchQuery = useMailStore((s) => s.searchQuery);
  const setSearchQuery = useMailStore((s) => s.setSearchQuery);
  const clearSearch = useMailStore((s) => s.clearSearch);
  const executeServerSearch = useMailStore((s) => s.executeServerSearch);
  const isSearchingServer = useMailStore((s) => s.isSearchingServer);
  const fetchEmails = useMailStore((s) => s.fetchEmails);
  const selectedFolderId = useMailStore((s) => s.selectedFolderId);
  const selectedAccountId = useMailStore((s) => s.selectedAccountId);
  const addToast = useToastStore((s) => s.addToast);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!value.trim()) {
      clearSearch();
      return;
    }
    debounceTimerRef.current = setTimeout(() => {
      executeServerSearch(value, selectedFolderId);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      executeServerSearch(searchQuery, selectedFolderId);
      setIsSearchFocused(false);
    } else if (e.key === 'Escape') {
      clearSearch();
      setIsSearchFocused(false);
    }
  };

  const handleInsertOperator = (prefix: string) => {
    const nextVal = searchQuery ? `${searchQuery.trim()} ${prefix}` : prefix;
    setSearchQuery(nextVal);
    searchInputRef.current?.focus();
  };

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

      <div className="flex-1 max-w-xl mx-2 md:mx-4 z-10" ref={searchContainerRef}>
        <div className="relative">
          {isSearchingServer ? (
            <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-300 animate-spin pointer-events-none" />
          ) : (
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          )}

          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search mail: from:alex subject:invoice has:attachment or fuzzy keywords..."
            className="w-full h-8 pl-8 pr-20 rounded bg-black/20 hover:bg-black/30 text-white text-xs md:text-sm placeholder:text-neutral-300 focus:outline-none focus:bg-white focus:text-neutral-900 focus:placeholder:text-neutral-400 transition-colors border border-white/10"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 hover:bg-white/20 rounded-full text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <kbd
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="hidden md:inline px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/80 border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
              title="Open Command Palette"
            >
              Ctrl+K
            </kbd>
          </div>

          {/* Quick Search Operator Suggestions Dropdown */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 p-2 text-xs text-neutral-800 dark:text-neutral-200 z-50 select-none animate-in fade-in-50 duration-100">
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#0078d4]" />
                <span>Search filters & operators</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-1">
                {SEARCH_OPERATOR_HINTS.map((hint) => (
                  <button
                    key={hint.prefix}
                    type="button"
                    onClick={() => handleInsertOperator(hint.prefix)}
                    className="p-1.5 text-left rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors group cursor-pointer"
                  >
                    <span className="font-semibold text-[#0078d4] dark:text-blue-400 group-hover:underline block font-mono text-[11px]">
                      {hint.prefix}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate block">
                      {hint.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 px-2">
                <span>Direct fuzzy search across subject, sender, body & attachments</span>
                <span>Press Enter to search</span>
              </div>
            </div>
          )}
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
