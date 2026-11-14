'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Calendar,
  FileText,
  Mail,
  CheckSquare,
  ShieldCheck,
  Check,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityItem } from './useActivityState';

interface ActivityCardItemProps {
  item: ActivityItem;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ActivityCardItem({ item, onMarkRead, onDelete }: ActivityCardItemProps) {
  const getBadgeIcon = (category: ActivityItem['category']) => {
    switch (category) {
      case 'mention':
        return <MessageSquare className="w-3 h-3 text-violet-500" />;
      case 'calendar':
        return <Calendar className="w-3 h-3 text-teal-500" />;
      case 'file':
        return <FileText className="w-3 h-3 text-amber-500" />;
      case 'email':
        return <Mail className="w-3 h-3 text-blue-500" />;
      case 'assignment':
        return <CheckSquare className="w-3 h-3 text-sky-500" />;
      case 'system':
      default:
        return <ShieldCheck className="w-3 h-3 text-emerald-500" />;
    }
  };

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all flex gap-3.5 group relative',
        item.isRead
          ? 'bg-white dark:bg-[#202020] border-neutral-200 dark:border-neutral-800'
          : 'bg-blue-50/30 dark:bg-[#1f2733] border-blue-200 dark:border-blue-900/60 shadow-xs'
      )}
    >
      {/* Actor Avatar with event badge */}
      <div className="relative shrink-0">
        {item.actorAvatar ? (
          <img src={item.actorAvatar} alt={item.actorName} className="w-10 h-10 rounded-full object-cover shadow-xs" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center font-bold text-xs">
            {item.actorName.charAt(0)}
          </div>
        )}
        <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-[#202020] shadow-xs border border-neutral-200 dark:border-neutral-700">
          {getBadgeIcon(item.category)}
        </span>
      </div>

      {/* Content Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-snug">
            <span className="font-bold text-neutral-900 dark:text-white mr-1">{item.actorName}</span>
            <span>{item.actionText}</span>
          </p>
          <span className="text-[11px] text-neutral-400 shrink-0">{item.timestamp}</span>
        </div>

        {/* Clickable Target Title Card */}
        <Link
          href={item.targetHref}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700/80 text-xs font-semibold text-neutral-900 dark:text-white transition-colors mt-1 group/link"
        >
          <span className="truncate max-w-sm">{item.targetTitle}</span>
          <ExternalLink className="w-3 h-3 text-neutral-400 group-hover/link:text-[#0078d4] shrink-0 transition-colors" />
        </Link>

        {/* Snippet preview */}
        {item.snippet && (
          <p className="text-xs text-neutral-500 italic mt-2 pl-2.5 border-l-2 border-neutral-300 dark:border-neutral-700 line-clamp-2">
            {item.snippet}
          </p>
        )}
      </div>

      {/* Hover Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-start">
        {!item.isRead && (
          <button
            type="button"
            title="Mark as read"
            onClick={() => onMarkRead(item.id)}
            className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          title="Dismiss notification"
          onClick={() => onDelete(item.id)}
          className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Unread dot */}
      {!item.isRead && (
        <span className="absolute right-3 top-3 w-2 h-2 rounded-full bg-[#0078d4]" />
      )}
    </div>
  );
}
