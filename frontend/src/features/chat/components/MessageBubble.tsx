import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types';
import SignalLogo from '@/components/common/SignalLogo';

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`group flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
          isUser
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
            : 'bg-secondary border border-border'
        }`}
      >
        {isUser ? (
          <span className='text-xs font-bold'>U</span>
        ) : (
          <SignalLogo iconSize={16} showWordmark={false} />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/15 rounded-tr-sm'
              : 'bg-card border border-white/5 text-foreground shadow-lg rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <span className='whitespace-pre-wrap'>{message.content}</span>
          ) : (
            <div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className='text-foreground font-bold text-lg mt-3 mb-1.5 first:mt-0'>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className='text-foreground font-semibold text-base mt-3 mb-1 first:mt-0'>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className='text-foreground font-semibold text-sm mt-2 mb-1 first:mt-0'>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className='text-foreground/90 leading-relaxed mb-2 last:mb-0'>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className='space-y-1 mb-2 ml-1'>{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className='space-y-1 mb-2 ml-4 list-decimal'>
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className='text-foreground/90 flex gap-2 items-start'>
                      <span className='mt-2 w-1 h-1 rounded-full bg-primary/70 shrink-0' />
                      <span>{children}</span>
                    </li>
                  ),
                  table: ({ children }) => (
                    <div className='overflow-x-auto my-2 rounded-md border border-border'>
                      <table className='w-full text-xs'>{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className='bg-secondary text-muted-foreground'>
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className='divide-y divide-border'>{children}</tbody>
                  ),
                  tr: ({ children }) => <tr>{children}</tr>,
                  th: ({ children }) => (
                    <th className='px-3 py-2 text-left font-semibold text-xs uppercase tracking-wide'>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className='px-3 py-2 text-foreground/80'>{children}</td>
                  ),
                  code: ({ children, className }) => {
                    const isBlock = className?.startsWith('language-');
                    return isBlock ? (
                      <code className='block bg-background/80 border border-border rounded-md px-3 py-2.5 text-xs font-mono text-primary overflow-x-auto my-2 whitespace-pre'>
                        {children}
                      </code>
                    ) : (
                      <code className='bg-background/60 border border-border/60 rounded px-1.5 py-0.5 text-xs font-mono text-primary'>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <div>{children}</div>,
                  blockquote: ({ children }) => (
                    <blockquote className='border-l-2 border-primary/40 pl-3 py-0.5 my-2 text-muted-foreground italic text-xs'>
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => (
                    <strong className='text-foreground font-semibold'>
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className='text-muted-foreground italic'>{children}</em>
                  ),
                  hr: () => <hr className='border-border my-2' />,
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className='inline-block w-1.5 h-4 bg-primary/80 rounded-sm ml-0.5 animate-pulse align-middle' />
              )}
            </div>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {message.attachments.map((att) => (
              <a
                key={att.id}
                href={att.fileUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs text-primary hover:underline border border-border rounded-md px-2.5 py-1.5 bg-secondary flex items-center gap-1.5 transition-colors hover:bg-secondary/80'
              >
                <svg
                  width='11'
                  height='11'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path d='M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48' />
                </svg>
                {att.fileName}
              </a>
            ))}
          </div>
        )}

        {/* Model badge */}
        {!isUser && message.model && !isStreaming && (
          <span className='text-muted-foreground/30 text-[10px] group-hover:text-muted-foreground/50 transition-colors'>
            {message.model}
          </span>
        )}
      </div>
    </div>
  );
}
