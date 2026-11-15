'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CornerUpLeft, ReplyAll, CornerUpRight, LayoutGrid,
  MoreHorizontal, ChevronDown, ChevronUp, Printer, Flag, Trash2, Download, CalendarPlus
} from 'lucide-react';
import { MailMessage, MailMessageMetadata } from '@/types';
import { BimiAvatar } from '@/components/ui/BimiAvatar';
import { getRegisteredFolder, folderSlug } from '@/lib/folders';
import { ProfileCardModal, ProfileContactData } from '@/components/profile/ProfileCardModal';
import { CreateScheduleModal } from '@/components/calendar/CreateScheduleModal';
import { CalendarEvent } from '@/components/calendar/types';
import { createAppointment } from '@/lib/api/handlers/calendar';
import { useCalendarsStore } from '@/stores/useCalendarsStore';
import { useToastStore } from '@/stores/useToastStore';
import { ReadingPaneHeaderDetails } from './ReadingPaneHeaderDetails';
import { exportEmailToEml } from '@/lib/emlExport';
import { SnoozeMenu } from '../SnoozeMenu';
import { format } from 'date-fns';
import { useSession } from '@/components/providers/SessionProvider';
import { formatRecipientsWithYou, getUserEmails } from '@/lib/recipientUtils';

interface ReadingPaneHeaderProps {
  email: MailMessage | MailMessageMetadata;
  onBack?: () => void;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onDelete: () => void;
  onToggleFlag: () => void;
  hideHistory?: boolean;
  onToggleHistory?: () => void;
  onToggleCanvas?: () => void;
}

