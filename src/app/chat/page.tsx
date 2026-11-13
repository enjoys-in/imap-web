import React from 'react';
import { ChatPageView } from '@/components/chat/ChatPageView';

export const metadata = {
  title: 'Chat & Teams — AirSend',
  description: 'Team messaging channels, 1:1 direct messages, and real-time collaboration.',
};

export default function ChatPage() {
  return <ChatPageView />;
}
