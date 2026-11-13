'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, User } from 'lucide-react';
import { useAppointments } from '@/hooks/useEmailsQuery';
import { format } from 'date-fns';

export function CalendarView() {
  const [selectedDay] = useState(new Date());
  const { data: appointments, isLoading } = useAppointments();

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 overflow-hidden select-none">
      <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[#0078d4]" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {format(selectedDay, 'MMMM yyyy')}
          </h2>
        </div>

        <button className="h-8 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>New event</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6 max-w-4xl">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            Today &bull; {format(selectedDay, 'EEEE, MMMM d')}
          </h3>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
            <div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
          </div>
        ) : (
          <div className="space-y-3">
            {appointments?.map((apt) => {
              const startFormatted = format(new Date(apt.startUtc), 'h:mm a');
              const endFormatted = format(new Date(apt.endUtc), 'h:mm a');

              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 hover:border-[#0078d4] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {apt.title}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#0078d4] font-medium">
                      Confirmed
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {startFormatted} – {endFormatted}
                      </span>
                    </div>

                    {apt.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{apt.location}</span>
                      </div>
                    )}

                    {apt.organizerName && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{apt.organizerName}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
