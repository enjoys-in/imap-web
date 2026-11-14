'use client';

import React, { useState, useEffect } from 'react';
import { CalendarColor, CalendarEvent, CalendarParticipant } from './types';
import { ScheduleTopBar } from './schedule/ScheduleTopBar';
import { ScheduleTimeRow } from './schedule/ScheduleTimeRow';
import { ScheduleFormFields } from './schedule/ScheduleFormFields';
import { ScheduleMiniCanvas } from './schedule/ScheduleMiniCanvas';
import { formatTimeDisplay } from './schedule/scheduleConstants';

interface CreateScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  initialDayIndex?: number;
  initialHour?: number;
  initialEvent?: CalendarEvent | null;
}

export function CreateScheduleModal({
  open,
  onClose,
  onSave,
  initialDayIndex = 6,
  initialHour = 7,
  initialEvent,
}: CreateScheduleModalProps) {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [isSeries, setIsSeries] = useState(false);
  const [busyStatus, setBusyStatus] = useState('Busy');
  const [reminder, setReminder] = useState('15m');
  const [categoryColor, setCategoryColor] = useState<CalendarColor>('salmon');
  const [sensitivity, setSensitivity] = useState('Normal');

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [startHourDecimal, setStartHourDecimal] = useState(initialEvent?.startHour ?? initialHour);
  const [durationHours, setDurationHours] = useState(initialEvent?.durationHours ?? 0.5);
  const [isAllDay, setIsAllDay] = useState(false);

  const [attendees, setAttendees] = useState<string[]>([]);
  const [location, setLocation] = useState(initialEvent?.category || '');
  const [hasOnlineMeeting, setHasOnlineMeeting] = useState(Boolean(initialEvent?.meetUrl));
  const [meetUrl, setMeetUrl] = useState(initialEvent?.meetUrl || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [agenda, setAgenda] = useState('');
  const [selectedCharm, setSelectedCharm] = useState<string | null>(null);
  const [schedulerTrigger, setSchedulerTrigger] = useState(0);

  useEffect(() => {
    if (open) {
      if (initialEvent) {
        setTitle(initialEvent.title || '');
        setStartHourDecimal(initialEvent.startHour ?? initialHour);
        setDurationHours(initialEvent.durationHours || 0.5);
        setDescription(initialEvent.description || '');
        setCategoryColor(initialEvent.color || 'salmon');
        setHasOnlineMeeting(Boolean(initialEvent.meetUrl));
        setMeetUrl(initialEvent.meetUrl || '');
      } else {
        setTitle('');
        setStartHourDecimal(initialHour);
        setDurationHours(0.5);
        setDescription('');
        setAgenda('');
        setAttendees([]);
        setHasOnlineMeeting(false);
        setMeetUrl('');
      }
    }
  }, [open, initialHour, initialEvent]);

  if (!open) return null;

  const endHourDecimal = (startHourDecimal + durationHours) % 24;

  const handleSave = () => {
    const finalTitle = title.trim() || 'Untitled event';
    const participants: CalendarParticipant[] = attendees.map((email, idx) => ({
      id: `p-${idx}`,
      name: email.split('@')[0],
      avatar: `https://images.unsplash.com/photo-${1534528741775 + idx}?w=64&h=64&fit=crop&crop=faces`,
    }));

    const finalMeet = hasOnlineMeeting
      ? (meetUrl.trim() || `https://meet.airsend.io/join/${Math.random().toString(36).substring(2, 9)}`)
      : undefined;

    onSave({
      id: initialEvent?.id,
      uid: initialEvent?.uid,
      originalStart: initialEvent?.originalStart,
      isOccurrenceOnly: initialEvent?.isOccurrenceOnly,
      title: finalTitle,
      dayIndex: initialDayIndex,
      startTime: formatTimeDisplay(startHourDecimal),
      endTime: formatTimeDisplay(endHourDecimal),
      startHour: startHourDecimal,
      durationHours,
      color: categoryColor,
      category: location || (hasOnlineMeeting ? 'Online Meeting' : 'General'),
      description: agenda ? `${description}\n\nAgenda:\n${agenda}`.trim() : description,
      meetUrl: finalMeet,
      participants,
      isAllDay,
      isRecurring: isSeries,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-5xl bg-[#181818] text-neutral-100 rounded-xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col max-h-[92vh]">
        <ScheduleTopBar
          isEdit={!!initialEvent}
          onClose={onClose}
          isSeries={isSeries}
          setIsSeries={setIsSeries}
          busyStatus={busyStatus}
          setBusyStatus={setBusyStatus}
          reminder={reminder}
          setReminder={setReminder}
          categoryColor={categoryColor}
          setCategoryColor={setCategoryColor}
          sensitivity={sensitivity}
          setSensitivity={setSensitivity}
          onSave={handleSave}
        />

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#181818]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <ScheduleFormFields
              title={title}
              setTitle={setTitle}
              selectedCharm={selectedCharm}
              setSelectedCharm={setSelectedCharm}
              attendees={attendees}
              onAddAttendee={(e) => !attendees.includes(e) && setAttendees([...attendees, e])}
              onRemoveAttendee={(e) => setAttendees(attendees.filter((a) => a !== e))}
              location={location}
              setLocation={setLocation}
              hasOnlineMeeting={hasOnlineMeeting}
              setHasOnlineMeeting={setHasOnlineMeeting}
              meetUrl={meetUrl}
              setMeetUrl={setMeetUrl}
              description={description}
              setDescription={setDescription}
              agenda={agenda}
              setAgenda={setAgenda}
            />

            <ScheduleTimeRow
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              startHourDecimal={startHourDecimal}
              onStartHourChange={setStartHourDecimal}
              durationHours={durationHours}
              onDurationChange={setDurationHours}
              isAllDay={isAllDay}
              onAllDayChange={setIsAllDay}
              onScrollToScheduler={() => setSchedulerTrigger((p) => p + 1)}
            />
          </div>

          <ScheduleMiniCanvas
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            startHourDecimal={startHourDecimal}
            onStartHourChange={setStartHourDecimal}
            durationHours={durationHours}
            onDurationChange={setDurationHours}
            scrollTrigger={schedulerTrigger}
          />
        </div>
      </div>
    </div>
  );
}
