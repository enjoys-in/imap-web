'use client';

import React, { useState } from 'react';
import { CalendarWorkspaceTabs } from './CalendarWorkspaceTabs';
import { CalendarSidebar } from './CalendarSidebar';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarWeekGrid } from './CalendarWeekGrid';
import { CreateScheduleModal } from './CreateScheduleModal';
import { INITIAL_EVENTS, INITIAL_TABS } from './mockData';
import { CalendarEvent, CalendarViewMode, WorkspaceTab } from './types';

export function CalendarView() {
  const [tabs, setTabs] = useState<WorkspaceTab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState<string>('tab-2');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState('Totoro CRM System');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('Week');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDayIndex, setModalDayIndex] = useState(2);
  const [modalHour, setModalHour] = useState(8.5);

  const handleSelectTab = (id: string) => {
    setTabs((prev) =>
      prev.map((t) => ({ ...t, active: t.id === id }))
    );
    setActiveTabId(id);
    const found = tabs.find((t) => t.id === id);
    if (found) setSelectedProject(found.name);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      handleSelectTab(remaining[0].id);
    }
  };

  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: WorkspaceTab = {
      id: newId,
      name: `Project ${tabs.length + 1}`,
      icon: '📁',
      active: true,
    };
    setTabs((prev) => [...prev.map((t) => ({ ...t, active: false })), newTab]);
    setActiveTabId(newId);
    setSelectedProject(newTab.name);
  };

  const handleSlotClick = (dayIndex: number, hour: number) => {
    setModalDayIndex(dayIndex);
    setModalHour(hour);
    setModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setModalDayIndex(event.dayIndex);
    setModalHour(event.startHour);
    setModalOpen(true);
  };

  const handleSaveSchedule = (newEventData: Partial<CalendarEvent>) => {
    const created: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newEventData.title || 'Untitled Schedule',
      dayIndex: newEventData.dayIndex ?? modalDayIndex,
      startTime: newEventData.startTime || '08:30 AM',
      endTime: newEventData.endTime || '09:30 AM',
      startHour: newEventData.startHour ?? modalHour,
      durationHours: newEventData.durationHours || 1,
      color: newEventData.color || 'blue',
      striped: newEventData.striped ?? false,
      category: newEventData.category || 'Meeting',
      description: newEventData.description,
      meetUrl: newEventData.meetUrl,
      participants: newEventData.participants || [],
    };
    setEvents((prev) => [...prev, created]);
  };

  const filteredEvents = searchQuery.trim()
    ? events.filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : events;

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 overflow-hidden select-none">
      {/* Workspace Top Tabs */}
      <CalendarWorkspaceTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onAddTab={handleAddTab}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
      />

      {/* Main Split: Sidebar + Calendar Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <CalendarSidebar
          open={sidebarOpen}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Controls Ribbon */}
          <CalendarToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onPrev={() => {}}
            onNext={() => {}}
            onToday={() => {}}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewSchedule={() => setModalOpen(true)}
          />

          {/* Week Grid */}
          <CalendarWeekGrid
            events={filteredEvents}
            onSlotClick={handleSlotClick}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Create Schedule Modal */}
      <CreateScheduleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSchedule}
        initialDayIndex={modalDayIndex}
        initialHour={modalHour}
      />
    </div>
  );
}
