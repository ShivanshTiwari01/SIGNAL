'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sidebar, ChatWindow, ChatInput } from '@/features/chat/components';
import { useAuthToken } from '@/hooks/useAuthToken';

export default function ChatPage() {
  useAuthToken();

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const queryClient = useQueryClient();

  function handleNewChat() {
    setActiveConversationId(null);
  }

  function handleConversationCreated(id: string) {
    setActiveConversationId(id);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  }

  return (
    <>
      <Sidebar
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNew={handleNewChat}
      />
      <main className='flex-1 flex flex-col overflow-hidden'>
        <ChatWindow conversationId={activeConversationId} />
        <ChatInput
          conversationId={activeConversationId}
          onConversationCreated={handleConversationCreated}
        />
      </main>
    </>
  );
}
