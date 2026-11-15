'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ChevronDown, Video } from 'lucide-react';
import { getCachedAppointments } from '@/lib/idb/calendarCacheDb';
import { getAppointments, subscribeCalendarEvents } from '@/lib/api/handlers/calendar';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';

function isAppointmentToday(apt: Appointment): boolean {
  try {
    if (!apt.startUtc) return false;
    const start = new Date(apt.startUtc);
    if (isNaN(start.getTime())) return false;

    const now = new Date();
    // Compare local date (year, month, day)
    const isSameDay =
      start.getFullYear() === now.getFullYear() &&
      start.getMonth() === now.getMonth() &&
      start.getDate() === now.getDate();

    if (isSameDay) return true;

    // Check if multi-day or ongoing appointment spans today
    if (apt.endUtc) {
      const end = new Date(apt.endUtc);
      if (!isNaN(end.getTime())) {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        if (start <= endOfDay && end >= startOfDay) {
          return true;
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

function formatMeetingTime(startUtc: string, endUtc?: string): string {
  try {
    const start = new Date(startUtc);
    const startStr = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (endUtc) {
      const end = new Date(endUtc);
      if (!isNaN(end.getTime())) {
        const endStr = end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        return `${startStr} – ${endStr}`;
      }
    }
    return startStr;
  } catch {
    return 'Today';
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
  const [hasLoaded, setHasLoaded] = useState(false);

  const filterAndSet = (list: Appointment[]) => {
    // Only display if user has meetings today
    const todayMeetings = list
      .filter((apt) => isAppointmentToday(apt))
      .sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime());

    setMeetings(todayMeetings);
  };

  const loadUpcoming = async () => {
    try {
      // 1. Instant load from local IndexedDB cache
      const cached = await getCachedAppointments().catch(() => []);
      if (cached.length > 0) {
        filterAndSet(cached);
      }

      // 2. Fetch fresh from backend API
      const fresh = await getAppointments().catch(() => []);
      if (fresh.length > 0) {
        filterAndSet(fresh);
      }
    } catch {
      // Keep existing cached state
    } finally {
      setHasLoaded(true);
    }
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

  // If there are no meetings today, do not display this widget at all
  if (hasLoaded && meetings.length === 0) {
    return null;
  }

  // If not yet loaded and no cached meetings, don't show any empty flash
  if (!hasLoaded && meetings.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800/80 bg-transparent shrink-0 select-none transition-all">
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

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Collapse upcoming meetings' : 'Expand upcoming meetings'}
          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 transition-transform duration-300 ease-in-out',
              !isOpen && '-rotate-90'
            )}
          />
        </button>
      </div>

      {/* Accordion Content with Smooth Transition */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-2.5 pt-0.5 space-y-1.5">
            {meetings.map((meeting) => {
              const meetingUrl = extractMeetingUrl(meeting);
              const isHappeningNow = (() => {
                try {
                  const now = Date.now();
                  const start = new Date(meeting.startUtc).getTime();
                  const end = new Date(meeting.endUtc || meeting.startUtc).getTime();
                  return now >= start && now <= (end > start ? end : start + 30 * 60 * 1000);
                } catch {
                  return false;
                }
              })();

              return (
                <div
                  key={meeting.id || meeting.uid}
                  className={cn(
                    'p-2 rounded-lg border transition-all flex flex-col gap-1',
                    isHappeningNow
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 shadow-xs'
                      : 'bg-neutral-50 dark:bg-neutral-850/70 border-neutral-100 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700'
                  )}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <Link
                      href="/calendar"
                      className="font-medium text-xs text-neutral-800 dark:text-neutral-200 hover:text-[#0078d4] dark:hover:text-blue-400 transition-colors truncate block flex-1"
                      title={meeting.title}
                    >
                      {meeting.title || 'Untitled Meeting'}
                    </Link>

                    {meetingUrl && (
                      <a
                        href={meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors shrink-0"
                        title="Join Meeting"
                      >
                        <Video className="w-2.5 h-2.5" />
                        <span>Join</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500">
                    <span className="font-mono flex items-center gap-1">
                      {isHappeningNow && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                          title="Happening now"
                        />
                      )}
                      <span>{formatMeetingTime(meeting.startUtc, meeting.endUtc)}</span>
                    </span>
                    {meeting.location && !meeting.location.startsWith('http') && (
                      <span className="truncate max-w-[90px]" title={meeting.location}>
                        {meeting.location}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
