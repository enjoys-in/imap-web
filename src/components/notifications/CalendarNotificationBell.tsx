'use client';

import React, { useState } from 'react';
import {
  CalendarClock,
  Clock,
  Video,
  X,
  BellRing,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useCalendarNotificationStore } from '@/stores';
import { useCalendarNotifications } from '@/hooks/useCalendarNotifications';
import { useToastStore } from '@/stores/useToastStore';

export function CalendarNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const reminders = useCalendarNotificationStore((s) => s.reminders);
  const dismissReminder = useCalendarNotificationStore((s) => s.dismissReminder);
  const snoozeReminder = useCalendarNotificationStore((s) => s.snoozeReminder);
  const markAllRead = useCalendarNotificationStore((s) => s.markAllRead);
  const { requestPermission, checkNow } = useCalendarNotifications();
  const addToast = useToastStore((s) => s.addToast);

  const unreadReminders = reminders.filter((r) => !r.isRead);
  const unreadCount = unreadReminders.length;

  const handleEnablePush = async () => {
    const granted = await requestPermission();
    addToast({
      title: granted ? 'Push Notifications Active' : 'Push Permission Denied',
      description: granted
        ? 'Desktop alerts will notify you when AirSend is running in the background.'
        : 'Permission was blocked or dismissed in browser settings.',
      type: granted ? 'success' : 'warning',
    });
  };

  const handleManualCheck = async () => {
    setIsRefreshing(true);
    try {
      await checkNow();
      addToast({
        title: 'Alerts Synced',
        description: 'Checked calendar server for upcoming meeting reminders.',
        type: 'info',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 hover:bg-white/15 rounded text-white transition-colors relative cursor-pointer"
        title="Calendar Notifications"
        aria-label="Calendar Notifications"
      >
        <CalendarClock className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-amber-500 text-neutral-950 font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-[#004578]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#383838] rounded-xl shadow-2xl z-50 overflow-hidden select-none animate-in fade-in zoom-in-95 duration-100">
            {/* Popover Header */}
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#0078d4]" />
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Calendar Alerts ({reminders.length})
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-[#0078d4] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark read</span>
                </button>
              )}
            </div>

            {/* Notification Mode Hint */}
            <div className="px-3 py-2 bg-blue-50/50 dark:bg-blue-950/20 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
              <span className="text-neutral-600 dark:text-neutral-300">
                Window mode: <strong>In-App</strong> &bull; Background: <strong>Push</strong>
              </span>
              <button
                onClick={handleEnablePush}
                className="text-[10px] px-2 py-0.5 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <BellRing className="w-3 h-3" />
                <span>Web Push</span>
              </button>
            </div>

            {/* Reminders List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
              {reminders.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400">
                  No upcoming meeting reminders. Connected to live calendar SSE stream.
                </div>
              ) : (
                reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className={`p-3 transition-colors ${
                      !rem.isRead
                        ? 'bg-amber-500/5 dark:bg-amber-500/10'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                        {rem.title}
                      </h4>
                      <button
                        onClick={() => dismissReminder(rem.id)}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{rem.timeStr}</span>
                    </div>

                    {rem.location && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        <Video className="w-3 h-3 text-[#0078d4]" />
                        <span>{rem.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-2.5">
                      <button
                        onClick={() => snoozeReminder(rem.id, 5)}
                        className="px-2 py-0.5 text-[11px] rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                      >
                        Snooze 5m
                      </button>
                      <button
                        onClick={() => dismissReminder(rem.id)}
                        className="px-2 py-0.5 text-[11px] rounded bg-[#0078d4] hover:bg-[#106ebe] text-white transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Live SSE Stream Status Footer */}
            <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live SSE Stream</span>
              </div>
              <button
                onClick={handleManualCheck}
                disabled={isRefreshing}
                className="px-2.5 py-1 rounded bg-[#0078d4] hover:bg-[#106ebe] text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Sync now</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
