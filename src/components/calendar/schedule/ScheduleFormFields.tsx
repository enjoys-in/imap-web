'use client';

import React, { useState, useRef } from 'react';
import {
  Smile, Users, UserPlus, ChevronDown, MapPin, Video, FileText,
  Paperclip, Image as ImageIcon, Sun, Sparkles, Accessibility,
  ClipboardList, Check, AlertTriangle, Loader2, ExternalLink,
} from 'lucide-react';
import { CHARMS } from './scheduleConstants';
import { cn } from '@/lib/utils';
import { createInstantMeeting, isAirSendMeetUrl } from '../airsendMeet';
import { useToastStore } from '@/stores/useToastStore';

interface ScheduleFormFieldsProps {
  title: string;
  setTitle: (t: string) => void;
  selectedCharm: string | null;
  setSelectedCharm: (c: string | null) => void;
  attendees: string[];
  onAddAttendee: (email: string) => void;
  onRemoveAttendee: (email: string) => void;
  hasByoSmtp?: boolean;
  timeRowNode?: React.ReactNode;
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
  hasByoSmtp,
  timeRowNode,
  location, setLocation, hasOnlineMeeting, setHasOnlineMeeting,
  meetUrl, setMeetUrl, description, setDescription, agenda, setAgenda,
}: ScheduleFormFieldsProps) {
  const [charmOpen, setCharmOpen] = useState(false);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [isGeneratingMeet, setIsGeneratingMeet] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateAirSendMeet = async () => {
    setIsGeneratingMeet(true);
    setHasOnlineMeeting(true);
    try {
      const generatedUrl = await createInstantMeeting({ title });
      setMeetUrl(generatedUrl);
      addToast({
        title: 'AirSend Meet created',
        description: `Instant meeting link attached: ${generatedUrl}`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'AirSend Meet error',
        description: err?.message || 'Could not generate instant meeting from meet.airsend.in',
        type: 'error',
      });
    } finally {
      setIsGeneratingMeet(false);
    }
  };

  const handleKeyDownAttendee = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && attendeeInput.trim()) {
      e.preventDefault();
      if (attendees.length >= 3000) return;
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

  return (
    <div className="space-y-4">
      <input ref={fileInputRef} type="file" multiple onChange={handleFiles} className="hidden" />
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleFiles} className="hidden" />

      {/* Row 1: Charm & Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setCharmOpen(!charmOpen)}
            className="w-7 h-7 rounded border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700/80 flex items-center justify-center text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer select-none"
            title="Charm"
          >
            {selectedCharm ? (
              <span>{selectedCharm}</span>
            ) : (
              <div className="flex items-center justify-center relative">
                <Smile className="w-4 h-4 text-neutral-400" />
              </div>
            )}
          </button>
          {charmOpen && (
            <div className="absolute left-0 top-full mt-1 p-2 bg-[#252525] border border-neutral-700 rounded-md shadow-2xl grid grid-cols-4 gap-1.5 z-50 animate-in fade-in zoom-in-95">
              {CHARMS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setSelectedCharm(c);
                    setCharmOpen(false);
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
            className="w-full text-base font-normal bg-transparent text-neutral-100 placeholder:text-neutral-500 border-b border-neutral-700/80 focus:border-[#0078d4] focus:outline-hidden pb-1"
          />
        </div>
      </div>

      {/* Row 2: Invite required attendees */}
      <div className="flex items-start gap-3">
        <div className="w-7 flex items-center justify-center pt-1 text-neutral-400 shrink-0">
          <Users className="w-4 h-4" />
        </div>
        <div className="flex-1 flex flex-wrap items-center gap-1.5 border-b border-neutral-700/80 pb-1.5 focus-within:border-[#0078d4] min-h-[32px]">
          {attendees.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-neutral-800 text-neutral-200 border border-neutral-700"
            >
              <span>{email}</span>
              <button
                type="button"
                onClick={() => onRemoveAttendee(email)}
                className="hover:text-red-400 cursor-pointer ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={attendeeInput}
            onChange={(e) => setAttendeeInput(e.target.value)}
            onKeyDown={handleKeyDownAttendee}
            disabled={attendees.length >= 3000}
            placeholder={
              attendees.length >= 3000
                ? 'Maximum 3,000 attendees reached'
                : attendees.length === 0
                ? 'Invite required attendees'
                : 'Add another attendee...'
            }
            className="flex-1 min-w-[160px] text-xs bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden py-0.5 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => !attendees.includes('team@airsend.io') && onAddAttendee('team@airsend.io')}
            className="text-neutral-400 hover:text-white p-0.5 rounded hover:bg-neutral-800/60 cursor-pointer flex items-center shrink-0 ml-auto"
            title="Contacts list"
          >
            <UserPlus className="w-4 h-4" />
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {hasByoSmtp === false && attendees.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-amber-400 bg-amber-950/30 border border-amber-900/40 px-2.5 py-1 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>This calendar has no SMTP configured. External invitees will not receive email invitations.</span>
          </div>
        )}
      </div>

      {/* Row 3: Date, Time & Scheduler */}
      {timeRowNode}

      {/* Row 4: Room or location */}
      <div className="flex items-center gap-3">
        <div className="w-7 flex items-center justify-center text-neutral-400 shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="flex-1 border-b border-neutral-700/80 pb-1.5">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add a room or location"
            className="w-full text-xs bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden py-0.5"
          />
        </div>
      </div>

      {/* Row 5: Online meeting link toggle, meet.airsend.in generator & URL input */}
      <div className="flex items-start gap-3">
        <div className="w-7 flex items-center justify-center pt-1 text-neutral-400 shrink-0">
          <Video className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-2 select-none">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={hasOnlineMeeting}
                onClick={() => {
                  const next = !hasOnlineMeeting;
                  setHasOnlineMeeting(next);
                  if (!next) {
                    setMeetUrl('');
                  }
                }}
                className={cn(
                  'w-9 h-5 rounded-full p-0.5 transition-colors relative cursor-pointer select-none inline-flex items-center shrink-0',
                  hasOnlineMeeting ? 'bg-[#0078d4]' : 'bg-neutral-700'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full bg-white transition-transform shadow-xs',
                    hasOnlineMeeting ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
              <span className="text-xs text-neutral-200 font-normal">Online meeting</span>
            </div>

            {/* meet.airsend.in Instant Meeting Generator Button */}
            <button
              type="button"
              onClick={handleGenerateAirSendMeet}
              disabled={isGeneratingMeet}
              className={cn(
                'h-6 px-2.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer border select-none shrink-0 disabled:opacity-50',
                isAirSendMeetUrl(meetUrl)
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700 hover:text-white hover:border-neutral-600'
              )}
              title="Generate an instant meeting on meet.airsend.in"
            >
              {isGeneratingMeet ? (
                <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
              ) : (
                <Video className="w-3 h-3 text-blue-400" />
              )}
              <span>meet.airsend.in</span>
            </button>
          </div>

          {hasOnlineMeeting && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2 border-b border-neutral-700/80 pb-1.5 focus-within:border-[#0078d4]">
                <input
                  type="url"
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  placeholder="Enter meeting link or click meet.airsend.in..."
                  className="w-full text-xs bg-transparent text-neutral-100 placeholder:text-neutral-500 focus:outline-hidden py-0.5"
                  autoFocus={!meetUrl}
                />
                {meetUrl && (
                  <button
                    type="button"
                    onClick={() => setMeetUrl('')}
                    className="text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer shrink-0 text-xs"
                    title="Clear meeting link"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Status and Action Row */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                {!meetUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Need a meeting link?</span>
                    <button
                      type="button"
                      onClick={handleGenerateAirSendMeet}
                      disabled={isGeneratingMeet}
                      className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingMeet ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      <span>Add meet.airsend.in</span>
                    </button>
                  </div>
                ) : isAirSendMeetUrl(meetUrl) ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      AirSend Meet attached
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGenerateAirSendMeet}
                        disabled={isGeneratingMeet}
                        className="text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        title="Generate a new room"
                      >
                        Regenerate
                      </button>
                      <a
                        href={meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-medium underline flex items-center gap-0.5"
                      >
                        <span>Open meeting</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-neutral-400">Custom online meeting link</span>
                    <button
                      type="button"
                      onClick={handleGenerateAirSendMeet}
                      disabled={isGeneratingMeet}
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                    >
                      Switch to meet.airsend.in
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 6: Description Editor with Rich Toolbar */}
      <div className="flex items-start gap-3">
        <div className="w-7 flex items-center justify-center pt-2 text-neutral-400 shrink-0">
          <FileText className="w-4 h-4" />
        </div>
        <div className="flex-1 rounded-md border border-neutral-700/80 bg-[#212121] p-3 flex flex-col justify-between min-h-[190px] shadow-inner">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder=""
            className="w-full bg-transparent text-xs text-neutral-200 placeholder:text-neutral-500 resize-none focus:outline-hidden flex-1 min-h-[120px]"
          />
          <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-2 text-neutral-400 text-xs select-none">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-white cursor-pointer p-1 rounded hover:bg-neutral-800 flex items-center gap-0.5"
              title="Attach file"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="hover:text-white cursor-pointer p-1 rounded hover:bg-neutral-800"
              title="Insert image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDescription((p) => p ? `${p} 😊` : '😊')}
              className="hover:text-white cursor-pointer p-1 rounded hover:bg-neutral-800"
              title="Insert emoji"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDescription((p) => p ? `${p}\n• ` : '• ')}
              className="hover:text-white cursor-pointer p-1 rounded hover:bg-neutral-800 font-serif font-bold text-xs"
              title="Insert bullet item"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setDescription((p) => p.startsWith('⚠️ [HIGH IMPORTANCE]\n') ? p.replace('⚠️ [HIGH IMPORTANCE]\n', '') : `⚠️ [HIGH IMPORTANCE]\n${p}`)}
              className="hover:text-amber-400 cursor-pointer p-1 rounded hover:bg-neutral-800"
              title="Toggle importance"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="hover:text-white cursor-pointer p-1 rounded hover:bg-neutral-800 flex items-center gap-0.5 text-[10px] font-bold tracking-tight"
              title="Spell check"
            >
              <span>ABC</span>
              <Check className="w-2.5 h-2.5 text-neutral-400" />
            </button>
            <button
              type="button"
              onClick={() => setDescription((p) => (p ? `${p}\n\n• Objectives:\n• Topics:\n• Action Items:` : '• Objectives:\n• Topics:\n• Action Items:'))}
              className="hover:text-[#0078d4] cursor-pointer p-1 rounded hover:bg-neutral-800"
              title="Insert Agenda template"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDescription((p) => p ? `${p}\n[Accessibility verified]` : '[Accessibility verified]')}
              className="hover:text-white cursor-pointer p-1 rounded hover:bg-neutral-800"
              title="Check accessibility"
            >
              <Accessibility className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 7: Agenda */}
      <div className="flex items-center gap-3">
        <div className="w-7 flex items-center justify-center text-neutral-400 shrink-0">
          <ClipboardList className="w-4 h-4" />
        </div>
        <div className="flex-1 rounded-md border border-neutral-700/80 bg-transparent px-3 py-2 text-xs focus-within:border-[#0078d4]">
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
