'use client';

import { useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send, ImagePlus, X, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';

const chatInputSchema = z.object({
  text: z.string().min(1),
});

type ChatInputValues = z.infer<typeof chatInputSchema>;

interface Props {
  conversationId: string | null;
  isStreaming: boolean;
  onSend: (
    params: { text: string; conversationId?: string; image?: File },
    onConversationCreated?: (id: string) => void,
  ) => Promise<void>;
  onStop: () => void;
  onConversationCreated: (id: string) => void;
}

export default function ChatInput({
  conversationId,
  isStreaming,
  onSend,
  onStop,
  onConversationCreated,
}: Props) {
  const [image, setImage] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { register, handleSubmit, reset, watch } = useForm<ChatInputValues>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: { text: '' },
  });

  const textValue = watch('text');

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [textValue]);

  async function onSubmit(values: ChatInputValues) {
    if (isStreaming) return;
    try {
      reset();
      setImage(null);
      await onSend(
        {
          text: values.text,
          conversationId: conversationId ?? undefined,
          image: image ?? undefined,
        },
        onConversationCreated,
      );
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  }

  const { ref: formRef, ...rest } = register('text');

  return (
    <div className='border-t border-border px-4 md:px-8 py-4 bg-card/80 backdrop-blur-sm'>
      {image && (
        <div className='flex items-center gap-2 mb-2.5'>
          <span className='text-xs text-muted-foreground border border-border rounded-md px-2.5 py-1.5 bg-secondary flex items-center gap-1.5'>
            <ImagePlus size={12} />
            {image.name}
          </span>
          <button
            type='button'
            onClick={() => setImage(null)}
            className='text-muted-foreground hover:text-foreground transition-colors'
          >
            <X size={13} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex items-end gap-2 bg-secondary border border-border rounded-xl px-3 py-2.5 focus-within:border-primary/30 focus-within:shadow-sm focus-within:shadow-primary/10 transition-all'
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
          {...rest}
          ref={(el) => {
            formRef(el);
            (textareaRef as any).current = el; // eslint-disable-line
          }}
          onKeyDown={handleKeyDown}
          placeholder='Ask Signal AI about the markets…'
          rows={1}
          className='flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none min-h-[24px] max-h-40 py-0.5'
        />

        {isStreaming ? (
          <button
            type='button'
            onClick={onStop}
            className='btn-outline px-2.5! py-1.5! text-sm shrink-0 border-error/40 text-error hover:bg-error/10'
            title='Stop generation'
          >
            <Square size={14} fill='currentColor' />
          </button>
        ) : (
          <button
            type='submit'
            disabled={!textValue?.trim()}
            className={cn(
              'bg-primary text-primary-foreground px-2.5 py-1.5 rounded-lg text-sm shrink-0 transition-all hover:bg-primary/90 active:scale-95',
              'disabled:opacity-30 disabled:cursor-not-allowed',
            )}
          >
            <Send size={15} />
          </button>
        )}
      </form>

      <p className='text-muted-foreground/30 text-xs text-center mt-2'>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
