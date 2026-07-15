'use client';

import * as React from 'react';
import { Paperclip, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatInputProps } from '@/types/chat';
import VoiceButton from './VoiceButton';
import { useVoiceInput } from '@/hooks/useVoiceInput';

const ACCEPTED_TYPES = '.pdf,.docx,.doc,.txt,.png,.jpg,.jpeg';

export default function ChatInput({
  value,
  placeholder,
  onChange,
  onSend,
  disabled,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = React.useState<File | null>(null);

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

  const handleSend = React.useCallback(() => {
    onSend(value, attachment ?? undefined);
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onSend, value, attachment]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAttachment(file);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canSend = !disabled && (value.trim() || attachment);

  return (
    <div className="relative sticky bottom-0 z-50 flex flex-col gap-2">
      {attachment && (
        <div className="flex items-center">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1',
              'rounded-full bg-[#6001d1]/20 border border-[#d2bbff]/30',
              'text-xs text-[#e5e2e1]'
            )}
          >
            <span className="max-w-[200px] truncate">{attachment.name}</span>
            <button
              type="button"
              onClick={handleRemoveAttachment}
              disabled={disabled}
              aria-label="Remove attachment"
              className={cn(
                'p-1 rounded-full text-[#d2bbff] transition-colors',
                !disabled && 'hover:bg-[#6001d1]/30'
              )}
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      <div className="relative flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={handleAttachClick}
          disabled={disabled}
          aria-label="Attach file"
          className={cn(
            'text-[#c4c7c7] p-2 rounded-lg transition-colors shrink-0',
            !disabled
              ? 'hover:text-[#d2bbff] hover:bg-[#6001d1]/20 active:bg-[#6001d1]/30'
              : 'opacity-40 cursor-not-allowed'
          )}
        >
          <Paperclip size={20} strokeWidth={2} />
        </button>

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
