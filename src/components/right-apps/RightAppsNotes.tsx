'use client';

import React, { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useRightAppsStore, NoteItem } from '@/stores/useRightAppsStore';
import { format } from 'date-fns';

const COLOR_CLASSES: Record<NoteItem['color'], { bg: string; border: string; text: string }> = {
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-900', text: 'text-yellow-900 dark:text-yellow-100' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-900', text: 'text-blue-900 dark:text-blue-100' },
  green: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900', text: 'text-emerald-900 dark:text-emerald-100' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-900', text: 'text-pink-900 dark:text-pink-100' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-900', text: 'text-purple-900 dark:text-purple-100' },
};

export function RightAppsNotes() {
  const notes = useRightAppsStore((s) => s.notes);
  const addNote = useRightAppsStore((s) => s.addNote);
  const updateNote = useRightAppsStore((s) => s.updateNote);
  const deleteNote = useRightAppsStore((s) => s.deleteNote);

  const [query, setQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState<NoteItem['color']>('yellow');

  const filtered = notes.filter(
    (n) => n.title.toLowerCase().includes(query.toLowerCase()) || n.content.toLowerCase().includes(query.toLowerCase())
  );

  const handleCreate = () => {
    addNote('New Note', 'Type your note content here...', selectedColor);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-xs text-neutral-800 dark:text-neutral-200 select-none">
      {/* Top Search & Create Bar */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2.5 bg-neutral-50/50 dark:bg-neutral-800/40">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full h-7 pl-8 pr-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-xs focus:outline-none focus:border-[#0078d4]"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {(['yellow', 'blue', 'green', 'pink', 'purple'] as const).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                  color === 'yellow' ? 'bg-amber-300' : color === 'blue' ? 'bg-sky-400' : color === 'green' ? 'bg-emerald-400' : color === 'pink' ? 'bg-pink-400' : 'bg-purple-400'
                } ${selectedColor === color ? 'scale-125 ring-2 ring-offset-1 ring-[#0078d4]' : 'opacity-70 hover:opacity-100'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="px-2.5 py-1 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3 h-3" />
            <span>New note</span>
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {filtered.map((note) => {
          const colors = COLOR_CLASSES[note.color] || COLOR_CLASSES.yellow;
          return (
            <div
              key={note.id}
              className={`p-3 rounded-lg border shadow-xs transition-shadow ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <input
                  type="text"
                  value={note.title}
                  onChange={(e) => updateNote(note.id, { title: e.target.value })}
                  className={`font-bold text-xs bg-transparent focus:outline-none w-full mr-2 ${colors.text}`}
                />
                <button
                  type="button"
                  onClick={() => deleteNote(note.id)}
                  className="text-neutral-400 hover:text-red-500 cursor-pointer transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                rows={3}
                value={note.content}
                onChange={(e) => updateNote(note.id, { content: e.target.value })}
                className="w-full bg-transparent text-xs focus:outline-none resize-none leading-relaxed text-neutral-800 dark:text-neutral-200"
              />

              <div className="text-[10px] text-neutral-400 mt-1">
                {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center text-neutral-400 text-center">
            <p>No notes found</p>
          </div>
        )}
      </div>
    </div>
  );
}
