'use client';

import React from 'react';
import { PanelLeftClose, PanelLeft, Hash, BellOff } from 'lucide-react';
import { useGeneralSettingsStore, SidebarMode, FolderBadgeStyle } from '@/stores/useGeneralSettingsStore';
import { cn } from '@/lib/utils';

export function SidebarAppearanceSection() {
  const sidebarMode = useGeneralSettingsStore((s) => s.sidebarMode || 'expanded');
  const folderBadgeStyle = useGeneralSettingsStore((s) => s.folderBadgeStyle || 'unread');
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          Folder Sidebar & Badge Counts
        </h3>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          Customize sidebar layout width and folder counter badges.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sidebar mode */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
            Sidebar Mode
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateSettings({ sidebarMode: 'expanded' })}
              className={cn(
                'p-2.5 rounded-md border text-left flex items-center gap-2 cursor-pointer transition-all',
                sidebarMode === 'expanded'
                  ? 'border-[#0078d4] bg-[#0078d4]/10 dark:bg-[#0078d4]/15 font-semibold text-[#0078d4] dark:text-blue-400'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
              )}
            >
              <PanelLeft className="w-4 h-4 shrink-0" />
              <div>
                <span className="text-xs block">Expanded</span>
                <span className="text-[10px] text-neutral-500 block">Full folder tree</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ sidebarMode: 'compact' })}
              className={cn(
                'p-2.5 rounded-md border text-left flex items-center gap-2 cursor-pointer transition-all',
                sidebarMode === 'compact'
                  ? 'border-[#0078d4] bg-[#0078d4]/10 dark:bg-[#0078d4]/15 font-semibold text-[#0078d4] dark:text-blue-400'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
              )}
            >
              <PanelLeftClose className="w-4 h-4 shrink-0" />
              <div>
                <span className="text-xs block">Compact Rail</span>
                <span className="text-[10px] text-neutral-500 block">Icon-only bar</span>
              </div>
            </button>
          </div>
        </div>

        {/* Badge counter style */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
            Folder Badges
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'unread' as FolderBadgeStyle, label: 'Unread Only', icon: Hash },
              { id: 'total' as FolderBadgeStyle, label: 'Total Count', icon: Hash },
              { id: 'hidden' as FolderBadgeStyle, label: 'Hidden', icon: BellOff },
            ].map((b) => {
              const isSelected = folderBadgeStyle === b.id;
              return (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => updateSettings({ folderBadgeStyle: b.id })}
                  className={cn(
                    'p-2 rounded-md border text-center transition-all cursor-pointer',
                    isSelected
                      ? 'border-[#0078d4] bg-[#0078d4]/10 dark:bg-[#0078d4]/15 font-semibold text-[#0078d4] dark:text-blue-400'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  )}
                >
                  <span className="text-xs block">{b.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
