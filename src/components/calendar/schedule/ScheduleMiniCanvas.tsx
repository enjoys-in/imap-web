'use client';

import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Maximize2, ChevronDown } from 'lucide-react';
import { HOURS, format24hTime } from './scheduleConstants';

interface ScheduleMiniCanvasProps {
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  startHourDecimal: number;
  onStartHourChange: (val: number) => void;
  durationHours: number;
  onDurationChange: (val: number) => void;
}

const ROW_HEIGHT = 44;

export function ScheduleMiniCanvas({
  selectedDate, onDateChange,
  startHourDecimal, onStartHourChange,
  durationHours, onDurationChange,
}: ScheduleMiniCanvasProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, startHourDecimal * ROW_HEIGHT - 60);
    }
  }, [startHourDecimal]);

  const endHourDecimal = startHourDecimal + durationHours;
  const startTimeStr = format24hTime(startHourDecimal);
  const endTimeStr = format24hTime(endHourDecimal);

  const headerDateStr = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

  const shiftDay = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    onDateChange(next);
  };

  const handleSlotClick = (e: React.MouseEvent<HTMLDivElement>, hourIdx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = Math.max(0, Math.min(rect.height - 1, e.clientY - rect.top));
    const quarter = Math.floor((relY / rect.height) * 4);
    onStartHourChange(Math.min(23.75, hourIdx + quarter * 0.25));
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startY = e.clientY;
    const initialDur = durationHours;

    const onMouseMove = (me: MouseEvent) => {
      const deltaQuarters = Math.round((me.clientY - startY) / (ROW_HEIGHT / 4));
      onDurationChange(Math.max(0.25, Math.min(12, initialDur + deltaQuarters * 0.25)));
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleBlockDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startY = e.clientY;
    const initialStart = startHourDecimal;

    const onMouseMove = (me: MouseEvent) => {
      const deltaQuarters = Math.round((me.clientY - startY) / (ROW_HEIGHT / 4));
      onStartHourChange(Math.max(0, Math.min(23.75, initialStart + deltaQuarters * 0.25)));
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="w-full md:w-[340px] lg:w-[380px] border-t md:border-t-0 md:border-l border-neutral-800 bg-[#161616] flex flex-col shrink-0">
      <div className="h-10 px-3.5 border-b border-neutral-800 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 text-neutral-400">
          <button type="button" onClick={() => shiftDay(-1)} className="hover:text-white cursor-pointer" title="Previous day">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
          <button type="button" onClick={() => shiftDay(1)} className="hover:text-white cursor-pointer" title="Next day">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1 text-xs text-neutral-200 font-medium pl-1">
            <span>{headerDateStr}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </div>
        </div>
        <button type="button" className="text-neutral-400 hover:text-white" title="Expand">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto relative custom-scrollbar divide-y divide-neutral-800/60" style={{ maxHeight: 'calc(92vh - 120px)' }}>
        <div className="relative">
          {HOURS.map((hourLabel, hourIdx) => (
            <div key={hourLabel} onClick={(e) => handleSlotClick(e, hourIdx)} className="h-11 flex relative hover:bg-neutral-800/30 cursor-pointer group transition-colors">
              <div className="w-14 shrink-0 text-right pr-3 pt-1 text-[11px] text-neutral-400 font-normal select-none">
                {hourLabel}
              </div>
              <div className="flex-1 border-l border-neutral-800 relative">
                <div className="absolute inset-x-0 top-1/4 border-t border-neutral-800/20 pointer-events-none" />
                <div className="absolute inset-x-0 top-2/4 border-t border-neutral-800/40 pointer-events-none" />
                <div className="absolute inset-x-0 top-3/4 border-t border-neutral-800/20 pointer-events-none" />
              </div>
            </div>
          ))}

          {/* Draggable & Resizable Selection Highlight Block */}
          <div
            onMouseDown={handleBlockDrag}
            className="absolute left-14 right-2 z-20 rounded-xs bg-[#e05151] hover:bg-[#ea5d5d] shadow-md cursor-move flex items-center justify-between px-2 select-none"
            style={{
              top: `${startHourDecimal * ROW_HEIGHT}px`,
              height: `${Math.max(22, durationHours * ROW_HEIGHT)}px`,
            }}
          >
            <span className="text-[11px] font-semibold text-white tracking-tight truncate pointer-events-none">
              {startTimeStr} – {endTimeStr}
            </span>
            <div
              onMouseDown={handleResizeStart}
              className="w-3 h-3 rounded-full bg-white border border-neutral-900 shadow-xs cursor-ns-resize hover:scale-125 transition-transform"
              title="Drag to resize duration (15m increments)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
