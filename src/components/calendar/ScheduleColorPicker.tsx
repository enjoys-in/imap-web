'use client';

import React from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { CalendarColor } from './types';
import { cn } from '@/lib/utils';

export const COLOR_OPTIONS: { id: CalendarColor; hex: string }[] = [
  { id: 'peach', hex: '#fca5a5' },
  { id: 'yellow', hex: '#fde047' },
  { id: 'green', hex: '#86efac' },
  { id: 'cyan', hex: '#67e8f9' },
  { id: 'blue', hex: '#93c5fd' },
  { id: 'purple', hex: '#c084fc' },
  { id: 'pink', hex: '#f472b6' },
  { id: 'salmon', hex: '#fb7185' },
];

interface ScheduleHeaderProps {
  onClose: () => void;
}

export function ScheduleModalHeader({ onClose }: ScheduleHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Create Schedule
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Fill in the data below to add a schedule
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ScheduleColorPickerProps {
  selectedColor: CalendarColor;
  onSelectColor: (color: CalendarColor) => void;
}

export function ScheduleColorPicker({
  selectedColor,
  onSelectColor,
}: ScheduleColorPickerProps) {
  return (
    <div className="flex items-center justify-between px-1">
      {COLOR_OPTIONS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onSelectColor(c.id)}
          className={cn(
            'w-6 h-6 rounded-full transition-transform cursor-pointer',
            selectedColor === c.id
              ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
              : 'hover:scale-105 opacity-90'
          )}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}
