'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import { HOURS, format24hTime } from './scheduleConstants';
import { cn } from '@/lib/utils';

interface ScheduleMiniCanvasProps {
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  startHourDecimal: number;
  onStartHourChange: (val: number) => void;
  durationHours: number;
  onDurationChange: (val: number) => void;
  scrollTrigger?: number;
}

const ROW_HEIGHT = 44;

export function ScheduleMiniCanvas({
  selectedDate, onDateChange,
  startHourDecimal, onStartHourChange,
  durationHours, onDurationChange,
  scrollTrigger,
}: ScheduleMiniCanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isDraggingRef.current) return;
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: Math.max(0, startHourDecimal * ROW_HEIGHT - 60), behavior: 'smooth' });
    }
  }, [scrollTrigger]);

  // Initial scroll to current startHour on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, startHourDecimal * ROW_HEIGHT - 60);
    }
  }, []);

  useEffect(() => {
    if (scrollTrigger) {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [scrollTrigger]);

  const endHourDecimal = startHourDecimal + durationHours;
  const startTimeStr = format24hTime(startHourDecimal);
  const endTimeStr = format24hTime(endHourDecimal);
  const headerDateStr = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const yyyy = selectedDate.getFullYear();
  const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const dd = String(selectedDate.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const shiftDay = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    onDateChange(next);
  };

  const handleSlotClick = (e: React.MouseEvent<HTMLDivElement>, hourIdx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = Math.max(0, Math.min(rect.height - 1, e.clientY - rect.top));
    const quarter = Math.floor((relY / rect.height) * 4);
    const newStart = Math.min(23.75, hourIdx + quarter * 0.25);
    onStartHourChange(newStart);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;
    const startY = e.clientY;
    const initialDur = durationHours;
    const maxDur = Math.max(0.25, 24 - startHourDecimal);
    const onMove = (me: MouseEvent) => {
      const delta = Math.round((me.clientY - startY) / (ROW_HEIGHT / 4));
      onDurationChange(Math.max(0.25, Math.min(maxDur, Math.min(12, initialDur + delta * 0.25))));
    };
    const onUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleStartResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;
    const startY = e.clientY;
    const initialStart = startHourDecimal;
    const initialEnd = initialStart + durationHours;
    const onMove = (me: MouseEvent) => {
      const delta = Math.round((me.clientY - startY) / (ROW_HEIGHT / 4));
      const newStart = Math.max(0, Math.min(initialEnd - 0.25, initialStart + delta * 0.25));
      onStartHourChange(newStart);
      onDurationChange(initialEnd - newStart);
    };
    const onUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleBlockDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;
    const startY = e.clientY;
    const initialStart = startHourDecimal;
    const maxStart = Math.max(0, 24 - durationHours);
    const onMove = (me: MouseEvent) => {
      const delta = (me.clientY - startY) / ROW_HEIGHT;
      const quarterSteps = Math.round(delta * 4) * 0.25;
      const newStart = Math.max(0, Math.min(maxStart, Math.round((initialStart + quarterSteps) * 100) / 100));
      onStartHourChange(newStart);
    };
    const onUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div ref={containerRef} className={cn(
      'border-t md:border-t-0 md:border-l border-neutral-800 bg-[#161616] flex flex-col shrink-0 transition-all duration-200',
      expanded ? 'w-full md:w-[480px] lg:w-[540px]' : 'w-full md:w-[340px] lg:w-[380px]'
    )}>
      <div className="h-10 px-3.5 border-b border-neutral-800 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1 text-neutral-400">
          <button type="button" onClick={() => shiftDay(-1)} className="p-1 rounded hover:bg-neutral-800 hover:text-white cursor-pointer" title="Previous day">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="relative flex items-center">
            <input
              type="date"
              value={dateStr}
              onChange={(e) => {
                if (!e.target.value) return;
                const [y, m, d] = e.target.value.split('-').map(Number);
                const next = new Date(selectedDate);
                next.setFullYear(y, m - 1, d);
                onDateChange(next);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              title="Click to pick date"
            />
            <div className="flex items-center gap-1 text-xs text-neutral-200 hover:text-white font-medium p-1 rounded hover:bg-neutral-800 cursor-pointer">
              <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
              <span>{headerDateStr}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </div>
          </div>
          <button type="button" onClick={() => shiftDay(1)} className="p-1 rounded hover:bg-neutral-800 hover:text-white cursor-pointer" title="Next day">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-neutral-400 hover:text-white cursor-pointer p-1 rounded hover:bg-neutral-800"
          title={expanded ? 'Collapse scheduler' : 'Expand scheduler'}
        >
          {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto relative custom-scrollbar divide-y divide-neutral-800/60" style={{ maxHeight: 'calc(92vh - 120px)' }}>
        <div className="relative">
          {HOURS.map((hourLabel, hourIdx) => (
            <div key={hourLabel} onClick={(e) => handleSlotClick(e, hourIdx)} className="h-11 flex relative hover:bg-neutral-800/30 cursor-pointer group transition-colors">
              <div className="w-14 shrink-0 text-right pr-3 pt-1 text-[11px] text-neutral-400 font-normal select-none">{hourLabel}</div>
              <div className="flex-1 border-l border-neutral-800 relative">
                <div className="absolute inset-x-0 top-1/4 border-t border-neutral-800/20 pointer-events-none" />
                <div className="absolute inset-x-0 top-2/4 border-t border-neutral-800/40 pointer-events-none" />
                <div className="absolute inset-x-0 top-3/4 border-t border-neutral-800/20 pointer-events-none" />
              </div>
            </div>
          ))}
          <div
            onMouseDown={handleBlockDrag}
            className={cn(
              'absolute left-14 right-2 z-20 rounded-xs bg-[#e05151] hover:bg-[#ea5d5d] shadow-md cursor-move flex items-center justify-between px-1.5 select-none',
              pulse && 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-[1.03] shadow-2xl transition-all'
            )}
            style={{ top: `${startHourDecimal * ROW_HEIGHT}px`, height: `${Math.max(22, durationHours * ROW_HEIGHT)}px` }}
          >
            <div onMouseDown={handleStartResizeStart} className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-900 shadow-xs cursor-ns-resize hover:scale-125 transition-transform shrink-0" title="Drag start time" />
            <span className="text-[11px] font-semibold text-white tracking-tight truncate pointer-events-none mx-1">{startTimeStr} – {endTimeStr}</span>
            <div onMouseDown={handleResizeStart} className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-900 shadow-xs cursor-ns-resize hover:scale-125 transition-transform shrink-0" title="Drag duration" />
          </div>
        </div>
      </div>
    </div>
  );
}
