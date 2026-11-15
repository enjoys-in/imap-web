'use client';

import React from 'react';
import { CreateScheduleModal } from './CreateScheduleModal';
import { CalendarEventDetailModal } from './CalendarEventDetailModal';
import { CalendarInviteModal } from './CalendarInviteModal';
import { CalendarAddProjectModal } from './CalendarAddProjectModal';
import { useCalendarState } from './useCalendarState';

interface CalendarModalsProps {
  s: ReturnType<typeof useCalendarState>;
}

export function CalendarModals({ s }: CalendarModalsProps) {
  return (
    <>
      <CreateScheduleModal
        open={s.createModalOpen}
        onClose={() => {
          s.setCreateModalOpen(false);
          s.setSelectedEvent(null);
        }}
        onSave={s.handleSaveSchedule}
        initialDayIndex={s.slotDay}
        initialHour={s.slotHour}
        initialDate={s.slotDate}
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
          s.setSelectedEvent(evt);
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
        onInviteSent={(email) => {
          void s.handleInviteTeammate(email);
        }}
      />

      <CalendarAddProjectModal
        open={s.addProjectModalOpen}
        onClose={() => s.setAddProjectModalOpen(false)}
        onAdd={s.handleAddProject}
      />
    </>
  );
}
