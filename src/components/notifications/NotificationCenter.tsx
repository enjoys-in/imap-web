'use client';

import React, { useState } from 'react';
import { Bell, Mail, Calendar, Check, BellRing, Sparkles } from 'lucide-react';
import { requestWebPushPermission, dispatchNotification } from '@/lib/notificationDispatcher';
import { useToastStore } from '@/stores/useToastStore';

interface NotificationEntry {
  id: string;
  title: string;
  detail: string;
  time: string;
  isRead: boolean;
  type: 'mail' | 'calendar' | 'system';
}

const INITIAL_NOTIFICATIONS: NotificationEntry[] = [
  {
    id: 'notif-1',
    title: 'Sarah Jenkins sent an email',
    detail: 'Q3 Product Roadmap Review & Sprint Planning',
    time: '35m ago',
    isRead: false,
    type: 'mail',
  },
  {
    id: 'notif-2',
    title: 'Upcoming Meeting in 25 min',
    detail: 'Sprint Planning & Backlog Grooming (Teams)',
    time: '25m ago',
    isRead: false,
    type: 'calendar',
  },
  {
    id: 'notif-3',
    title: 'CI/CD Pipeline Succeeded',
    detail: 'Release v2.4.0-rc1 passed all tests',
    time: '2h ago',
    isRead: true,
    type: 'system',
  },
];

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const addToast = useToastStore((s) => s.addToast);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleEnablePush = async () => {
    const granted = await requestWebPushPermission();
    if (granted) {
      addToast({
        title: 'Desktop Push Enabled',
        description: 'You will now receive notifications for new emails.',
        type: 'success',
      });
    } else {
      addToast({
        title: 'Push Notifications Disabled',
        description: 'Permission was dismissed or blocked in browser settings.',
        type: 'warning',
      });
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleSimulateEmail = () => {
    dispatchNotification({
      title: 'New Email from Sarah Jenkins',
      body: 'Q3 Product Roadmap Review & Sprint Planning',
      type: 'info',
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 hover:bg-white/15 rounded text-white transition-colors relative cursor-pointer"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0078d4]" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#383838] rounded-xl shadow-2xl z-50 overflow-hidden select-none animate-in fade-in zoom-in-95 duration-100">
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Notifications ({unreadCount})
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-[#0078d4] hover:underline flex items-center gap-1 font-medium"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="p-2 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 flex items-center justify-between">
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Web Push Alerts
              </span>
              <button
                onClick={handleEnablePush}
                className="text-[11px] px-2 py-0.5 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium transition-colors flex items-center gap-1"
              >
                <BellRing className="w-3 h-3" />
                <span>Enable</span>
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-start gap-2.5 ${
                    !item.isRead ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="pt-0.5">
                    {item.type === 'mail' ? (
                      <Mail className="w-4 h-4 text-[#0078d4]" />
                    ) : item.type === 'calendar' ? (
                      <Calendar className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Bell className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {item.detail}
                    </p>
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50">
              <button
                onClick={handleSimulateEmail}
                className="w-full py-1 px-2.5 rounded bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0078d4]" />
                <span>Simulate New Email Arrival</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
