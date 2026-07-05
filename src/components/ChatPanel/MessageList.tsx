'use client';

import * as React from 'react';
import type { ChatMessage } from '@/types/chat';
import AgentMessage from './AgentMessage';
import UserMessage from './UserMessage';

export interface MessageListProps {
  messages: ChatMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  const lastContent = messages.length > 0 ? messages[messages.length - 1].content : undefined;

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length, lastContent]);

  if (messages.length === 0) {
    return (
      <div
        ref={listRef}
        className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center text-center"
      >
        <p className="text-sm text-[#c4c7c7]">
          Start a conversation with Aether to build or improve your resume.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="flex-1 p-6 overflow-y-auto flex flex-col gap-6"
      aria-live="polite"
      aria-atomic="false"
    >
      {messages.map((message) => (
        <div key={message.id} className="animate-message-in">
          {message.role === 'user' ? (
            <UserMessage message={message} />
          ) : message.role === 'assistant' ? (
            <AgentMessage message={message} />
          ) : (
            <div className="max-w-[90%] rounded-2xl p-4 text-[15px] bg-red-500/10 text-red-300 border border-red-500/20">
              {message.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