export function ReadingPaneHeader({
  email, onReply, onReplyAll, onForward, onDelete, onToggleFlag
}: ReadingPaneHeaderProps) {
  const { account, accounts } = useSession();
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isConvertEventOpen, setIsConvertEventOpen] = useState(false);
  const [profileContact, setProfileContact] = useState<ProfileContactData | null>(null);

  const addToast = useToastStore((s) => s.addToast);
  const reloadCalendars = useCalendarsStore((s) => s.load);

  const handleSaveEvent = async (event: Partial<CalendarEvent>) => {
    try {
      const now = new Date();
      const startHour = event.startHour ?? 10;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(startHour), (startHour % 1) * 60);
      const end = new Date(start.getTime() + (event.durationHours || 1) * 3600000);

      await createAppointment({
        title: event.title || email.subject || 'Meeting',
        startUtc: start.toISOString(),
        endUtc: end.toISOString(),
        location: event.location || '',
        notes: event.description || `Converted from email: "${email.subject}"\nFrom: ${email.fromName} <${email.fromAddress}>`,
        attendees: [email.fromAddress],
      });

      addToast({
        title: 'Event Created',
        description: `"${event.title || email.subject}" has been added to your calendar.`,
        type: 'success',
      });
      reloadCalendars({ force: true }).catch(() => {});
      setIsConvertEventOpen(false);
    } catch (err: any) {
      addToast({
        title: 'Failed to create event',
        description: err?.message || 'Could not schedule event.',
        type: 'error',
      });
    }
  };

  const formattedDate = format(new Date(email.date), 'EEE M/d/yyyy h:mm a');
  const senderName = email.fromName || email.fromAddress;

  const messageFolder = getRegisteredFolder(email.folderId);
  const openInWindowSlug = messageFolder ? folderSlug(messageFolder) : 'inbox';

  const myEmails = getUserEmails(account?.email, accounts);
  const formattedTo = formatRecipientsWithYou(email.to, myEmails);

  const handleOpenProfile = (name: string, addr: string) => {
    setProfileContact({
      name, email: addr, phone: '+91 98765 43210',
      company: addr.split('@')[1] || 'Tech Corp', bimiLogoUrl: email.bimiLogoUrl,
    });
  };

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-200 transition-colors p-3 md:p-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <h1 className="text-base md:text-xl font-bold text-neutral-900 dark:text-white tracking-tight truncate">
          {email.subject || '(No subject)'}
        </h1>
        {((email.threadCount && email.threadCount > 1) || email.isThread) && (
          <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#0078d4] dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {email.threadCount ? `${email.threadCount} messages` : 'Conversation'}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <BimiAvatar name={senderName} email={email.fromAddress} explicitLogo={email.bimiLogoUrl} size="lg" className="w-10 h-10 shrink-0 font-bold" />
          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button type="button" onClick={() => handleOpenProfile(senderName, email.fromAddress)} className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 hover:text-[#0078d4] dark:hover:text-blue-400 hover:underline transition-colors truncate text-left cursor-pointer">
                {senderName}
              </button>
              <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate hidden sm:inline">&lt;{email.fromAddress}&gt;</span>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
              <span>To:</span>
              <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[200px] md:max-w-md">
                {formattedTo}
              </span>
              <button type="button" onClick={() => setIsHeaderExpanded((prev) => !prev)} className="ml-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 rounded transition-colors cursor-pointer" title="Toggle full message details">
                {isHeaderExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1">
            <SnoozeMenu emailId={email.id} />
            <button onClick={onReply} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer text-purple-400 dark:text-purple-300" title="Reply"><CornerUpLeft className="w-4 h-4" /></button>
            <button onClick={onReplyAll} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer text-purple-400 dark:text-purple-300 hidden sm:inline-flex" title="Reply all"><ReplyAll className="w-4 h-4" /></button>
            <button onClick={onForward} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer text-cyan-400 dark:text-cyan-300" title="Forward"><CornerUpRight className="w-4 h-4" /></button>
            <Link href={`/mail/view/${email.id}#${openInWindowSlug}`} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors text-blue-500 dark:text-blue-400" title="Open in new window"><LayoutGrid className="w-4 h-4" /></Link>
            <button onClick={() => setIsConvertEventOpen(true)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors text-amber-500 dark:text-amber-400" title="Convert email to calendar event"><CalendarPlus className="w-4 h-4" /></button>

            <div className="relative">
              <button onClick={() => setIsMoreOpen((v) => !v)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer" title="More actions"><MoreHorizontal className="w-4 h-4" /></button>
              {isMoreOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsMoreOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-[#252525] border border-neutral-200 dark:border-[#383838] rounded-md shadow-2xl py-1 z-40 text-xs">
                    <button onClick={() => { setIsConvertEventOpen(true); setIsMoreOpen(false); }} className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-[#333333] flex items-center gap-2 cursor-pointer text-blue-600 dark:text-blue-400 font-medium">
                      <CalendarPlus className="w-3.5 h-3.5" /><span>Create Event from Email</span>
                    </button>
                    <button onClick={() => { exportEmailToEml(email); setIsMoreOpen(false); }} className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-[#333333] flex items-center gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400 font-medium">
                      <Download className="w-3.5 h-3.5" /><span>Download (.eml)</span>
                    </button>
                    <button onClick={() => { window.print(); setIsMoreOpen(false); }} className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-[#333333] flex items-center gap-2 cursor-pointer">
                      <Printer className="w-3.5 h-3.5" /><span>Print</span>
                    </button>
                    <button onClick={() => { onToggleFlag(); setIsMoreOpen(false); }} className="w-full px-3 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-[#333333] flex items-center gap-2 cursor-pointer">
                      <Flag className="w-3.5 h-3.5" /><span>{email.isFlagged ? 'Clear flag' : 'Flag message'}</span>
                    </button>
                    <button onClick={() => { onDelete(); setIsMoreOpen(false); }} className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /><span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">{formattedDate}</span>
        </div>
      </div>

      {isHeaderExpanded && (
        <ReadingPaneHeaderDetails
          email={email}
          formattedDate={formattedDate}
          myEmails={myEmails}
        />
      )}
      <ProfileCardModal contact={profileContact} isOpen={Boolean(profileContact)} onClose={() => setProfileContact(null)} />

      {isConvertEventOpen && (
        <CreateScheduleModal
          open={isConvertEventOpen}
          onClose={() => setIsConvertEventOpen(false)}
          onSave={handleSaveEvent}
          initialEvent={{
            id: `convert-${email.id}`,
            title: email.subject || 'Meeting',
            dayIndex: (new Date().getDay() + 6) % 7,
            startTime: '10:00 AM',
            endTime: '11:00 AM',
            startHour: 10,
            durationHours: 1,
            color: 'blue',
            participants: [
              {
                id: 'p-orig',
                name: email.fromName || email.fromAddress,
                avatar: email.fromName?.[0] || 'U',
              },
            ],
            description: `Email conversation: "${email.subject}"\nFrom: ${email.fromName} <${email.fromAddress}>\n\n${email.preview || ''}`,
          }}
        />
      )}
    </div>
  );
}
