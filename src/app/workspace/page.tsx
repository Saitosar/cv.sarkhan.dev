'use client';

import * as React from 'react';
import { Suspense } from 'react';
import SplitScreen from '@/components/SplitScreen';
import ChatPanel from '@/components/ChatPanel';
import CanvasPanel from '@/components/CanvasPanel';
import { useATSStore } from '@/stores/useATSStore';
import { cn } from '@/lib/utils';

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100dvh-48px)] md:h-[calc(100dvh-64px)] flex items-center justify-center">
        <span className="text-sm text-[#c4c7c7]">Loading workspace...</span>
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}

function WorkspaceContent() {
  const hasData = useATSStore((s) =>
    s.score != null && (s.score.overall > 0 || s.score.suggestions.length > 0)
  );

  return (
    <div className="h-[calc(100dvh-48px)] md:h-[calc(100dvh-64px)] flex flex-col">
      <div className="flex-1 p-4 pl-4 md:pl-6 pr-4 md:pr-0 pt-2 md:pt-3">
        <SplitScreen
          left={<ChatPanel />}
          right={
            <div className={cn('relative w-full h-full', !hasData && 'hidden')} >
              <CanvasPanel />
            </div>
          }
        />
      </div>
    </div>
  );
}
