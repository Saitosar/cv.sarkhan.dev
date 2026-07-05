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

export default function ChatPanel({ className }: ChatPanelProps) {
  const messages = useChatStore((s) => s.session.messages);
  const inputValue = useChatStore((s) => s.inputValue);
  const inputPlaceholder = useChatStore((s) => s.inputPlaceholder);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const addMessage = useChatStore((s) => s.addMessage);
  const setInputValue = useChatStore((s) => s.setInputValue);
  const setIsStreaming = useChatStore((s) => s.setIsStreaming);
  const updateLastMessage = useChatStore((s) => s.updateLastMessage);

  const handleSend = React.useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || isStreaming) return;
      addMessage('user', trimmed);
      setInputValue('');
      setIsStreaming(true);
      addMessage('assistant', '', 'general');

      // Simulate streaming (remove when real API is wired)
      let step = 0;
      const text =
        'I reviewed your request. Let me improve the resume section based on what you shared.';
      const interval = setInterval(() => {
        step += 1;
        updateLastMessage(text.slice(0, Math.min(step * 2, text.length)));
        if (step * 2 >= text.length) {
          clearInterval(interval);
          setIsStreaming(false);
        }
      }, 30);
    },
    [isStreaming, addMessage, setInputValue, setIsStreaming, updateLastMessage]
  );

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
        {isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content === '' && (
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
          onSend={handleSend}
          disabled={isStreaming}
        />
      </div>
    </div>
  );
}
