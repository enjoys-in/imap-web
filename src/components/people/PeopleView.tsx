'use client';

import React from 'react';
import { Users, Mail, Phone, Building } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

const CONTACTS = [
  {
    id: 'c-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@contoso.com',
    role: 'VP of Product Engineering',
    company: 'Contoso',
    phone: '+1 (555) 234-5678',
  },
  {
    id: 'c-2',
    name: 'David Chen',
    email: 'david.chen@contoso.com',
    role: 'Lead UI/UX Designer',
    company: 'Contoso',
    phone: '+1 (555) 876-5432',
  },
  {
    id: 'c-3',
    name: 'Emily Watson',
    email: 'emily.w@contoso.com',
    role: 'Principal Backend Architect',
    company: 'Contoso',
    phone: '+1 (555) 345-6789',
  },
];

export function PeopleView() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 select-none overflow-hidden">
      <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 px-4 flex items-center gap-3 shrink-0">
        <Users className="w-5 h-5 text-[#0078d4]" />
        <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Contacts & People
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTACTS.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 flex items-start gap-3 hover:border-[#0078d4] transition-colors"
            >
              <Avatar name={contact.name} size="lg" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {contact.name}
                </h4>
                <p className="text-xs text-neutral-500 truncate mb-2">{contact.role}</p>

                <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{contact.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
