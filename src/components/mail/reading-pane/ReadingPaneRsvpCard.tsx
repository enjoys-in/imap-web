'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Check,
  HelpCircle,
  X,
  MapPin,
  Video,
  Clock,
  ExternalLink,
  CalendarPlus,
  Loader2,
  Users,
  CheckCircle2,
  AlertCircle,
  Repeat,
  Mail,
} from 'lucide-react';
import { format, formatDistanceStrict, isSameDay } from 'date-fns';
import { MailMessage, MailMessageMetadata, MailAttachment } from '@/types';
import { parseIcsInvite, ParsedIcsInvite, containsIcsCalendar } from '@/lib/icsParser';
import { rsvpAppointment, createAppointment } from '@/lib/api/handlers/calendar';
import { getCachedAppointments } from '@/lib/idb/calendarAppointmentsDb';
import { emailsApi } from '@/lib/api';
import { useToastStore } from '@/stores/useToastStore';
import { useCalendarsStore } from '@/stores/useCalendarsStore';
import { cn } from '@/lib/utils';

interface ReadingPaneRsvpCardProps {
  email: MailMessage | MailMessageMetadata;
  bodyText?: string;
  bodyHtml?: string;
  onReply?: () => void;
}

type UserRsvpStatus = 'accepted' | 'tentative' | 'declined' | null;

