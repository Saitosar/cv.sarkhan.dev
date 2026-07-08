'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ChatInputProps } from '@/types/chat';
import VoiceButton from './VoiceButton';
import { useVoiceInput } from '@/hooks/useVoiceInput';

export default function ChatInput({
  value,
  placeholder,
  onChange,
  onSend,
  disabled,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleVoiceResult = React.useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        onChange(value ? `${value} ${text}` : text);
        return;
      }

      const start = textarea.selectionStart ?? value.length;
      const end = textarea.selectionEnd ?? value.length;
      const before = value.slice(0, start);
      const after = value.slice(end);
      const separator = before.length > 0 && !before.endsWith(' ') ? ' ' : '';
      const next = `${before}${separator}${text}${after}`;
      onChange(next);

      // Restore cursor after the inserted text
      requestAnimationFrame(() => {
        const position = start + separator.length + text.length;
        textarea.setSelectionRange(position, position);
        textarea.focus();
      });
    },
    [onChange, value]
  );

  const { state, isSupported, toggleListening } = useVoiceInput(handleVoiceResult);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(value);
    }
  };

  return (
    <div className="relative flex items-center gap-2 md:sticky md:bottom-0">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'flex-1 bg-[#1c1b1b] border border-[rgba(255,255,255,0.08)] rounded-xl',
          'py-3 pl-4 pr-12 text-[#e5e2e1] placeholder:text-[#c4c7c7]',
          'focus:outline-none focus:border-[#d2bbff] resize-none min-h-[48px] max-h-[160px]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isSupported && (
          <VoiceButton
            state={state}
            onClick={toggleListening}
            disabled={disabled}
          />
        )}
        <button
          type="button"
          onClick={() => onSend(value)}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className={cn(
            'text-[#d2bbff] p-2 rounded-lg transition-colors',
            !disabled && value.trim()
              ? 'hover:bg-[#6001d1]/20 active:bg-[#6001d1]/30'
              : 'opacity-40 cursor-not-allowed'
          )}
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  );
}
