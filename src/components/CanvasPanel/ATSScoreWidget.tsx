'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ATSScoreWidgetProps } from '@/types/canvas';
import CircularScore from './CircularScore';
import PulseRing from './PulseRing';

export default function ATSScoreWidget({
  score,
  label = 'ATS Match',
  isAnalyzing,
  className,
}: ATSScoreWidgetProps) {
  return (
    <div
      className={cn(
        'glass-panel rounded-2xl p-4',
        'flex flex-col items-center gap-2',
        'ats-glow',
        'border border-[#4F46E5]/30',
        'w-32',
        className
      )}
    >
      <div className="relative w-20 h-20 flex items-center justify-center">
        <CircularScore score={score} size={80} strokeWidth={8} />
        <PulseRing visible={isAnalyzing ?? true} color="#4F46E5" />
        <span className="text-2xl text-[#e5e2e1] relative z-10 font-bold">
          {score}
          <span className="text-sm">%</span>
        </span>
      </div>
      <span className="text-[10px] text-[#d2bbff] tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}
