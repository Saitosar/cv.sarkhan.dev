'use client';

import * as React from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatInputProps } from '@/types/chat';

export default function ChatInput({
  value,
  placeholder,
  onChange,
  onSend,
  disabled,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSend = React.useCallback(() => {
    onSend(value);
  }, [onSend, value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="relative sticky bottom-0 z-50">
      <div className="relative flex items-center gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'flex-1 bg-[#1c1b1b] border border-[rgba(255,255,255,0.08)] rounded-2xl',
            'py-3 pl-4 pr-12 text-[#e5e2e1] placeholder:text-[#c4c7c7]',
            'focus:outline-none focus:border-[#d2bbff] resize-none min-h-[52px] max-h-[160px]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              'text-[#c4c7c7] p-2 rounded-lg transition-colors',
              canSend
                ? 'hover:text-[#d2bbff] hover:bg-[#6001d1]/20 active:bg-[#6001d1]/30'
                : 'opacity-40 cursor-not-allowed'
            )}
          >
            <Send size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
