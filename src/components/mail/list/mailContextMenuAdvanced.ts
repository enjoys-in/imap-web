import { Ban, ShieldAlert, Shield, UserX, VolumeX, Save, Search, Eye, SlidersHorizontal } from 'lucide-react';
import { ContextMenuItem } from '@/components/ui/ContextMenu';
import { MailMessage, MailMessageMetadata } from '@/types';
import { exportEmailToEml } from '@/lib/emlExport';
import { MailContextActions } from './mailContextMenuTypes';

export function buildSecurityAndAdvancedItems(
  email: MailMessageMetadata | MailMessage,
  actions: MailContextActions
): ContextMenuItem[] {
  return [
    // Section 4: Junk & Security
    { label: 'Report junk', icon: Ban, iconColor: 'text-amber-500', onClick: () => actions.onReportJunk(email) },
    { label: 'Report phishing', icon: ShieldAlert, iconColor: 'text-rose-500', onClick: () => actions.onReportPhishing(email) },
    { label: 'Report a concern', icon: Shield, onClick: () => actions.onReportConcern(email) },
    {
      label: 'Block',
      icon: UserX,
      iconColor: 'text-rose-400',
      children: [
        { label: `Block ${email.fromAddress}`, onClick: () => actions.onBlock(email.fromAddress) },
        { label: 'Never block sender', onClick: () => actions.onAllowSender(email.fromAddress) },
      ],
    },
    { label: 'Ignore', icon: VolumeX, iconColor: 'text-rose-400', onClick: () => actions.onMute(email.id) },
    { divider: true, label: '' },

    // Section 5: Save as & Advanced
    {
      label: 'Save as',
      icon: Save,
      iconColor: 'text-blue-400',
      children: [
        { label: 'Save as EML', icon: Save, onClick: () => exportEmailToEml(email as MailMessage) },
        { label: 'Save as MSG', icon: Save, onClick: () => exportEmailToEml(email as MailMessage) },
      ],
    },
    {
      label: 'Find related',
      icon: Search,
      children: [
        { label: 'Messages in this conversation', onClick: () => actions.onFindConversation(email) },
        { label: `Messages from ${email.fromName || email.fromAddress}`, onClick: () => actions.onFindFromSender(email) },
      ],
    },
    {
      label: 'View',
      icon: Eye,
      children: [
        { label: 'Open in new window', onClick: () => window.open(`/mail/view/${email.id}`, '_blank') },
        { label: 'View message source', onClick: () => actions.onViewSource(email) },
      ],
    },
    {
      label: 'Advanced actions',
      icon: SlidersHorizontal,
      children: [
        { label: 'Create task from email', onClick: () => actions.onCreateTask(email) },
        { label: 'Add to contacts', onClick: () => actions.onAddContact(email) },
      ],
    },
  ];
}
