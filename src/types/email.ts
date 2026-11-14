export type SpecialFolder =
  | 'None'
  | 'Inbox'
  | 'Drafts'
  | 'Sent'
  | 'Archive'
  | 'Junk'
  | 'Trash';

export type EmailConversationType = 'thread' | 'single';

export interface MailFolder {
  id: string;
  accountId: string;
  fullName: string;
  displayName: string;
  parentFullName?: string | null;
  special: SpecialFolder;
  uidValidity?: number;
  unreadCount: number;
  totalCount: number;
  lastSyncedAt?: string;
  sortRank: number;
}

export interface MailAttachment {
  id: string;
  messageId: string;
  fileName: string;
  contentType: string;
  size: number;
  contentId?: string | null;
  isInline: boolean;
  downloadUrl?: string;
  part?: string;
}

export interface AddressItem {
  name: string;
  address: string;
}

export interface MailMessage {
  id: string;
  folderId: string;
  accountId: string;
  uid: number;
  messageIdHeader?: string;
  inReplyTo?: string;
  references?: string;
  threadId: string;
  subject: string;
  fromName: string;
  fromAddress: string;
  to: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  date: string;
  size: number;
  preview: string;
  isRead: boolean;
  isFlagged: boolean;
  isPinned?: boolean;
  isAnswered: boolean;
  isForwarded: boolean;
  isDraft: boolean;
  isThread?: boolean;
  threadCount?: number;
  conversationType?: EmailConversationType;
  hasAttachments: boolean;
  hasCalendar: boolean;
  categoryKeywords?: string[];
  bodyText?: string;
  bodyHtml?: string;
  isBodyDownloaded: boolean;
  calendarIcs?: string;
  attachments?: MailAttachment[];
  bimiLogoUrl?: string;
  bimiVerified?: boolean;
}

export type MailMessageMetadata = Omit<MailMessage, 'bodyHtml' | 'bodyText'>;

export interface EmailThread {
  threadId: string;
  subject: string;
  messageCount: number;
  unreadCount: number;
  lastMessageDate: string;
  folderId?: string;
  accountId?: string;
  participants: AddressItem[];
  messages: MailMessage[];
}

export interface ThreadConversation {
  threadId: string;
  subject: string;
  totalMessages: number;
  unreadCount: number;
  messages: (MailMessage | MailMessageMetadata)[];
  rootMessageId?: string;
  lastActivityDate: string;
}

export interface ThreadMessageItem {
  id: string;
  folderId: string;
  accountId: string;
  threadId: string;
  subject: string;
  fromName: string;
  fromAddress: string;
  to: string;
  cc?: string;
  bcc?: string;
  date: string;
  preview: string;
  bodyHtml?: string;
  bodyText?: string;
  isRead: boolean;
  isFlagged: boolean;
  hasAttachments: boolean;
  attachments?: MailAttachment[];
  bimiLogoUrl?: string;
  conversationType?: EmailConversationType;
}