export function ReadingPaneRsvpCard({
  email,
  bodyText,
  bodyHtml,
  onReply,
}: ReadingPaneRsvpCardProps) {
  const [invite, setInvite] = useState<ParsedIcsInvite | null>(null);
  const [isLoadingIcs, setIsLoadingIcs] = useState(false);
  const [userRsvp, setUserRsvp] = useState<UserRsvpStatus>(null);
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [isAddedToCalendar, setIsAddedToCalendar] = useState(false);
  const [conflictEventTitle, setConflictEventTitle] = useState<string | null>(null);

  const addToast = useToastStore((s) => s.addToast);
  const reloadCalendars = useCalendarsStore((s) => s.load);

  // 1. Identify .ics attachment if present
  const icsAttachment = useMemo<MailAttachment | undefined>(() => {
    if (!email.attachments || email.attachments.length === 0) return undefined;
    return email.attachments.find(
      (att) =>
        att.fileName?.toLowerCase().endsWith('.ics') ||
        att.contentType?.toLowerCase().includes('calendar') ||
        att.contentType?.toLowerCase().includes('ics')
    );
  }, [email.attachments]);

  // 2. Parse ICS either from inline body or from attachment
  useEffect(() => {
    let isCancelled = false;

    // Check inline body first
    if (containsIcsCalendar(bodyText)) {
      const parsed = parseIcsInvite(bodyText!);
      if (parsed) {
        setInvite(parsed);
        return;
      }
    }

    if (containsIcsCalendar(bodyHtml)) {
      const parsed = parseIcsInvite(bodyHtml!);
      if (parsed) {
        setInvite(parsed);
        return;
      }
    }

    // If attachment exists, fetch attachment text and parse
    if (icsAttachment && email.folderId) {
      setIsLoadingIcs(true);
      const uid = email.uid || email.id;
      const part = (icsAttachment as any).part || icsAttachment.id;

      emailsApi
        .downloadAttachment(email.folderId, uid, part)
        .then(async (blob) => {
          if (isCancelled) return;
          const text = await blob.text();
          const parsed = parseIcsInvite(text);
          if (parsed && !isCancelled) {
            setInvite(parsed);
          }
        })
        .catch(() => {
          // Silent fallback if attachment cannot be fetched
        })
        .finally(() => {
          if (!isCancelled) setIsLoadingIcs(false);
        });

      return () => {
        isCancelled = true;
      };
    }

    setInvite(null);
  }, [email.id, email.uid, email.folderId, bodyText, bodyHtml, icsAttachment]);

  // 3. Inspect user's existing response and calendar conflicts
  useEffect(() => {
    if (!invite) return;

    // Detect user status from attendee list if available
    const myAttendee = invite.attendees.find(
      (att) =>
        att.partstat &&
        ['ACCEPTED', 'TENTATIVE', 'DECLINED'].includes(att.partstat.toUpperCase())
    );

    if (myAttendee?.partstat) {
      const ps = myAttendee.partstat.toUpperCase();
      if (ps === 'ACCEPTED') setUserRsvp('accepted');
      else if (ps === 'TENTATIVE') setUserRsvp('tentative');
      else if (ps === 'DECLINED') setUserRsvp('declined');
    }

    // Check conflict against cached calendar appointments
    getCachedAppointments()
      .then((appointments) => {
        const invStart = invite.start.getTime();
        const invEnd = invite.end.getTime();

        const conflict = appointments.find((apt) => {
          if (apt.uid === invite.uid) {
            setIsAddedToCalendar(true);
            return false;
          }
          const aStart = new Date(apt.startUtc).getTime();
          const aEnd = new Date(apt.endUtc).getTime();
          return aStart < invEnd && aEnd > invStart;
        });

        if (conflict) {
          setConflictEventTitle(conflict.title || 'Existing event');
        } else {
          setConflictEventTitle(null);
        }
      })
      .catch(() => {
        setConflictEventTitle(null);
      });
  }, [invite]);

  // 4. Handle RSVP response
  const handleRsvp = useCallback(
    async (responseType: 'accept' | 'maybe' | 'decline') => {
      if (!invite || isSubmittingRsvp) return;

      setIsSubmittingRsvp(true);
      const targetState: UserRsvpStatus =
        responseType === 'accept' ? 'accepted' : responseType === 'maybe' ? 'tentative' : 'declined';

      try {
        await rsvpAppointment(invite.uid, responseType);

        setUserRsvp(targetState);

        // If accepted or tentative, ensure it is added to the user's primary calendar
        if (responseType !== 'decline' && !isAddedToCalendar) {
          try {
            await createAppointment({
              title: invite.summary,
              startUtc: invite.start.toISOString(),
              endUtc: invite.end.toISOString(),
              location: invite.location || '',
              notes: invite.description || '',
              isAllDay: invite.isAllDay,
              attendees: invite.attendees.map((a) => a.email),
              recurrenceRule: invite.recurrenceRule,
            });
            setIsAddedToCalendar(true);
            reloadCalendars({ force: true }).catch(() => {});
          } catch {
            // Calendar entry failure should not break RSVP state
          }
        }

        const label =
          responseType === 'accept'
            ? 'Accepted'
            : responseType === 'maybe'
            ? 'Tentatively accepted'
            : 'Declined';

        addToast({
          title: `RSVP: ${label}`,
          description: `Your response has been sent for "${invite.summary}".`,
          type: 'success',
        });
      } catch {
        addToast({
          title: 'RSVP update failed',
          description: 'Could not send RSVP response to organizer. Please try again.',
          type: 'error',
        });
      } finally {
        setIsSubmittingRsvp(false);
      }
    },
    [invite, isSubmittingRsvp, isAddedToCalendar, addToast, reloadCalendars]
  );

  // 5. Explicit "Add to Calendar" action
  const handleAddToCalendar = useCallback(async () => {
    if (!invite || isAddingToCalendar || isAddedToCalendar) return;

    setIsAddingToCalendar(true);
    try {
      await createAppointment({
        title: invite.summary,
        startUtc: invite.start.toISOString(),
        endUtc: invite.end.toISOString(),
        location: invite.location || '',
        notes: invite.description || '',
        isAllDay: invite.isAllDay,
        attendees: invite.attendees.map((a) => a.email),
        recurrenceRule: invite.recurrenceRule,
      });

      setIsAddedToCalendar(true);
      await reloadCalendars({ force: true });

      addToast({
        title: 'Event added to calendar',
        description: `"${invite.summary}" has been scheduled.`,
        type: 'success',
      });
    } catch {
      addToast({
        title: 'Could not add event',
        description: 'Failed to save event to calendar.',
        type: 'error',
      });
    } finally {
      setIsAddingToCalendar(false);
    }
  }, [invite, isAddingToCalendar, isAddedToCalendar, addToast, reloadCalendars]);

  if (isLoadingIcs) {
    return (
      <div className="mx-4 my-2.5 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 animate-pulse flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Loading calendar invitation details...
        </span>
      </div>
    );
  }

  if (!invite) return null;

  // Format date range
  const startDateStr = format(invite.start, 'EEEE, MMMM d, yyyy');
  const startTimeStr = format(invite.start, 'h:mm a');
  const endTimeStr = format(invite.end, 'h:mm a');
  const durationStr = formatDistanceStrict(invite.end, invite.start);
  const isSameDate = isSameDay(invite.start, invite.end);

  const formattedDateTime = invite.isAllDay
    ? `${startDateStr} (All day)`
    : isSameDate
    ? `${startDateStr} · ${startTimeStr} – ${endTimeStr} (${durationStr})`
    : `${startDateStr} ${startTimeStr} – ${format(invite.end, 'MMM d')} ${endTimeStr}`;

  return (
    <div className="mx-4 my-3 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md overflow-hidden transition-all duration-200">
      {/* Top Banner Accent */}
      <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Header Block: Date Badge + Title + Details */}
        <div className="flex items-start gap-4">
          {/* Outlook-style Calendar Month/Day Badge */}
          <div className="w-13 sm:w-14 shrink-0 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700/80 shadow-xs text-center bg-neutral-50 dark:bg-neutral-800">
            <div className="bg-blue-600 text-[10px] font-black uppercase text-white py-0.5 tracking-wider">
              {format(invite.start, 'MMM')}
            </div>
            <div className="py-1">
              <span className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-100 leading-none block">
                {format(invite.start, 'd')}
              </span>
              <span className="text-[9px] font-semibold uppercase text-neutral-400 dark:text-neutral-500 tracking-tight block mt-0.5">
                {format(invite.start, 'EEE')}
              </span>
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/80 dark:border-blue-900/60">
                <CalendarIcon className="w-3 h-3" />
                Calendar Invitation
              </span>

              {invite.recurrenceRule && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200/80 dark:border-purple-900/60">
                  <Repeat className="w-3 h-3" />
                  Recurring
                </span>
              )}

              {userRsvp === 'accepted' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  You accepted
                </span>
              )}
              {userRsvp === 'tentative' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60">
                  <HelpCircle className="w-3 h-3 stroke-[2.5]" />
                  You tentatively accepted
                </span>
              )}
              {userRsvp === 'declined' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/60">
                  <X className="w-3 h-3 stroke-[2.5]" />
                  You declined
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {invite.summary}
            </h3>

            {/* Time string */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 mt-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{formattedDateTime}</span>
            </div>

            {/* Conflict / Free-busy Indicator */}
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {conflictEventTitle ? (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Conflicts with: {conflictEventTitle}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>No conflicts at this time</span>
                </div>
              )}
            </div>

            {/* Location or Virtual Link */}
            {invite.location && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 mt-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{invite.location}</span>
              </div>
            )}

            {/* Organizer */}
            {invite.organizer.email && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Organizer:{' '}
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {invite.organizer.name}
                </span>{' '}
                &lt;{invite.organizer.email}&gt;
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2 flex-wrap">
          {/* RSVP choices: Yes / Maybe / No */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mr-1 hidden sm:inline">
              RSVP:
            </span>

            <button
              type="button"
              onClick={() => handleRsvp('accept')}
              disabled={isSubmittingRsvp}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60',
                userRsvp === 'accepted'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:border-emerald-800/60'
              )}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Yes</span>
            </button>

            <button
              type="button"
              onClick={() => handleRsvp('maybe')}
              disabled={isSubmittingRsvp}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60',
                userRsvp === 'tentative'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-600 hover:text-white border border-amber-200 dark:border-amber-800/60'
              )}
            >
              <HelpCircle className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Maybe</span>
            </button>

            <button
              type="button"
              onClick={() => handleRsvp('decline')}
              disabled={isSubmittingRsvp}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60',
                userRsvp === 'declined'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-red-600 hover:text-white border border-neutral-200 dark:border-neutral-700'
              )}
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>No</span>
            </button>

            {isSubmittingRsvp && (
              <Loader2 className="w-4 h-4 text-neutral-400 animate-spin ml-1" />
            )}
          </div>

          {/* Secondary Actions: Virtual Meeting Join & Add to Calendar */}
          <div className="flex items-center gap-2 flex-wrap">
            {invite.meetingUrl && (
              <a
                href={invite.meetingUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Meeting</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            )}

            {!isAddedToCalendar ? (
              <button
                type="button"
                onClick={handleAddToCalendar}
                disabled={isAddingToCalendar}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isAddingToCalendar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CalendarPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
                <span>Add to Calendar</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 font-medium px-2 py-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                On your calendar
              </span>
            )}

            {onReply && (
              <button
                type="button"
                onClick={onReply}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
                title="Send a message to the organizer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Message Organizer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
