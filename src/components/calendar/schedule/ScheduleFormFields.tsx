'use client';

import React, { useState, useRef } from 'react';
import {
  Smile, Users, UserCheck, MapPin, Video, FileText,
  Paperclip, Image as ImageIcon, Type, Sun,
  CheckCircle2, Sparkles, Accessibility, ClipboardList, Link as LinkIcon, Copy, Check,
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
  hasOnlineMeeting: boolean;
  setHasOnlineMeeting: (val: boolean) => void;
  meetUrl: string;
  setMeetUrl: (url: string) => void;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  agenda: string;
  setAgenda: (a: string) => void;
}

export function ScheduleFormFields({
  title, setTitle, selectedCharm, setSelectedCharm,
  attendees, onAddAttendee, onRemoveAttendee,
  location, setLocation, hasOnlineMeeting, setHasOnlineMeeting,
  meetUrl, setMeetUrl, description, setDescription, agenda, setAgenda,
}: ScheduleFormFieldsProps) {
  const [charmOpen, setCharmOpen] = useState(false);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDownAttendee = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && attendeeInput.trim()) {
      e.preventDefault();
      onAddAttendee(attendeeInput.trim());
      setAttendeeInput('');
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const names = files.map((f) => `📎 ${f.name}`).join('\n');
    setDescription((p) => (p ? `${p}\n\nAttachments:\n${names}` : `Attachments:\n${names}`));
  };

  const handleSelectProvider = (prov: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    if (prov === 'teams') setMeetUrl(`https://teams.microsoft.com/l/meetup-join/airsend-${id}`);
    else if (prov === 'google') setMeetUrl(`https://meet.google.com/air-${id.substring(0, 4)}-${id.substring(4)}`);
    else if (prov === 'zoom') setMeetUrl(`https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    else if (prov === 'airsend') setMeetUrl(`https://meet.airsend.io/join/${id}`);
  };

  const handleCopyLink = () => {
    if (!meetUrl) return;
    navigator.clipboard?.writeText(meetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3.5">
      <input ref={fileInputRef} type="file" multiple onChange={handleFiles} className="hidden" />
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleFiles} className="hidden" />

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button type="button" onClick={() => setCharmOpen(!charmOpen)} className="w-7 h-7 rounded border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700/80 flex items-center justify-center text-xs cursor-pointer" title="Charm">
            {selectedCharm ? <span>{selectedCharm}</span> : <Smile className="w-4 h-4 text-neutral-400" />}
          </button>
          {charmOpen && (
            <div className="absolute left-0 top-full mt-1 p-2 bg-[#252525] border border-neutral-700 rounded-md shadow-xl grid grid-cols-4 gap-1.5 z-50">
              {CHARMS.map((c) => (
                <button key={c} type="button" onClick={() => { setSelectedCharm(c); setCharmOpen(false); }} className="w-7 h-7 rounded hover:bg-neutral-700 flex items-center justify-center text-sm cursor-pointer">{c}</button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add title" className="w-full text-base font-normal bg-transparent text-neutral-100 placeholder:text-neutral-500 border-b border-neutral-700 focus:border-[#0078d4] focus:outline-hidden pb-1" />
        </div>
      </div>

      {/* Attendees */}
      <div className="flex items-start gap-3">
        <div className="w-7 flex items-center justify-center pt-1 text-neutral-400 shrink-0"><Users className="w-4 h-4" /></div>
        <div className="flex-1 flex flex-wrap items-center gap-1.5 border-b border-neutral-700 pb-1.5 focus-within:border-[#0078d4]">
          {attendees.map((email) => (
            <span key={email} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-800 text-neutral-200 border border-neutral-700">
              <span>{email}</span><button type="button" onClick={() => onRemoveAttendee(email)} className="hover:text-red-400 cursor-pointer">×</button>
            </span>
          ))}
          <input type="text" value={attendeeInput} onChange={(e) => setAttendeeInput(e.target.value)} onKeyDown={handleKeyDownAttendee} placeholder={attendees.length === 0 ? 'Invite required attendees' : 'Add another attendee...'} className="flex-1 min-w-[140px] text-xs bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden" />
          <button type="button" onClick={() => !attendees.includes('team@airsend.io') && onAddAttendee('team@airsend.io')} className="text-neutral-400 hover:text-neutral-200 p-0.5 cursor-pointer" title="Quick add team"><UserCheck className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-3">
        <div className="w-7 flex items-center justify-center text-neutral-400 shrink-0"><MapPin className="w-4 h-4" /></div>
        <div className="flex-1 border-b border-neutral-700 pb-1">
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Add a room or location" className="w-full text-xs bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden" />
        </div>
      </div>

      {/* Generic Online Meeting Link */}
      <div className="flex items-start gap-3">
        <div className="w-7 flex items-center justify-center pt-1.5 text-neutral-400 shrink-0"><Video className="w-4 h-4" /></div>
        <div className="flex-1 space-y-2 border-b border-neutral-700/80 pb-2">
          <div className="flex items-center justify-between">
            <div
              onClick={() => {
                const next = !hasOnlineMeeting;
                setHasOnlineMeeting(next);
                if (next && !meetUrl) setMeetUrl(`https://meet.airsend.io/join/${Math.random().toString(36).substring(2, 9)}`);
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className={cn('w-9 h-5 rounded-full p-0.5 transition-colors relative', hasOnlineMeeting ? 'bg-[#0078d4]' : 'bg-neutral-700')}>
                <div className={cn('w-4 h-4 rounded-full bg-white transition-transform', hasOnlineMeeting ? 'translate-x-4' : 'translate-x-0')} />
              </div>
              <span className="text-xs text-neutral-200 group-hover:text-white font-medium">Online meeting link</span>
            </div>
            {hasOnlineMeeting && (
              <select onChange={(e) => handleSelectProvider(e.target.value)} className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-[11px] text-neutral-300 focus:outline-hidden cursor-pointer">
                <option value="airsend">AirSend Meet</option><option value="teams">Microsoft Teams</option><option value="google">Google Meet</option><option value="zoom">Zoom</option><option value="custom">Custom link</option>
              </select>
            )}
          </div>
          {hasOnlineMeeting && (
            <div className="flex items-center gap-2 h-8 px-2.5 bg-neutral-800/80 border border-neutral-700 rounded-lg text-xs">
              <LinkIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <input type="text" value={meetUrl} onChange={(e) => setMeetUrl(e.target.value)} placeholder="https://..." className="w-full bg-transparent text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden" />
              <button type="button" onClick={handleCopyLink} className="text-[11px] text-neutral-400 hover:text-white shrink-0 cursor-pointer flex items-center gap-1" title="Copy link">
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}<span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notes Box with working toolbar */}
      <div className="flex items-start gap-3">
        <div className="w-7 flex items-center justify-center pt-2 text-neutral-400 shrink-0"><FileText className="w-4 h-4" /></div>
        <div className="flex-1 rounded-md border border-neutral-700/80 bg-[#212121] p-3 flex flex-col justify-between min-h-[150px] shadow-inner">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description or attach documents..." className="w-full bg-transparent text-xs text-neutral-200 placeholder:text-neutral-500 resize-none focus:outline-hidden flex-1 min-h-[90px]" />
          <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-2 text-neutral-400 text-xs">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-neutral-200 cursor-pointer p-0.5" title="Attach file"><Paperclip className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => imageInputRef.current?.click()} className="hover:text-neutral-200 cursor-pointer p-0.5" title="Insert image"><ImageIcon className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => setDescription((p) => p ? `${p}\n• ` : '• ')} className="hover:text-neutral-200 cursor-pointer p-0.5" title="Insert bullet list"><Type className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => setDescription((p) => p.startsWith('⚠️ [HIGH IMPORTANCE]\n') ? p.replace('⚠️ [HIGH IMPORTANCE]\n', '') : `⚠️ [HIGH IMPORTANCE]\n${p}`)} className="hover:text-amber-400 cursor-pointer p-0.5" title="Toggle importance"><Sun className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => setDescription((p) => p ? `${p} ✓` : '✓')} className="hover:text-emerald-400 cursor-pointer p-0.5" title="Insert checkmark"><CheckCircle2 className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => setDescription((p) => (p ? `${p}\n\n• Objectives:\n• Topics:\n• Action Items:` : '• Objectives:\n• Topics:\n• Action Items:'))} className="hover:text-[#0078d4] cursor-pointer p-0.5" title="Insert Agenda template"><Sparkles className="w-3.5 h-3.5" /></button>
            <button type="button" onClick={() => setDescription((p) => p ? `${p}\n[Accessibility verified]` : '[Accessibility verified]')} className="hover:text-neutral-200 cursor-pointer p-0.5" title="Accessibility check"><Accessibility className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Agenda */}
      <div className="flex items-center gap-3">
        <div className="w-7 flex items-center justify-center text-neutral-400 shrink-0"><ClipboardList className="w-4 h-4" /></div>
        <div className="flex-1 rounded-md border border-neutral-700/80 bg-transparent px-3 py-1.5 text-xs focus-within:border-[#0078d4]">
          <input type="text" value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="Add an agenda" className="w-full bg-transparent text-neutral-200 placeholder:text-neutral-500 focus:outline-hidden text-xs" />
        </div>
      </div>
    </div>
  );
}
