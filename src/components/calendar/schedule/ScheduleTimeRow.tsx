'use client';

import React, { useState } from 'react';
import { Clock, CalendarRange, ChevronDown, Check } from 'lucide-react';
import {
  TIME_INTERVALS_15M,
  DURATION_OPTIONS,
  formatOutlookEventDate,
  format24hTime,
} from './scheduleConstants';
import { cn } from '@/lib/utils';

interface ScheduleTimeRowProps {
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  startHourDecimal: number;
  onStartHourChange: (val: number) => void;
  durationHours: number;
  onDurationChange: (val: number) => void;
  isAllDay: boolean;
  onAllDayChange: (val: boolean) => void;
  onScrollToScheduler: () => void;
}

export function ScheduleTimeRow({
  selectedDate,
  onDateChange,
  startHourDecimal,
  onStartHourChange,
  durationHours,
  onDurationChange,
  isAllDay,
  onAllDayChange,
  onScrollToScheduler,
}: ScheduleTimeRowProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const endHourDecimal = (startHourDecimal + durationHours) % 24;

  const handleStartChange = (newStart: number) => {
    onStartHourChange(newStart);
  };

  const handleEndChange = (newEnd: number) => {
    let diff = newEnd - startHourDecimal;
    if (diff <= 0) diff += 24;
    onDurationChange(Math.max(0.25, diff));
  };

  // Convert Date to YYYY-MM-DD for native input
  const yyyy = selectedDate.getFullYear();
  const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const dd = String(selectedDate.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const formattedDisplay = formatOutlookEventDate(selectedDate, startHourDecimal, durationHours, isAllDay);

  return (
    <div className="relative">
      {pickerOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setPickerOpen(false)}
        />
      )}

      <div className="flex items-center gap-3">
        <div className="w-7 flex items-center justify-center text-neutral-400 shrink-0">
          <Clock className="w-4 h-4" />
        </div>

        <div className="flex-1 flex items-center justify-between border-b border-neutral-700/80 pb-1.5 min-h-[32px]">
          {/* Main date/time clickable badge */}
          <button
            type="button"
            onClick={() => setPickerOpen(!pickerOpen)}
            className="flex items-center gap-2 text-xs text-neutral-200 hover:text-white transition-colors cursor-pointer select-none py-0.5 rounded px-1.5 -ml-1.5 hover:bg-neutral-800/60 font-normal"
            title="Click to change date and time"
          >
            <span>{formattedDisplay}</span>
            <ChevronDown className={cn('w-3 h-3 text-neutral-400 transition-transform', pickerOpen && 'rotate-180')} />
          </button>

          {/* Scheduler Button */}
          <button
            type="button"
            onClick={onScrollToScheduler}
            className="flex items-center gap-1.5 text-neutral-300 hover:text-white px-2 py-0.5 rounded hover:bg-neutral-800 transition-colors cursor-pointer text-xs font-normal shrink-0 select-none"
            title="Jump to scheduler"
          >
            <CalendarRange className="w-3.5 h-3.5 text-neutral-400" />
            <span>Scheduler</span>
          </button>
        </div>
      </div>

      {/* Dropdown Popover for adjusting Date / Time / All Day */}
      {pickerOpen && (
        <div className="absolute left-10 top-full mt-2 w-80 sm:w-96 bg-[#252525] border border-neutral-700 rounded-lg shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 space-y-3.5">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-2">
            <span className="text-xs font-semibold text-neutral-200">Date & Time Settings</span>
            <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => onAllDayChange(e.target.checked)}
                className="accent-[#0078d4] rounded cursor-pointer"
              />
              <span>All day event</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] text-neutral-400 block font-medium">Date</label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => {
                if (!e.target.value) return;
                const [y, m, d] = e.target.value.split('-').map(Number);
                const nextDate = new Date(selectedDate);
                nextDate.setFullYear(y, m - 1, d);
                onDateChange(nextDate);
              }}
              className="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-100 focus:border-[#0078d4] focus:outline-hidden cursor-pointer"
            />
          </div>

          {!isAllDay && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-neutral-400 block font-medium mb-1">Start Time</label>
                  <select
                    value={startHourDecimal}
                    onChange={(e) => handleStartChange(parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-100 focus:border-[#0078d4] focus:outline-hidden cursor-pointer"
                  >
                    {TIME_INTERVALS_15M.map((t) => (
                      <option key={`start-${t.value}`} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block font-medium mb-1">End Time</label>
                  <select
                    value={endHourDecimal}
                    onChange={(e) => handleEndChange(parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-100 focus:border-[#0078d4] focus:outline-hidden cursor-pointer"
                  >
                    {TIME_INTERVALS_15M.map((t) => (
                      <option key={`end-${t.value}`} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block font-medium mb-1.5">Quick Duration</label>
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={`dur-${d.value}`}
                      type="button"
                      onClick={() => onDurationChange(d.value)}
                      className={cn(
                        'px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer',
                        durationHours === d.value
                          ? 'bg-[#0078d4] text-white'
                          : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="pt-2 border-t border-neutral-700 flex justify-end">
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="px-3 py-1 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
