'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';
import type { ChatHeaderProps } from '@/types/chat';

export default function ChatHeader({
  agentName,
  isOnline,
}: ChatHeaderProps) {
  return (
    <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center bg-[#141313]/30">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-8 h-8 rounded-full',
            'flex items-center justify-center',
            'border transition-colors duration-200',
            'bg-[rgba(96,1,209,0.1)] border-[rgba(210,187,255,0.3)]'
          )}
        >
          <Bot size={16} className="text-[#6001d1]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg text-[#e5e2e1]">{agentName}</h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border text-[#6001d1] border-[rgba(210,187,255,0.3)] bg-[rgba(96,1,209,0.1)]">
              Aether
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                isOnline
                  ? 'bg-[#4ae176] shadow-[0_0_8px_rgba(74,225,118,0.6)]'
                  : 'bg-[#c4c7c7]'
              )}
            />
            <span
              className={cn(
                'text-[10px]',
                isOnline ? 'text-[#4ae176]' : 'text-[#c4c7c7]'
              )}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
