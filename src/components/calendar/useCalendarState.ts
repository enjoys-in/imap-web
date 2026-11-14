'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarEvent, CalendarViewMode, WorkspaceTab, CalendarColor } from './types';
import { WorkspaceItem } from './CalendarWorkspaceMenu';
import { CalendarNotificationItem } from './CalendarNotificationsPopover';
import { ProjectItem } from './CalendarSidebar';
import {
  getAppointments,
  createAppointment,
  deleteAppointment,
  subscribeCalendarEvents,
  type NewCalendarInput,
  type UserCalendar,
} from '@/lib/api/handlers/calendar';
import { DEFAULT_CALENDAR_COLOR } from '@/lib/calendarColors';
import { useCalendarsStore } from '@/stores/useCalendarsStore';
import { Appointment } from '@/types';

const PLACEHOLDER_PROJECT: ProjectItem = {
  id: 'p-1',
  name: 'General',
  icon: '★',
  color: DEFAULT_CALENDAR_COLOR,
};

const tabIdFor = (calendarId: string): string => `tab-${calendarId}`;

const projectIcon = (calendar: UserCalendar): string =>
  calendar.isDefault ? '★' : (Array.from(calendar.name.trim())[0] ?? '•').toUpperCase();

const toProject = (calendar: UserCalendar): ProjectItem => ({
  id: calendar.id,
  name: calendar.name,
  color: calendar.color,
  icon: projectIcon(calendar),
});

