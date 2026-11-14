'use client';

import React from 'react';
import { Users, Mail } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useMailContacts } from '@/hooks/useMailContacts';
import { useComposeStore } from '@/stores/useComposeStore';

export function PeopleView() {
  const contacts = useMailContacts();
  const openNew = useComposeStore((s) => s.openNew);
  const updateFields = useComposeStore((s) => s.updateFields);

  const handleSendEmail = (email: string) => {
    openNew();
    setTimeout(() => updateFields({ to: email }), 10);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 px-4 flex items-center gap-3 shrink-0">
        <Users className="w-5 h-5 text-[#0078d4]" />
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Contacts & People
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6 max-w-4xl">
        {contacts.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs text-neutral-400 text-center">
            <p>No contacts yet. People you exchange mail with will show up here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 flex items-start gap-3 hover:border-[#0078d4] transition-colors"
              >
                <Avatar name={contact.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {contact.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendEmail(contact.email)}
                    className="mt-2 px-2.5 py-1 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
