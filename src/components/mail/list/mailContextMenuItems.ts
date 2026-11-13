import {
  CornerUpLeft, ReplyAll, CornerUpRight, Trash2, Archive,
  FolderInput, Copy, Mail, MailOpen, Pin, Tag, Flag, Clock,
  Sliders, Settings, Ban, ShieldAlert, Shield, UserX, VolumeX,
  Save, Search, Eye, SlidersHorizontal,
} from 'lucide-react';
import { ContextMenuItem } from '@/components/ui/ContextMenu';
import { MailMessage, MailMessageMetadata } from '@/types';
import { exportEmailToEml } from '@/lib/emlExport';

export interface MailContextActions {
  onReply: (email: MailMessageMetadata | MailMessage, replyAll: boolean) => void;
  onForward: (email: MailMessageMetadata | MailMessage) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onMoveTo: (id: string, folderId: string, folderName: string) => void;
  onToggleRead: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleFlag: (id: string) => void;
  onSnooze: (id: string, label: string) => void;
  onBlock: (address: string) => void;
  onReportJunk: (email: MailMessageMetadata | MailMessage) => void;
  onReportPhishing: (email: MailMessageMetadata | MailMessage) => void;
  onToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export function buildMailContextMenuItems(
  email: MailMessageMetadata | MailMessage,
  actions: MailContextActions
): ContextMenuItem[] {
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
      label: 'Move', icon: FolderInput, iconColor: 'text-blue-500',
      children: [
        { label: 'Inbox', onClick: () => actions.onMoveTo(email.id, 'fld-inbox', 'Inbox') },
        { label: 'Archive', onClick: () => actions.onMoveTo(email.id, 'fld-archive', 'Archive') },
        { label: 'Junk Email', onClick: () => actions.onMoveTo(email.id, 'fld-junk', 'Junk Email') },
        { label: 'Deleted Items', onClick: () => actions.onMoveTo(email.id, 'fld-deleted', 'Deleted Items') },
      ],
    },
    {
      label: 'Copy', icon: Copy, iconColor: 'text-blue-500',
      children: [
        { label: 'Inbox', onClick: () => actions.onToast('Copied', 'Copied to Inbox', 'success') },
        { label: 'Archive', onClick: () => actions.onToast('Copied', 'Copied to Archive', 'success') },
        { label: 'Personal', onClick: () => actions.onToast('Copied', 'Copied to Personal folder', 'success') },
      ],
    },
    { divider: true, label: '' },

    // Section 3: State & Tags
    { label: email.isRead ? 'Mark as unread' : 'Mark as read', icon: email.isRead ? Mail : MailOpen, onClick: () => actions.onToggleRead(email.id) },
    { label: email.isPinned ? 'Unpin' : 'Pin', icon: Pin, iconColor: 'text-[#0078d4]', onClick: () => actions.onTogglePin(email.id) },
    {
      label: 'Categorize', icon: Tag,
      children: [
        { label: 'Blue category', onClick: () => actions.onToast('Categorized', 'Tagged Blue Category', 'info') },
        { label: 'Green category', onClick: () => actions.onToast('Categorized', 'Tagged Green Category', 'info') },
        { label: 'Orange category', onClick: () => actions.onToast('Categorized', 'Tagged Orange Category', 'info') },
        { label: 'Purple category', onClick: () => actions.onToast('Categorized', 'Tagged Purple Category', 'info') },
        { label: 'Red category', onClick: () => actions.onToast('Categorized', 'Tagged Red Category', 'info') },
        { label: 'Clear all categories', onClick: () => actions.onToast('Cleared', 'Categories removed', 'info') },
      ],
    },
    {
      label: 'Flag', icon: Flag, iconColor: 'text-rose-500',
      children: [
        { label: 'Today', onClick: () => actions.onToggleFlag(email.id) },
        { label: 'Tomorrow', onClick: () => actions.onToggleFlag(email.id) },
        { label: 'This week', onClick: () => actions.onToggleFlag(email.id) },
        { label: 'Next week', onClick: () => actions.onToggleFlag(email.id) },
        { label: 'No date', onClick: () => actions.onToggleFlag(email.id) },
        { label: 'Clear flag', onClick: () => actions.onToggleFlag(email.id) },
      ],
    },
    {
      label: 'Snooze', icon: Clock,
      children: [
        { label: 'Later today', onClick: () => actions.onSnooze(email.id, 'Later today') },
        { label: 'Tomorrow morning', onClick: () => actions.onSnooze(email.id, 'Tomorrow morning') },
        { label: 'This weekend', onClick: () => actions.onSnooze(email.id, 'This weekend') },
        { label: 'Next week', onClick: () => actions.onSnooze(email.id, 'Next week') },
      ],
    },
    {
      label: 'Rules', icon: Sliders,
      children: [
        { label: `Always move messages from ${email.fromAddress}`, onClick: () => actions.onToast('Rule Created', 'Sender will be auto-routed', 'success') },
        { label: 'Create rule...', onClick: () => window.location.assign('/settings/mail/rules') },
        { label: 'Manage rules...', onClick: () => window.location.assign('/settings/mail/rules') },
      ],
    },
    { label: 'Set quick actions', icon: Settings, onClick: () => window.location.assign('/settings/mail') },
    { divider: true, label: '' },

    // Section 4: Junk & Security
    { label: 'Report junk', icon: Ban, iconColor: 'text-amber-500', onClick: () => actions.onReportJunk(email) },
    { label: 'Report phishing', icon: ShieldAlert, iconColor: 'text-rose-500', onClick: () => actions.onReportPhishing(email) },
    { label: 'Report a concern', icon: Shield, onClick: () => actions.onToast('Reported', 'Security concern submitted', 'info') },
    {
      label: 'Block', icon: UserX, iconColor: 'text-rose-400',
      children: [
        { label: `Block ${email.fromAddress}`, onClick: () => actions.onBlock(email.fromAddress) },
        { label: 'Never block sender', onClick: () => actions.onToast('Sender Allowed', `${email.fromAddress} added to Safe Senders`, 'success') },
      ],
    },
    { label: 'Ignore', icon: VolumeX, iconColor: 'text-rose-400', onClick: () => actions.onToast('Ignored', 'Conversation muted', 'info') },
    { divider: true, label: '' },

    // Section 5: Save as & Advanced
    {
      label: 'Save as', icon: Save, iconColor: 'text-blue-400',
      children: [
        { label: 'Save as EML', icon: Save, onClick: () => exportEmailToEml(email as MailMessage) },
        { label: 'Save as MSG', icon: Save, onClick: () => exportEmailToEml(email as MailMessage) },
      ],
    },
    {
      label: 'Find related', icon: Search,
      children: [
        { label: 'Messages in this conversation', onClick: () => actions.onToast('Search', 'Filtering conversation thread', 'info') },
        { label: `Messages from ${email.fromName || email.fromAddress}`, onClick: () => actions.onToast('Search', `Filtering from ${email.fromAddress}`, 'info') },
      ],
    },
    {
      label: 'View', icon: Eye,
      children: [
        { label: 'Open in new window', onClick: () => window.open(`/mail/view/${email.id}`, '_blank') },
        { label: 'View message source', onClick: () => actions.onToast('Headers', 'SPF/DKIM/DMARC verified', 'info') },
      ],
    },
    {
      label: 'Advanced actions', icon: SlidersHorizontal,
      children: [
        { label: 'Create task from email', onClick: () => window.location.assign('/todo') },
        { label: 'Add to contacts', onClick: () => window.location.assign('/people') },
      ],
    },
  ];
}
