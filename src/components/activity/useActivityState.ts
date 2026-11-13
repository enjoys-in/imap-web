'use client';

import { useState } from 'react';

export type ActivityTab = 'all' | 'mentions' | 'assigned' | 'system';

export interface ActivityItem {
  id: string;
  category: 'mention' | 'assignment' | 'email' | 'calendar' | 'file' | 'system';
  actorName: string;
  actorAvatar: string;
  actionText: string;
  targetTitle: string;
  targetType: 'mail' | 'calendar' | 'files' | 'chat' | 'todo';
  targetHref: string;
  timestamp: string;
  group: 'Today' | 'Yesterday' | 'Earlier this week';
  isRead: boolean;
  snippet?: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    category: 'mention',
    actorName: 'Sarah Connor',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    actionText: 'mentioned you in #design-system',
    targetTitle: 'Wireframe Review & Handoff',
    targetType: 'chat',
    targetHref: '/chat',
    timestamp: '10 mins ago',
    group: 'Today',
    isRead: false,
    snippet: '"Can you check the schedule modal padding on smaller screens when you get a second?"',
  },
  {
    id: 'act-2',
    category: 'calendar',
    actorName: 'Alex Rivera',
    actorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    actionText: 'invited you to a calendar event',
    targetTitle: 'IMAP Protocol & Streaming Architecture',
    targetType: 'calendar',
    targetHref: '/calendar',
    timestamp: '45 mins ago',
    group: 'Today',
    isRead: false,
    snippet: 'Today at 02:00 PM – 03:00 PM • Google Meet link included',
  },
  {
    id: 'act-3',
    category: 'file',
    actorName: 'Elena Rostova',
    actorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    actionText: 'uploaded a file to Cloud Storage',
    targetTitle: 'Release_Notes_v2.4.docx',
    targetType: 'files',
    targetHref: '/files',
    timestamp: '2 hours ago',
    group: 'Today',
    isRead: true,
  },
  {
    id: 'act-4',
    category: 'email',
    actorName: 'AWS Billing',
    actorAvatar: '',
    actionText: 'sent you a priority notification',
    targetTitle: 'Your Monthly AWS Invoice INV-2026-1049 is ready',
    targetType: 'mail',
    targetHref: '/mail/u/0#inbox',
    timestamp: 'Yesterday at 04:30 PM',
    group: 'Yesterday',
    isRead: true,
  },
  {
    id: 'act-5',
    category: 'assignment',
    actorName: 'Alex Rivera',
    actorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    actionText: 'assigned a task to you in To Do',
    targetTitle: 'Verify IndexedDB Offline Mail Cache fallback',
    targetType: 'todo',
    targetHref: '/todo',
    timestamp: 'Yesterday at 02:15 PM',
    group: 'Yesterday',
    isRead: true,
  },
  {
    id: 'act-6',
    category: 'system',
    actorName: 'AirSend Security',
    actorAvatar: '',
    actionText: 'performed automatic IMAP folder synchronization',
    targetTitle: 'Synced 8 mailboxes & 1,420 total messages',
    targetType: 'mail',
    targetHref: '/settings/mail/rules',
    timestamp: 'Nov 11, 2026',
    group: 'Earlier this week',
    isRead: true,
  },
];

export function useActivityState() {
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [activeTab, setActiveTab] = useState<ActivityTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = activities.filter((item) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = item.actorName.toLowerCase().includes(q);
      const matchTarget = item.targetTitle.toLowerCase().includes(q);
      const matchAction = item.actionText.toLowerCase().includes(q);
      if (!matchActor && !matchTarget && !matchAction) return false;
    }

    // Tab filter
    if (activeTab === 'mentions') return item.category === 'mention';
    if (activeTab === 'assigned') return item.category === 'assignment' || item.category === 'calendar';
    if (activeTab === 'system') return item.category === 'system';
    return true;
  });

  const markAllAsRead = () => {
    setActivities((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const unreadCount = activities.filter((a) => !a.isRead).length;

  return {
    activities: filtered,
    totalCount: activities.length,
    unreadCount,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    markAllAsRead,
    markAsRead,
    deleteActivity,
  };
}
