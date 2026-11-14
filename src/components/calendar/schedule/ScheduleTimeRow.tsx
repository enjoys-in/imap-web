'use client';

import React from 'react';
import { Clock, Calendar as CalendarIcon, CalendarDays } from 'lucide-react';
import { TIME_INTERVALS_15M, DURATION_OPTIONS, format24hTime } from './scheduleConstants';

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
  selectedDate, onDateChange,
  startHourDecimal, onStartHourChange,
  durationHours, onDurationChange,
  isAllDay, onAllDayChange,
  onScrollToScheduler,
}: ScheduleTimeRowProps) {
  const endHourDecimal = (startHourDecimal + durationHours) % 24;

  const handleStartChange = (newStart: number) => {
    onStartHourChange(newStart);
  };

  const handleEndChange = (newEnd: number) => {
    let diff = newEnd - startHourDecimal;
    if (diff <= 0) diff += 24;
    onDurationChange(Math.max(0.25, diff));
  };

  // Convert Date to YYYY-MM-DD
  const yyyy = selectedDate.getFullYear();
  const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const dd = String(selectedDate.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  return (
    <div className="flex items-start gap-3 pt-1">
      <div className="w-7 flex items-center justify-center pt-2 text-neutral-400 shrink-0">
        <Clock className="w-4 h-4" />
      </div>
      <div className="flex-1 border-b border-neutral-700 pb-2 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Native Date Picker with custom styling */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-200">
            <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
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
              className="bg-transparent text-xs text-neutral-200 focus:outline-hidden cursor-pointer"
            />
          </div>

          {!isAllDay && (
            <>
              {/* Start Time Select */}
              <div className="flex items-center gap-1">
                <select
                  value={startHourDecimal}
                  onChange={(e) => handleStartChange(parseFloat(e.target.value))}
                  className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-100 focus:border-[#0078d4] focus:outline-hidden cursor-pointer"
                >
                  {TIME_INTERVALS_15M.map((t) => (
                    <option key={`start-${t.value}`} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <span className="text-neutral-400 text-xs">–</span>
                {/* End Time Select */}
                <select
                  value={endHourDecimal}
                  onChange={(e) => handleEndChange(parseFloat(e.target.value))}
                  className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-100 focus:border-[#0078d4] focus:outline-hidden cursor-pointer"
                >
                  {TIME_INTERVALS_15M.map((t) => (
                    <option key={`end-${t.value}`} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Duration Preset Selector */}
              <select
                value={durationHours}
                onChange={(e) => onDurationChange(parseFloat(e.target.value))}
                className="px-2 py-1 bg-neutral-800/60 border border-neutral-700/80 rounded text-[11px] text-neutral-300 focus:outline-hidden cursor-pointer"
                title="Meeting duration"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={`dur-${d.value}`} value={d.value}>
                    {d.label}
                  </option>
                ))}
                {!DURATION_OPTIONS.some((d) => d.value === durationHours) && (
                  <option value={durationHours}>
                    {durationHours < 1 ? `${Math.round(durationHours * 60)} min` : `${durationHours} hours`}
                  </option>
                )}
              </select>
            </>
          )}

          {/* All Day Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-neutral-300 ml-auto cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => onAllDayChange(e.target.checked)}
              className="accent-[#0078d4] rounded cursor-pointer"
            />
            <span>All day</span>
          </label>
        </div>

        {/* Formatted Date Range and Scheduler jump link */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
          <span>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            {!isAllDay && ` • ${format24hTime(startHourDecimal)} – ${format24hTime(endHourDecimal)}`}
          </span>

          <button
            type="button"
            onClick={onScrollToScheduler}
            className="flex items-center gap-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
            <span>View in scheduler</span>
          </button>
        </div>
      </div>
    </div>
  );
}
