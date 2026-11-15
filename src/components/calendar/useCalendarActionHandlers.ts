'use client';

import { useMemo } from 'react';
import { useCalendarState } from './useCalendarState';
import { CalendarEvent } from './types';

interface HandlerParams {
  s: ReturnType<typeof useCalendarState>;
  showAlert: (alert: { title: string; description: string; type?: 'info' | 'error' | 'success' | 'warning' }) => void;
}

export function useCalendarActionHandlers({ s, showAlert }: HandlerParams) {
  const filteredEvents = useMemo(() => {
    const q = s.searchQuery.trim().toLowerCase();
    if (!q) return s.events;
    return s.events.filter(
      (e) => e.title.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q)
    );
  }, [s.events, s.searchQuery]);

  const handleOpenSlot = (day: number, hr: number, date?: Date) => {
    if (s.isViewOnly) {
      showAlert({
        title: s.isUserNotFound ? 'Activate Calendar' : 'View-Only Calendar',
        description: s.isUserNotFound
          ? 'Your calendar is currently in view-only mode. Click "Add to Calendar" above to activate your calendar.'
          : 'Calendar is in view-only mode (401 Unauthorized). Please sign in to create schedules.',
        type: 'info',
      });
      return;
    }
    s.setSlotDay(day);
    s.setSlotHour(hr);
    if (date) {
      s.setSlotDate(date);
    }
    s.setSelectedEvent(null);
    s.setCreateModalOpen(true);
  };

  const handleNewSchedule = () => {
    if (s.isViewOnly) {
      showAlert({
        title: s.isUserNotFound ? 'Activate Calendar' : 'View-Only Calendar',
        description: s.isUserNotFound
          ? 'Your calendar is currently in view-only mode. Click "Add to Calendar" above to activate your calendar.'
          : 'Calendar is in view-only mode (401 Unauthorized). Please sign in to create schedules.',
        type: 'info',
      });
      return;
    }
    s.setSelectedEvent(null);
    s.setSlotDate(new Date());
    s.setCreateModalOpen(true);
  };

  const handleAddProjectClick = () => {
    if (s.isViewOnly) {
      showAlert({
        title: 'View-Only Mode',
        description: s.isUserNotFound
          ? 'Click "Add to Calendar" above to activate your calendar.'
          : 'Calendar is in view-only mode. Sign in to add calendars.',
        type: 'info',
      });
      return;
    }
    if (s.projects.length >= 1 && s.projects[0].id !== 'p-1') {
      showAlert({
        title: 'Calendar Limit',
        description: 'Only one calendar per email is supported. You can customize settings in Settings > Calendar.',
        type: 'info',
      });
      return;
    }
    s.setAddProjectModalOpen(true);
  };

  const handleOpenDetail = (evt: CalendarEvent) => {
    s.setSelectedEvent(evt);
    s.setDetailModalOpen(true);
  };

  return {
    filteredEvents,
    handleOpenSlot,
    handleNewSchedule,
    handleAddProjectClick,
    handleOpenDetail,
  };
}
