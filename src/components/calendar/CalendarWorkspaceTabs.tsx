'use client';

import React from 'react';
import { Bell, Plus, UserPlus, X, PanelLeftClose, ChevronDown } from 'lucide-react';
import { WorkspaceTab } from './types';
import { cn } from '@/lib/utils';

interface CalendarWorkspaceTabsProps {
  tabs: WorkspaceTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onAddTab: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenWorkspaceMenu: () => void;
  onOpenNotifications: () => void;
  unreadNotifications: boolean;
  onOpenInvite: () => void;
}

export function CalendarWorkspaceTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
  sidebarOpen,
  onToggleSidebar,
  onOpenWorkspaceMenu,
  onOpenNotifications,
  unreadNotifications,
  onOpenInvite,
}: CalendarWorkspaceTabsProps) {
  return (
    <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-[#f8f9fa] dark:bg-[#121212] px-3 flex items-center justify-between shrink-0 select-none relative">
      {/* Studio Brand & Sidebar Toggle */}
      <div className="flex items-center gap-2 pr-3 border-r border-neutral-200 dark:border-neutral-800">
        <button
          onClick={onOpenWorkspaceMenu}
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            ✽
          </div>
          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Agus Ardhi
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:text-neutral-700" />
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Cansaas Studio
            </span>
          </div>
        </button>

        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <PanelLeftClose className={cn('w-4 h-4 transition-transform', !sidebarOpen && 'rotate-180')} />
        </button>
      </div>

      {/* Workspace Tabs Carousel */}
      <div className="flex-1 flex items-center gap-1.5 px-3 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                'group flex items-center gap-2 h-9 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all border shrink-0',
                isActive
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs border-neutral-200 dark:border-neutral-700'
                  : 'bg-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 border-transparent hover:bg-neutral-200/50 dark:hover:bg-neutral-800/40'
              )}
            >
              <span className="text-[11px] opacity-80">{tab.icon}</span>
              <span className="truncate max-w-[140px]">{tab.name}</span>
              <button
                type="button"
                onClick={(e) => onCloseTab(tab.id, e)}
                className="opacity-0 group-hover:opacity-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 p-0.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-opacity cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={onAddTab}
          title="Add workspace tab"
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-400 transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Actions: Notifications & Invite */}
      <div className="flex items-center gap-2 pl-3">
        <button
          onClick={onOpenNotifications}
          title="Notifications"
          className="relative w-8 h-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-white dark:border-neutral-900" />
          )}
        </button>

        <button
          onClick={onOpenInvite}
          className="h-8 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-750 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-neutral-500" />
          <span>Invite</span>
        </button>
      </div>
    </header>
  );
}
