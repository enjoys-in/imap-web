import React from 'react';
import {
  Bold, Italic, Strikethrough, Code, Quote, List, ListOrdered,
  Link, Palette, PaintBucket, Bot
} from 'lucide-react';
import { Command } from '../../lib/types/editor';

interface ContextMenuProps {
  position: { x: number; y: number };
  onCommand: (command: Command, event: React.MouseEvent) => void;
  onClose: () => void;
}

const menuItems = [
  { command: 'bold' as Command, icon: Bold, label: 'Bold' },
  { command: 'italic' as Command, icon: Italic, label: 'Italic' },
  { command: 'strikethrough' as Command, icon: Strikethrough, label: 'Strikethrough' },
  { command: 'code' as Command, icon: Code, label: 'Code' },
  { command: 'blockquote' as Command, icon: Quote, label: 'Quote' },
  { command: 'bulletList' as Command, icon: List, label: 'Bullet List' },
  { command: 'numberList' as Command, icon: ListOrdered, label: 'Number List' },
  { command: 'link' as Command, icon: Link, label: 'Link' },
  { command: 'foreColor' as Command, icon: Palette, label: 'Text Color' },
  { command: 'backColor' as Command, icon: PaintBucket, label: 'Background' },
];

export function ContextMenu({ position, onCommand, onClose }: ContextMenuProps) {
  return (
    <div
      className="fixed z-50 dark:bg-neutral-950 bg-neutral-100 rounded-lg shadow-xl border py-1 min-w-[160px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {menuItems.map((item) => (
        <button
          key={item.command}
          className="w-full px-3 py-2 text-left flex items-center gap-2 hover:dark:bg-neutral-800 hover:bg-neutral-200 transition-colors"
          onClick={(e) => {
            onCommand(item.command, e);
            onClose();
          }}
        >
          <item.icon className="w-4 h-4" />
          <span className="text-sm">{item.label}</span>
        </button>
      ))}
    </div>
  );
}