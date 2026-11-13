'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Pin,
  PinOff,
  Sparkles,
  Calendar,
  Grid,
  List,
  Check,
} from 'lucide-react';
import { useRightAppsStore, NoteItem } from '@/stores/useRightAppsStore';
import { useToastStore } from '@/stores/useToastStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const COLOR_CONFIG: Record<
  NoteItem['color'],
  { label: string; bg: string; border: string; text: string; dot: string; ring: string }
> = {
  yellow: {
    label: 'Yellow',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/70',
    text: 'text-amber-900 dark:text-amber-100',
    dot: 'bg-amber-400',
    ring: 'ring-amber-500',
  },
  blue: {
    label: 'Blue',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-200 dark:border-sky-800/70',
    text: 'text-sky-900 dark:text-sky-100',
    dot: 'bg-sky-400',
    ring: 'ring-sky-500',
  },
  green: {
    label: 'Green',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/70',
    text: 'text-emerald-900 dark:text-emerald-100',
    dot: 'bg-emerald-400',
    ring: 'ring-emerald-500',
  },
  pink: {
    label: 'Pink',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    border: 'border-pink-200 dark:border-pink-800/70',
    text: 'text-pink-900 dark:text-pink-100',
    dot: 'bg-pink-400',
    ring: 'ring-pink-500',
  },
  purple: {
    label: 'Purple',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800/70',
    text: 'text-purple-900 dark:text-purple-100',
    dot: 'bg-purple-400',
    ring: 'ring-purple-500',
  },
};

