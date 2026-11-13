'use client';

import { useState } from 'react';

export interface ChatAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'zip' | 'doc';
  url?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
  reactions?: Record<string, number>;
  attachments?: ChatAttachment[];
}

export interface ChatConversation {
  id: string;
  type: 'channel' | 'direct';
  name: string;
  description?: string;
  avatar?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  membersCount?: number;
}

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  { id: 'c-general', type: 'channel', name: 'general', description: 'General team discussion & daily banter', membersCount: 28, lastMessage: 'Please review the updated sprint priorities', lastMessageTime: '10:35 AM' },
  { id: 'c-engineering', type: 'channel', name: 'engineering', description: 'IMAP protocol sync, API endpoints, backend', membersCount: 14, unreadCount: 2, lastMessage: 'CORS & MIME parsing merged in imap-api', lastMessageTime: '11:15 AM' },
  { id: 'c-design', type: 'channel', name: 'design-system', description: 'Tailwind styling, calendar layouts, tokens', membersCount: 8, lastMessage: 'The new pastel palette looks fantastic!', lastMessageTime: 'Yesterday' },
  { id: 'c-announcements', type: 'channel', name: 'announcements', description: 'Product releases and company-wide notices', membersCount: 42, lastMessage: 'AirSend v2.4 rollout scheduled for Friday', lastMessageTime: 'Nov 12' },
  { id: 'dm-sarah', type: 'direct', name: 'Sarah Connor', description: 'Product Designer', status: 'online', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', unreadCount: 1, lastMessage: 'Can you check the schedule modal padding?', lastMessageTime: '11:42 AM' },
  { id: 'dm-alex', type: 'direct', name: 'Alex Rivera', description: 'IMAP Architect', status: 'online', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', lastMessage: 'UID validity checks verified on the server.', lastMessageTime: '10:18 AM' },
  { id: 'dm-elena', type: 'direct', name: 'Elena Rostova', description: 'DevOps & Infrastructure', status: 'away', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', lastMessage: 'Staging environment updated with new certificates.', lastMessageTime: 'Yesterday' },
  { id: 'dm-liam', type: 'direct', name: 'Liam Chen', description: 'Frontend Specialist', status: 'offline', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80', lastMessage: 'Sure, I will double check the LOC count.', lastMessageTime: 'Nov 10' },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'c-engineering': [
    { id: 'm1', senderId: 'u2', senderName: 'Alex Rivera', senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', content: 'Hey team, I just finished configuring CORS and the auto-MIME body parser in imap-api.', timestamp: '11:10 AM', isMe: false, reactions: { '🚀': 3, '👍': 4 } },
    { id: 'm2', senderId: 'u-me', senderName: 'You', senderAvatar: '', content: 'Awesome! We mounted the dual routes `/api` and `/api/v1/imap` and user identity syncs automatically.', timestamp: '11:12 AM', isMe: true, status: 'read', attachments: [{ name: 'imap-api-spec.pdf', size: '2.4 MB', type: 'pdf' }] },
    { id: 'm3', senderId: 'u2', senderName: 'Alex Rivera', senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', content: 'CORS & MIME parsing merged in imap-api. Ready for frontend streaming test.', timestamp: '11:15 AM', isMe: false, reactions: { '🎉': 2 } },
  ],
  'dm-sarah': [
    { id: 'm4', senderId: 'u1', senderName: 'Sarah Connor', senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', content: 'Hi! Have you had a chance to test the pastel cards in Calendar?', timestamp: '11:38 AM', isMe: false },
    { id: 'm5', senderId: 'u-me', senderName: 'You', senderAvatar: '', content: 'Yes, the 8 pastel color swatches and the interactive Create Schedule modal are working end-to-end!', timestamp: '11:40 AM', isMe: true, status: 'read' },
    { id: 'm6', senderId: 'u1', senderName: 'Sarah Connor', senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', content: 'Can you check the schedule modal padding on smaller screens when you get a second?', timestamp: '11:42 AM', isMe: false },
  ],
  'c-general': [
    { id: 'm7', senderId: 'u3', senderName: 'Elena Rostova', senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', content: 'Good morning everyone! Reminder: Design sync is at 2:00 PM today.', timestamp: '09:00 AM', isMe: false },
    { id: 'm8', senderId: 'u2', senderName: 'Alex Rivera', senderAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', content: 'Please review the updated sprint priorities in Jira.', timestamp: '10:35 AM', isMe: false },
  ],
};

export function useChatState() {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>('c-engineering');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'channels' | 'direct'>('all');
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [isNewChannelOpen, setIsNewChannelOpen] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];
  const activeMessages = messagesMap[activeId] || [];

  const sendMessage = (content: string, attachment?: ChatAttachment) => {
    if (!content.trim() && !attachment) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'u-me',
      senderName: 'You',
      senderAvatar: '',
      content: content.trim(),
      timestamp: 'Just now',
      isMe: true,
      status: 'delivered',
      attachments: attachment ? [attachment] : undefined,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, lastMessage: content || attachment?.name || 'File', lastMessageTime: 'Just now' } : c))
    );
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    setMessagesMap((prev) => {
      const list = prev[activeId] || [];
      const updated = list.map((msg) => {
        if (msg.id !== messageId) return msg;
        const current = { ...(msg.reactions || {}) };
        current[emoji] = (current[emoji] || 0) + 1;
        return { ...msg, reactions: current };
      });
      return { ...prev, [activeId]: updated };
    });
  };

  const createChannel = (name: string, description: string) => {
    const cleanName = name.toLowerCase().replace(/\s+/g, '-');
    const newConv: ChatConversation = {
      id: `c-${cleanName}-${Date.now()}`,
      type: 'channel',
      name: cleanName,
      description,
      membersCount: 1,
      lastMessage: 'Channel created',
      lastMessageTime: 'Just now',
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setIsNewChannelOpen(false);
  };

  return {
    conversations,
    activeId,
    setActiveId,
    activeConversation,
    activeMessages,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    showInfoDrawer,
    setShowInfoDrawer,
    isNewChannelOpen,
    setIsNewChannelOpen,
    sendMessage,
    toggleReaction,
    createChannel,
  };
}
