'use client';

import React from 'react';
import { CalendarWorkspaceTabs } from './CalendarWorkspaceTabs';
import { CalendarWorkspaceMenu } from './CalendarWorkspaceMenu';
import { CalendarNotificationsPopover } from './CalendarNotificationsPopover';
import { CalendarInviteModal } from './CalendarInviteModal';
import { CalendarAddProjectModal } from './CalendarAddProjectModal';
import { CalendarEventDetailModal } from './CalendarEventDetailModal';
import { CreateScheduleModal } from './CreateScheduleModal';
import { CalendarSidebar } from './CalendarSidebar';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarWeekGrid } from './CalendarWeekGrid';
import { CalendarDayView } from './CalendarDayView';
import { CalendarMonthView } from './CalendarMonthView';
import { useCalendarState } from './useCalendarState';
import { useAlertStore } from '@/stores';

export function CalendarView() {
  const s = useCalendarState();
  const showAlert = useAlertStore((st) => st.showAlert);

  const filteredEvents = s.searchQuery.trim()
    ? s.events.filter((e) =>
        e.title.toLowerCase().includes(s.searchQuery.toLowerCase()) ||
        e.category?.toLowerCase().includes(s.searchQuery.toLowerCase())
      )
    : s.events;

  const handleOpenSlot = (day: number, hr: number) => {
    s.setSlotDay(day);
    s.setSlotHour(hr);
    s.setCreateModalOpen(true);
  };

  const handleOpenDetail = (evt: any) => {
    s.setSelectedEvent(evt);
    s.setDetailModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 overflow-hidden select-none relative">
      <CalendarWorkspaceTabs
        tabs={s.tabs}
        activeTabId={s.activeTabId}
        onSelectTab={s.handleSelectTab}
        onCloseTab={s.handleCloseTab}
        onAddTab={() => s.setAddProjectModalOpen(true)}
        sidebarOpen={s.sidebarOpen}
        onToggleSidebar={() => s.setSidebarOpen((p) => !p)}
        onOpenWorkspaceMenu={() => s.setWorkspaceMenuOpen((p) => !p)}
        onOpenNotifications={() => s.setNotificationsOpen((p) => !p)}
        unreadNotifications={s.notifications.some((n) => !n.read)}
        onOpenInvite={() => s.setInviteModalOpen(true)}
      />

      <CalendarWorkspaceMenu
        open={s.workspaceMenuOpen}
        onClose={() => s.setWorkspaceMenuOpen(false)}
        workspaces={s.workspaces}
        onSelect={(id) => s.setWorkspaces((prev) => prev.map((w) => ({ ...w, active: w.id === id })))}
        onNewWorkspace={() => s.setAddProjectModalOpen(true)}
      />

      <CalendarNotificationsPopover
        open={s.notificationsOpen}
        onClose={() => s.setNotificationsOpen(false)}
        notifications={s.notifications}
        onMarkAllRead={() => s.setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        onDismiss={(id) => s.setNotifications((prev) => prev.filter((n) => n.id !== id))}
      />

      <div className="flex-1 flex overflow-hidden">
        <CalendarSidebar
          open={s.sidebarOpen}
          activeEssential={s.activeEssential}
          onSelectEssential={(id) => {
            s.setActiveEssential(id);
            if (id === 'team') s.setInviteModalOpen(true);
          }}
          selectedProject={s.selectedProject}
          onSelectProject={(name) => {
            s.setSelectedProject(name);
            s.handleSelectTab(s.tabs.find((t) => t.name === name)?.id || s.activeTabId);
          }}
          projects={s.projects}
          onAddProject={() => s.setAddProjectModalOpen(true)}
          onOpenSettings={() =>
            showAlert({
              title: 'Calendar & Workspace Settings',
              description:
                'Manage appointment notifications, calendar timezones, and workspace defaults.',
              type: 'info',
            })
          }
          onOpenReleaseNotes={() =>
            showAlert({
              title: 'Studio Calendar v2.4 — Release Notes',
              description:
                '• Full-width Day Calendar View with 24-hour scale\n• Live current time dotted indicator with auto-scroll\n• System timezone integration (Asia/Kolkata / GMT+5:30)\n• Multi-project workspace tabs and real-time scheduling',
              type: 'info',
            })
          }
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <CalendarToolbar
            viewMode={s.viewMode}
            onViewModeChange={s.setViewMode}
            onPrev={() => s.setActiveDayIndex((prev) => (prev > 0 ? prev - 1 : 4))}
            onNext={() => s.setActiveDayIndex((prev) => (prev < 4 ? prev + 1 : 0))}
            onToday={() => s.setActiveDayIndex(1)}
            searchQuery={s.searchQuery}
            onSearchChange={s.setSearchQuery}
            onNewSchedule={() => s.setCreateModalOpen(true)}
          />

          {s.viewMode === 'Week' && (
            <CalendarWeekGrid
              events={filteredEvents}
              onSlotClick={handleOpenSlot}
              onEventClick={handleOpenDetail}
              onSelectDayHeader={(day) => {
                s.setActiveDayIndex(day);
                s.setViewMode('Day');
              }}
            />
          )}

          {s.viewMode === 'Day' && (
            <CalendarDayView
              events={filteredEvents}
              activeDayIndex={s.activeDayIndex}
              onSlotClick={handleOpenSlot}
              onEventClick={handleOpenDetail}
            />
          )}

          {s.viewMode === 'Month' && (
            <CalendarMonthView
              events={filteredEvents}
              onSlotClick={handleOpenSlot}
              onEventClick={handleOpenDetail}
            />
          )}
        </div>
      </div>

      <CreateScheduleModal
        open={s.createModalOpen}
        onClose={() => s.setCreateModalOpen(false)}
        onSave={s.handleSaveSchedule}
        initialDayIndex={s.slotDay}
        initialHour={s.slotHour}
      />

      <CalendarEventDetailModal
        open={s.detailModalOpen}
        event={s.selectedEvent}
        onClose={() => s.setDetailModalOpen(false)}
        onDelete={s.handleDeleteEvent}
        onEdit={(evt) => {
          s.setSlotDay(evt.dayIndex);
          s.setSlotHour(evt.startHour);
          s.setCreateModalOpen(true);
        }}
      />

      <CalendarInviteModal
        open={s.inviteModalOpen}
        onClose={() => s.setInviteModalOpen(false)}
        onInviteSent={(email, role) => {
          showAlert({
            title: 'Invitation Sent',
            description: `Successfully invited ${email} as ${role} to ${s.selectedProject}.`,
            type: 'success',
          });
        }}
      />

      <CalendarAddProjectModal
        open={s.addProjectModalOpen}
        onClose={() => s.setAddProjectModalOpen(false)}
        onAdd={s.handleAddProject}
      />
    </div>
  );
}
