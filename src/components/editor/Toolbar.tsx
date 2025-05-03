import React from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Quote, List, ListOrdered,
  Link, Table2, Palette, PaintBucket, Undo, Redo, Languages,
  AlignLeft, AlignCenter, AlignRight, Indent, Outdent, X
} from 'lucide-react';
import { Command, ToolbarButton } from '../../lib/types/editor';

const buttons: ToolbarButton[] = [
  { command: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B' },
  { command: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I' },
  { command: 'underline', icon: Underline, label: 'Underline', shortcut: 'Ctrl+U' },
  { command: 'strikethrough', icon: Strikethrough, label: 'Strikethrough' },
  { command: 'code', icon: Code, label: 'Code' },
  { command: 'blockquote', icon: Quote, label: 'Blockquote' },
  { command: 'bulletList', icon: List, label: 'Bullet List' },
  { command: 'numberList', icon: ListOrdered, label: 'Number List' },
  { command: 'link', icon: Link, label: 'Hyperlink' },
  { command: 'table', icon: Table2, label: 'Table' },
  { command: 'foreColor', icon: Palette, label: 'Font Color' },
  { command: 'backColor', icon: PaintBucket, label: 'Background Color' },
  { command: 'alignLeft', icon: AlignLeft, label: 'Align Left' },
  { command: 'alignCenter', icon: AlignCenter, label: 'Align Center' },
  { command: 'alignRight', icon: AlignRight, label: 'Align Right' },
  { command: 'indent', icon: Indent, label: 'Increase Indent' },
  { command: 'outdent', icon: Outdent, label: 'Decrease Indent' },
  { command: 'removeFormat', icon: X, label: 'Clear Formatting' },
];

interface ToolbarProps {
  onCommand: (command: Command, value?: string, event?: React.MouseEvent) => void;

}

export function Toolbar({
  onCommand,
}: ToolbarProps) {
  return (
    <div className="sticky top-0 z-0 border-t dark:bg-neutral-900 shadow-xl bg-neutral-100 dark:border-neutral-800  border-gray-200 p-2 flex items-center gap-1 flex-wrap">
      <div className="flex items-center justify-center gap-1">
        {buttons.map((btn) => (
          <button
            type='button'
            key={btn.command}
            onClick={(e) => onCommand(btn.command, undefined, e)}
            className="p-1 rounded items-center  dark:hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-300"
            title={`${btn.label}${btn.shortcut ? ` (${btn.shortcut})` : ''}`}
          >
            <btn.icon />
          </button>
        ))}
      </div>
    </div>
  );
}
