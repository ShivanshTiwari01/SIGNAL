'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sidebar, ChatWindow, ChatInput } from '@/features/chat/components';
import TickerStrip from '@/features/chat/components/TickerStrip';
import { useAuthToken } from '@/hooks/useAuthToken';
import { useStreamMessage } from '@/features/chat/hooks/useStreamMessage';

export default function ChatPage() {
  useAuthToken();

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const queryClient = useQueryClient();
  const {
    content: streamingContent,
    isStreaming,
    sendMessage,
    stopStream,
    clearStream,
  } = useStreamMessage();

  function handleNewChat() {
    setActiveConversationId(null);
    clearStream();
  }

  function handleConversationCreated(id: string) {
    setActiveConversationId(id);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }

  function handleSelectConversation(id: string) {
    setActiveConversationId(id);
    clearStream();
  }

  return (
    <>
      <Sidebar
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewChat}
      />
      <main className='flex-1 flex flex-col overflow-hidden'>
        <TickerStrip />
        <ChatWindow
          conversationId={activeConversationId}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
        />
        <ChatInput
          conversationId={activeConversationId}
          isStreaming={isStreaming}
          onSend={sendMessage}
          onStop={stopStream}
          onConversationCreated={handleConversationCreated}
        />
      </main>
    </>
  );
}
