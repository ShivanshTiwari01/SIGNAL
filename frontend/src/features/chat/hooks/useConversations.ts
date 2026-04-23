import { useQuery } from '@tanstack/react-query';
import api from '@/store/axios';
import type { Conversation } from '../types';

async function fetchConversations(): Promise<Conversation[]> {
  const res = await api.get('/chat/conversations');
  return res.data.data;
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  });
}
