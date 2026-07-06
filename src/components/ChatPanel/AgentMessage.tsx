'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import type { AgentMessageProps } from '@/types/chat';
import SuggestionChips from './SuggestionChips';

export default function AgentMessage({
  message,
  onApply,
  onDetails,
}: AgentMessageProps) {
  const handleAction = (action: string) => {
    if (action === 'apply') onApply?.(message.id);
    else if (action === 'details') onDetails?.(message.id);
  };

  return (
    <div className="flex gap-4 max-w-[90%]">
      <div
        className={cn(
          'w-8 h-8 rounded-full bg-[#6001d1] flex-shrink-0 flex items-center justify-center',
          'shadow-[0_0_15px_rgba(96,1,209,0.4)]'
        )}
      >
        <span className="material-symbols-outlined text-white text-sm">
          psychology
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[10px] text-[#d2bbff] ml-1">Aether AI</span>
        <div
          className={cn(
            'bg-[#2b2a2a]/80 chat-glow rounded-2xl rounded-tl-none',
            'p-4 text-[15px] text-[#e5e2e1]'
          )}
        >
          <div className="[&_a]:text-[#d2bbff] [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0">
            <ReactMarkdown
              components={{
                a: ({ ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  return (
                    <code
                      {...props}
                      className={cn(
                        isInline
                          ? 'bg-[#2b2a2a] px-1 rounded text-[#e5e2e1]'
                          : 'block bg-[#1a1a2e] p-3 rounded-lg font-mono text-[#e5e2e1] overflow-x-auto',
                        className
                      )}
                    >
                      {children}
                    </code>
                  );
                },
                ul: ({ ...props }) => (
                  <ul {...props} className="list-disc pl-5 my-2 space-y-1" />
                ),
                ol: ({ ...props }) => (
                  <ol {...props} className="list-decimal pl-5 my-2 space-y-1" />
                ),
                li: ({ ...props }) => <li {...props} className="text-[#e5e2e1]" />,
                strong: ({ ...props }) => (
                  <strong {...props} className="font-bold text-white" />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        {message.hasActions && (
          <SuggestionChips
            messageId={message.id}
            chips={[
              { id: 'apply', label: 'Apply', action: 'apply', variant: 'primary' },
              { id: 'details', label: 'Details', action: 'details', variant: 'secondary' },
            ]}
            onAction={(_, action) => handleAction(action)}
          />
        )}
      </div>
    </div>
  );
}
