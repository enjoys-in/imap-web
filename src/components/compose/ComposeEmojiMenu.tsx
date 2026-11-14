'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { useUiStore } from '@/stores/useUiStore';
import { cn } from '@/lib/utils';

const PICKER_WIDTH = 352;
const PICKER_HEIGHT = 435;
const GAP = 6;
const MARGIN = 8;

interface ComposeEmojiMenuProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

export function ComposeEmojiMenu({ onSelect, className }: ComposeEmojiMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const theme = useUiStore((s) => s.theme);

  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const left = Math.max(MARGIN, Math.min(rect.left, window.innerWidth - PICKER_WIDTH - MARGIN));
      const below = rect.bottom + GAP;
      const fitsBelow = below + PICKER_HEIGHT + MARGIN <= window.innerHeight;
      const top = fitsBelow ? below : Math.max(MARGIN, rect.top - PICKER_HEIGHT - GAP);
      setPosition({ top, left });
    }
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    let picker: HTMLElement | null = null;

    (async () => {
      const [{ Picker }, emojiData] = await Promise.all([
        import('emoji-mart'),
        import('@emoji-mart/data'),
      ]);
      const host = hostRef.current;
      if (cancelled || !host) return;

      picker = new Picker({
        data: emojiData.default,
        theme: theme === 'dark' ? 'dark' : 'light',
        previewPosition: 'none',
        skinTonePosition: 'search',
        autoFocus: true,
        onEmojiSelect: (emoji: { native?: string }) => {
          if (emoji.native) onSelectRef.current(emoji.native);
          setIsOpen(false);
        },
        parent: host,
      }) as unknown as HTMLElement;
    })();

    return () => {
      cancelled = true;
      picker?.remove();
    };
  }, [isOpen, theme]);

  return (
    <div className="relative inline-block shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          'p-1 hover:bg-neutral-200 dark:hover:bg-[#383838] rounded text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-0.5 shrink-0 cursor-pointer',
          isOpen && 'bg-neutral-200 dark:bg-[#383838]',
          className
        )}
        title="Insert emoji"
        aria-label="Insert emoji"
        aria-expanded={isOpen}
      >
        <Smile className="w-3.5 h-3.5 text-amber-500" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: position.top, left: position.left, width: PICKER_WIDTH, minHeight: PICKER_HEIGHT }}
          className="z-50 rounded-lg shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-[#1f1f1f] select-text"
        >
          <div ref={hostRef} />
        </div>
      )}
    </div>
  );
}
