'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CalendarWorkspaceTabs } from './CalendarWorkspaceTabs';
import { CalendarWorkspaceMenu } from './CalendarWorkspaceMenu';
import { CalendarNotificationsPopover } from './CalendarNotificationsPopover';
import { CalendarMissingBanner } from './CalendarMissingBanner';
import { CalendarSidebar } from './CalendarSidebar';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarWeekGrid } from './CalendarWeekGrid';
import { CalendarDayView } from './CalendarDayView';
import { CalendarMonthView } from './CalendarMonthView';
import { CalendarModals } from './CalendarModals';
import { useCalendarState } from './useCalendarState';
import { useCalendarActionHandlers } from './useCalendarActionHandlers';
import { useAlertStore } from '@/stores';

export function CalendarView() {
  const s = useCalendarState();
  const router = useRouter();
  const showAlert = useAlertStore((st) => st.showAlert);

  const {
    filteredEvents,
    handleOpenSlot,
    handleNewSchedule,
    handleAddProjectClick,
    handleOpenDetail,
  } = useCalendarActionHandlers({ s, showAlert });

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

      {/* Calendar Missing Banner: Shows if calendar is missing for account; if added then doesn't show */}
      <CalendarMissingBanner
        isCalendarAdded={s.isCalendarAdded}
        activeEmail={s.activeEmail}
        isUserNotFound={s.isUserNotFound}
        calendarsError={s.calendarsError}
        onboardingLoading={s.onboardingLoading}
        onOnboardUser={() => void s.handleOnboardUser()}
        onReload={() => void s.reloadCalendars()}
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
          onAddProject={handleAddProjectClick}
          onShareAvailability={() => s.setInviteModalOpen(true)}
          onOpenSettings={() => router.push('/settings/calendar')}
          onOpenReleaseNotes={() =>
            showAlert({
              title: 'Studio Calendar v2.4 — Release Notes',
              description: 'Release notes available in Settings > General > About.',
              type: 'info',
            })
          }
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <CalendarToolbar
            viewMode={s.viewMode}
            onViewModeChange={s.setViewMode}
            onPrev={() => s.setActiveDayIndex((prev) => (prev > 0 ? prev - 1 : 6))}
            onNext={() => s.setActiveDayIndex((prev) => (prev < 6 ? prev + 1 : 0))}
            onToday={() => s.setActiveDayIndex(1)}
            searchQuery={s.searchQuery}
            onSearchChange={s.setSearchQuery}
            onNewSchedule={handleNewSchedule}
            isViewOnly={s.isViewOnly}
            isHealthy={s.isHealthy}
            healthMessage={s.healthMessage}
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

      <CalendarModals s={s} />
    </div>
  );
}
