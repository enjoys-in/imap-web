'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CalendarClock, Check, Plus, Calendar, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useComposeStore } from '@/stores';
import { useToastStore } from '@/stores/useToastStore';

interface MeetingSlot {
  id: string;
  label: string;
  formatted: string;
  selected: boolean;
}

export function ComposeSuggestTimesMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const body = useComposeStore((s) => s.body);
  const updateFields = useComposeStore((s) => s.updateFields);
  const addToast = useToastStore((s) => s.addToast);

  // Generate slots for the next 3 business days
  const initialSlots = useMemo<MeetingSlot[]>(() => {
    const slots: MeetingSlot[] = [];
    const today = new Date();
    let dayCount = 1;

    while (slots.length < 4 && dayCount <= 7) {
      const targetDate = addDays(today, dayCount);
      const dayOfWeek = targetDate.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const datePrefix = format(targetDate, 'EEEE, MMM d');
        if (slots.length % 2 === 0) {
          slots.push({
            id: `slot-${dayCount}-1`,
            label: `${datePrefix} · 10:00 AM – 10:30 AM`,
            formatted: `• ${datePrefix} at 10:00 AM – 10:30 AM`,
            selected: true,
          });
        } else {
          slots.push({
            id: `slot-${dayCount}-2`,
            label: `${datePrefix} · 2:00 PM – 2:30 PM`,
            formatted: `• ${datePrefix} at 2:00 PM – 2:30 PM`,
            selected: true,
          });
        }
      }
      dayCount++;
    }
    return slots;
  }, []);

  const [slots, setSlots] = useState<MeetingSlot[]>(initialSlots);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleSlot = (id: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleInsert = () => {
    const selectedSlots = slots.filter((s) => s.selected);
    if (selectedSlots.length === 0) return;

    const timesBlock = `\n\nI'd love to connect. Here are a few times I'm available:\n${selectedSlots
      .map((s) => s.formatted)
      .join('\n')}\n\nPlease let me know what works best for you, or feel free to propose another time!`;

    const newBody = body ? `${body.trimEnd()}${timesBlock}` : timesBlock.trimStart();
    updateFields({ body: newBody });

    addToast({
      title: 'Availability inserted',
      description: `Added ${selectedSlots.length} available times to email.`,
      type: 'success',
    });

    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        title="Suggest meeting times / Insert available slots"
        className="h-7 px-2.5 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <CalendarClock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:inline">Suggest Times</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl p-3 z-50 text-xs text-neutral-800 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100 space-y-2.5">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-bold text-neutral-900 dark:text-neutral-100 text-[11px] uppercase tracking-wider">
                Insert Available Times
              </span>
            </div>
            <span className="text-[10px] text-neutral-400">30 min slots</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {slots.map((s) => (
              <div
                key={s.id}
                onClick={() => toggleSlot(s.id)}
                className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                  s.selected
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-neutral-900 dark:text-neutral-100'
                    : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/60 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate text-xs font-medium">{s.label}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                    s.selected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-neutral-300 dark:border-neutral-600'
                  }`}
                >
                  {s.selected && <Check className="w-3 h-3 stroke-[2.5]" />}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert Times</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
