'use client';

import * as React from 'react';
import type { UserMessageProps } from '@/types/chat';

export default function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="bg-[#6001d1]/20 rounded-2xl rounded-tr-none p-4 text-[15px] text-[#e5e2e1] max-w-[85%]">
        {message.content}
      </div>
    </div>
  );
}
