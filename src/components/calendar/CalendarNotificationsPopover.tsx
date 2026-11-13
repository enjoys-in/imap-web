'use client';

import React from 'react';
import { Bell, Check, Clock, X } from 'lucide-react';

export interface CalendarNotificationItem {
  id: string;
  title: string;
  time: string;
  read: boolean;
}

interface CalendarNotificationsPopoverProps {
  open: boolean;
  onClose: () => void;
  notifications: CalendarNotificationItem[];
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

export function CalendarNotificationsPopover({
  open,
  onClose,
  notifications,
  onMarkAllRead,
  onDismiss,
}: CalendarNotificationsPopoverProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-4 top-13 z-50 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-2.5 animate-in fade-in zoom-in-95 select-none">
        <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Calendar Notifications
            </h4>
          </div>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-400">
              No new notifications
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-750 flex items-start justify-between gap-2 text-xs hover:border-neutral-300 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{item.time}</span>
                  </div>
                </div>
                <button
                  onClick={() => onDismiss(item.id)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
