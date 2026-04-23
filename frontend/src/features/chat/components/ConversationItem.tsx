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
      className={`w-full text-left truncate text-sm ${
        isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
      }`}
    >
      <MessageSquare size={14} className='shrink-0' />
      <span className='truncate'>{conversation.title}</span>
    </button>
  );
}
