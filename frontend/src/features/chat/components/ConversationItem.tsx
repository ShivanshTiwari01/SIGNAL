import type { Conversation } from '../types';
import { MessageSquare } from 'lucide-react';

interface Props {
  conversation: Conversation;
  isActive: boolean;
  onClick: (id: string) => void;
}

export default function ConversationItem({
  conversation,
  isActive,
  onClick,
}: Props) {
  return (
    <button
      onClick={() => onClick(conversation.id)}
      className={`w-full text-left text-sm flex items-center gap-2.5 px-3 py-2 rounded-md transition-all ${
        isActive
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
      }`}
    >
      <MessageSquare size={13} className='shrink-0' />
      <span className='truncate'>{conversation.title}</span>
    </button>
  );
}
