'use client';

import React, { useState } from 'react';
import {
  Smile, Users, UserCheck, MapPin, Video, FileText,
  Paperclip, ChevronDown, Image as ImageIcon, Type, Sun,
  CheckCircle2, Sparkles, Accessibility, ClipboardList,
} from 'lucide-react';
import { CHARMS } from './scheduleConstants';
import { cn } from '@/lib/utils';

interface ScheduleFormFieldsProps {
  title: string;
  setTitle: (t: string) => void;
  selectedCharm: string | null;
  setSelectedCharm: (c: string | null) => void;
  attendees: string[];
  onAddAttendee: (email: string) => void;
  onRemoveAttendee: (email: string) => void;
  location: string;
  setLocation: (loc: string) => void;
  isTeamsMeeting: boolean;
  setIsTeamsMeeting: (val: boolean) => void;
  description: string;
  setDescription: (d: string) => void;
  agenda: string;
  setAgenda: (a: string) => void;
}

export function ScheduleFormFields({
  title, setTitle, selectedCharm, setSelectedCharm,
  attendees, onAddAttendee, onRemoveAttendee,
  location, setLocation, isTeamsMeeting, setIsTeamsMeeting,
  description, setDescription, agenda, setAgenda,
}: ScheduleFormFieldsProps) {
  const [charmOpen, setCharmOpen] = useState(false);
  const [attendeeInput, setAttendeeInput] = useState('');

  const handleKeyDownAttendee = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && attendeeInput.trim()) {
      e.preventDefault();
      onAddAttendee(attendeeInput.trim());
      setAttendeeInput('');
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Title with Charm */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setCharmOpen(!charmOpen)}
            className="w-7 h-7 rounded border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700/80 flex items-center justify-center text-xs cursor-pointer"
            title="Charm"
          >
            {selectedCharm ? <span>{selectedCharm}</span> : <Smile className="w-4 h-4 text-neutral-400" />}
          </button>
          {charmOpen && (
            <div className="absolute left-0 top-full mt-1 p-2 bg-[#252525] border border-neutral-700 rounded-md shadow-xl grid grid-cols-4 gap-1.5 z-50">
              {CHARMS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setSelectedCharm(c); setCharmOpen(false); }}
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
            className="w-full text-base font-normal bg-transparent text-neutral-100 placeholder:text-neutral-500 border-b border-neutral-700 focus:border-[#0078d4] focus:outline-hidden pb-1 transition-colors"
          />
        </div>
      </div>

      {/* Attendees */}
      <div className="flex items-start gap-3">
        <div className="w-7 flex items-center justify-center pt-1 text-neutral-400 shrink-0"><Users className="w-4 h-4" /></div>
        <div className="flex-1 flex flex-wrap items-center gap-1.5 border-b border-neutral-700 pb-1.5 focus-within:border-[#0078d4]">
          {attendees.map((email) => (
            <span key={email} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-800 text-neutral-200 border border-neutral-700">
              <span>{email}</span>
              <button type="button" onClick={() => onRemoveAttendee(email)} className="hover:text-red-400">×</button>
            </span>
          ))}
          <input
            type="text"
            value={attendeeInput}
            onChange={(e) => setAttendeeInput(e.target.value)}
            onKeyDown={handleKeyDownAttendee}
            placeholder={attendees.length === 0 ? 'Invite required attendees' : 'Add another attendee...'}
            className="flex-1 min-w-[140px] text-xs bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden"
          />
          <button type="button" className="text-neutral-400 hover:text-neutral-200 p-0.5"><UserCheck className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-3">
        <div className="w-7 flex items-center justify-center text-neutral-400 shrink-0"><MapPin className="w-4 h-4" /></div>
        <div className="flex-1 border-b border-neutral-700 pb-1">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add a room or location"
            className="w-full text-xs bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Teams meeting toggle */}
      <div className="flex items-center gap-3">
        <div className="w-7 flex items-center justify-center text-neutral-400 shrink-0"><Video className="w-4 h-4" /></div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsTeamsMeeting(!isTeamsMeeting)}
            className={cn('w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative', isTeamsMeeting ? 'bg-[#0078d4]' : 'bg-neutral-700')}
          >
            <div className={cn('w-4 h-4 rounded-full bg-white transition-transform', isTeamsMeeting ? 'translate-x-4' : 'translate-x-0')} />
          </button>
          <span className="text-xs text-neutral-300 select-none">Microsoft Teams meeting</span>
        </div>
      </div>

      {/* Description Notes Box */}
      <div className="flex items-start gap-3">
        <div className="w-7 flex items-center justify-center pt-2 text-neutral-400 shrink-0"><FileText className="w-4 h-4" /></div>
        <div className="flex-1 rounded-md border border-neutral-700/80 bg-[#212121] p-3 flex flex-col justify-between min-h-[150px] shadow-inner">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description or attach documents..."
            className="w-full bg-transparent text-xs text-neutral-200 placeholder:text-neutral-500 resize-none focus:outline-hidden flex-1 min-h-[90px]"
          />
          <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-2 text-neutral-400 text-xs">
            <button type="button" className="hover:text-neutral-200 flex items-center gap-0.5"><Paperclip className="w-3.5 h-3.5" /><ChevronDown className="w-2.5 h-2.5" /></button>
            <button type="button" className="hover:text-neutral-200"><ImageIcon className="w-3.5 h-3.5" /></button>
            <button type="button" className="hover:text-neutral-200"><Type className="w-3.5 h-3.5" /></button>
            <button type="button" className="hover:text-neutral-200"><Sun className="w-3.5 h-3.5" /></button>
            <button type="button" className="hover:text-neutral-200"><CheckCircle2 className="w-3.5 h-3.5" /></button>
            <button type="button" className="hover:text-[#0078d4]"><Sparkles className="w-3.5 h-3.5" /></button>
            <button type="button" className="hover:text-neutral-200"><Accessibility className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Agenda */}
      <div className="flex items-center gap-3">
        <div className="w-7 flex items-center justify-center text-neutral-400 shrink-0"><ClipboardList className="w-4 h-4" /></div>
        <div className="flex-1 rounded-md border border-neutral-700/80 bg-transparent px-3 py-1.5 text-xs focus-within:border-[#0078d4]">
          <input
            type="text"
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="Add an agenda"
            className="w-full bg-transparent text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden text-xs"
          />
        </div>
      </div>
    </div>
  );
}
