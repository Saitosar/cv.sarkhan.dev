'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ChatPanelProps } from '@/types/chat';
import ChatHeader from './ChatPanel/ChatHeader';
import SessionBadge from './ChatPanel/SessionBadge';
import MessageList from './ChatPanel/MessageList';
import ChatInput from './ChatPanel/ChatInput';
import TypingIndicator from './ChatPanel/TypingIndicator';
import { useChatStore } from '@/stores/useChatStore';
import { useResumeStore } from '@/stores/useResumeStore';
import { chatSSE } from '@/services/chat-sse';

export default function ChatPanel({ className }: ChatPanelProps) {
  const messages = useChatStore((s) => s.session.messages);
  const inputValue = useChatStore((s) => s.inputValue);
  const inputPlaceholder = useChatStore((s) => s.inputPlaceholder);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const setInputValue = useChatStore((s) => s.setInputValue);
  const resume = useResumeStore((s) => s.resume);

  const handleSend = React.useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || isStreaming) return;
      setInputValue('');
      await chatSSE.send(trimmed, resume, resume.targetJob?.description);
    },
    [isStreaming, setInputValue, resume]
  );

  const handleCancel = React.useCallback(() => {
    chatSSE.cancel();
  }, []);

  const showTyping =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1].role === 'assistant' &&
    messages[messages.length - 1].content === '';

  return (
    <div
      className={cn(
        'flex flex-col h-full glass-panel rounded-2xl overflow-hidden',
        className
      )}
    >
      <ChatHeader agentName="Aether Coach" isOnline={true} />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-6 pt-4 pb-2">
          <SessionBadge label="Session Started • Focus: Senior DevOps" />
        </div>
        <MessageList messages={messages} />
        {showTyping && (
          <div className="px-6 py-2">
            <TypingIndicator visible={true} />
          </div>
        )}
      </div>
      <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#141313]/30">
        <ChatInput
          value={inputValue}
          placeholder={inputPlaceholder}
          onChange={setInputValue}
          onSend={isStreaming ? handleCancel : handleSend}
          disabled={false}
        />
      </div>
    </div>
  );
}
