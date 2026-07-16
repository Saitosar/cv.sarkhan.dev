'use client';

import * as React from 'react';
import type { UserMessageProps } from '@/types/chat';

export default function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="bg-[#6001d1]/20 rounded-2xl rounded-tr-none p-2 md:p-3 text-[14px] md:text-[15px] text-[#e5e2e1] max-w-[95%]">
        {message.content}
      </div>
    </div>
  );
}
