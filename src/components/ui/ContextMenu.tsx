'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContextMenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  divider?: boolean;
  children?: ContextMenuItem[];
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
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

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

  const menuWidth = 220;
  const menuHeight = Math.min(items.length * 28 + 24, 600);
  const isRightOverflow = x + menuWidth + 180 > window.innerWidth;
  const adjustedX = Math.max(8, Math.min(x, window.innerWidth - menuWidth - 8));
  const adjustedY = Math.max(8, Math.min(y, window.innerHeight - menuHeight - 8));

  const menuContent = (
    <div
      ref={menuRef}
      onContextMenu={(e) => e.preventDefault()}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-[9999] w-56 max-h-[85vh] overflow-y-auto bg-white dark:bg-[#202020] border border-neutral-200 dark:border-[#383838] rounded-lg shadow-2xl py-1 text-xs select-none text-neutral-800 dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-75 ring-1 ring-black/5 dark:ring-white/10"
    >
      {items.map((item, idx) => {
        if (item.divider) {
          return <div key={idx} className="my-1 border-t border-neutral-200 dark:border-[#383838]" />;
        }
        const Icon = item.icon;
        const hasChildren = Boolean(item.children && item.children.length > 0);
        const isSubOpen = activeSubmenu === idx;

        return (
          <div
            key={idx}
            className="relative"
            onMouseEnter={() => hasChildren && setActiveSubmenu(idx)}
            onMouseLeave={() => hasChildren && setActiveSubmenu((curr) => (curr === idx ? null : curr))}
          >
            <button
              type="button"
              disabled={item.disabled}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                  onClose();
                }
              }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
                isSubOpen && 'bg-neutral-100 dark:bg-[#2c2c2c]',
                item.destructive
                  ? 'text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-[#f46a6a] dark:hover:bg-red-950/40 dark:hover:text-[#ff7878]'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-[#2c2c2c] dark:hover:text-white'
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                {Icon && (
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0',
                      item.destructive
                        ? 'text-red-600 dark:text-[#f46a6a]'
                        : item.iconColor || 'text-neutral-500 dark:text-neutral-400'
                    )}
                  />
                )}
                <span className="truncate">{item.label}</span>
              </div>
              {hasChildren && <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1.5" />}
            </button>

            {/* Floating Submenu */}
            {hasChildren && isSubOpen && (
              <div
                className={cn(
                  'absolute top-0 w-48 bg-white dark:bg-[#242424] border border-neutral-200 dark:border-[#383838] rounded-lg shadow-2xl py-1 z-50 text-xs animate-in fade-in duration-75',
                  isRightOverflow ? 'right-full mr-1' : 'left-full ml-1'
                )}
              >
                {item.children!.map((sub, sIdx) => {
                  if (sub.divider) {
                    return <div key={sIdx} className="my-1 border-t border-neutral-200 dark:border-[#383838]" />;
                  }
                  const SubIcon = sub.icon;
                  return (
                    <button
                      key={sIdx}
                      type="button"
                      disabled={sub.disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (sub.onClick) sub.onClick();
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors cursor-pointer disabled:opacity-40',
                        sub.destructive
                          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-[#303030] dark:hover:text-white'
                      )}
                    >
                      {SubIcon && (
                        <SubIcon
                          className={cn(
                            'w-4 h-4 shrink-0',
                            sub.destructive ? 'text-red-500' : sub.iconColor || 'text-neutral-400'
                          )}
                        />
                      )}
                      <span className="truncate">{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return createPortal(menuContent, document.body);
}
