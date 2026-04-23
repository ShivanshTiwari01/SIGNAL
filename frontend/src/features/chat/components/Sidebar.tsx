'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import ConversationItem from './ConversationItem';
import { useConversations } from '../hooks/useConversations';
import SignalLogo from '@/components/common/SignalLogo';
import type { Conversation } from '../types';

interface Props {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export default function Sidebar({ activeId, onSelect, onNew }: Props) {
  const { data: conversations, isLoading } = useConversations();

  return (
    <aside className='w-64 flex flex-col h-full bg-card border-r border-border shrink-0'>
      <div className='h-14 flex items-center justify-between px-4 border-b border-border'>
        <Link href='/'>
          <SignalLogo iconSize={32} />
        </Link>
      </div>

      <div className='p-3'>
        <button
          onClick={onNew}
          className='btn-outline w-full text-sm flex items-center justify-center gap-2'
        >
          <Plus size={14} />
          New Chat
        </button>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <p className='px-6 py-4 text-muted-foreground text-sm'>Loading...</p>
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conv: Conversation) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onClick={onSelect}
            />
          ))
        ) : (
          <p className='px-6 py-4 text-muted-foreground text-sm'>
            No conversations yet.
          </p>
        )}
      </div>
    </aside>
  );
}
