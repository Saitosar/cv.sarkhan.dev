'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ChatInputProps } from '@/types/chat';

export default function ChatInput({
  value,
  placeholder,
  onChange,
  onSend,
  disabled,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(value);
    }
  };

  return (
    <div className="relative">
      <textarea
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'w-full bg-[#1c1b1b] border border-[rgba(255,255,255,0.08)] rounded-xl',
          'py-3 pl-4 pr-12 text-[#e5e2e1] placeholder:text-[#c4c7c7]',
          'focus:outline-none focus:border-[#d2bbff] resize-none min-h-[48px] max-h-[160px]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      <button
        type="button"
        onClick={() => onSend(value)}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 text-[#d2bbff] p-2 rounded-lg',
          'transition-colors',
          !disabled && value.trim()
            ? 'hover:bg-[#6001d1]/20 active:bg-[#6001d1]/30'
            : 'opacity-40 cursor-not-allowed'
        )}
      >
        <span className="material-symbols-outlined">send</span>
      </button>
    </div>
  );
}
