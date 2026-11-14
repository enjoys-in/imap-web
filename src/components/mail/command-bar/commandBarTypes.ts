import React from 'react';

export type CommandBarActionId =
  | 'delete'
  | 'archive'
  | 'move'
  | 'report-junk'
  | 'snooze'
  | 'report-phishing'
  | 'reply'
  | 'reply-all'
  | 'forward'
  | 'toggle-read'
  | 'toggle-flag'
  | 'undo'
  | 'deselect';

export interface CommandBarActionItem {
  id: CommandBarActionId;
  label: string;
  icon: React.ElementType;
  iconColor?: string;
  enabled: boolean;
  title: string;
  isSpecial?: 'move' | 'snooze';
  dividerBefore?: boolean;
}

export const ACTION_WIDTHS: Record<CommandBarActionId, number> = {
  delete: 74,
  archive: 80,
  move: 88,
  'report-junk': 102,
  snooze: 78,
  'report-phishing': 122,
  reply: 72,
  'reply-all': 84,
  forward: 82,
  'toggle-read': 112,
  'toggle-flag': 66,
  undo: 70,
  deselect: 82,
};

export const OVERFLOW_BUTTON_WIDTH = 40;
