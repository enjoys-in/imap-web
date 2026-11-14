'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useMailStore, MailSortField, MailSortDirection } from '@/stores';
import { MailSortLayoutOptions } from './MailSortLayoutOptions';
import { cn } from '@/lib/utils';

export function MailSortMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sortField = useMailStore((s) => s.sortField);
  const sortDirection = useMailStore((s) => s.sortDirection);
  const setSortConfig = useMailStore((s) => s.setSortConfig);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fieldLabels: Record<MailSortField, string> = {
    date: 'Date',
    from: 'From',
    subject: 'Subject',
    size: 'Size',
  };

  const currentLabel = `By ${fieldLabels[sortField] || 'Date'}`;

  const handleSelectField = (field: MailSortField) => {
    const defaultDir: MailSortDirection = field === 'from' || field === 'subject' ? 'asc' : 'desc';
    const nextDir = field === sortField ? sortDirection : defaultDir;
    setSortConfig(field, nextDir);
    setIsOpen(false);
  };

  const handleSelectDirection = (dir: MailSortDirection) => {
    setSortConfig(sortField, dir);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-xs select-none">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer px-1.5 py-0.5 rounded',
          isOpen
            ? 'text-[#0078d4] dark:text-blue-400 bg-neutral-200/50 dark:bg-neutral-800'
            : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
        )}
        title="Sort, order and layout"
      >
        <span>{currentLabel}</span>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700/80 rounded-lg shadow-xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Sort by
          </div>

          {(['date', 'from', 'subject', 'size'] as MailSortField[]).map((field) => (
            <button
              key={field}
              type="button"
              onClick={() => handleSelectField(field)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer',
                sortField === field
                  ? 'text-[#0078d4] dark:text-blue-400 font-semibold bg-neutral-50 dark:bg-neutral-800/60'
                  : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/40'
              )}
            >
              <span>{fieldLabels[field]}</span>
              {sortField === field && <Check className="w-3.5 h-3.5 text-[#0078d4] dark:text-blue-400" />}
            </button>
          ))}

          <div className="my-1 border-t border-neutral-200 dark:border-neutral-700/80" />

          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Sort order
          </div>

          <button
            type="button"
            onClick={() => handleSelectDirection('desc')}
            className={cn(
              'w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer',
              sortDirection === 'desc'
                ? 'text-[#0078d4] dark:text-blue-400 font-semibold bg-neutral-50 dark:bg-neutral-800/60'
                : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/40'
            )}
          >
            <span>{sortField === 'date' ? 'Newest on top' : sortField === 'size' ? 'Largest on top' : 'Z to A'}</span>
            {sortDirection === 'desc' && <Check className="w-3.5 h-3.5 text-[#0078d4] dark:text-blue-400" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelectDirection('asc')}
            className={cn(
              'w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer',
              sortDirection === 'asc'
                ? 'text-[#0078d4] dark:text-blue-400 font-semibold bg-neutral-50 dark:bg-neutral-800/60'
                : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/40'
            )}
          >
            <span>{sortField === 'date' ? 'Oldest on top' : sortField === 'size' ? 'Smallest on top' : 'A to Z'}</span>
            {sortDirection === 'asc' && <Check className="w-3.5 h-3.5 text-[#0078d4] dark:text-blue-400" />}
          </button>

          <MailSortLayoutOptions onSelect={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
