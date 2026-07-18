'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ChatPanelProps } from '@/types/chat';
import ChatHeader from './ChatPanel/ChatHeader';
import MessageList from './ChatPanel/MessageList';
import ChatInput from './ChatPanel/ChatInput';
import TypingIndicator from './ChatPanel/TypingIndicator';
import { useChatStore } from '@/stores/useChatStore';
import { chatSSE } from '@/services/chat-sse';
import { useElementHeight } from '@/hooks/useElementHeight';

const MOBILE_NAV_HEIGHT = 72;

export default function ChatPanel({ className }: ChatPanelProps) {
  const messages = useChatStore((s) => s.session.messages);
    <div
      className={cn(
        'flex flex-col h-full glass-panel rounded-2xl overflow-hidden',
        className
      )}
    >
      <ChatHeader
        agentName="Aether Coach"
        isOnline={true}
      />
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <MessageList
          messages={messages}
          bottomOffset={bottomOffset}
          className="pb-[160px] md:pb-6"
        />
        {showTyping && (
          <div className="px-3 py-2 shrink-0">
            <TypingIndicator visible={true} />
          </div>
        )}
      </div>
      <div
        ref={inputRef}
        className="sticky bottom-0 z-50 shrink-0 p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#141313]/80"
      >
        <ChatInput
          value={inputValue}
          placeholder={messages.length <= 1 ? "Send a LinkedIn link, resume, or describe your experience..." : "Ask Aether anything about your resume..."}
          onChange={setInputValue}
          onSend={isStreaming ? handleCancel : handleSend}
          disabled={isStreaming}
        />
      </div>
    </div>
  );
}
