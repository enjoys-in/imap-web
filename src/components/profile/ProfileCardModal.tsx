'use client';

import React, { useState } from 'react';
import { X, Phone, Mail, MoreHorizontal, ChevronDown } from 'lucide-react';
import { BimiAvatar } from '@/components/ui/BimiAvatar';
import { useComposeStore } from '@/stores/useComposeStore';
import { ProfileContactInfo } from './ProfileContactInfo';
import { ProfileRecentMessages } from './ProfileRecentMessages';
import { cn } from '@/lib/utils';

export interface ProfileContactData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  bimiLogoUrl?: string;
}

interface ProfileCardModalProps {
  contact: ProfileContactData | null;
  isOpen: boolean;
  onClose: () => void;
}

const TABS = ['Overview', 'Contact', 'Files', 'Messages', 'LinkedIn'] as const;
type TabType = typeof TABS[number];

export function ProfileCardModal({ contact, isOpen, onClose }: ProfileCardModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const openNew = useComposeStore((s) => s.openNew);
  const updateFields = useComposeStore((s) => s.updateFields);

  if (!isOpen || !contact) return null;

  const handleSendEmail = () => {
    openNew();
    setTimeout(() => {
      updateFields({ to: contact.email });
    }, 10);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-100 transition-colors">
        {/* Top Header Card matching Screenshot 2 */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1e1e1e] shrink-0 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <BimiAvatar
              name={contact.name}
              email={contact.email}
              explicitLogo={contact.bimiLogoUrl}
              size="xl"
              className="ring-2 ring-white/10 shadow-md"
            />

            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white truncate">
                {contact.name}
              </h2>
              <p className="text-xs text-neutral-500 truncate mt-0.5">{contact.email}</p>

              {/* Action Buttons: Call, Mail, More */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  className="h-7 px-3 rounded-md bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="h-7 w-7 rounded-md bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
                  title="Send message"
                >
                  <Mail className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  className="h-7 w-7 rounded-md bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
                  title="More actions"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 mt-5 -mb-5 border-t border-neutral-200 dark:border-neutral-800/80 pt-2 text-xs font-semibold overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'pb-2 transition-colors relative cursor-pointer whitespace-nowrap',
                    isActive
                      ? 'text-[#0078d4] font-bold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                  )}
                >
                  <span>{tab}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0078d4] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <ProfileContactInfo
            name={contact.name}
            email={contact.email}
            phone={contact.phone}
            company={contact.company}
          />

          <ProfileRecentMessages
            contactName={contact.name}
            contactEmail={contact.email}
            onSelectMessage={() => onClose()}
          />
        </div>
      </div>
    </div>
  );
}
