'use client';

import React, { useState } from 'react';
import { ChevronDown, Plus, User } from 'lucide-react';
import { CalendarColor, CalendarEvent } from './types';
import { ScheduleModalHeader, ScheduleColorPicker } from './ScheduleColorPicker';
import { ScheduleTimePicker } from './ScheduleTimePicker';

const SAMPLE_PARTICIPANTS = [
  { id: 'u1', name: 'Agus Ardhi', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces' },
  { id: 'u2', name: 'Nadia Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces' },
  { id: 'u3', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces' },
  { id: 'u4', name: 'Sarah Miller', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces' },
];

interface CreateScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => void;
  initialDayIndex?: number;
  initialHour?: number;
}

export function CreateScheduleModal({
  open,
  onClose,
  onSave,
  initialDayIndex = 2,
  initialHour = 8.5,
}: CreateScheduleModalProps) {
  const [selectedColor, setSelectedColor] = useState<CalendarColor>('blue');
  const [title, setTitle] = useState('Wireframe Review');
  const [startTime, setStartTime] = useState('08:30 AM');
  const [endTime, setEndTime] = useState('09:30 AM');
  const [dateStr, setDateStr] = useState('Wednesday, September 15');
  const [category, setCategory] = useState('Meeting');
  const [participants, setParticipants] = useState(SAMPLE_PARTICIPANTS.slice(0, 2));
  const [description, setDescription] = useState(
    'Review wireframe progress and gather feedback from the design team'
  );

  if (!open) return null;

  const handleAddParticipant = () => {
    if (participants.length < SAMPLE_PARTICIPANTS.length) {
      setParticipants(SAMPLE_PARTICIPANTS.slice(0, participants.length + 1));
    } else {
      setParticipants(SAMPLE_PARTICIPANTS.slice(0, 1));
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      dayIndex: initialDayIndex,
      startTime,
      endTime,
      startHour: initialHour,
      durationHours: 1,
      color: selectedColor,
      striped: false,
      category,
      meetUrl: 'https://8hj3-8hyf.google-meet.com',
      description,
      participants,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in select-none">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-3.5">
        <ScheduleModalHeader onClose={onClose} />

        <ScheduleColorPicker
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event Title"
          className="w-full h-10 px-3.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
        />

        <ScheduleTimePicker
          startTime={startTime}
          onStartTimeChange={setStartTime}
          endTime={endTime}
          onEndTimeChange={setEndTime}
          dateStr={dateStr}
          onDateStrChange={setDateStr}
          meetUrl="https://8hj3-8hyf.google-meet.com"
        />

        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-9 pl-3 pr-8 appearance-none bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 focus:outline-hidden"
          >
            <option value="Meeting">📋 Meeting</option>
            <option value="Design Sprint">⚡ Design Sprint</option>
            <option value="Workshop">🎨 Workshop</option>
            <option value="Stand-Up">👥 Stand-Up</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        {/* Attendees Stack with User Icon & Dynamic Add */}
        <div className="flex items-center gap-2 h-9 px-3 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <div className="flex items-center -space-x-1.5">
            {participants.map((p) => (
              <img
                key={p.id}
                src={p.avatar}
                title={p.name}
                className="w-5 h-5 rounded-full border border-white dark:border-neutral-900 object-cover"
                alt={p.name}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddParticipant}
            title="Add or cycle attendee"
            className="w-5 h-5 rounded-full border border-dashed border-neutral-400 text-neutral-500 hover:border-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-center cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Description Textarea */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full p-3 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none"
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-8 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
