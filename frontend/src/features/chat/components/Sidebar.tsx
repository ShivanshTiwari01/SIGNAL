'use client';

import Link from 'next/link';
import { Plus, Settings, MessageSquare } from 'lucide-react';
import ConversationItem from './ConversationItem';
import { useConversations } from '../hooks/useConversations';
import SignalLogo from '@/components/common/SignalLogo';
import type { Conversation } from '../types';
import { useState } from 'react';
import SettingsModal from './SettingsModal';

interface Props {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export default function Sidebar({ activeId, onSelect, onNew }: Props) {
  const { data: conversations, isLoading } = useConversations();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <aside className='w-64 flex flex-col h-full bg-card border-r border-border shrink-0'>
        {/* Header */}
        <div className='h-14 flex items-center justify-between px-4 border-b border-border'>
          <Link href='/' className='hover:opacity-80 transition-opacity'>
            <SignalLogo iconSize={28} />
          </Link>
        </div>

        {/* New chat button */}
        <div className='p-3'>
          <button
            onClick={onNew}
            className='w-full flex items-center justify-center gap-2 text-sm py-2 px-3 rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all'
          >
            <Plus size={14} />
            New Chat
          </button>
        </div>

        {/* Conversations list */}
        <div className='flex-1 overflow-y-auto'>
          {isLoading ? (
            <div className='px-3 py-4 space-y-2'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='h-9 rounded-md bg-secondary animate-pulse'
                  style={{ opacity: 1 - i * 0.2 }}
                />
              ))}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className='px-2 py-1'>
              <p className='text-muted-foreground/50 text-[10px] font-semibold uppercase tracking-wider px-2 py-2'>
                Recent
              </p>
              {conversations.map((conv: Conversation) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeId}
                  onClick={onSelect}
                />
              ))}
            </div>
          ) : (
            <div className='px-4 py-8 text-center'>
              <MessageSquare
                size={24}
                className='text-muted-foreground/30 mx-auto mb-2'
              />
              <p className='text-muted-foreground/50 text-xs'>
                No conversations yet.
              </p>
              <p className='text-muted-foreground/30 text-xs mt-0.5'>
                Start a new chat above.
              </p>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className='border-t border-border p-3'>
          <button
            onClick={() => setSettingsOpen(true)}
            className='w-full flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all'
          >
            <Settings size={15} />
            Settings
          </button>
        </div>
      </aside>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
