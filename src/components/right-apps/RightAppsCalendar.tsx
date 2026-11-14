'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface MiniEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
}

const INITIAL_EVENTS: MiniEvent[] = [];

export function RightAppsCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<MiniEvent[]>(INITIAL_EVENTS);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('03:00 PM');

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: `ev-${Date.now()}`,
        title: newTitle.trim(),
        start: newTime,
        end: '04:00 PM',
        color: '#0078d4',
      },
    ]);
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-xs text-neutral-800 dark:text-neutral-200 select-none">
      {/* Month Navigation */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <span className="font-bold text-neutral-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer text-neutral-500"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer text-neutral-500"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini Calendar Grid */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-neutral-400 mb-1">
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={`h-6 w-full rounded flex items-center justify-center cursor-pointer transition-colors text-[11px] ${
                  isSelected
                    ? 'bg-[#0078d4] text-white font-bold'
                    : isToday
                    ? 'border border-[#0078d4] text-[#0078d4] font-semibold'
                    : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Agenda Header & Add button */}
      <div className="p-3 pb-1 flex items-center justify-between">
        <span className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#0078d4]" />
          <span>Agenda &bull; {format(selectedDate, 'EEE, MMM d')}</span>
        </span>
        <button
          type="button"
          onClick={() => setIsAdding((v) => !v)}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[#0078d4] cursor-pointer"
          title="Add event"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <form onSubmit={handleAddEvent} className="p-3 mx-2 my-1 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Event title"
            className="w-full px-2 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-[#1f1f1f] text-xs focus:outline-none"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-24 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-[#1f1f1f] text-[11px]"
            />
            <div className="flex gap-1">
              <button type="button" onClick={() => setIsAdding(false)} className="px-2 py-0.5 rounded text-[11px] text-neutral-500 hover:text-neutral-900 cursor-pointer">Cancel</button>
              <button type="submit" disabled={!newTitle.trim()} className="px-2.5 py-0.5 bg-[#0078d4] text-white rounded text-[11px] font-medium disabled:opacity-40 cursor-pointer">Save</button>
            </div>
          </div>
        </form>
      )}

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="p-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-[#0078d4] transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ev.color }} />
              <span className="truncate">{ev.title}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-1 pl-3.5">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>{ev.start} &ndash; {ev.end}</span>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="h-24 flex items-center justify-center text-neutral-400 text-center">
            <p>No events yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