function appointmentToCalendarEvent(apt: Appointment): CalendarEvent {
  const startDate = apt.startUtc ? new Date(apt.startUtc) : new Date();
  const endDate = apt.endUtc ? new Date(apt.endUtc) : new Date(startDate.getTime() + 3600000);

  // Map getDay(): Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
  // dayIndex: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const jsDay = startDate.getDay();
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

  const startHour = isNaN(startDate.getHours()) ? 9 : startDate.getHours();
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = Math.max(0.5, Math.min(24, Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10));

  const formatTime = (d: Date) => {
    if (isNaN(d.getTime())) return '09:00 AM';
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${minStr} ${ampm}`;
  };

  const colors: CalendarColor[] = ['blue', 'cyan', 'green', 'peach', 'pink', 'purple', 'yellow', 'salmon'];
  const colorIndex = apt.id ? Math.abs(apt.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % colors.length : 0;

  return {
    id: apt.id || apt.uid || `apt-${Date.now()}`,
    title: apt.title || 'Untitled Event',
    dayIndex: Math.min(Math.max(0, dayIndex), 6),
    startTime: formatTime(startDate),
    endTime: formatTime(endDate),
    startHour,
    durationHours,
    color: colors[colorIndex],
    striped: false,
    category: apt.location || 'Meeting',
    description: apt.notes,
    meetUrl: undefined,
    participants: apt.organizerEmail
      ? [{ id: 'org', name: apt.organizerName || apt.organizerEmail, avatar: '' }]
      : [],
  };
}

export function useCalendarState() {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([
    { id: 'tab-1', name: 'General', icon: 'Hash', active: true },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState('General');
  const [activeEssential, setActiveEssential] = useState('calendar');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('Week');
  const [activeDayIndex, setActiveDayIndex] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendars = useCalendarsStore((s) => s.calendars);
  const calendarsStatus = useCalendarsStore((s) => s.status);
  const calendarsError = useCalendarsStore((s) => s.error);
  const loadCalendars = useCalendarsStore((s) => s.load);
  const createCalendarInStore = useCalendarsStore((s) => s.create);
  const seenCalendarIds = useRef(new Set<string>());
  const projects = useMemo<ProjectItem[]>(
    () => (calendars.length > 0 ? calendars.map(toProject) : [PLACEHOLDER_PROJECT]),
    [calendars]
  );
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([
    { id: 'w-1', name: 'AirSend Workspace', role: 'Owner', active: true },
  ]);
  const [notifications, setNotifications] = useState<CalendarNotificationItem[]>([]);

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      const apts = await getAppointments();
      if (active && apts.length > 0) {
        setEvents(apts.map(appointmentToCalendarEvent));
      }
    };

    void loadCalendars();
    void loadEvents();

    const unsubscribePush = subscribeCalendarEvents(() => {
      void loadCalendars({ force: true });
      void loadEvents();
    });

    return () => {
      active = false;
      unsubscribePush();
    };
  }, [loadCalendars]);

  useEffect(() => {
    const fresh = calendars.filter((c) => !seenCalendarIds.current.has(c.id));
    if (fresh.length === 0) {
      return;
    }
    const initial = seenCalendarIds.current.size === 0;
    for (const calendar of fresh) {
      seenCalendarIds.current.add(calendar.id);
    }

    const freshTabs: WorkspaceTab[] = fresh.map((calendar) => ({
      id: tabIdFor(calendar.id),
      name: calendar.name,
      icon: projectIcon(calendar),
      active: false,
    }));
    const focused = initial ? freshTabs[0] : freshTabs[freshTabs.length - 1];
    focused.active = true;

    setTabs((prev) =>
      initial ? freshTabs : [...prev.map((tab) => ({ ...tab, active: false })), ...freshTabs]
    );
    setActiveTabId(focused.id);
    setSelectedProject(focused.name);
  }, [calendars]);

  // Modals & Popovers
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [slotDay, setSlotDay] = useState(1);
  const [slotHour, setSlotHour] = useState(9);

  const handleSelectTab = (id: string) => {
    setTabs((prev) => prev.map((t) => ({ ...t, active: t.id === id })));
    setActiveTabId(id);
    const found = tabs.find((t) => t.id === id);
    if (found) setSelectedProject(found.name);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) handleSelectTab(remaining[0].id);
  };

  const handleAddProject = async (input: NewCalendarInput): Promise<void> => {
    await createCalendarInStore(input);
  };

  const handleDeleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteAppointment(id);
    } catch {
      // Ignored if server unreachable
    }
  };

  const handleSaveSchedule = async (newEventData: Partial<CalendarEvent>) => {
    const created: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newEventData.title || 'Untitled Schedule',
      dayIndex: newEventData.dayIndex ?? slotDay,
      startTime: newEventData.startTime || '08:30 AM',
      endTime: newEventData.endTime || '09:30 AM',
      startHour: newEventData.startHour ?? slotHour,
      durationHours: newEventData.durationHours || 1,
      color: newEventData.color || 'blue',
      striped: false,
      category: newEventData.category || 'Meeting',
      description: newEventData.description,
      meetUrl: newEventData.meetUrl,
      participants: newEventData.participants || [],
    };
    setEvents((prev) => [...prev, created]);

    try {
      const now = new Date();
      const start = new Date(now);
      start.setHours(created.startHour, 0, 0, 0);
      const end = new Date(start.getTime() + (created.durationHours || 1) * 3600 * 1000);
      const calendarId = calendars.find((c) => c.name === selectedProject)?.id;

      await createAppointment({
        accountId: '',
        uid: created.id,
        sequence: 0,
        title: created.title,
        location: created.category,
        startUtc: start.toISOString(),
        endUtc: end.toISOString(),
        isAllDay: false,
        isRecurring: false,
        organizerEmail: '',
        organizerName: '',
        isOrganizer: true,
        attendees: '',
        myResponse: 'Accepted',
        showAs: 'Busy',
        notes: created.description,
        calendarId,
      });
    } catch {
      // Ignored if server unreachable
    }
  };

  return {
    tabs,
    activeTabId,
    handleSelectTab,
    handleCloseTab,
    sidebarOpen,
    setSidebarOpen,
    selectedProject,
    setSelectedProject,
    activeEssential,
    setActiveEssential,
    viewMode,
    setViewMode,
    activeDayIndex,
    setActiveDayIndex,
    searchQuery,
    setSearchQuery,
    events,
    projects,
    calendarsError: calendarsStatus === 'error' ? calendarsError : null,
    reloadCalendars: () => loadCalendars({ force: true }),
    handleAddProject,
    workspaces,
    setWorkspaces,
    notifications,
    setNotifications,
    createModalOpen,
    setCreateModalOpen,
    detailModalOpen,
    setDetailModalOpen,
    workspaceMenuOpen,
    setWorkspaceMenuOpen,
    notificationsOpen,
    setNotificationsOpen,
    inviteModalOpen,
    setInviteModalOpen,
    addProjectModalOpen,
    setAddProjectModalOpen,
    selectedEvent,
    setSelectedEvent,
    slotDay,
    setSlotDay,
    slotHour,
    setSlotHour,
    handleDeleteEvent,
    handleSaveSchedule,
  };
}
