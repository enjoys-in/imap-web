'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock, Calendar, Sun, Sunrise, Send, Archive } from 'lucide-react';
import { format, addDays, nextMonday, setHours, setMinutes, setSeconds } from 'date-fns';
import { cn } from '@/lib/utils';

interface ComposeScheduleSendMenuProps {
  onSend: () => void;
  onScheduleSend: (scheduledTime: Date) => void;
  onSendAndArchive?: () => void;
  disabled?: boolean;
}

export function ComposeScheduleSendMenu({
  onSend,
  onScheduleSend,
  onSendAndArchive,
  disabled = false,
}: ComposeScheduleSendMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customDateTime, setCustomDateTime] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowCustomPicker(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Compute preset dates
  const now = new Date();
  const tomorrow8am = setSeconds(setMinutes(setHours(addDays(now, 1), 8), 0), 0);
  const tomorrow1pm = setSeconds(setMinutes(setHours(addDays(now, 1), 13), 0), 0);
  const nextMon8am = setSeconds(setMinutes(setHours(nextMonday(now), 8), 0), 0);

  const presets = [
    {
      label: 'Tomorrow morning',
      timeStr: format(tomorrow8am, 'EEE, h:mm a'),
      date: tomorrow8am,
      icon: Sunrise,
    },
    {
      label: 'Tomorrow afternoon',
      timeStr: format(tomorrow1pm, 'EEE, h:mm a'),
      date: tomorrow1pm,
      icon: Sun,
    },
    {
      label: 'Monday morning',
      timeStr: format(nextMon8am, 'MMM d, h:mm a'),
      date: nextMon8am,
      icon: Calendar,
    },
  ];

  const handleSelectPreset = (date: Date) => {
    setIsOpen(false);
    onScheduleSend(date);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDateTime) return;
    const date = new Date(customDateTime);
    if (!isNaN(date.getTime())) {
      setIsOpen(false);
      setShowCustomPicker(false);
      onScheduleSend(date);
    }
  };

  return (
    <div ref={menuRef} className="relative inline-flex items-center shadow-xs rounded">
      {/* Primary Send Button */}
      <button
        type="button"
        onClick={onSend}
        disabled={disabled}
        className="h-7 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded-l border-r border-[#106ebe] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Send</span>
      </button>

      {/* Schedule Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        disabled={disabled}
        title="Schedule send"
        className="h-7 px-1.5 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded-r flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl py-1 z-50 text-xs text-neutral-800 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 font-semibold text-[11px] text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Schedule Send</span>
          </div>

          {!showCustomPicker ? (
            <>
              {onSendAndArchive && (
                <div className="border-b border-neutral-100 dark:border-neutral-800 pb-1 mb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onSendAndArchive();
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/80 flex items-center justify-between cursor-pointer transition-colors text-purple-600 dark:text-purple-400 font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <Archive className="w-3.5 h-3.5" />
                      <span>Send &amp; Archive</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Ctrl+Shift+Enter</span>
                  </button>
                </div>
              )}

              {presets.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSelectPreset(p.date)}
                    className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span>{p.label}</span>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-medium">{p.timeStr}</span>
                  </button>
                );
              })}

              <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomPicker(true)}
                  className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/80 flex items-center gap-2 cursor-pointer text-[#0078d4] dark:text-blue-400 font-semibold"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Choose custom date & time...</span>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-3 space-y-3">
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                Select Date and Time
              </label>
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                min={format(now, "yyyy-MM-dd'T'HH:mm")}
                className="w-full text-xs px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                required
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomPicker(false)}
                  className="px-2.5 py-1 rounded text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-2xs"
                >
                  Schedule
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
