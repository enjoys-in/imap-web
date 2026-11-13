'use client';

import React from 'react';
import { useChatState } from './useChatState';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessageArea } from './ChatMessageArea';
import { ChatInfoDrawer } from './ChatInfoDrawer';
import { ChatNewChannelModal } from './ChatNewChannelModal';

export function ChatPageView() {
  const {
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
  } = useChatState();

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-white dark:bg-[#181818] select-none">
      {/* Channels & DMs Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewChannel={() => setIsNewChannelOpen(true)}
      />

      {/* Main Conversation Window */}
      <ChatMessageArea
        conversation={activeConversation}
        messages={activeMessages}
        onSendMessage={sendMessage}
        onReact={toggleReaction}
        onToggleInfo={() => setShowInfoDrawer((prev) => !prev)}
        isInfoOpen={showInfoDrawer}
      />

      {/* Right Details Drawer */}
      <ChatInfoDrawer
        conversation={activeConversation}
        open={showInfoDrawer}
        onClose={() => setShowInfoDrawer(false)}
      />

      {/* New Channel Dialog */}
      <ChatNewChannelModal
        isOpen={isNewChannelOpen}
        onClose={() => setIsNewChannelOpen(false)}
        onCreate={createChannel}
      />
    </div>
  );
}
