'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Tag } from 'lucide-react';
import { useToastStore } from '@/stores';

interface CategoryItem {
  id: string;
  name: string;
  color: string;
  shortcut?: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-blue', name: 'Blue category', color: '#0078d4', shortcut: 'Ctrl+F2' },
  { id: 'cat-green', name: 'Green category', color: '#107c41', shortcut: 'Ctrl+F3' },
  { id: 'cat-orange', name: 'Orange category', color: '#d83b01' },
  { id: 'cat-purple', name: 'Purple category', color: '#5c2d91' },
  { id: 'cat-red', name: 'Red category', color: '#a4262c', shortcut: 'Ctrl+F4' },
  { id: 'cat-yellow', name: 'Yellow category', color: '#ffb900' },
];

export function CategoriesSettingsView() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0078d4');
  const addToast = useToastStore((s) => s.addToast);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const item: CategoryItem = { id: `cat-${Date.now()}`, name: newName.trim(), color: selectedColor };
    setCategories((prev) => [...prev, item]);
    setNewName('');
    addToast({ title: 'Category added', description: `Created "${item.name}"`, type: 'success' });
  };

  const handleDelete = (id: string, name: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast({ title: 'Category deleted', description: `Removed "${name}"`, type: 'info' });
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Categories</h2>
        <p className="text-neutral-500 mt-0.5">Organize and tag email conversations and calendar events by color.</p>
      </div>

      {/* Add New Category */}
      <div className="p-3 bg-neutral-50 dark:bg-[#1a1a1a] rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5">
        <input
          type="color"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-8 h-8 rounded border-0 p-0 cursor-pointer bg-transparent"
        />
        <input
          type="text"
          placeholder="New category name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="h-8 px-2.5 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs flex-1"
        />
        <button
          onClick={handleAdd}
          className="h-8 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /><span>Add category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-[#1c1c1c] overflow-hidden">
        {categories.map((cat) => (
          <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#222222] transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-sm shadow-xs shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{cat.name}</span>
              {cat.shortcut && (
                <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#282828] text-[10px] text-neutral-500 font-mono">
                  {cat.shortcut}
                </span>
              )}
            </div>

            <button
              onClick={() => handleDelete(cat.id, cat.name)}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-500 rounded transition-colors cursor-pointer"
              title="Delete category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
