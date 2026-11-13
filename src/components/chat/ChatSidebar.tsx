'use client';

import React from 'react';
import { Hash, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatConversation } from './useChatState';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeId: string;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: 'all' | 'channels' | 'direct';
  onTabChange: (t: 'all' | 'channels' | 'direct') => void;
  onNewChannel: () => void;
}

const STATUS_COLORS = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  busy: 'bg-rose-500',
  offline: 'bg-neutral-400',
};

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  onNewChannel,
}: ChatSidebarProps) {
  const q = searchQuery.toLowerCase();
  const filtered = conversations.filter((c) => {
    const matches = c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
    if (!matches) return false;
    if (activeTab === 'channels') return c.type === 'channel';
    if (activeTab === 'direct') return c.type === 'direct';
    return true;
  });

  const channels = filtered.filter((c) => c.type === 'channel');
  const dms = filtered.filter((c) => c.type === 'direct');

  return (
    <aside className="w-72 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#161616] flex flex-col h-full shrink-0 select-none">
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Chat & Channels</h2>
          <button
            type="button"
            onClick={onNewChannel}
            title="Create Channel"
            className="p-1.5 rounded-lg bg-[#0078d4] text-white hover:bg-[#106ebe] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search channels & people..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#202020] text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-neutral-200/50 dark:bg-neutral-800/60 rounded-md">
          {(['all', 'channels', 'direct'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={cn(
                'flex-1 text-[11px] font-medium py-1 rounded transition-colors capitalize cursor-pointer',
                activeTab === tab
                  ? 'bg-white dark:bg-[#252525] text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              )}
            >
              {tab === 'direct' ? 'Direct' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {activeTab !== 'direct' && channels.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 mb-1 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              <span>Channels</span>
              <span className="text-[10px] text-neutral-400">{channels.length}</span>
            </div>
            <div className="space-y-0.5">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => onSelect(ch.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors',
                    activeId === ch.id
                      ? 'bg-white dark:bg-[#252525] text-neutral-900 dark:text-white shadow-xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                    <span className="truncate">{ch.name}</span>
                  </div>
                  {ch.unreadCount ? (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#0078d4] text-white">
                      {ch.unreadCount}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab !== 'channels' && dms.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 mb-1 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              <span>Direct Messages</span>
              <span className="text-[10px] text-neutral-400">{dms.length}</span>
            </div>
            <div className="space-y-0.5">
              {dms.map((dm) => (
                <button
                  key={dm.id}
                  type="button"
                  onClick={() => onSelect(dm.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors',
                    activeId === dm.id
                      ? 'bg-white dark:bg-[#252525] text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                  )}
                >
                  <div className="relative shrink-0">
                    {dm.avatar ? (
                      <img src={dm.avatar} alt={dm.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                        {dm.name.charAt(0)}
                      </div>
                    )}
                    <span className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#161616]', dm.status ? STATUS_COLORS[dm.status] : STATUS_COLORS.offline)} />
                  </div>
                  <div className="flex-1 truncate text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{dm.name}</span>
                      {dm.lastMessageTime && <span className="text-[10px] text-neutral-400 shrink-0">{dm.lastMessageTime}</span>}
                    </div>
                    {dm.lastMessage && <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{dm.lastMessage}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
