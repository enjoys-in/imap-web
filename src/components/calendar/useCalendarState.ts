'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarEvent, CalendarViewMode, WorkspaceTab, CalendarColor } from './types';
import { WorkspaceItem } from './CalendarWorkspaceMenu';
import { CalendarNotificationItem } from './CalendarNotificationsPopover';
import { ProjectItem } from './CalendarSidebar';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  rsvpAppointment,
  subscribeCalendarEvents,
  type NewCalendarInput,
  type UserCalendar,
} from '@/lib/api/handlers/calendar';
import { DEFAULT_CALENDAR_COLOR } from '@/lib/calendarColors';
import { useCalendarsStore } from '@/stores/useCalendarsStore';
import { useCalendarNotificationStore } from '@/stores/useCalendarNotificationStore';
import { useTeamAvailabilityStore } from '@/stores/useTeamAvailabilityStore';
import { useToastStore } from '@/stores/useToastStore';
import { useCalendarHealthPoll } from '@/hooks/useCalendarHealthPoll';
import { getAccounts } from '@/lib/api/handlers/account';
import { getAuthToken } from '@/lib/api/client';
import { getCachedAppointments } from '@/lib/idb/calendarCacheDb';
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

  const startHour = isNaN(startDate.getHours())
    ? 9
    : startDate.getHours() + startDate.getMinutes() / 60;
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = Math.max(0.25, Math.min(24, Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100));

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

  let attendeesList: { id: string; name: string; avatar: string }[] = [];
  if (apt.attendees) {
    try {
      const parsed = typeof apt.attendees === 'string' ? JSON.parse(apt.attendees) : apt.attendees;
      if (Array.isArray(parsed)) {
        attendeesList = parsed.map((a: any, idx: number) => ({
          id: `p-${idx}`,
          name: typeof a === 'string' ? a.split('@')[0] : a.name || a.email?.split('@')[0] || 'Guest',
          avatar: '',
        }));
      } else if (typeof parsed === 'object') {
        attendeesList = Object.entries(parsed).map(([key, val]: [string, any]) => ({
          id: key,
          name: val.name || val.email?.split('@')[0] || 'Guest',
          avatar: '',
        }));
      }
    } catch {}
  }

  const participants = attendeesList.length > 0
    ? attendeesList
    : apt.organizerEmail
    ? [{ id: 'org', name: apt.organizerName || apt.organizerEmail, avatar: '' }]
    : [];

  const extractedMeetUrl =
    apt.location && /https?:\/\/[^\s]+/i.test(apt.location)
      ? apt.location.match(/https?:\/\/[^\s]+/i)?.[0]
      : apt.notes && /https?:\/\/[^\s]+/i.test(apt.notes)
      ? apt.notes.match(/https?:\/\/[^\s]+/i)?.[0]
      : undefined;

  return {
    id: apt.id || apt.uid || `apt-${Date.now()}`,
    uid: apt.uid || apt.id,
    title: apt.title || 'Untitled Event',
    dayIndex: Math.min(Math.max(0, dayIndex), 6),
    startTime: formatTime(startDate),
    endTime: formatTime(endDate),
    startHour,
    durationHours,
    color: colors[colorIndex],
    striped: Boolean(apt.isRecurring),
    category: apt.location || 'Meeting',
    location: apt.location,
    description: apt.notes,
    meetUrl: extractedMeetUrl,
    participants,
    isAllDay: Boolean(apt.isAllDay),
    isRecurring: Boolean(apt.isRecurring),
    organizerEmail: apt.organizerEmail,
    isOrganizer: apt.isOrganizer,
    myResponse: apt.myResponse,
    startUtc: apt.startUtc,
    endUtc: apt.endUtc,
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
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [slotDate, setSlotDate] = useState<Date>(() => new Date());
  const getTodayDayIndex = () => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  };
  const [activeDayIndex, setActiveDayIndex] = useState(getTodayDayIndex);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendars = useCalendarsStore((s) => s.calendars);
  const calendarsStatus = useCalendarsStore((s) => s.status);
  const calendarsError = useCalendarsStore((s) => s.error);
  const isUserNotFound = useCalendarsStore((s) => s.isUserNotFound);
  const isUnauthorized = useCalendarsStore((s) => s.isUnauthorized);
  const initFromCache = useCalendarsStore((s) => s.initFromCache);
  const isCalendarAddedForAccount = useCalendarsStore((s) => s.isCalendarAddedForAccount);
  const initTeamCache = useTeamAvailabilityStore((s) => s.initFromCache);

  const { isHealthy, healthMessage } = useCalendarHealthPoll();
  const [activeEmail, setActiveEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    void initFromCache();
    void initTeamCache();
    void getCachedAppointments().then((cached: Appointment[]) => {
      if (cached.length > 0) {
        setEvents(cached.map(appointmentToCalendarEvent));
      }
    });
    void getAccounts().then((accs) => {
      if (accs.length > 0) {
        const primary = accs[0];
        if (primary.email) setActiveEmail(primary.email);
        const name = primary.displayName || (primary as any).name || primary.email?.split('@')[0] || '';
        if (name) setUserName(name);
      }
    });
  }, [initFromCache, initTeamCache]);

  const isCalendarAdded = isCalendarAddedForAccount(activeEmail);
  const isViewOnly = isUnauthorized || (!isCalendarAdded && isUserNotFound);
  const loadCalendars = useCalendarsStore((s) => s.load);
  const createCalendarInStore = useCalendarsStore((s) => s.create);
  const onboardInStore = useCalendarsStore((s) => s.onboard);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const loadTeamData = useTeamAvailabilityStore((s) => s.loadTeamData);
  const updateTeammateFromSSE = useTeamAvailabilityStore((s) => s.updateTeammateFromSSE);
  const shareWithUser = useTeamAvailabilityStore((s) => s.shareWithUser);
  const addToast = useToastStore((s) => s.addToast);

  const handleOnboardUser = async () => {
    setOnboardingLoading(true);
    try {
      const accounts = await getAccounts().catch(() => []);
      const primary = accounts[0];
      let email = primary?.email;
      let name = primary?.displayName;

      if (!email) {
        const token = getAuthToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            email = payload.email || payload.mid;
            name = payload.display_name || payload.name || email;
          } catch {}
        }
      }

      await onboardInStore(email, name);
      // Immediately reload appointments
      const apts = await getAppointments().catch(() => []);
      if (apts.length > 0) {
        setEvents(apts.map(appointmentToCalendarEvent));
      }
    } catch (err) {
      console.error('Failed to connect to calendar service:', err);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const seenCalendarIds = useRef(new Set<string>());
  const projects = useMemo<ProjectItem[]>(
    () => (calendars.length > 0 ? calendars.map(toProject) : [PLACEHOLDER_PROJECT]),
    [calendars]
  );
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([
    { id: 'w-1', name: 'AirSend Workspace', role: 'Owner', active: true },
  ]);
  const reminders = useCalendarNotificationStore((s) => s.reminders);
  const dismissReminder = useCalendarNotificationStore((s) => s.dismissReminder);
  const markAllReadReminders = useCalendarNotificationStore((s) => s.markAllRead);

  const notifications = useMemo<CalendarNotificationItem[]>(
    () =>
      reminders.map((r) => ({
        id: r.id,
        title: r.title,
        time: r.timeStr,
        read: r.isRead,
      })),
    [reminders]
  );

  const loadEvents = async (options?: { force?: boolean }) => {
    try {
      const apts = await getAppointments(undefined, undefined, undefined, options);
      if (apts.length > 0) {
        setEvents(apts.map(appointmentToCalendarEvent));
      }
    } catch {}
  };

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadAll = async () => {
      await Promise.all([
        loadCalendars(),
        loadEvents(),
        loadTeamData(),
      ]);
    };

    void loadAll();

    // Wire live SSE stream (UI_GUIDE.md Section 10)
    const unsubscribePush = subscribeCalendarEvents({
      onState: (changed) => {
        const entries = Object.values(changed);
        const hasCal = entries.some((e) => e.Calendar);
        const hasEvt = entries.some((e) => e.CalendarEvent);
        if (hasCal) {
          void loadCalendars({ force: true });
        }
        if (hasEvt || hasCal) {
          void loadEvents({ force: true });
        }
      },
      onAvailability: (data) => {
        updateTeammateFromSSE(data);
      },
      onShares: () => {
        void loadTeamData({ force: true });
      },
      onResync: () => {
        void loadCalendars({ force: true });
        void loadEvents({ force: true });
        void loadTeamData({ force: true });
      },
    });

    return () => {
      unsubscribePush();
    };
  }, [loadCalendars, loadTeamData, updateTeammateFromSSE]);

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
    if (isViewOnly) {
      throw new Error('Calendar is currently in view-only mode.');
    }
    if (calendars.length >= 1) {
      throw new Error('Only one calendar per email is allowed. You can edit features in Settings > Calendar.');
    }
    await createCalendarInStore(input);
  };

  const handleDeleteEvent = async (
    id: string,
    options?: { isOccurrenceOnly?: boolean; originalStart?: string }
  ) => {
    if (isViewOnly) return;
    if (options?.isOccurrenceOnly && options.originalStart) {
      setEvents((prev) => prev.filter((e) => !(e.id === id && e.originalStart === options.originalStart)));
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
    try {
      await deleteAppointment(id, options);
    } catch {
      // Ignored if server unreachable
    }
  };

  const handleRsvpEvent = async (eventUid: string, response: 'accept' | 'decline' | 'maybe') => {
    try {
      await rsvpAppointment(eventUid, response);
      addToast({
        title: 'Response Sent',
        description: `Marked invitation as ${response}.`,
        type: 'success',
      });
      await loadEvents();
    } catch (err: any) {
      addToast({
        title: 'Response Failed',
        description: err.message || 'Could not update meeting response.',
        type: 'error',
      });
    }
  };

  const handleInviteTeammate = async (email: string) => {
    try {
      await shareWithUser(email);
      addToast({
        title: 'Availability Shared',
        description: `Shared calendar availability with ${email}.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Share Failed',
        description: err.message || 'Could not share availability.',
        type: 'error',
      });
    }
  };

  const handleSaveSchedule = async (newEventData: Partial<CalendarEvent>) => {
    if (isViewOnly) return;
    const editingId = newEventData.id || selectedEvent?.id;
    const isEdit = Boolean(editingId);

    try {
      let startUtc = newEventData.startUtc;
      let endUtc = newEventData.endUtc;

      if (!startUtc || !endUtc) {
        const baseDate = newEventData.selectedDate || new Date();
        const startHour = newEventData.startHour ?? slotHour;
        const durationHours = newEventData.durationHours || 1;
        const startHourInt = Math.floor(startHour);
        const startMinInt = Math.round((startHour - startHourInt) * 60);

        const start = new Date(baseDate);
        start.setHours(startHourInt, startMinInt, 0, 0);
        const end = new Date(start.getTime() + Math.round(durationHours * 60) * 60000);

        startUtc = start.toISOString();
        endUtc = end.toISOString();
      }

      if (newEventData.isAllDay) {
        const start = new Date(startUtc);
        startUtc = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)).toISOString();
        endUtc = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate() + 1, 0, 0, 0)).toISOString();
      }

      const calendarId = calendars.find((c) => c.name === selectedProject)?.id;
      const isRecurring = Boolean(newEventData.isRecurring);
      let recurrenceRule: string | undefined;
      if (isRecurring) {
        const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const jsDay = new Date(startUtc).getDay();
        recurrenceRule = `FREQ=WEEKLY;BYDAY=${days[jsDay]}`;
      }

      if (isEdit && editingId) {
        const isOccurrenceOnly = Boolean(newEventData.isOccurrenceOnly);
        const originalStart = newEventData.originalStart || selectedEvent?.originalStart;

        // Optimistically update UI immediately so event moves to the new position without waiting
        const rawLoc = (newEventData.location || (newEventData.category !== 'General' && newEventData.category !== 'Online Meeting' ? newEventData.category : '') || '').trim();
        const meet = newEventData.meetUrl?.trim();

        let payloadLocation = rawLoc;
        if (meet) {
          payloadLocation = rawLoc && rawLoc !== meet ? `${rawLoc} • ${meet}` : meet;
        }

        let payloadNotes = newEventData.description?.trim() || '';
        if (meet && !payloadNotes.includes(meet)) {
          payloadNotes = payloadNotes ? `${payloadNotes}\n\nMeeting link: ${meet}` : `Meeting link: ${meet}`;
        }

        setEvents((prev) =>
          prev.map((e) =>
            e.id === editingId
              ? {
                  ...e,
                  ...newEventData,
                  startUtc,
                  endUtc,
                  dayIndex: newEventData.dayIndex ?? e.dayIndex,
                  startHour: newEventData.startHour ?? e.startHour,
                  durationHours: newEventData.durationHours ?? e.durationHours,
                  startTime: newEventData.startTime || e.startTime,
                  endTime: newEventData.endTime || e.endTime,
                  title: newEventData.title || e.title,
                  location: payloadLocation,
                  category: payloadLocation || 'Meeting',
                  description: payloadNotes,
                }
              : e
          )
        );

        await updateAppointment(
          editingId,
          {
            title: newEventData.title,
            location: payloadLocation,
            startUtc,
            endUtc,
            isAllDay: Boolean(newEventData.isAllDay),
            notes: payloadNotes,
          },
          {
            isOccurrenceOnly,
            originalStart,
          }
        );
      } else {
        const rawLoc = (newEventData.location || (newEventData.category !== 'General' && newEventData.category !== 'Online Meeting' ? newEventData.category : '') || '').trim();
        const meet = newEventData.meetUrl?.trim();

        let payloadLocation = rawLoc;
        if (meet) {
          payloadLocation = rawLoc && rawLoc !== meet ? `${rawLoc} • ${meet}` : meet;
        }

        let payloadNotes = newEventData.description?.trim() || '';
        if (meet && !payloadNotes.includes(meet)) {
          payloadNotes = payloadNotes ? `${payloadNotes}\n\nMeeting link: ${meet}` : `Meeting link: ${meet}`;
        }

        const createdApt = await createAppointment({
          title: newEventData.title || 'Untitled Schedule',
          location: payloadLocation,
          startUtc,
          endUtc,
          isAllDay: Boolean(newEventData.isAllDay),
          notes: payloadNotes,
          calendarId,
          attendees: (newEventData.participants || []).map((p) => p.name).filter(Boolean),
          timeZone: newEventData.isAllDay ? undefined : Intl.DateTimeFormat().resolvedOptions().timeZone,
          recurrenceRule,
        });

        if (createdApt) {
          setEvents((prev) => [...prev, appointmentToCalendarEvent(createdApt)]);
        }
      }

      await loadEvents({ force: true });
      setSelectedEvent(null);
    } catch (err) {
      console.warn('[CalDev] Save schedule failed:', err);
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
    currentDate,
    setCurrentDate,
    slotDate,
    setSlotDate,
    userName,
    activeDayIndex,
    setActiveDayIndex,
    searchQuery,
    setSearchQuery,
    events,
    projects,
    calendarsError: calendarsStatus === 'error' ? calendarsError : null,
    isUserNotFound,
    isUnauthorized,
    isViewOnly,
    isCalendarAdded,
    activeEmail,
    isHealthy,
    healthMessage,
    onboardingLoading,
    handleOnboardUser,
    reloadCalendars: () => loadCalendars({ force: true }),
    handleAddProject,
    workspaces,
    setWorkspaces,
    notifications,
    handleDismissNotification: dismissReminder,
    handleMarkAllReadNotifications: markAllReadReminders,
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
    handleRsvpEvent,
    handleInviteTeammate,
  };
}
