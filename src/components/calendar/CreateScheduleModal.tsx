'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Maximize2,
  Calendar,
  RotateCcw,
  ChevronDown,
  Clock,
  Tag,
  Lock,
  Printer,
  Save,
  Smile,
  Users,
  MapPin,
  Video,
  FileText,
  Paperclip,
  Image as ImageIcon,
  Type,
  Sun,
  CheckCircle2,
  Sparkles,
  Accessibility,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  UserCheck,
  Grid,
} from 'lucide-react';
import { CalendarColor, CalendarEvent, CalendarParticipant } from './types';
import { cn } from '@/lib/utils';

interface CreateScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  initialDayIndex?: number;
  initialHour?: number;
  initialEvent?: CalendarEvent | null;
}

const HOURS = [
  '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM',
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
  '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM',
];

const BUSY_OPTIONS = [
  { id: 'Free', label: 'Free' },
  { id: 'WorkingElsewhere', label: 'Working elsewhere' },
  { id: 'Tentative', label: 'Tentative' },
  { id: 'Busy', label: 'Busy' },
  { id: 'Away', label: 'Away' },
];

const REMINDER_OPTIONS = [
  { id: 'none', label: 'Don\'t remind me' },
  { id: '0m', label: '0 minutes before' },
  { id: '5m', label: '5 minutes before' },
  { id: '15m', label: '15 minutes before' },
  { id: '30m', label: '30 minutes before' },
  { id: '1h', label: '1 hour before' },
  { id: '1d', label: '1 day before' },
];

const CATEGORY_COLORS: { id: CalendarColor; label: string; bg: string }[] = [
  { id: 'salmon', label: 'Red category', bg: '#d13438' },
  { id: 'peach', label: 'Orange category', bg: '#da3b01' },
  { id: 'yellow', label: 'Yellow category', bg: '#fce100' },
  { id: 'green', label: 'Green category', bg: '#107c41' },
  { id: 'blue', label: 'Blue category', bg: '#0078d4' },
  { id: 'purple', label: 'Purple category', bg: '#5c2d91' },
];

const SENSITIVITY_OPTIONS = [
  { id: 'Normal', label: 'Normal' },
  { id: 'Personal', label: 'Personal' },
  { id: 'Private', label: 'Private' },
  { id: 'Confidential', label: 'Confidential' },
];

