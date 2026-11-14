import {
  Trash2,
  Archive,
  FolderInput,
  AlertCircle,
  Clock,
  ShieldAlert,
  CornerUpLeft,
  ReplyAll,
  CornerUpRight,
  Mail,
  Flag,
  Undo2,
  X,
} from 'lucide-react';
import { CommandBarActionItem } from './commandBarTypes';

interface BuildActionsParams {
  hasTarget: boolean;
  isSingle: boolean;
  canUndo: boolean;
  isFlagged?: boolean;
}

export function buildMailCommandBarActions({
  hasTarget,
  isSingle,
  canUndo,
  isFlagged,
}: BuildActionsParams): CommandBarActionItem[] {
  return [
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      enabled: hasTarget,
      title: hasTarget ? 'Delete' : 'Select an email',
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      enabled: hasTarget,
      title: hasTarget ? 'Archive' : 'Select an email',
    },
    {
      id: 'move',
      label: 'Move to',
      icon: FolderInput,
      enabled: hasTarget,
      isSpecial: 'move',
      title: hasTarget ? 'Move to' : 'Select an email',
    },
    {
      id: 'report-junk',
      label: 'Report junk',
      icon: AlertCircle,
      iconColor: hasTarget ? 'text-amber-500' : 'text-neutral-400',
      enabled: hasTarget,
      title: hasTarget ? 'Report junk' : 'Select an email',
    },
    {
      id: 'snooze',
      label: 'Snooze',
      icon: Clock,
      iconColor: hasTarget ? 'text-amber-500' : 'text-neutral-400',
      enabled: hasTarget,
      isSpecial: 'snooze',
      title: hasTarget ? 'Snooze / Remind me later' : 'Select an email',
    },
    {
      id: 'report-phishing',
      label: 'Report phishing',
      icon: ShieldAlert,
      iconColor: hasTarget ? 'text-red-500' : 'text-neutral-400',
      enabled: hasTarget,
      title: hasTarget ? 'Report phishing' : 'Select an email',
    },
    {
      id: 'reply',
      label: 'Reply',
      icon: CornerUpLeft,
      iconColor: isSingle ? 'text-blue-500' : 'text-neutral-400',
      enabled: isSingle,
      dividerBefore: true,
      title: !hasTarget
        ? 'Select an email to reply'
        : !isSingle
        ? 'Reply not available for multiple conversations'
        : 'Reply',
    },
    {
      id: 'reply-all',
      label: 'Reply all',
      icon: ReplyAll,
      iconColor: isSingle ? 'text-purple-500' : 'text-neutral-400',
      enabled: isSingle,
      title: !hasTarget
        ? 'Select an email to reply all'
        : !isSingle
        ? 'Reply all not available for multiple conversations'
        : 'Reply all',
    },
    {
      id: 'forward',
      label: 'Forward',
      icon: CornerUpRight,
      iconColor: isSingle ? 'text-cyan-500' : 'text-neutral-400',
      enabled: isSingle,
      title: !hasTarget
        ? 'Select an email to forward'
        : !isSingle
        ? 'Forward not available for multiple conversations'
        : 'Forward',
    },
    {
      id: 'toggle-read',
      label: 'Read / Unread',
      icon: Mail,
      enabled: hasTarget,
      dividerBefore: true,
      title: hasTarget ? 'Toggle Read / Unread' : 'Select an email',
    },
    {
      id: 'toggle-flag',
      label: 'Flag',
      icon: Flag,
      iconColor: hasTarget && isFlagged ? 'text-amber-500 fill-amber-500' : undefined,
      enabled: hasTarget,
      title: hasTarget ? 'Toggle flag' : 'Select an email',
    },
    {
      id: 'undo',
      label: 'Undo',
      icon: Undo2,
      enabled: canUndo,
      title: canUndo ? 'Undo last action' : 'Nothing to undo',
    },
    {
      id: 'deselect',
      label: 'Deselect',
      icon: X,
      enabled: hasTarget,
      title: hasTarget ? 'Deselect conversation' : 'No selection',
    },
  ];
}
