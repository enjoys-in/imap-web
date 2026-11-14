'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, X, Sparkles } from 'lucide-react';
import { useMailStore } from '@/stores';
import { SEARCH_OPERATOR_HINTS } from '@/lib/searchParser';

export function TopHeaderSearchBar() {
  const searchQuery = useMailStore((s) => s.searchQuery);
  const setSearchQuery = useMailStore((s) => s.setSearchQuery);
  const clearSearch = useMailStore((s) => s.clearSearch);
  const executeServerSearch = useMailStore((s) => s.executeServerSearch);
  const isSearchingServer = useMailStore((s) => s.isSearchingServer);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
      if (value.trim().length >= 2) {
        executeServerSearch(value.trim());
      }
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (searchQuery.trim()) {
        executeServerSearch(searchQuery.trim());
      }
      setIsSearchFocused(false);
    }
  };

  const handleInsertOperator = (prefix: string) => {
    const nextVal = searchQuery ? `${searchQuery.trim()} ${prefix}` : prefix;
    setSearchQuery(nextVal);
    searchInputRef.current?.focus();
  };

  return (
    <div className="flex-1 max-w-xl mx-2 md:mx-4 z-10" ref={containerRef}>
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
  );
}
