'use client';

import { useState } from 'react';
import { CalendarEvent, CalendarViewMode, WorkspaceTab } from './types';
import { INITIAL_EVENTS, INITIAL_TABS } from './mockData';
import { WorkspaceItem } from './CalendarWorkspaceMenu';
import { CalendarNotificationItem } from './CalendarNotificationsPopover';
import { ProjectItem } from './CalendarSidebar';

const DEFAULT_WORKSPACES: WorkspaceItem[] = [
  { id: 'ws-1', name: 'Cansaas Studio', role: 'Owner', active: true },
  { id: 'ws-2', name: 'Agus Ardhi Personal', role: 'Personal', active: false },
  { id: 'ws-3', name: 'Acme Enterprise', role: 'Admin', active: false },
];

const DEFAULT_PROJECTS: ProjectItem[] = [
  { id: 'p1', name: 'Totoro CRM System', color: 'bg-blue-600', icon: 'Q' },
  { id: 'p2', name: 'Obake Dashboard', color: 'bg-emerald-600', icon: '★' },
  { id: 'p3', name: 'Calcifer API Gateway', color: 'bg-amber-700', icon: '🔥' },
  { id: 'p4', name: 'Ponyo Task Manager', color: 'bg-neutral-800', icon: '🐟' },
];

const DEFAULT_NOTIFICATIONS: CalendarNotificationItem[] = [
  { id: 'n1', title: 'Design Sprint starting in 15m', time: '5m ago', read: false },
  { id: 'n2', title: 'Nadia Chen accepted invitation to Moodboard Session', time: '1h ago', read: false },
  { id: 'n3', title: 'Totoro CRM sprint 14 updated', time: '2h ago', read: true },
];

export function useCalendarState() {
  const [tabs, setTabs] = useState<WorkspaceTab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState<string>('tab-2');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState('Totoro CRM System');
  const [activeEssential, setActiveEssential] = useState('calendar');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('Week');
  const [activeDayIndex, setActiveDayIndex] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>(DEFAULT_WORKSPACES);
  const [notifications, setNotifications] = useState<CalendarNotificationItem[]>(DEFAULT_NOTIFICATIONS);

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

  const handleAddProject = (p: { name: string; icon: string; color: string }) => {
    const newProj: ProjectItem = { id: `p-${Date.now()}`, ...p };
    setProjects((prev) => [...prev, newProj]);
    const newTab: WorkspaceTab = { id: `tab-${Date.now()}`, name: p.name, icon: p.icon, active: true };
    setTabs((prev) => [...prev.map((t) => ({ ...t, active: false })), newTab]);
    setActiveTabId(newTab.id);
    setSelectedProject(p.name);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveSchedule = (newEventData: Partial<CalendarEvent>) => {
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
