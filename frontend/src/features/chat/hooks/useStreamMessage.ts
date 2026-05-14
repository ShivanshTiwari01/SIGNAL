'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';

interface StreamMessageParams {
  text: string;
  conversationId?: string;
  image?: File;
}

interface StreamState {
  content: string;
  isStreaming: boolean;
}

export function useStreamMessage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState<StreamState>({
    content: '',
    isStreaming: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      params: StreamMessageParams,
      onConversationCreated?: (id: string) => void,
    ): Promise<void> => {
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      setState({ content: '', isStreaming: true });

      try {
        const token = await getToken();
        const formData = new FormData();
        formData.append('text', params.text);
        if (params.image) formData.append('image', params.image);

        const base = process.env.NEXT_PUBLIC_API_URL ?? '';
        const url = params.conversationId
          ? `${base}/chat/conversation/stream?conversationId=${params.conversationId}`
          : `${base}/chat/conversation/stream`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
          signal: abort.signal,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => 'Unknown error');
          throw new Error(errText || `Request failed: ${res.status}`);
        }

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let newConversationId: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const parsed = JSON.parse(raw);
              if (parsed.token !== undefined) {
                setState((prev) => ({
                  ...prev,
                  content: prev.content + parsed.token,
                }));
              } else if (parsed.done) {
                newConversationId = parsed.conversationId ?? null;
                if (newConversationId)
                  onConversationCreated?.(newConversationId);
                setState((prev) => ({ ...prev, isStreaming: false }));
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch {
              // Silently skip unparseable SSE lines
            }
          }
        }

        // Refresh query cache after stream finishes
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        if (newConversationId) {
          queryClient.invalidateQueries({
            queryKey: ['conversation', newConversationId],
          });
        } else if (params.conversationId) {
          queryClient.invalidateQueries({
            queryKey: ['conversation', params.conversationId],
          });
        }
        // eslint-disable-next-line
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setState((prev) => ({ ...prev, isStreaming: false }));
          throw err;
        }
      }
    },
    [getToken, queryClient],
  );

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const clearStream = useCallback(() => {
    setState({ content: '', isStreaming: false });
  }, []);

  return { ...state, sendMessage, stopStream, clearStream };
}
