import {
  CornerUpLeft, ReplyAll, CornerUpRight, Trash2, Archive,
  FolderInput, Copy, Mail, MailOpen, Pin, Tag, Flag, Clock,
  Sliders, Settings,
} from 'lucide-react';
import { ContextMenuItem } from '@/components/ui/ContextMenu';
import { MailMessage, MailMessageMetadata } from '@/types';
import { MailContextActions } from './mailContextMenuTypes';
import { listRegisteredFolders, findRegisteredSpecialFolder } from '@/lib/folders';
import { buildSecurityAndAdvancedItems } from './mailContextMenuAdvanced';

export * from './mailContextMenuTypes';

export function buildMailContextMenuItems(
  email: MailMessageMetadata | MailMessage,
  actions: MailContextActions
): ContextMenuItem[] {
  // Destinations are the backend's own folders for this message's account (not the one it is in).
  const destinations = listRegisteredFolders(email.accountId).filter((f) => f.id !== email.folderId);
  const archiveFolder = findRegisteredSpecialFolder('Archive', email.accountId);

  return [
    // Section 1: Communications
    { label: 'Reply', icon: CornerUpLeft, iconColor: 'text-purple-400', onClick: () => actions.onReply(email, false) },
    { label: 'Reply all', icon: ReplyAll, iconColor: 'text-purple-400', onClick: () => actions.onReply(email, true) },
    { label: 'Forward', icon: CornerUpRight, iconColor: 'text-cyan-400', onClick: () => actions.onForward(email) },
    { divider: true, label: '' },

    // Section 2: Management
    { label: 'Delete', icon: Trash2, destructive: true, onClick: () => actions.onDelete(email.id) },
    { label: 'Archive', icon: Archive, iconColor: 'text-emerald-500', onClick: () => actions.onArchive(email.id) },
    {
      label: 'Move',
      icon: FolderInput,
      iconColor: 'text-blue-500',
      children: destinations.map((f) => ({
        label: f.displayName,
        onClick: () => actions.onMoveTo(email.id, f.id, f.displayName),
      })),
    },
    {
      label: 'Copy',
      icon: Copy,
      iconColor: 'text-blue-500',
      children: destinations.map((f) => ({
        label: f.displayName,
        onClick: () => actions.onCopyTo(email.id, f.id, f.displayName),
      })),
    },
    { divider: true, label: '' },

    // Section 3: State & Tags
    {
      label: email.isRead ? 'Mark as unread' : 'Mark as read',
      icon: email.isRead ? Mail : MailOpen,
      onClick: () => actions.onToggleRead(email.id),
    },
    {
      label: email.isPinned ? 'Unpin' : 'Pin',
      icon: Pin,
      iconColor: 'text-[#0078d4]',
      onClick: () => actions.onTogglePin(email.id),
    },
    {
      label: 'Categorize',
      icon: Tag,
      children: [
        { label: 'Blue category', onClick: () => actions.onCategorize(email.id, 'Blue category') },
        { label: 'Green category', onClick: () => actions.onCategorize(email.id, 'Green category') },
        { label: 'Orange category', onClick: () => actions.onCategorize(email.id, 'Orange category') },
        { label: 'Purple category', onClick: () => actions.onCategorize(email.id, 'Purple category') },
        { label: 'Red category', onClick: () => actions.onCategorize(email.id, 'Red category') },
        { label: 'Clear all categories', onClick: () => actions.onCategorize(email.id, null) },
      ],
    },
    {
      label: 'Flag',
      icon: Flag,
      iconColor: 'text-rose-500',
      children: [
        { label: 'Today', onClick: () => actions.onSetFlagDue(email.id, 'Today') },
        { label: 'Tomorrow', onClick: () => actions.onSetFlagDue(email.id, 'Tomorrow') },
        { label: 'This week', onClick: () => actions.onSetFlagDue(email.id, 'This week') },
        { label: 'Next week', onClick: () => actions.onSetFlagDue(email.id, 'Next week') },
        { label: 'No date', onClick: () => actions.onSetFlagDue(email.id, 'No date') },
        { label: 'Clear flag', onClick: () => actions.onSetFlagDue(email.id, 'Clear flag') },
      ],
    },
    {
      label: 'Snooze',
      icon: Clock,
      children: [
        { label: 'Later today', onClick: () => actions.onSnooze(email.id, '6:00 PM') },
        { label: 'Tomorrow morning', onClick: () => actions.onSnooze(email.id, 'Tomorrow 8:00 AM') },
        { label: 'This weekend', onClick: () => actions.onSnooze(email.id, 'Saturday 8:00 AM') },
        { label: 'Next week', onClick: () => actions.onSnooze(email.id, 'Next Monday 8:00 AM') },
      ],
    },
    {
      label: 'Rules',
      icon: Sliders,
      children: [
        {
          label: `Always move messages from ${email.fromAddress}`,
          onClick: () => {
            if (archiveFolder) actions.onMoveTo(email.id, archiveFolder.id, archiveFolder.displayName);
            actions.onToast('Rule Created', `Messages from ${email.fromAddress} will be auto-archived`, 'success');
          },
        },
        { label: 'Create rule...', onClick: () => window.location.assign('/settings/mail/rules') },
        { label: 'Manage rules...', onClick: () => window.location.assign('/settings/mail/rules') },
      ],
    },
    { label: 'Set quick actions', icon: Settings, onClick: () => window.location.assign('/settings/mail') },
    { divider: true, label: '' },

    // Sections 4 & 5: Security & Advanced
    ...buildSecurityAndAdvancedItems(email, actions),
  ];
}
