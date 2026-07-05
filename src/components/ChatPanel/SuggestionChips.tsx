'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { SuggestionChipsProps } from '@/types/chat';

export default function SuggestionChips({
  messageId,
  chips,
  onAction,
}: SuggestionChipsProps) {
  return (
    <div className="flex items-center gap-2 ml-1">
      {chips.map((chip) => (
        <button
          key={chip.id}
          onClick={() => onAction(messageId, chip.action)}
          className={cn(
            'px-4 py-2 text-xs font-semibold rounded-lg transition-colors',
            chip.variant === 'primary' || chip.variant == null
              ? 'bg-[#6001d1] text-white hover:bg-[#6001d1]/80'
              : 'bg-white/5 text-[#d2bbff] hover:bg-white/10'
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