function formatTimeDisplay(hourDecimal: number): string {
  const normalizedHour = (hourDecimal % 24 + 24) % 24;
  const hours = Math.floor(normalizedHour);
  const minutes = Math.round((normalizedHour - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${displayHour}:${displayMinutes} ${ampm}`;
}

function format24hTime(hourDecimal: number): string {
  const normalizedHour = (hourDecimal % 24 + 24) % 24;
  const hours = Math.floor(normalizedHour);
  const minutes = Math.round((normalizedHour - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const h2Digit = displayHour < 10 ? `0${displayHour}` : `${displayHour}`;
  return `${h2Digit}:${displayMinutes} ${ampm}`;
}

export function CreateScheduleModal({
  open,
  onClose,
  onSave,
  initialDayIndex = 6, // default Sunday matching screenshot Sun, 15 Nov, 2026
  initialHour = 1,     // default 1:00 AM matching screenshot
  initialEvent,
}: CreateScheduleModalProps) {
  // Form State
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [isSeries, setIsSeries] = useState(false);
  const [busyStatus, setBusyStatus] = useState('Busy');
  const [reminder, setReminder] = useState('15m');
  const [categoryColor, setCategoryColor] = useState<CalendarColor>('salmon');
  const [sensitivity, setSensitivity] = useState('Normal');

  // Date and Time State
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d;
  });
  const [startHourDecimal, setStartHourDecimal] = useState(initialEvent?.startHour ?? initialHour);
  const [durationHours, setDurationHours] = useState(initialEvent?.durationHours ?? 0.5); // 30 min default
  const [isAllDay, setIsAllDay] = useState(false);

  // Attendees, Location, Meeting
  const [attendeeInput, setAttendeeInput] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [location, setLocation] = useState(initialEvent?.category || '');
  const [isTeamsMeeting, setIsTeamsMeeting] = useState(false);

  // Rich description & agenda
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [agenda, setAgenda] = useState('');
  const [selectedCharm, setSelectedCharm] = useState<string | null>(null);

  // Popover menus state
  const [busyOpen, setBusyOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sensitivityOpen, setSensitivityOpen] = useState(false);
  const [charmPickerOpen, setCharmPickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const schedulerScrollRef = useRef<HTMLDivElement>(null);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (open) {
      if (initialEvent) {
        setTitle(initialEvent.title || '');
        setStartHourDecimal(initialEvent.startHour || 1);
        setDurationHours(initialEvent.durationHours || 0.5);
        setDescription(initialEvent.description || '');
        setCategoryColor(initialEvent.color || 'salmon');
      } else {
        setTitle('');
        setStartHourDecimal(initialHour);
        setDurationHours(0.5); // 30 minutes like in screenshot 1:00 AM - 1:30 AM
        setDescription('');
        setAgenda('');
        setAttendees([]);
        setIsTeamsMeeting(false);
      }
    }
  }, [open, initialHour, initialEvent]);

  // Scroll scheduler to start hour when opened
  useEffect(() => {
    if (open && schedulerScrollRef.current) {
      const rowHeight = 44;
      const targetScroll = Math.max(0, startHourDecimal * rowHeight - 60);
      schedulerScrollRef.current.scrollTop = targetScroll;
    }
  }, [open, startHourDecimal]);

  if (!open) return null;

  const endHourDecimal = startHourDecimal + durationHours;
  const startTimeStr = format24hTime(startHourDecimal);
  const endTimeStr = format24hTime(endHourDecimal);

  // Formatted date string like "Sun 15-11-2026 01:00 AM - 01:30 AM"
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = String(selectedDate.getDate()).padStart(2, '0');
  const monthNum = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const yearNum = selectedDate.getFullYear();
  const dateFormatted = `${dayName} ${dayNum}-${monthNum}-${yearNum} ${startTimeStr} - ${endTimeStr}`;

  // Mini scheduler header date: "Sun, 15 Nov, 2026"
  const schedulerHeaderDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleAddAttendee = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && attendeeInput.trim()) {
      e.preventDefault();
      if (!attendees.includes(attendeeInput.trim())) {
        setAttendees([...attendees, attendeeInput.trim()]);
      }
      setAttendeeInput('');
    }
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter((a) => a !== email));
  };

  const handleSlotClick = (hourIndex: number) => {
    setStartHourDecimal(hourIndex);
  };

  const handleSave = () => {
    const finalTitle = title.trim() || 'Untitled event';
    const participants: CalendarParticipant[] = attendees.map((email, idx) => ({
      id: `p-${idx}`,
      name: email.split('@')[0],
      avatar: `https://images.unsplash.com/photo-${1534528741775 + idx}?w=64&h=64&fit=crop&crop=faces`,
    }));

    onSave({
      title: finalTitle,
      dayIndex: initialDayIndex,
      startTime: formatTimeDisplay(startHourDecimal),
      endTime: formatTimeDisplay(endHourDecimal),
      startHour: startHourDecimal,
      durationHours: durationHours,
      color: categoryColor,
      category: location || (isTeamsMeeting ? 'Microsoft Teams' : 'General'),
      description: agenda ? `${description}\n\nAgenda:\n${agenda}`.trim() : description,
      meetUrl: isTeamsMeeting ? 'https://teams.microsoft.com/l/meetup-join/airsend' : undefined,
      participants,
    });
    onClose();
  };

  const CHARMS = ['❤️', '⭐', '🎂', '☕', '💡', '🎉', '✈️', '💼', '📌', '🏋️', '📚', '🎯'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
      {/* Modal Dialog Container */}
      <div className="w-full max-w-5xl bg-[#181818] text-neutral-100 rounded-xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Window Title Bar */}
        <div className="h-9 px-3.5 bg-[#141414] border-b border-neutral-800/80 flex items-center justify-between shrink-0">
          <div className="text-xs font-normal text-neutral-300">
            {initialEvent ? 'Edit event' : 'New event'}
          </div>
          <div className="flex items-center gap-1 text-neutral-400">
            <button
              type="button"
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
              title="Maximize"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Command Action Bar */}
        <div className="h-11 px-3 bg-[#1e1e1e] border-b border-neutral-800 flex items-center justify-between gap-2 shrink-0 overflow-x-auto text-xs">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Event Pill */}
            <button
              type="button"
              onClick={() => setIsSeries(false)}
              className={cn(
                'px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors cursor-pointer',
                !isSeries
                  ? 'border border-neutral-600 bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Event</span>
            </button>

            {/* Series Button */}
            <button
              type="button"
              onClick={() => setIsSeries(true)}
              className={cn(
                'px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors cursor-pointer',
                isSeries
                  ? 'border border-neutral-600 bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
              )}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Series</span>
            </button>

            {/* Separator */}
            <div className="h-4 w-px bg-neutral-700/80 mx-0.5" />

            {/* Busy Status Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setBusyOpen(!busyOpen);
                  setReminderOpen(false);
                  setCategoryOpen(false);
                  setSensitivityOpen(false);
                }}
                className="px-2 py-1 rounded flex items-center gap-1 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Grid className="w-3.5 h-3.5 text-neutral-400" />
                <span>{busyStatus}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
              {busyOpen && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-[#252525] border border-neutral-700 rounded-md shadow-xl py-1 z-50">
                  {BUSY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setBusyStatus(opt.label);
                        setBusyOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-700/60 text-xs text-neutral-200 transition-colors flex items-center justify-between"
                    >
                      <span>{opt.label}</span>
                      {busyStatus === opt.label && <span className="text-[#0078d4]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reminder Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setReminderOpen(!reminderOpen);
                  setBusyOpen(false);
                  setCategoryOpen(false);
                  setSensitivityOpen(false);
                }}
                className="p-1.5 rounded flex items-center gap-1 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Reminder"
              >
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
              {reminderOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-[#252525] border border-neutral-700 rounded-md shadow-xl py-1 z-50">
                  {REMINDER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setReminder(opt.id);
                        setReminderOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-700/60 text-xs text-neutral-200 transition-colors flex items-center justify-between"
                    >
                      <span>{opt.label}</span>
                      {reminder === opt.id && <span className="text-[#0078d4]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category / Tag Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setCategoryOpen(!categoryOpen);
                  setBusyOpen(false);
                  setReminderOpen(false);
                  setSensitivityOpen(false);
                }}
                className="p-1.5 rounded flex items-center gap-1 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Category"
              >
                <Tag className="w-3.5 h-3.5 text-neutral-400" />
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
              {categoryOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-[#252525] border border-neutral-700 rounded-md shadow-xl py-1 z-50">
                  {CATEGORY_COLORS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setCategoryColor(opt.id);
                        setCategoryOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-700/60 text-xs text-neutral-200 transition-colors flex items-center gap-2"
                    >
                      <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: opt.bg }} />
                      <span className="flex-1">{opt.label}</span>
                      {categoryColor === opt.id && <span className="text-[#0078d4]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sensitivity / Lock Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSensitivityOpen(!sensitivityOpen);
                  setBusyOpen(false);
                  setReminderOpen(false);
                  setCategoryOpen(false);
                }}
                className="p-1.5 rounded flex items-center gap-1 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Sensitivity"
              >
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
              {sensitivityOpen && (
                <div className="absolute left-0 top-full mt-1 w-44 bg-[#252525] border border-neutral-700 rounded-md shadow-xl py-1 z-50">
                  {SENSITIVITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSensitivity(opt.label);
                        setSensitivityOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-neutral-700/60 text-xs text-neutral-200 transition-colors flex items-center justify-between"
                    >
                      <span>{opt.label}</span>
                      {sensitivity === opt.label && <span className="text-[#0078d4]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="h-4 w-px bg-neutral-700/80 mx-0.5" />

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Print event"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>

          {/* Right: Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="h-7 px-3.5 bg-[#0078d4] hover:bg-[#106ebe] active:bg-[#005a9e] text-white font-semibold text-xs rounded flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>

        {/* Modal Main Body (2 Columns) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#181818]">
          {/* Left Column: Form & Inputs (~64% width) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Row 1: Title Input with Charm */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCharmPickerOpen(!charmPickerOpen)}
                  className="w-7 h-7 rounded border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700/80 hover:border-neutral-500 flex items-center justify-center text-xs transition-colors cursor-pointer"
                  title="Add charm / emoji"
                >
                  {selectedCharm ? (
                    <span>{selectedCharm}</span>
                  ) : (
                    <Smile className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
                {charmPickerOpen && (
                  <div className="absolute left-0 top-full mt-1 p-2 bg-[#252525] border border-neutral-700 rounded-md shadow-xl grid grid-cols-4 gap-1.5 z-50">
                    {CHARMS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setSelectedCharm(c);
                          setCharmPickerOpen(false);
                        }}
                        className="w-7 h-7 rounded hover:bg-neutral-700 flex items-center justify-center text-sm cursor-pointer"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add title"
                  className="w-full text-base font-normal bg-transparent text-neutral-100 placeholder:text-neutral-500 border-b border-neutral-700 focus:border-[#0078d4] focus:outline-none pb-1.5 transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Invite Required Attendees */}
            <div className="flex items-start gap-3 pt-1">
              <div className="w-7 flex items-center justify-center pt-1 text-neutral-400">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex-1 relative">
                <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-700 pb-1.5 focus-within:border-[#0078d4] transition-colors">
                  {attendees.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-800 text-neutral-200 border border-neutral-700"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(email)}
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    onKeyDown={handleAddAttendee}
                    placeholder={attendees.length === 0 ? 'Invite required attendees' : 'Add another attendee...'}
                    className="flex-1 min-w-[160px] text-xs bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    className="text-neutral-400 hover:text-neutral-200 p-0.5"
                    title="Address book"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Row 3: Date & Time Selector */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-7 flex items-center justify-center text-neutral-400">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 flex items-center justify-between border-b border-neutral-700 pb-1.5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTimePickerOpen(!timePickerOpen)}
                    className="text-xs text-neutral-200 hover:text-white transition-colors cursor-pointer text-left font-normal"
                  >
                    {dateFormatted}
                  </button>
                  {timePickerOpen && (
                    <div className="absolute left-0 top-full mt-2 p-3 bg-[#252525] border border-neutral-700 rounded-lg shadow-2xl z-50 w-72 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 pb-1 border-b border-neutral-700">
                        <span>Event Timing</span>
                        <label className="flex items-center gap-1.5 font-normal text-[11px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllDay}
                            onChange={(e) => setIsAllDay(e.target.checked)}
                            className="accent-[#0078d4] rounded"
                          />
                          <span>All day</span>
                        </label>
                      </div>

                      {!isAllDay && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400">Start Time</span>
                            <select
                              value={startHourDecimal}
                              onChange={(e) => setStartHourDecimal(parseFloat(e.target.value))}
                              className="w-full mt-1 p-1.5 rounded bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 focus:outline-none"
                            >
                              {Array.from({ length: 48 }).map((_, idx) => {
                                const val = idx * 0.5;
                                return (
                                  <option key={val} value={val}>
                                    {formatTimeDisplay(val)}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400">End Time</span>
                            <select
                              value={endHourDecimal}
                              onChange={(e) => {
                                const end = parseFloat(e.target.value);
                                setDurationHours(Math.max(0.5, end - startHourDecimal));
                              }}
                              className="w-full mt-1 p-1.5 rounded bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 focus:outline-none"
                            >
                              {Array.from({ length: 48 }).map((_, idx) => {
                                const val = idx * 0.5;
                                return (
                                  <option key={val} value={val}>
                                    {formatTimeDisplay(val)}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setTimePickerOpen(false)}
                          className="px-3 py-1 bg-[#0078d4] text-white text-xs rounded hover:bg-[#106ebe]"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right controls: Mini calendar icon + Scheduler */}
                <div className="flex items-center gap-3 text-neutral-400">
                  <CalendarDays className="w-4 h-4 cursor-pointer hover:text-neutral-200" />
                  <button
                    type="button"
                    onClick={() => {
                      if (schedulerScrollRef.current) {
                        schedulerScrollRef.current.scrollTop = Math.max(0, startHourDecimal * 44 - 60);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white font-medium cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Scheduler</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 4: Add a room or location */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-7 flex items-center justify-center text-neutral-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 border-b border-neutral-700 pb-1.5">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add a room or location"
                  className="w-full text-xs bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 5: Microsoft Teams meeting toggle */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-7 flex items-center justify-center text-neutral-400">
                <Video className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-3">
                {/* Modern Pill Switch */}
                <button
                  type="button"
                  onClick={() => setIsTeamsMeeting(!isTeamsMeeting)}
                  className={cn(
                    'w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative',
                    isTeamsMeeting ? 'bg-[#0078d4]' : 'bg-neutral-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-white transition-transform',
                      isTeamsMeeting ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
                <span className="text-xs text-neutral-300 font-normal select-none">
                  Microsoft Teams meeting
                </span>
              </div>
            </div>

            {/* Row 6: Description & Rich Notes Box */}
            <div className="flex items-start gap-3 pt-1">
              <div className="w-7 flex items-center justify-center pt-2 text-neutral-400">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 rounded-md border border-neutral-700/80 bg-[#212121] p-3 flex flex-col justify-between min-h-[170px] shadow-inner">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description or attach documents..."
                  className="w-full bg-transparent text-xs text-neutral-200 placeholder:text-neutral-500 resize-none focus:outline-none flex-1 min-h-[105px]"
                />

                {/* Bottom Formatting Toolbar */}
                <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-2 text-neutral-400 text-xs">
                  <button type="button" className="hover:text-neutral-200 flex items-center gap-0.5" title="Attach file">
                    <Paperclip className="w-3.5 h-3.5" />
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                  <button type="button" className="hover:text-neutral-200" title="Insert image">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="hover:text-neutral-200" title="Insert emoji">
                    <Smile className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="hover:text-neutral-200" title="Font format">
                    <Type className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="hover:text-neutral-200" title="High importance">
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="hover:text-neutral-200 flex items-center gap-0.5" title="Spellcheck">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="hover:text-[#0078d4]" title="Copilot assistance">
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="hover:text-neutral-200" title="Accessibility check">
                    <Accessibility className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Row 7: Add an agenda */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-7 flex items-center justify-center text-neutral-400">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div className="flex-1 rounded-md border border-neutral-700/80 bg-transparent px-3 py-2 text-xs focus-within:border-[#0078d4] transition-colors">
                <input
                  type="text"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Add an agenda"
                  className="w-full bg-transparent text-neutral-200 placeholder:text-neutral-500 focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Mini Day View Scheduler (~36% width) */}
          <div className="w-full md:w-[340px] lg:w-[380px] border-t md:border-t-0 md:border-l border-neutral-800 bg-[#161616] flex flex-col shrink-0">
            {/* Scheduler Header */}
            <div className="h-10 px-3.5 border-b border-neutral-800 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2 text-neutral-400">
                <button
                  type="button"
                  onClick={() => {
                    const prev = new Date(selectedDate);
                    prev.setDate(prev.getDate() - 1);
                    setSelectedDate(prev);
                  }}
                  className="hover:text-white"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <CalendarDays className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                <button
                  type="button"
                  onClick={() => {
                    const next = new Date(selectedDate);
                    next.setDate(next.getDate() + 1);
                    setSelectedDate(next);
                  }}
                  className="hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1 text-xs text-neutral-200 font-medium pl-1">
                  <span>{schedulerHeaderDate}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </div>
              </div>

              <button
                type="button"
                className="text-neutral-400 hover:text-white"
                title="Expand scheduler"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Time Slots Canvas */}
            <div
              ref={schedulerScrollRef}
              className="flex-1 overflow-y-auto relative custom-scrollbar divide-y divide-neutral-800/60"
              style={{ maxHeight: 'calc(92vh - 120px)' }}
            >
              {HOURS.map((hourLabel, hourIdx) => {
                const isSelectedSlot = Math.floor(startHourDecimal) === hourIdx;

                return (
                  <div
                    key={hourLabel}
                    onClick={() => handleSlotClick(hourIdx)}
                    className="h-11 flex relative hover:bg-neutral-800/30 cursor-pointer group transition-colors"
                  >
                    {/* Hour Label */}
                    <div className="w-14 shrink-0 text-right pr-3 pt-1 text-[11px] text-neutral-400 font-normal select-none">
                      {hourLabel}
                    </div>

                    {/* Slot Canvas with Subtle Grid Lines */}
                    <div className="flex-1 border-l border-neutral-800 relative">
                      {/* Half-hour guide line */}
                      <div className="absolute inset-x-0 top-1/2 border-t border-neutral-800/40 pointer-events-none" />

                      {/* Selected Event Highlight Block */}
                      {isSelectedSlot && (
                        <div
                          className="absolute inset-x-1.5 z-20 rounded-xs bg-[#e05151] hover:bg-[#ea5d5d] shadow-md transition-all cursor-move flex items-center px-2"
                          style={{
                            top: `${(startHourDecimal % 1) * 100}%`,
                            height: `${Math.max(22, durationHours * 44)}px`,
                          }}
                        >
                          <span className="text-[11px] font-semibold text-white tracking-tight truncate select-none">
                            {startTimeStr} - {endTimeStr}
                          </span>

                          {/* Top-Right Drag Handle Dot */}
                          <div
                            className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-900 absolute -top-1 right-2 shadow-xs pointer-events-auto"
                            title="Drag handle"
                          />

                          {/* Bottom-Left Drag Handle Dot */}
                          <div
                            className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-900 absolute -bottom-1 left-2 shadow-xs pointer-events-auto"
                            title="Drag handle"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
