'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Mail, Inbox, Send, Archive, Trash2, FileEdit,
  Sliders, ShieldCheck, HardDrive, Settings, Sun, RefreshCw, X
} from 'lucide-react';
import { useMailStore, useComposeStore, useToastStore } from '@/stores';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Settings' | 'Actions';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
}

export function CommandPaletteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const setSelectedFolder = useMailStore((s) => s.setSelectedFolder);
  const fetchEmails = useMailStore((s) => s.fetchEmails);
  const openNew = useComposeStore((s) => s.openNew);
  const addToast = useToastStore((s) => s.addToast);

  // Global Ctrl+K / Cmd+K keyboard listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    { id: 'new-mail', category: 'Actions', title: 'New Message', subtitle: 'Compose a new email', icon: Mail, action: () => openNew() },
    { id: 'sync-mail', category: 'Actions', title: 'Sync Mailbox', subtitle: 'Fetch latest messages from IMAP', icon: RefreshCw, action: () => { fetchEmails(); addToast({ title: 'Synced', description: 'Folder refreshed', type: 'success' }); } },
    { id: 'toggle-theme', category: 'Actions', title: 'Toggle Theme', subtitle: 'Switch between light and dark mode', icon: Sun, action: () => { document.documentElement.classList.toggle('dark'); } },
    { id: 'nav-inbox', category: 'Navigation', title: 'Inbox', subtitle: 'Go to Inbox', icon: Inbox, action: () => { setSelectedFolder('fld-inbox'); router.push('/mail/u/0#inbox'); } },
    { id: 'nav-sent', category: 'Navigation', title: 'Sent Items', subtitle: 'View sent messages', icon: Send, action: () => { setSelectedFolder('fld-sent'); router.push('/mail/u/0#sent'); } },
    { id: 'nav-drafts', category: 'Navigation', title: 'Drafts', subtitle: 'View message drafts', icon: FileEdit, action: () => { setSelectedFolder('fld-drafts'); router.push('/mail/u/0#drafts'); } },
    { id: 'nav-archive', category: 'Navigation', title: 'Archive', subtitle: 'View archived mail', icon: Archive, action: () => { setSelectedFolder('fld-archive'); router.push('/mail/u/0#archive'); } },
    { id: 'nav-trash', category: 'Navigation', title: 'Deleted Items', subtitle: 'View deleted messages', icon: Trash2, action: () => { setSelectedFolder('fld-deleted'); router.push('/mail/u/0#trash'); } },
    { id: 'set-storage', category: 'Settings', title: 'Storage & Quota', subtitle: 'Manage IMAP quota and storage breakdown', icon: HardDrive, action: () => router.push('/settings/accounts/storage') },
    { id: 'set-rules', category: 'Settings', title: 'Rules & Policies', subtitle: 'Configure server-side filtering policies', icon: Sliders, action: () => router.push('/settings/mail/rules') },
    { id: 'set-junk', category: 'Settings', title: 'Spam Filter', subtitle: 'Manage junk threshold & safe senders', icon: ShieldCheck, action: () => router.push('/settings/mail/junk') },
    { id: 'set-accounts', category: 'Settings', title: 'Account Settings', subtitle: 'Manage connections, ports, & credentials', icon: Settings, action: () => router.push('/settings/accounts') },
  ];

  const filtered = commands.filter((c) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return c.title.toLowerCase().includes(q) || (c.subtitle && c.subtitle.toLowerCase().includes(q));
  });

  const handleSelect = (cmd: CommandItem) => {
    setIsOpen(false);
    cmd.action();
  };

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-100">
      <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-10 text-neutral-800 dark:text-neutral-200">
        <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyNavigation}
            placeholder="Type a command or jump to folder (Ctrl+K)..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-300 dark:border-neutral-700">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-1 text-xs">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-neutral-400">No commands found</div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => handleSelect(cmd)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'w-full px-3.5 py-2 text-left flex items-center justify-between cursor-pointer transition-colors',
                    isSelected ? 'bg-[#0078d4]/10 dark:bg-[#0078d4]/20 text-[#0078d4] dark:text-blue-300' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={cn('w-4 h-4 shrink-0', isSelected ? 'text-[#0078d4]' : 'text-neutral-400')} />
                    <div className="truncate">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">{cmd.title}</div>
                      {cmd.subtitle && <div className="text-[11px] text-neutral-400 truncate">{cmd.subtitle}</div>}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 shrink-0 ml-2">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
