'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import { HOURS, formatSchedulerHeaderDate, formatEventBlockDisplay } from './scheduleConstants';
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
  selectedDate,
  onDateChange,
  startHourDecimal,
  onStartHourChange,
  durationHours,
  onDurationChange,
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

  const headerDateStr = formatSchedulerHeaderDate(selectedDate);
  const eventBlockText = formatEventBlockDisplay(startHourDecimal, durationHours);

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
    const half = relY >= rect.height / 2 ? 0.5 : 0;
    const newStart = Math.min(23.5, hourIdx + half);
    onStartHourChange(newStart);
  };

  // Resize duration from bottom-left dot
  const handleDurationResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;
    const startY = e.clientY;
    const initialDur = durationHours;
    const maxDur = Math.max(0.25, 24 - startHourDecimal);
    const onMove = (me: MouseEvent) => {
      const delta = Math.round((me.clientY - startY) / (ROW_HEIGHT / 2)) * 0.5;
      onDurationChange(Math.max(0.5, Math.min(maxDur, initialDur + delta)));
    };
    const onUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Resize start time from top-right dot
  const handleStartResize = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;
    const startY = e.clientY;
    const initialStart = startHourDecimal;
    const initialEnd = initialStart + durationHours;
    const onMove = (me: MouseEvent) => {
      const delta = Math.round((me.clientY - startY) / (ROW_HEIGHT / 2)) * 0.5;
      const newStart = Math.max(0, Math.min(initialEnd - 0.5, initialStart + delta));
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

  // Move entire block
  const handleBlockDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;
    const startY = e.clientY;
    const initialStart = startHourDecimal;
    const maxStart = Math.max(0, 24 - durationHours);
    const onMove = (me: MouseEvent) => {
      const delta = Math.round((me.clientY - startY) / (ROW_HEIGHT / 2)) * 0.5;
      const newStart = Math.max(0, Math.min(maxStart, initialStart + delta));
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
    <div
      ref={containerRef}
      className={cn(
        'border-t md:border-t-0 md:border-l border-neutral-800 bg-[#181818] flex flex-col shrink-0 transition-all duration-200 select-none',
        expanded ? 'w-full md:w-[480px] lg:w-[520px]' : 'w-full md:w-[330px] lg:w-[360px]'
      )}
    >
      {/* Top Header of Right Column */}
      <div className="h-10 px-3.5 border-b border-neutral-800 flex items-center justify-between shrink-0 select-none bg-[#181818]">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <button
            type="button"
            onClick={() => shiftDay(-1)}
            className="p-1 rounded hover:bg-neutral-800 hover:text-white cursor-pointer"
            title="Previous day"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="p-0.5 text-neutral-400">
            <Calendar className="w-3.5 h-3.5" />
          </div>

          <button
            type="button"
            onClick={() => shiftDay(1)}
            className="p-1 rounded hover:bg-neutral-800 hover:text-white cursor-pointer"
            title="Next day"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="relative flex items-center ml-1">
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
            <div className="flex items-center gap-1 text-xs text-neutral-200 hover:text-white font-normal p-1 rounded hover:bg-neutral-800/80 cursor-pointer">
              <span>{headerDateStr}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </div>
          </div>
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

      {/* Grid Canvas */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative custom-scrollbar divide-y divide-neutral-800/60"
        style={{ maxHeight: 'calc(92vh - 120px)' }}
      >
        <div className="relative">
          {HOURS.map((hourLabel, hourIdx) => (
            <div
              key={hourLabel}
              onClick={(e) => handleSlotClick(e, hourIdx)}
              className="h-11 flex relative hover:bg-neutral-800/20 cursor-pointer group transition-colors"
            >
              {/* Hour Label */}
              <div className="w-14 shrink-0 text-left pl-3.5 pt-0.5 text-[11px] text-neutral-400 font-normal select-none">
                {hourLabel}
              </div>

              {/* Hour Slot Grid Area */}
              <div className="flex-1 border-l border-neutral-800 relative">
                {/* Half hour dashed divider line */}
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-neutral-800/60 pointer-events-none" />
              </div>
            </div>
          ))}

          {/* Draggable & Resizable Coral Red Event Block */}
          <div
            onMouseDown={handleBlockDrag}
            className={cn(
              'absolute left-14 right-2 z-20 rounded-xs bg-[#ea5252] hover:bg-[#ee5d5d] shadow-md cursor-move flex items-center px-2 select-none transition-all',
              pulse && 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-[1.02] shadow-2xl'
            )}
            style={{
              top: `${startHourDecimal * ROW_HEIGHT}px`,
              height: `${Math.max(22, durationHours * ROW_HEIGHT)}px`,
            }}
          >
            {/* Handle 1: Bottom-left dot for duration */}
            <div
              onMouseDown={handleDurationResize}
              className="absolute -bottom-1 left-2.5 w-2 h-2 rounded-full bg-white border border-neutral-900 shadow-sm cursor-ns-resize hover:scale-125 transition-transform z-30"
              title="Drag duration"
            />

            {/* Event Time Text */}
            <span className="text-[11px] font-semibold text-white tracking-tight truncate pointer-events-none">
              {eventBlockText}
            </span>

            {/* Handle 2: Top-right dot for start time */}
            <div
              onMouseDown={handleStartResize}
              className="absolute -top-1 right-2.5 w-2 h-2 rounded-full bg-white border border-neutral-900 shadow-sm cursor-ns-resize hover:scale-125 transition-transform z-30"
              title="Drag start time"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
