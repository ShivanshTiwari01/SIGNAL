import { useQuery } from '@tanstack/react-query';
import api from '@/store/axios';
import type { PaginatedMessages } from '../types';

async function fetchConversation(id: string): Promise<PaginatedMessages> {
  const res = await api.get(`/chat/conversation/${id}`);
  return res.data;
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => fetchConversation(id!),
    enabled: !!id,
  });
}
