'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { useConversation } from '../hooks/useConversation';
import SignalLogo from '@/components/common/SignalLogo';
import type { Message } from '../types';

interface Props {
  conversationId: string | null;
  streamingContent?: string;
  isStreaming?: boolean;
}

const SKELETON_LINES = [80, 60, 90, 45] as const;

function TypingIndicator() {
  return (
    <div className='flex gap-3'>
      <div className='w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5'>
        <SignalLogo iconSize={16} showWordmark={false} />
      </div>
      <div className='bg-card border border-white/5 rounded-xl rounded-tl-sm px-4 py-3 shadow-lg'>
        <div className='flex gap-1.5 items-center h-4'>
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className='w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce'
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='flex-1 px-6 py-6 flex flex-col gap-6 animate-pulse'>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`flex gap-3 ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}
        >
          <div className='w-8 h-8 rounded-full bg-secondary shrink-0' />
          <div
            className={`flex flex-col gap-2 max-w-[60%] ${i % 2 === 1 ? 'items-end' : ''}`}
          >
            {SKELETON_LINES.slice(0, i === 1 ? 1 : 2).map((w, j) => (
              <div
                key={j}
                className='h-3 bg-secondary rounded-full'
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ChatWindow({
  conversationId,
  streamingContent,
  isStreaming,
}: Props) {
  const { data, isLoading } = useConversation(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data, streamingContent]);

  if (!conversationId && !isStreaming) {
    return (
      <div className='flex-1 flex flex-col items-center justify-center gap-6 text-center px-6'>
        <div className='w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xl shadow-primary/10'>
          <SignalLogo iconSize={36} showWordmark={false} />
        </div>
        <div>
          <p className='text-foreground font-semibold text-xl'>Signal AI</p>
          <p className='text-muted-foreground text-sm mt-1.5 max-w-xs leading-relaxed'>
            Your precision-focused trading intelligence. Ask me anything about
            the markets.
          </p>
        </div>
        <div className='flex flex-col gap-2 w-full max-w-sm'>
          {[
            'What should I buy today?',
            'Analyse RELIANCE for me',
            'What is the NIFTY50 trend?',
          ].map((suggestion) => (
            <div
              key={suggestion}
              className='text-xs text-muted-foreground border border-border/50 rounded-lg px-3 py-2 bg-secondary/30 hover:border-primary/20 hover:text-foreground transition-colors cursor-default'
            >
              {suggestion}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading && !streamingContent) {
    return <LoadingSkeleton />;
  }

  // Build streaming message object to render at the bottom
  const streamingMessage: Message | null =
    isStreaming && streamingContent
      ? {
          id: '__streaming__',
          role: 'ai',
          content: streamingContent,
          conversationId: conversationId ?? '',
          tokenCount: 0,
          createdAt: new Date().toISOString(),
        }
      : null;

  return (
    <div className='flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-5'>
      {data?.data.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Show streaming message or typing indicator */}
      {isStreaming && !streamingContent && <TypingIndicator />}
      {streamingMessage && (
        <MessageBubble message={streamingMessage} isStreaming />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
