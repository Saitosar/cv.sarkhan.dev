'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ChatHeaderProps } from '@/types/chat';

export default function ChatHeader({
  agentName,
  isOnline,
  avatarIcon = 'smart_toy',
}: ChatHeaderProps) {
  return (
    <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center bg-[#141313]/30">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-8 h-8 rounded-full bg-[#6001d1]/20',
            'flex items-center justify-center',
            'border border-[#d2bbff]/30'
          )}
        >
          <span className="material-symbols-outlined text-[#d2bbff] text-sm">
            {avatarIcon}
          </span>
        </div>
        <div>
          <h2 className="text-lg text-[#e5e2e1]">{agentName}</h2>
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
