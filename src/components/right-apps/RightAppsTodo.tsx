'use client';

import React, { useState } from 'react';
import { Plus, Check, Star, Trash2 } from 'lucide-react';
import { useRightAppsStore } from '@/stores/useRightAppsStore';
import { cn } from '@/lib/utils';

export function RightAppsTodo() {
  const todos = useRightAppsStore((s) => s.todos);
  const addTodo = useRightAppsStore((s) => s.addTodo);
  const toggleTodo = useRightAppsStore((s) => s.toggleTodo);
  const starTodo = useRightAppsStore((s) => s.starTodo);
  const deleteTodo = useRightAppsStore((s) => s.deleteTodo);

  const [inputTitle, setInputTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'starred'>('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;
    addTodo(inputTitle.trim());
    setInputTitle('');
  };

  const filtered = todos.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'starred') return t.starred;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-xs text-neutral-800 dark:text-neutral-200 select-none">
      {/* Quick Add Form */}
      <form onSubmit={handleAdd} className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] focus-within:border-[#0078d4] transition-colors">
          <Plus className="w-3.5 h-3.5 text-[#0078d4] shrink-0" />
          <input
            type="text"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="Add a task"
            className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-neutral-400 text-neutral-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!inputTitle.trim()}
            className="px-2 py-0.5 bg-[#0078d4] disabled:opacity-40 hover:bg-[#106ebe] text-white rounded text-[11px] font-medium cursor-pointer transition-colors"
          >
            Add
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto scrollbar-none text-[11px]">
          {(['all', 'pending', 'completed', 'starred'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={cn(
                'px-2 py-0.5 rounded-full capitalize transition-colors cursor-pointer shrink-0',
                filter === mode
                  ? 'bg-[#0078d4] text-white font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </form>

      {/* Todo Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map((todo) => (
          <div
            key={todo.id}
            className="group flex items-center justify-between gap-2 p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-[#252525] transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => toggleTodo(todo.id)}
                className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors',
                  todo.completed
                    ? 'bg-[#0078d4] border-[#0078d4] text-white'
                    : 'border-neutral-400 dark:border-neutral-600 hover:border-[#0078d4]'
                )}
              >
                {todo.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </button>
              <span
                className={cn(
                  'truncate text-xs',
                  todo.completed
                    ? 'line-through text-neutral-400 dark:text-neutral-500'
                    : 'text-neutral-800 dark:text-neutral-200 font-medium'
                )}
              >
                {todo.title}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => starTodo(todo.id)}
                className="p-1 text-neutral-400 hover:text-amber-500 cursor-pointer transition-colors"
                title={todo.starred ? 'Starred' : 'Mark as important'}
              >
                <Star
                  className={cn(
                    'w-3.5 h-3.5',
                    todo.starred ? 'fill-amber-400 text-amber-500' : 'text-neutral-400'
                  )}
                />
              </button>
              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                className="p-1 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 cursor-pointer transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 text-center">
            <p>No tasks in this view</p>
          </div>
        )}
      </div>
    </div>
  );
}
