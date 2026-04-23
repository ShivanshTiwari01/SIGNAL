import type { Message } from '../types';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      <div
        className={`max-w-[75%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-lg px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser ? 'bg-primary text-primary-foreground' : 'card-neural'
          }`}
        >
          {message.content}
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-1'>
            {message.attachments.map((att) => (
              <a
                key={att.id}
                href={att.fileUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs text-primary hover:underline border border-border rounded px-2 py-1 bg-secondary'
              >
                {att.fileName}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
