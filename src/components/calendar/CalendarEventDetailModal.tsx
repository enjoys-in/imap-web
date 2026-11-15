'use client';

import React, { useState } from 'react';
import { CalendarEvent } from './types';
import {
  Clock,
  Trash2,
  Video,
  X,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Repeat,
  Loader2,
} from 'lucide-react';

interface CalendarEventDetailModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string, options?: { isOccurrenceOnly?: boolean; originalStart?: string }) => void;
  onEdit: (event: CalendarEvent) => void;
  onRsvp?: (eventUid: string, response: 'accept' | 'decline' | 'maybe') => Promise<void>;
  isReadOnly?: boolean;
}

export function CalendarEventDetailModal({
  event,
  open,
  onClose,
  onDelete,
  onEdit,
  onRsvp,
  isReadOnly = false,
}: CalendarEventDetailModalProps) {
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);

  if (!open || !event) return null;

  const handleRsvpAction = async (resp: 'accept' | 'decline' | 'maybe') => {
    if (!event.uid || !onRsvp) return;
    setRsvpLoading(true);
    try {
      await onRsvp(event.uid, resp);
      onClose();
    } finally {
      setRsvpLoading(false);
    }
  };

  const showRsvp = !event.isOrganizer && Boolean(event.uid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                {event.category || 'Meeting'}
              </span>
              {event.isRecurring && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                  <Repeat className="w-2.5 h-2.5" />
                  <span>Series</span>
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
              {event.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Time & Duration */}
        <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>
              {event.startTime} - {event.endTime} ({event.durationHours}h)
            </span>
          </div>
          {event.organizerEmail && !event.isOrganizer && (
            <span className="text-[11px] text-neutral-400 truncate">
              by {event.organizerEmail}
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 whitespace-pre-wrap">
            {event.description}
          </p>
        )}

        {/* RSVP Invitation Status & Action Bar (UI_GUIDE.md Section 7) */}
        {showRsvp && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Invitation Response
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                Status: {event.myResponse || 'NeedsAction'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={rsvpLoading}
                onClick={() => handleRsvpAction('accept')}
                className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                {rsvpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Accept</span>
              </button>
              <button
                type="button"
                disabled={rsvpLoading}
                onClick={() => handleRsvpAction('maybe')}
                className="py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                {rsvpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <HelpCircle className="w-3.5 h-3.5" />}
                <span>Maybe</span>
              </button>
              <button
                type="button"
                disabled={rsvpLoading}
                onClick={() => handleRsvpAction('decline')}
                className="py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                {rsvpLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>Decline</span>
              </button>
            </div>
          </div>
        )}

        {/* Participants */}
        {event.participants.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Attendees ({event.participants.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {event.participants.map((p) => (
                <span
                  key={p.id}
                  className="px-2 py-1 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Link CTA */}
        {Boolean(event.meetUrl || (event.location && /https?:\/\//i.test(event.location))) && (
          <a
            href={event.meetUrl || event.location?.match(/https?:\/\/[^\s]+/i)?.[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
          >
            <Video className="w-4 h-4" />
            <span>Join Meeting</span>
          </a>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 relative">
          {isReadOnly ? (
            <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
              View Only
            </span>
          ) : (
            <div className="relative">
              <button
                onClick={() => {
                  if (event.isRecurring) {
                    setShowDeleteMenu((v) => !v);
                  } else {
                    onDelete(event.id);
                    onClose();
                  }
                }}
                className="px-3 h-8 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              {/* Recurring series deletion choices */}
              {showDeleteMenu && (
                <div className="absolute left-0 bottom-full mb-1.5 w-52 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-1.5 z-50 text-xs space-y-1">
                  <button
                    onClick={() => {
                      onDelete(event.id, {
                        isOccurrenceOnly: true,
                        originalStart: event.originalStart,
                      });
                      setShowDeleteMenu(false);
                      onClose();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                  >
                    Delete this occurrence only
                  </button>
                  <button
                    onClick={() => {
                      onDelete(event.id);
                      setShowDeleteMenu(false);
                      onClose();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-medium transition-colors cursor-pointer"
                  >
                    Delete all events in series
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (event.isRecurring) {
                      setShowEditMenu((v) => !v);
                    } else {
                      onClose();
                      onEdit(event);
                    }
                  }}
                  className="px-3.5 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Edit
                </button>

                {showEditMenu && (
                  <div className="absolute right-0 bottom-full mb-1.5 w-52 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-1.5 z-50 text-xs space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditMenu(false);
                        onClose();
                        onEdit({ ...event, isOccurrenceOnly: true });
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                    >
                      Edit this occurrence only
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditMenu(false);
                        onClose();
                        onEdit({ ...event, isOccurrenceOnly: false });
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
                    >
                      Edit entire series
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
