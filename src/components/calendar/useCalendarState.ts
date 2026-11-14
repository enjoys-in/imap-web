'use client';

import { useState } from 'react';
import { CalendarEvent, CalendarViewMode, WorkspaceTab } from './types';
import { WorkspaceItem } from './CalendarWorkspaceMenu';
import { CalendarNotificationItem } from './CalendarNotificationsPopover';
import { ProjectItem } from './CalendarSidebar';

export function useCalendarState() {
  const [tabs, setTabs] = useState<WorkspaceTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');
  const [activeEssential, setActiveEssential] = useState('calendar');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('Week');
  const [activeDayIndex, setActiveDayIndex] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [notifications, setNotifications] = useState<CalendarNotificationItem[]>([]);

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