export function NotesPageView() {
  const notes = useRightAppsStore((s) => s.notes);
  const addNote = useRightAppsStore((s) => s.addNote);
  const updateNote = useRightAppsStore((s) => s.updateNote);
  const deleteNote = useRightAppsStore((s) => s.deleteNote);
  const togglePinNote = useRightAppsStore((s) => s.togglePinNote);
  const addToast = useToastStore((s) => s.addToast);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pinned' | NoteItem['color']>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Quick Create Note form state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState<NoteItem['color']>('yellow');

  const handleCreateNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) return;

    addNote(newTitle.trim() || 'Untitled Note', newContent.trim(), newColor);
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
    addToast({
      title: 'Note Created',
      description: 'Saved to your Sticky Notes and synchronized locally.',
      type: 'success',
    });
  };

  const handleDelete = (id: string, title: string) => {
    deleteNote(id);
    addToast({
      title: 'Note Deleted',
      description: `"${title}" has been removed.`,
      type: 'info',
    });
  };

  // Filter notes
  const filtered = notes
    .filter((n) => {
      if (selectedCategory === 'pinned') return n.isPinned;
      if (selectedCategory !== 'all') return n.color === selectedCategory;
      return true;
    })
    .filter((n) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      // Pinned first, then by updatedAt descending
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const pinnedCount = notes.filter((n) => n.isPinned).length;

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-neutral-100/60 dark:bg-[#161616] text-neutral-800 dark:text-neutral-100 select-none transition-colors">
      {/* Left Sidebar */}
      <div className="w-56 md:w-60 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1c1c1c] p-3 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">
              Sticky Notes
            </h2>
          </div>
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-medium">
            {notes.length}
          </span>
        </div>

        {/* Quick New Note Button */}
        <button
          onClick={() => setIsCreating(true)}
          className="w-full h-8 px-3 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>

        {/* Search Input */}
        <div className="relative my-1">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full h-7 pl-8 pr-2.5 rounded bg-neutral-100 dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700/80 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#0078d4]"
          />
        </div>

        {/* Categories / Filters */}
        <div className="space-y-0.5 flex-1 overflow-y-auto pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
              selectedCategory === 'all'
                ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
            )}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-neutral-500" />
              <span>All Notes</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">{notes.length}</span>
          </button>

          <button
            onClick={() => setSelectedCategory('pinned')}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
              selectedCategory === 'pinned'
                ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
            )}
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-amber-500" />
              <span>Pinned</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">{pinnedCount}</span>
          </button>

          <div className="pt-3 pb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Colors
          </div>

          {(['yellow', 'blue', 'green', 'pink', 'purple'] as const).map((colorKey) => {
            const conf = COLOR_CONFIG[colorKey];
            const count = notes.filter((n) => n.color === colorKey).length;
            const isSel = selectedCategory === colorKey;

            return (
              <button
                key={colorKey}
                onClick={() => setSelectedCategory(colorKey)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                  isSel
                    ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('w-2.5 h-2.5 rounded-full', conf.dot)} />
                  <span>{conf.label}</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="h-12 px-4 md:px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base text-neutral-900 dark:text-white capitalize">
              {selectedCategory === 'all'
                ? 'All Notes'
                : selectedCategory === 'pinned'
                ? 'Pinned Notes'
                : `${selectedCategory} Notes`}
            </h1>
            <span className="text-xs text-neutral-400">({filtered.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-[#252525] p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1 rounded cursor-pointer transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#333333] text-[#0078d4] shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                )}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1 rounded cursor-pointer transition-colors',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-[#333333] text-[#0078d4] shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                )}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setIsCreating(true)}
              className="h-7 px-2.5 rounded bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add note</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Create Note Card (when expanded or clicked) */}
          {isCreating && (
            <div
              className={cn(
                'p-4 rounded-xl border shadow-sm max-w-xl transition-all',
                COLOR_CONFIG[newColor].bg,
                COLOR_CONFIG[newColor].border
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  placeholder="Note Title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  className={cn(
                    'font-bold text-sm bg-transparent focus:outline-none w-full placeholder:text-neutral-400',
                    COLOR_CONFIG[newColor].text
                  )}
                />
              </div>

              <textarea
                placeholder="Take a note..."
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none resize-none leading-relaxed text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400"
              />

              <div className="flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10 mt-2">
                <div className="flex items-center gap-1.5">
                  {(['yellow', 'blue', 'green', 'pink', 'purple'] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={cn(
                        'w-4 h-4 rounded-full transition-transform cursor-pointer',
                        COLOR_CONFIG[color].dot,
                        newColor === color
                          ? 'scale-125 ring-2 ring-offset-1 ring-[#0078d4]'
                          : 'opacity-70 hover:opacity-100'
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateNote()}
                    className="px-3 py-1 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes Grid */}
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3 max-w-3xl'
            )}
          >
            {filtered.map((note) => {
              const conf = COLOR_CONFIG[note.color] || COLOR_CONFIG.yellow;
              return (
                <div
                  key={note.id}
                  className={cn(
                    'group relative rounded-xl border p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between',
                    conf.bg,
                    conf.border,
                    note.isPinned && 'ring-1 ring-amber-400/60'
                  )}
                >
                  <div>
                    {/* Top Header: Title, Pin, Delete */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <input
                        type="text"
                        value={note.title}
                        onChange={(e) => updateNote(note.id, { title: e.target.value })}
                        className={cn(
                          'font-bold text-xs bg-transparent focus:outline-none w-full select-text',
                          conf.text
                        )}
                      />

                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => togglePinNote(note.id)}
                          className={cn(
                            'p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors',
                            note.isPinned
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                          )}
                          title={note.isPinned ? 'Unpin note' : 'Pin note'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(note.id, note.title)}
                          className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content textarea */}
                    <textarea
                      rows={viewMode === 'grid' ? 5 : 3}
                      value={note.content}
                      onChange={(e) => updateNote(note.id, { content: e.target.value })}
                      className="w-full bg-transparent text-xs focus:outline-none resize-none leading-relaxed text-neutral-800 dark:text-neutral-100 select-text"
                    />
                  </div>

                  {/* Bottom Footer: Color Picker & Timestamp */}
                  <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-neutral-400 select-none mt-2">
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {(['yellow', 'blue', 'green', 'pink', 'purple'] as const).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateNote(note.id, { color })}
                          className={cn(
                            'w-3 h-3 rounded-full transition-transform cursor-pointer',
                            COLOR_CONFIG[color].dot,
                            note.color === color ? 'scale-125 ring-1 ring-black/40' : 'hover:scale-110'
                          )}
                          title={COLOR_CONFIG[color].label}
                        />
                      ))}
                    </div>

                    <span className="font-mono text-[9px]">
                      {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                  {query ? 'No matching notes found' : 'No notes yet'}
                </h3>
                <p className="text-xs text-neutral-400 max-w-xs">
                  {query
                    ? 'Try searching with different keywords or clear the filter.'
                    : 'Capture quick ideas, meeting memos, and snippets on color-coded sticky notes.'}
                </p>
              </div>
              {!query && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create a note</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
