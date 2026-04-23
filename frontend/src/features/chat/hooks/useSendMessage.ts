import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/store/axios';

interface SendMessageParams {
  text: string;
  conversationId?: string;
  image?: File;
}

async function sendMessage({ text, conversationId, image }: SendMessageParams) {
  const formData = new FormData();
  formData.append('text', text);
  if (image) formData.append('image', image);

  const url = conversationId
    ? `/chat/conversation?conversationId=${conversationId}`
    : '/chat/conversation';

  const res = await api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
