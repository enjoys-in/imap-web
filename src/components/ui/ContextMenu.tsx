'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!mounted || typeof document === 'undefined') return null;

  // Viewport-aware boundary clamping so menu follows cursor accurately
  const menuWidth = 210;
  const menuHeight = items.length * 30 + 16;
  const maxX = window.innerWidth - menuWidth - 8;
  const maxY = window.innerHeight - menuHeight - 8;

  const adjustedX = Math.max(8, Math.min(x, maxX));
  const adjustedY = Math.max(8, Math.min(y, maxY));

  const menuContent = (
    <div
      ref={menuRef}
      onContextMenu={(e) => e.preventDefault()}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-[9999] w-52 bg-white dark:bg-[#252525] border border-neutral-200 dark:border-[#383838] rounded-md shadow-2xl py-1 text-xs select-none text-neutral-800 dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-75 transition-colors ring-1 ring-black/5 dark:ring-white/10"
    >
      {items.map((item, idx) => {
        if (item.divider) {
          return <div key={idx} className="my-1 border-t border-neutral-200 dark:border-[#383838]" />;
        }
        const Icon = item.icon;
        return (
          <button
            key={idx}
            type="button"
            disabled={item.disabled}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              item.destructive
                ? 'text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-[#f46a6a] dark:hover:bg-red-950/40 dark:hover:text-[#ff7878]'
                : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-[#333333] dark:hover:text-white'
            }`}
          >
            {Icon && (
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  item.destructive ? 'text-red-600 dark:text-[#f46a6a]' : 'text-neutral-500 dark:text-neutral-400'
                }`}
              />
            )}
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );

  return createPortal(menuContent, document.body);
}
