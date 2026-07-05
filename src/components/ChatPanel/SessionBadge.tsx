'use client';

import * as React from 'react';
import type { SessionBadgeProps } from '@/types/chat';

export default function SessionBadge({ label }: SessionBadgeProps) {
  return (
    <div className="text-center">
      <span className="text-[10px] text-[#c4c7c7] bg-[#353434]/50 px-3 py-1 rounded-full border border-[rgba(255,255,255,0.08)]">
        {label}
      </span>
    </div>
  );
}
