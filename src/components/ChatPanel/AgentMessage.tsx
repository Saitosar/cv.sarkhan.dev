'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';
import type { AgentMessageProps } from '@/types/chat';
import { CHAT_MODES } from '@/types/hr-coach';
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

  const source = message.source ?? 'aether';
  const config = CHAT_MODES[source];

  return (
    <div className="flex gap-3 max-w-[95%] md:max-w-[90%]">
      <div
        className={cn(
          'w-7 h-7 md:w-8 md:h-8 rounded-full flex-shrink-0 flex items-center justify-center',
          'shadow-[0_0_15px_rgba(0,0,0,0.3)]'
        )}
        style={{
          backgroundColor: config.color,
          boxShadow: `0 0 15px ${config.borderColor}`,
        }}
      >
        <Bot size={16} className="text-white" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] ml-1" style={{ color: config.color }}>
            {config.agentName}
          </span>
          {message.source && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full border"
              style={{
                color: config.color,
                borderColor: config.borderColor,
                backgroundColor: config.bgColor,
              }}
            >
              {config.label}
            </span>
          )}
        </div>
        <div
          className={cn(
            'bg-[#2b2a2a]/80 rounded-2xl rounded-tl-none',
            'chat-glow',
            'p-3 md:p-4 text-[14px] md:text-[15px] text-[#e5e2e1]'
          )}
          style={{
            borderLeft: `2px solid ${config.color}`,
          }}
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
              { id: 'details', label: 'Details', action: 'details', variant: 'secondary' },
            ]}
            onAction={(_, action) => handleAction(action)}
          />
        )}
      </div>
    </div>
  );
}
