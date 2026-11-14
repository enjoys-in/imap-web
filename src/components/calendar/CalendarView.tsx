'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const showAlert = useAlertStore((st) => st.showAlert);

  const filteredEvents = s.searchQuery.trim()
    ? s.events.filter((e) =>
        e.title.toLowerCase().includes(s.searchQuery.toLowerCase()) ||
        e.category?.toLowerCase().includes(s.searchQuery.toLowerCase())
      )
    : s.events;

  const handleOpenSlot = (day: number, hr: number) => {
    if (s.isViewOnly) {
      showAlert({
        title: s.isUserNotFound ? 'Activate Calendar' : 'View-Only Calendar',
        description: s.isUserNotFound
          ? 'Your calendar is currently in view-only mode. Click "Start Using Calendar" above to activate your calendar and create schedules.'
          : 'Calendar is in view-only mode (401 Unauthorized). Please sign in to create or modify schedules.',
        type: 'info',
      });
      return;
    }
    s.setSlotDay(day);
    s.setSlotHour(hr);
    s.setCreateModalOpen(true);
  };

  const handleNewSchedule = () => {
    if (s.isViewOnly) {
      showAlert({
        title: s.isUserNotFound ? 'Activate Calendar' : 'View-Only Calendar',
        description: s.isUserNotFound
          ? 'Your calendar is currently in view-only mode. Click "Start Using Calendar" above to activate your calendar and create schedules.'
          : 'Calendar is in view-only mode (401 Unauthorized). Please sign in to create or modify schedules.',
        type: 'info',
      });
      return;
    }
    s.setCreateModalOpen(true);
  };

  const handleAddProjectClick = () => {
    if (s.isViewOnly) {
      showAlert({
        title: 'View-Only Mode',
        description: s.isUserNotFound
          ? 'Click "Start Using Calendar" above to activate your calendar.'
          : 'Calendar is in view-only mode. Sign in to add calendars.',
        type: 'info',
      });
      return;
    }
    if (s.projects.length >= 1 && s.projects[0].id !== 'p-1') {
      showAlert({
        title: 'Calendar Limit',
        description: 'Only one calendar per email is supported. You can customize its feature settings in Settings > Calendar.',
        type: 'info',
      });
      return;
    }
    s.setAddProjectModalOpen(true);
  };

  const handleOpenDetail = (evt: any) => {
    s.setSelectedEvent(evt);
    s.setDetailModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 overflow-hidden relative">
      <CalendarWorkspaceTabs
        tabs={s.tabs}
        activeTabId={s.activeTabId}
        onSelectTab={s.handleSelectTab}
        onCloseTab={s.handleCloseTab}
        onAddTab={handleAddProjectClick}
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
        onMarkAllRead={s.handleMarkAllReadNotifications}
        onDismiss={s.handleDismissNotification}
      />

      {s.calendarsError && (
        <div
          role="alert"
          className={`flex items-center justify-between gap-3 px-4 py-2.5 text-xs border-b ${
            s.isUserNotFound
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-900'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {s.isUserNotFound && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-bold">
                ℹ
              </span>
            )}
            <span>{s.calendarsError}</span>
          </div>
          <div className="flex items-center gap-2">
            {s.isUserNotFound ? (
              <button
                type="button"
                disabled={s.onboardingLoading}
                onClick={() => void s.handleOnboardUser()}
                className="shrink-0 px-3.5 py-1.5 rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
              >
                {s.onboardingLoading ? 'Connecting...' : 'Start Using Calendar'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void s.reloadCalendars()}
                className="shrink-0 px-2.5 h-6 rounded-md font-semibold bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 transition-colors cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

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
          onAddProject={handleAddProjectClick}
          onShareAvailability={() => s.setInviteModalOpen(true)}
          onOpenSettings={() => router.push('/settings/calendar')}
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
            onNewSchedule={handleNewSchedule}
            isViewOnly={s.isViewOnly}
          />

          {s.viewMode === 'Week' && (
            <CalendarWeekGrid
              events={filteredEvents}
              onSlotClick={handleOpenSlot}
              onEventClick={handleOpenDetail}
              pendingSlot={s.createModalOpen ? { dayIndex: s.slotDay, hour: s.slotHour } : null}
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
        onClose={() => {
          s.setCreateModalOpen(false);
          s.setSelectedEvent(null);
        }}
        onSave={s.handleSaveSchedule}
        initialDayIndex={s.slotDay}
        initialHour={s.slotHour}
        initialEvent={s.selectedEvent}
      />

      <CalendarEventDetailModal
        open={s.detailModalOpen}
        event={s.selectedEvent}
        onClose={() => s.setDetailModalOpen(false)}
        onDelete={s.handleDeleteEvent}
        onRsvp={s.handleRsvpEvent}
        onEdit={(evt) => {
          if (s.isViewOnly) return;
          s.setSlotDay(evt.dayIndex);
          s.setSlotHour(evt.startHour);
          s.setDetailModalOpen(false);
          s.setCreateModalOpen(true);
        }}
        isReadOnly={s.isViewOnly}
      />

      <CalendarInviteModal
        open={s.inviteModalOpen}
        onClose={() => s.setInviteModalOpen(false)}
        onInviteSent={(email, role) => {
          void s.handleInviteTeammate(email);
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
