'use client';

import React, { useState } from 'react';
import { Sun, Star, Calendar, CheckSquare, Plus, Trash2, Check } from 'lucide-react';
import { useRightAppsStore } from '@/stores/useRightAppsStore';
import { cn } from '@/lib/utils';

export function TodoPageView() {
  const todos = useRightAppsStore((s) => s.todos);
  const addTodo = useRightAppsStore((s) => s.addTodo);
  const toggleTodo = useRightAppsStore((s) => s.toggleTodo);
  const starTodo = useRightAppsStore((s) => s.starTodo);
  const deleteTodo = useRightAppsStore((s) => s.deleteTodo);

  const [activeCategory, setActiveCategory] = useState<'my-day' | 'important' | 'all' | 'completed'>('my-day');
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTodo(newTitle.trim());
    setNewTitle('');
  };

  const filtered = todos.filter((t) => {
    if (activeCategory === 'important') return t.starred;
    if (activeCategory === 'completed') return t.completed;
    if (activeCategory === 'my-day') return !t.completed;
    return true;
  });

  const categories = [
    { id: 'my-day', label: 'My Day', icon: Sun, color: 'text-amber-500' },
    { id: 'important', label: 'Important', icon: Star, color: 'text-rose-500' },
    { id: 'all', label: 'Tasks', icon: CheckSquare, color: 'text-blue-500' },
    { id: 'completed', label: 'Completed', icon: Check, color: 'text-emerald-500' },
  ];

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-100 select-none transition-colors">
      {/* Todo Lists Sidebar */}
      <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#161616] p-3 flex flex-col gap-1 shrink-0">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white px-3 py-2">To Do</h2>
        {categories.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeCategory === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveCategory(id as typeof activeCategory)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors',
                isActive
                  ? 'bg-white dark:bg-[#252525] text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
              )}
            >
              <Icon className={cn('w-4 h-4', color)} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Todo Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-6 max-w-4xl">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight capitalize text-neutral-900 dark:text-white">
            {activeCategory.replace('-', ' ')}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">Stay organized and accomplish your priorities.</p>
        </div>

        {/* Add Task Box */}
        <form onSubmit={handleAdd} className="mb-4">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#202020] focus-within:border-[#0078d4] focus-within:bg-white dark:focus-within:bg-[#181818] transition-colors shadow-2xs">
            <Plus className="w-4 h-4 text-[#0078d4]" />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a task"
              className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-3 py-1 bg-[#0078d4] disabled:opacity-40 hover:bg-[#106ebe] text-white rounded text-xs font-semibold cursor-pointer transition-colors"
            >
              Add
            </button>
          </div>
        </form>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filtered.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-[#0078d4] transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  className={cn(
                    'w-5 h-5 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors',
                    todo.completed
                      ? 'bg-[#0078d4] border-[#0078d4] text-white'
                      : 'border-neutral-400 dark:border-neutral-600 hover:border-[#0078d4]'
                  )}
                >
                  {todo.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span
                  className={cn(
                    'truncate text-xs',
                    todo.completed
                      ? 'line-through text-neutral-400 dark:text-neutral-500'
                      : 'text-neutral-900 dark:text-white font-medium'
                  )}
                >
                  {todo.title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => starTodo(todo.id)}
                  className="p-1 text-neutral-400 hover:text-amber-500 cursor-pointer transition-colors"
                  title="Mark as important"
                >
                  <Star className={cn('w-4 h-4', todo.starred ? 'fill-amber-400 text-amber-500' : 'text-neutral-400')} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 cursor-pointer transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-neutral-400 text-xs text-center">
              <p>No tasks found in {activeCategory.replace('-', ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
