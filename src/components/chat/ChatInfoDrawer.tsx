'use client';

import React from 'react';
import { X, Hash, Bell, Users, FileText, Pin, Image as ImageIcon } from 'lucide-react';
import { ChatConversation } from './useChatState';
import { cn } from '@/lib/utils';

interface ChatInfoDrawerProps {
  conversation: ChatConversation;
  onClose: () => void;
  open?: boolean;
}

export function ChatInfoDrawer({ conversation, onClose, open = true }: ChatInfoDrawerProps) {
  const isChannel = conversation.type === 'channel';

  const SAMPLE_MEMBERS = [
    { name: 'Sarah Connor', role: 'Product Designer', online: true },
    { name: 'Alex Rivera', role: 'IMAP Architect', online: true },
    { name: 'Elena Rostova', role: 'DevOps Engineer', online: false },
    { name: 'Liam Chen', role: 'Frontend Engineer', online: false },
  ];

  const SAMPLE_FILES = [
    { name: 'imap-api-spec.pdf', size: '2.4 MB', date: 'Today' },
    { name: 'calendar-preview.png', size: '1.2 MB', date: 'Yesterday' },
    { name: 'release-notes.docx', size: '840 KB', date: 'Nov 10' },
  ];

  return (
    <aside
      className={cn(
        'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1b1b1b] flex flex-col h-full shrink-0 select-none overflow-hidden transition-all duration-300 ease-in-out',
        open
          ? 'w-64 border-l opacity-100'
          : 'w-0 border-l-0 opacity-0 pointer-events-none'
      )}
    >
      <div
        className={cn(
          'w-64 h-full flex flex-col shrink-0 min-w-[256px] overflow-y-auto transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-4'
        )}
      >
        {/* Drawer Header */}
        <div className="h-14 px-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      <div className="p-4 space-y-5">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 mb-2 overflow-hidden shadow-xs">
            {isChannel ? (
              <Hash className="w-8 h-8 text-[#0078d4]" />
            ) : conversation.avatar ? (
              <img src={conversation.avatar} alt={conversation.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-lg">{conversation.name.charAt(0)}</span>
            )}
          </div>
          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
            {isChannel ? `#${conversation.name}` : conversation.name}
          </h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            {conversation.description || (isChannel ? 'Public Channel' : 'Team Member')}
          </p>
        </div>

        {/* Notifications & Settings */}
        <div className="space-y-1">
          <div className="flex items-center justify-between py-1.5 text-xs text-neutral-700 dark:text-neutral-300">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-neutral-400" />
              <span>Notifications</span>
            </div>
            <span className="text-[10px] font-semibold text-[#0078d4] bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">All Messages</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-xs text-neutral-700 dark:text-neutral-300">
            <div className="flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-neutral-400" />
              <span>Pinned Messages</span>
            </div>
            <span className="text-[10px] text-neutral-400">2</span>
          </div>
        </div>

        {/* Members Roster (if channel) */}
        {isChannel && (
          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Members ({conversation.membersCount || 4})</span>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              {SAMPLE_MEMBERS.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${m.online ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                    <span className="text-neutral-800 dark:text-neutral-200 font-medium">{m.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared Files */}
        <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Shared Files</span>
            </div>
            <span className="text-[10px] text-neutral-400">3</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {SAMPLE_FILES.map((f, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs">
                <div className="truncate">
                  <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">{f.name}</p>
                  <p className="text-[10px] text-neutral-400">{f.size} • {f.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </aside>
  );
}
