'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ChevronDown, Video, Plus, ExternalLink } from 'lucide-react';
import { getCachedAppointments } from '@/lib/idb/calendarCacheDb';
import { getAppointments, subscribeCalendarEvents } from '@/lib/api/handlers/calendar';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';

function formatMeetingTime(startUtc: string): string {
  try {
    const start = new Date(startUtc);
    const now = new Date();
    const isToday = start.toDateString() === now.toDateString();

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = start.toDateString() === tomorrow.toDateString();

    const timeStr = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (isToday) {
      return `Today • ${timeStr}`;
    }
    if (isTomorrow) {
      return `Tomorrow • ${timeStr}`;
    }
    const monthDay = start.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${monthDay} • ${timeStr}`;
  } catch {
    return 'Upcoming';
  }
}

function extractMeetingUrl(apt: Appointment): string | null {
  if (apt.location && apt.location.startsWith('http')) {
    return apt.location;
  }
  if (apt.notes) {
    const match = apt.notes.match(/https?:\/\/[^\s<>'"]+/i);
    if (match) return match[0];
  }
  return null;
}

export function SidebarUpcomingMeetings() {
  const [isOpen, setIsOpen] = useState(true);
  const [meetings, setMeetings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUpcoming = async () => {
    try {
      // 1. Instant load from local IndexedDB cache
      const cached = await getCachedAppointments().catch(() => []);
      if (cached.length > 0) {
        filterAndSet(cached);
        setLoading(false);
      }

      // 2. Fetch fresh from backend API
      const fresh = await getAppointments().catch(() => []);
      if (fresh.length > 0) {
        filterAndSet(fresh);
      }
    } catch {
      // Keep existing cached state
    } finally {
      setLoading(false);
    }
  };

  const filterAndSet = (list: Appointment[]) => {
    const nowMs = Date.now() - 15 * 60 * 1000; // include current meetings starting within last 15m
    const upcoming = list
      .filter((apt) => {
        const time = new Date(apt.endUtc || apt.startUtc).getTime();
        return !isNaN(time) && time >= nowMs;
      })
      .sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime())
      .slice(0, 4);

    setMeetings(upcoming);
  };

  useEffect(() => {
    void loadUpcoming();

    // Live update when calendar events change via SSE
    const unsubscribe = subscribeCalendarEvents({
      onState: () => void loadUpcoming(),
      onResync: () => void loadUpcoming(),
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800/80 bg-transparent shrink-0 select-none">
      {/* Accordion Header */}
      <div className="px-3 py-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex-1 flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer text-left"
        >
          <Calendar className="w-3.5 h-3.5 text-[#0078d4] shrink-0" />
          <span className="truncate">Upcoming Meetings</span>
          {meetings.length > 0 && (
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {meetings.length}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href="/calendar"
            title="Open Calendar"
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? 'Collapse upcoming meetings' : 'Expand upcoming meetings'}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', !isOpen && '-rotate-90')} />
          </button>
        </div>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-3 pb-2.5 pt-0.5 space-y-1.5 animate-in fade-in duration-150">
          {meetings.length === 0 ? (
            <div className="py-2 px-2 rounded-lg bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center justify-between">
              <span>{loading ? 'Checking schedule...' : 'No upcoming meetings'}</span>
              <Link
                href="/calendar"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-[10px]"
              >
                Schedule
              </Link>
            </div>
          ) : (
            meetings.map((meeting) => {
              const meetingUrl = extractMeetingUrl(meeting);
              return (
                <div
                  key={meeting.id || meeting.uid}
                  className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-850/70 border border-neutral-100 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group flex flex-col gap-1"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <Link
                      href="/calendar"
                      className="font-medium text-xs text-neutral-800 dark:text-neutral-200 group-hover:text-[#0078d4] dark:group-hover:text-blue-400 transition-colors truncate block flex-1"
                      title={meeting.title}
                    >
                      {meeting.title || 'Untitled Meeting'}
                    </Link>

                    {meetingUrl && (
                      <a
                        href={meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold flex items-center gap-1 hover:bg-emerald-100 transition-colors shrink-0"
                        title="Join Meeting"
                      >
                        <Video className="w-2.5 h-2.5" />
                        <span>Join</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500">
                    <span className="font-mono">{formatMeetingTime(meeting.startUtc)}</span>
                    {meeting.location && !meeting.location.startsWith('http') && (
                      <span className="truncate max-w-[80px]" title={meeting.location}>
                        {meeting.location}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
