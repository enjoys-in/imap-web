'use client';

import React, { useState } from 'react';
import { Search, Mail } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useComposeStore } from '@/stores/useComposeStore';
import { useMailContacts } from '@/hooks/useMailContacts';

export function RightAppsContacts() {
  const [query, setQuery] = useState('');
  const openNew = useComposeStore((s) => s.openNew);
  const updateFields = useComposeStore((s) => s.updateFields);

  // Contacts are the people found in the user's own mail.
  const contacts = useMailContacts();

  const q = query.toLowerCase();
  const filtered = contacts.filter(
    (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  );

  const handleSendEmail = (email: string) => {
    openNew();
    setTimeout(() => {
      updateFields({ to: email });
    }, 10);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-xs text-neutral-800 dark:text-neutral-200 select-none">
      {/* Search Header */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts..."
            className="w-full h-7 pl-8 pr-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs focus:outline-none focus:border-[#0078d4]"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map((contact) => (
          <div
            key={contact.id}
            className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-[#0078d4] transition-colors shadow-2xs space-y-2"
          >
            <div className="flex items-center gap-2.5">
              <Avatar name={contact.name} size="md" />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white truncate">{contact.name}</h4>
              </div>
            </div>

            <div className="text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1 pt-1 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => handleSendEmail(contact.email)}
                className="px-2.5 py-1 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Mail className="w-3 h-3" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center text-neutral-400 text-center">
            <p>No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
