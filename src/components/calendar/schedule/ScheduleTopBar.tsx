'use client';

import React, { useState } from 'react';
import {
  X, Maximize2, Calendar, RotateCcw, ChevronDown, Clock,
  Tag, Lock, Printer, Save, Grid,
} from 'lucide-react';
import { CalendarColor } from '../types';
import {
  BUSY_OPTIONS, REMINDER_OPTIONS, CATEGORY_COLORS, SENSITIVITY_OPTIONS,
} from './scheduleConstants';
import { cn } from '@/lib/utils';

interface ScheduleTopBarProps {
  isEdit: boolean;
  onClose: () => void;
  isSeries: boolean;
  setIsSeries: (val: boolean) => void;
  busyStatus: string;
  setBusyStatus: (val: string) => void;
  reminder: string;
  setReminder: (val: string) => void;
  categoryColor: CalendarColor;
  setCategoryColor: (val: CalendarColor) => void;
  sensitivity: string;
  setSensitivity: (val: string) => void;
  onSave: () => void;
}

export function ScheduleTopBar({
  isEdit, onClose, isSeries, setIsSeries,
  busyStatus, setBusyStatus, reminder, setReminder,
  categoryColor, setCategoryColor, sensitivity, setSensitivity, onSave,
}: ScheduleTopBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const toggle = (m: string) => setActiveMenu((prev) => (prev === m ? null : m));

  return (
    <>
      {/* Backdrop to close menus on outside click */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveMenu(null)}
        />
      )}

      <div className="h-9 px-3.5 bg-[#141414] border-b border-neutral-800/80 flex items-center justify-between shrink-0">
        <div className="text-xs font-normal text-neutral-300">{isEdit ? 'Edit event' : 'New event'}</div>
        <div className="flex items-center gap-1 text-neutral-400">
          <button type="button" className="w-6 h-6 rounded flex items-center justify-center hover:bg-neutral-800 hover:text-white" title="Maximize">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center hover:bg-neutral-800 hover:text-white" title="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-11 px-3 bg-[#1e1e1e] border-b border-neutral-800 flex items-center justify-between gap-2 shrink-0 overflow-visible relative z-40 text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsSeries(false)}
            className={cn('px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors cursor-pointer',
              !isSeries ? 'border border-neutral-600 bg-neutral-800 text-white shadow-xs' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60')}
          >
            <Calendar className="w-3.5 h-3.5" /><span>Event</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSeries(true)}
            className={cn('px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors cursor-pointer',
              isSeries ? 'border border-neutral-600 bg-neutral-800 text-white shadow-xs' : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60')}
          >
            <RotateCcw className="w-3.5 h-3.5" /><span>Series</span>
          </button>

          <div className="h-4 w-px bg-neutral-700/80 mx-0.5" />

          {/* Busy Dropdown */}
          <div className="relative">
            <button type="button" onClick={() => toggle('busy')} className="px-2 py-1 rounded flex items-center gap-1 text-neutral-300 hover:text-white hover:bg-neutral-800">
              <Grid className="w-3.5 h-3.5 text-neutral-400" /><span>{busyStatus}</span><ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>
            {activeMenu === 'busy' && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-[#252525] border border-neutral-700 rounded-md shadow-xl py-1 z-50">
                {BUSY_OPTIONS.map((opt) => (
                  <button key={opt.id} type="button" onClick={() => { setBusyStatus(opt.label); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-700/60 text-xs text-neutral-200 flex items-center justify-between">
                    <span>{opt.label}</span>{busyStatus === opt.label && <span className="text-[#0078d4]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reminder Dropdown */}
          <div className="relative">
            <button type="button" onClick={() => toggle('reminder')} className="p-1.5 rounded flex items-center gap-1 text-neutral-300 hover:text-white hover:bg-neutral-800" title="Reminder">
              <Clock className="w-3.5 h-3.5 text-neutral-400" /><ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>
            {activeMenu === 'reminder' && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-[#252525] border border-neutral-700 rounded-md shadow-xl py-1 z-50">
                {REMINDER_OPTIONS.map((opt) => (
                  <button key={opt.id} type="button" onClick={() => { setReminder(opt.id); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-700/60 text-xs text-neutral-200 flex items-center justify-between">
                    <span>{opt.label}</span>{reminder === opt.id && <span className="text-[#0078d4]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button type="button" onClick={() => toggle('category')} className="p-1.5 rounded flex items-center gap-1 text-neutral-300 hover:text-white hover:bg-neutral-800" title="Category">
              <Tag className="w-3.5 h-3.5 text-neutral-400" /><ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>
            {activeMenu === 'category' && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-[#252525] border border-neutral-700 rounded-md shadow-xl py-1 z-50">
                {CATEGORY_COLORS.map((opt) => (
                  <button key={opt.id} type="button" onClick={() => { setCategoryColor(opt.id); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-700/60 text-xs text-neutral-200 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: opt.bg }} />
                    <span className="flex-1">{opt.label}</span>{categoryColor === opt.id && <span className="text-[#0078d4]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sensitivity Dropdown */}
          <div className="relative">
            <button type="button" onClick={() => toggle('sensitivity')} className="p-1.5 rounded flex items-center gap-1 text-neutral-300 hover:text-white hover:bg-neutral-800" title="Sensitivity">
              <Lock className="w-3.5 h-3.5 text-neutral-400" /><ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>
            {activeMenu === 'sensitivity' && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-[#252525] border border-neutral-700 rounded-md shadow-xl py-1 z-50">
                {SENSITIVITY_OPTIONS.map((opt) => (
                  <button key={opt.id} type="button" onClick={() => { setSensitivity(opt.label); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-neutral-700/60 text-xs text-neutral-200 flex items-center justify-between">
                    <span>{opt.label}</span>{sensitivity === opt.label && <span className="text-[#0078d4]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-neutral-700/80 mx-0.5" />
          <button type="button" onClick={() => window.print()} className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800" title="Print">
            <Printer className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>

        <button
          type="button"
          onClick={onSave}
          className="h-7 px-3.5 bg-[#0078d4] hover:bg-[#106ebe] active:bg-[#005a9e] text-white font-semibold text-xs rounded flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Save className="w-3.5 h-3.5" /><span>Save</span>
        </button>
      </div>
    </>
  );
}
