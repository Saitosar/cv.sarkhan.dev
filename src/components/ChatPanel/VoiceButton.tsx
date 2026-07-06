'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import type { VoiceButtonProps } from '@/types/voice';

const stateConfig = {
  idle: {
    icon: Mic,
    className: 'text-[#c4c7c7] hover:text-[#d2bbff]',
    tooltip: 'Voice input',
  },
  listening: {
    icon: Mic,
    className: 'text-red-400',
    tooltip: 'Listening... click to stop',
  },
  processing: {
    icon: Loader2,
    className: 'text-yellow-400',
    tooltip: 'Processing...',
  },
  error: {
    icon: MicOff,
    className: 'text-red-400',
    tooltip: 'Voice input failed. Try again.',
  },
};

export default function VoiceButton({
  state,
  onClick,
  disabled,
}: VoiceButtonProps) {
  const config = stateConfig[state];
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={config.tooltip}
      aria-label={config.tooltip}
      className={cn(
        'relative p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d2bbff]/50',
        'hover:bg-white/5',
        isListening && 'ring-2 ring-red-400/30 bg-red-400/10 voice-pulse',
        config.className,
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <Icon
        size={18}
        className={cn(isProcessing && 'animate-spin')}
        aria-hidden="true"
      />
    </button>
  );
}
