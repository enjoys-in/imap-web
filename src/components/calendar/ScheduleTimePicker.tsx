'use client';

import React, { useState } from 'react';
import { Clock, ArrowRight, Calendar as CalendarIcon, Link as LinkIcon, Copy, Check } from 'lucide-react';

interface ScheduleTimePickerProps {
  startTime: string;
  onStartTimeChange: (val: string) => void;
  endTime: string;
  onEndTimeChange: (val: string) => void;
  dateStr: string;
  onDateStrChange: (val: string) => void;
  meetUrl: string;
}

export function ScheduleTimePicker({
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  dateStr,
  onDateStrChange,
  meetUrl,
}: ScheduleTimePickerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(meetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 h-9 px-3 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-700 dark:text-neutral-300">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="w-full bg-transparent font-medium focus:outline-hidden"
          />
        </div>
        <div className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center shrink-0">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 flex items-center gap-2 h-9 px-3 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-700 dark:text-neutral-300">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="w-full bg-transparent font-medium focus:outline-hidden"
          />
        </div>
      </div>

      {/* Date Row */}
      <div className="flex items-center gap-2.5 h-9 px-3 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-700 dark:text-neutral-300">
        <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
        <input
          type="text"
          value={dateStr}
          onChange={(e) => onDateStrChange(e.target.value)}
          className="w-full bg-transparent font-medium focus:outline-hidden"
        />
      </div>

      {/* Google Meet Link */}
      <div className="flex items-center justify-between h-9 px-3 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 truncate mr-2">
          <LinkIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{meetUrl}</span>
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 transition-colors shrink-0 cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
}
