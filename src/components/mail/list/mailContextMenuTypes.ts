import { MailMessage, MailMessageMetadata } from '@/types';

export interface MailContextActions {
  onReply: (email: MailMessageMetadata | MailMessage, replyAll: boolean) => void;
  onForward: (email: MailMessageMetadata | MailMessage) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onMoveTo: (id: string, folderId: string, folderName: string) => void;
  onCopyTo: (id: string, folderId: string, folderName: string) => void;
  onCategorize: (id: string, category: string | null) => void;
  onToggleRead: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleFlag: (id: string) => void;
  onSetFlagDue: (id: string, label: string) => void;
  onSnooze: (id: string, label: string) => void;
  onBlock: (address: string) => void;
  onAllowSender: (address: string) => void;
  onMute: (id: string) => void;
  onReportJunk: (email: MailMessageMetadata | MailMessage) => void;
  onReportPhishing: (email: MailMessageMetadata | MailMessage) => void;
  onReportConcern: (email: MailMessageMetadata | MailMessage) => void;
  onFindConversation: (email: MailMessageMetadata | MailMessage) => void;
  onFindFromSender: (email: MailMessageMetadata | MailMessage) => void;
  onCreateTask: (email: MailMessageMetadata | MailMessage) => void;
  onAddContact: (email: MailMessageMetadata | MailMessage) => void;
  onViewSource: (email: MailMessageMetadata | MailMessage) => void;
  onToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}
