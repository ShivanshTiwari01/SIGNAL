'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { useConversation } from '../hooks/useConversation';
import SignalLogo from '@/components/common/SignalLogo';

interface Props {
  conversationId: string | null;
}

export default function ChatWindow({ conversationId }: Props) {
  const { data, isLoading } = useConversation(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  if (!conversationId) {
    return (
      <div className='flex-1 flex flex-col items-center justify-center gap-4 text-center px-6'>
        <SignalLogo iconSize={56} showWordmark={false} />
        <div>
          <p className='text-foreground font-semibold text-lg'>Signal AI</p>
          <p className='text-muted-foreground text-sm mt-1'>
            Ask me anything about the markets.
          </p>
        </div>
        <p className='text-muted-foreground/50 text-xs'>
          Try: <span className='text-primary'>What should I buy today?</span>
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <p className='text-muted-foreground text-sm'>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className='flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5'>
      {data?.data.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
