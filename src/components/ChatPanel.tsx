'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ChatPanelProps, ChatMode } from '@/types/chat';
import ChatHeader from './ChatPanel/ChatHeader';
import SessionBadge from './ChatPanel/SessionBadge';
import MessageList from './ChatPanel/MessageList';
import ChatInput from './ChatPanel/ChatInput';
import TypingIndicator from './ChatPanel/TypingIndicator';
import { useChatStore } from '@/stores/useChatStore';
import { useResumeStore } from '@/stores/useResumeStore';
import { chatSSE } from '@/services/chat-sse';
import { CHAT_MODES } from '@/types/hr-coach';

export default function ChatPanel({ className }: ChatPanelProps) {
  const messages = useChatStore((s) => s.session.messages);
  const inputValue = useChatStore((s) => s.inputValue);
  const inputPlaceholder = useChatStore((s) => s.inputPlaceholder);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const mode = useChatStore((s) => s.session.mode);
  const setInputValue = useChatStore((s) => s.setInputValue);
  const addMessage = useChatStore((s) => s.addMessage);
  const setMode = useChatStore((s) => s.setMode);
  const resume = useResumeStore((s) => s.resume);

  const modeConfig = CHAT_MODES[mode];

  const handleModeToggle = React.useCallback(() => {
    setMode(mode === 'aether' ? 'hr-coach' : 'aether');
  }, [mode, setMode]);

  const handleSend = React.useCallback(
    async (value: string) => {
      const store = useChatStore.getState();
      const trimmed = message.trim();
      if (!trimmed || isStreaming) return;
      setInputValue('');
      try {
        await chatSSE.send(trimmed, resume, resume.targetJob?.description, mode);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        addErrorMessage(
          `⚠️ **Error:** ${errorMessage}\n\nPlease try again or check your connection.`,
          trimmed
        );
      }
    },
    [isStreaming, setInputValue, resume, addMessage, mode]
  );

  const handleCancel = React.useCallback(() => {
    chatSSE.cancel();
  }, []);

  const showTyping = isStreaming;

  return (
    <div
      className={cn(
        'flex flex-col h-full glass-panel rounded-2xl overflow-hidden',
        className
      )}
    >
      <ChatHeader
        agentName={modeConfig.agentName}
        isOnline={true}
        avatarIcon={modeConfig.avatarIcon}
        mode={mode}
        onModeToggle={handleModeToggle}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-6 pt-4 pb-2">
          <SessionBadge label="Session Started" />
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
          disabled={isStreaming}
        />
      </div>
    </div>
  );
}
