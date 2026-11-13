'use client';

import React from 'react';
import { Activity, AtSign, CheckSquare, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityTab } from './useActivityState';

interface ActivityTabsProps {
  activeTab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
}

export function ActivityTabs({ activeTab, onTabChange }: ActivityTabsProps) {
  const TABS: { id: ActivityTab; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Activity', icon: Activity },
    { id: 'mentions', label: 'Mentions', icon: AtSign },
    { id: 'assigned', label: 'Assigned', icon: CheckSquare },
    { id: 'system', label: 'Security & System', icon: ShieldCheck },
  ];

  return (
    <div className="px-5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1c1c1c] flex items-center gap-2 shrink-0 select-none overflow-x-auto">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn(
              'flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer relative',
              isActive
                ? 'border-[#0078d4] text-[#0078d4] dark:text-blue-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
