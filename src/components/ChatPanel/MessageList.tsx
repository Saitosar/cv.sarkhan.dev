'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';
import AgentMessage from './AgentMessage';
import UserMessage from './UserMessage';

export interface MessageListProps {
  messages: ChatMessage[];
  bottomOffset?: number;
  className?: string;
}

export default function MessageList({ messages, bottomOffset = 0, className }: MessageListProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  const lastContent = messages.length > 0 ? messages[messages.length - 1].content : undefined;

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      el.scrollTo({ top: maxScroll, behavior: 'smooth' });
    }
  }, [messages.length, lastContent, bottomOffset]);

  const safeBottom = bottomOffset > 0 ? bottomOffset + 8 : 128;
  const scrollPaddingBottom = `${safeBottom}px`;
  const scrollPaddingBottomSafe = `calc(${safeBottom}px + env(safe-area-inset-bottom, 0px))`;

  if (messages.length === 0) {
    return (
      <div
        ref={listRef}
        style={{ scrollPaddingBottom: scrollPaddingBottomSafe, paddingBottom: scrollPaddingBottomSafe }}
        className={cn(
          "flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center text-center",
          className
        )}
      >
        <p className="text-sm text-[#c4c7c7]">
          Send a LinkedIn link, resume, or describe your experience — Aether will read it and build your resume.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      style={{ scrollPaddingBottom }}
      className={cn(
        "flex-1 p-6 overflow-y-auto flex flex-col gap-6",
        className
      )}
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
