'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ChatPanelProps, ChatMode } from '@/types/chat';
import ChatHeader from './ChatPanel/ChatHeader';
import SessionBadge from './ChatPanel/SessionBadge';
import MessageList from './ChatPanel/MessageList';
import ChatInput from './ChatPanel/ChatInput';
import TypingIndicator from './ChatPanel/TypingIndicator';
import SuggestionChips from './ChatPanel/SuggestionChips';
import { useChatStore } from '@/stores/useChatStore';
import { useResumeStore } from '@/stores/useResumeStore';
import { chatSSE } from '@/services/chat-sse';
import { CHAT_MODES } from '@/types/hr-coach';
import { useElementHeight } from '@/hooks/useElementHeight';

const MOBILE_NAV_HEIGHT = 72;

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

  const { ref: inputRef, height: inputHeight } = useElementHeight<HTMLDivElement>();

  const handleModeToggle = React.useCallback(() => {
    setMode(mode === 'aether' ? 'hr-coach' : 'aether');
  }, [mode, setMode]);

  const handleSend = React.useCallback(
    async (value: string) => {
      const store = useChatStore.getState();
      const trimmed = value.trim();
      if (!trimmed || isStreaming) return;
      setInputValue('');
      try {
        await chatSSE.send(trimmed, resume, resume.targetJob?.description, mode);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        store.addErrorMessage(
          `⚠️ **Error:** ${errorMessage}\\n\\nPlease try again or check your connection.`,
          trimmed
        );
      }
    },
    [isStreaming, setInputValue, resume, mode]
  );

  const handleCancel = React.useCallback(() => {
    chatSSE.cancel();
  }, []);

  const handleChipAction = React.useCallback(
    (_messageId: string, action: string) => {
      setInputValue(action);
    },
    [setInputValue]
  );

  const showTyping = isStreaming;

  const bottomOffset = inputHeight + MOBILE_NAV_HEIGHT;

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
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="px-6 pt-4 pb-2 shrink-0">
          <SessionBadge focus={resume.targetJob?.title} />
        </div>
        <MessageList
          messages={messages}
          bottomOffset={bottomOffset}
          className="pb-[160px] md:pb-6"
        />
        {showTyping && (
          <div className="px-6 py-2 shrink-0">
            <TypingIndicator visible={true} />
          </div>
        )}
      </div>
      <div
        ref={inputRef}
        className="sticky bottom-0 z-50 shrink-0 p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#141313]/80 backdrop-blur-md"
      >
        <div className="flex flex-wrap gap-2 mb-3">
          <SuggestionChips
            messageId="chat-input-suggestions"
            chips={[
              { id: 'attach', label: '📎 Attach Resume', action: '📎 I have a resume to upload', variant: 'secondary' },
              { id: 'linkedin', label: '🔗 Send LinkedIn', action: '🔗 Here is my LinkedIn profile: ', variant: 'secondary' },
              { id: 'experience', label: '📝 Describe Experience', action: '📝 I have experience in ', variant: 'secondary' },
              { id: 'target', label: '🎯 Target a Job', action: '🎯 I am targeting a role as ', variant: 'secondary' },
            ]}
            onAction={handleChipAction}
          />
        </div>
        <ChatInput
          value={inputValue}
          placeholder="Describe your experience or paste a link..."
          onChange={setInputValue}
          onSend={isStreaming ? handleCancel : handleSend}
          disabled={isStreaming}
        />
      </div>
    </div>
  );
}
