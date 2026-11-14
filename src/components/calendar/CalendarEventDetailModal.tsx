'use client';

import React from 'react';
import { CalendarEvent } from './types';
import { Clock, Calendar as CalendarIcon, Link as LinkIcon, Trash2, Video, X } from 'lucide-react';

interface CalendarEventDetailModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (event: CalendarEvent) => void;
  isReadOnly?: boolean;
}

export function CalendarEventDetailModal({
  event,
  open,
  onClose,
  onDelete,
  onEdit,
  isReadOnly = false,
}: CalendarEventDetailModalProps) {
  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in select-none">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 pr-4">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              {event.category || 'Meeting'}
            </span>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
              {event.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
            {event.description}
          </p>
        )}

        {/* Participants */}
        {event.participants.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Attendees
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-1.5">
                {event.participants.map((p) => (
                  <img
                    key={p.id}
                    src={p.avatar}
                    alt={p.name}
                    title={p.name}
                    className="w-6 h-6 rounded-full border border-white dark:border-neutral-900 object-cover"
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-500">
                {event.participants.map((p) => p.name).join(', ')}
                {event.extraAttendeesCount ? ` +${event.extraAttendeesCount} more` : ''}
              </span>
            </div>
          </div>
        )}

        {/* Meeting Link CTA */}
        {event.meetUrl && (
          <a
            href={event.meetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
          >
            <Video className="w-4 h-4" />
            <span>Join Google Meet</span>
          </a>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
          {isReadOnly ? (
            <span className="text-[11px] font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
              View Only
            </span>
          ) : (
            <button
              onClick={() => {
                onDelete(event.id);
                onClose();
              }}
              className="px-3 h-8 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(event);
                }}
                className="px-3.5 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Edit
              </button>
            )}
            <button
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
