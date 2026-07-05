'use client';

import * as React from 'react';
import type { TypingIndicatorProps } from '@/types/chat';

export default function TypingIndicator({ visible }: TypingIndicatorProps) {
  if (!visible) return null;

  return (
    <div className="flex items-center gap-1.5" aria-label="Aether is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot w-1.5 h-1.5 rounded-full bg-[#d2bbff]"
        />
      ))}
    </div>
  );
}
