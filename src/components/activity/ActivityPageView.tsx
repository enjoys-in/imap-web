'use client';

import React from 'react';
import { useActivityState } from './useActivityState';
import { ActivityHeader } from './ActivityHeader';
import { ActivityTabs } from './ActivityTabs';
import { ActivityCardItem } from './ActivityCardItem';

export function ActivityPageView() {
  const {
    activities,
    unreadCount,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    markAllAsRead,
    markAsRead,
    deleteActivity,
  } = useActivityState();

  const GROUPS: ('Today' | 'Yesterday' | 'Earlier this week')[] = [
    'Today',
    'Yesterday',
    'Earlier this week',
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50/50 dark:bg-[#181818] select-none">
      {/* Header */}
      <ActivityHeader
        unreadCount={unreadCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onMarkAllRead={markAllAsRead}
      />

      {/* Tabs */}
      <ActivityTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Timeline Stream */}
      <div className="flex-1 overflow-y-auto p-5 max-w-4xl w-full mx-auto space-y-6">
        {activities.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-xs">
            <p className="font-semibold text-neutral-600 dark:text-neutral-300">No activity to show</p>
            <p className="mt-1">You are all caught up! New mentions, invites, and file updates will appear here.</p>
          </div>
        ) : (
          GROUPS.map((group) => {
            const groupItems = activities.filter((item) => item.group === group);
            if (groupItems.length === 0) return null;

            return (
              <div key={group} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    {group}
                  </span>
                  <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                </div>

                <div className="space-y-2.5">
                  {groupItems.map((item) => (
                    <ActivityCardItem
                      key={item.id}
                      item={item}
                      onMarkRead={markAsRead}
                      onDelete={deleteActivity}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
