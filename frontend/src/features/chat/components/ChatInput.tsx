'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send, ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSendMessage } from '../hooks/useSendMessage';

const chatInputSchema = z.object({
  text: z.string().min(1),
});

type ChatInputValues = z.infer<typeof chatInputSchema>;

interface Props {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export default function ChatInput({
  conversationId,
  onConversationCreated,
}: Props) {
  const [image, setImage] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutate: sendMessage, isPending } = useSendMessage();

  const { register, handleSubmit, reset, watch } = useForm<ChatInputValues>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: { text: '' },
  });

  const textValue = watch('text');

  function onSubmit(values: ChatInputValues) {
    sendMessage(
      {
        text: values.text,
        conversationId: conversationId ?? undefined,
        image: image ?? undefined,
      },
      {
        // eslint-disable-next-line
        onSuccess: (data: any) => {
          reset();
          setImage(null);
          if (!conversationId && data?.data?.conversationId) {
            onConversationCreated(data.data.conversationId);
          }
        },
        onError: () => toast.error('Failed to send message.'),
      },
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  }

  return (
    <div className='border-t border-border px-4 py-4 bg-card'>
      {image && (
        <div className='flex items-center gap-2 mb-2'>
          <span className='text-xs text-muted-foreground border border-border rounded px-2 py-1 bg-secondary flex items-center gap-1.5'>
            <ImagePlus size={12} />
            {image.name}
          </span>
          <button
            type='button'
            onClick={() => setImage(null)}
            className='text-muted-foreground hover:text-foreground'
          >
            <X size={13} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex items-end gap-2 bg-secondary border border-border rounded-lg px-3 py-2'
      >
        <button
          type='button'
          onClick={() => fileRef.current?.click()}
          className='text-muted-foreground hover:text-foreground transition-colors shrink-0 pb-0.5'
          title='Attach image'
        >
          <ImagePlus size={18} />
        </button>
        <input
          ref={fileRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />

        <textarea
          {...register('text')}
          onKeyDown={handleKeyDown}
          placeholder='Ask Signal AI...'
          rows={1}
          className='flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none min-h-[24px] max-h-40'
        />

        <button
          type='submit'
          disabled={!textValue?.trim() || isPending}
          className={cn(
            'btn-primary px-3! py-1.5! text-sm shrink-0',
            'disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          <Send size={15} />
        </button>
      </form>

      <p className='text-muted-foreground/40 text-xs text-center mt-2'>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
