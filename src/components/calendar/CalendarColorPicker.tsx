'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CALENDAR_COLORS } from '@/lib/calendarColors';

interface CalendarColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}

export function CalendarColorPicker({ value, onChange, disabled }: CalendarColorPickerProps) {
  return (
    <div role="radiogroup" aria-label="Calendar color" className="flex items-center gap-2 flex-wrap">
      {CALENDAR_COLORS.map((color) => {
        const selected = value.toLowerCase() === color.hex.toLowerCase();
        return (
          <button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color.label}
            title={color.label}
            disabled={disabled}
            onClick={() => onChange(color.hex)}
            style={{ backgroundColor: color.hex }}
            className={cn(
              'w-6 h-6 rounded-full transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
              selected && 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-neutral-900 scale-110'
            )}
          />
        );
      })}
    </div>
  );
}
