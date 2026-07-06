'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { MatchScoreBadgeProps } from '@/types/job-search';

export default function MatchScoreBadge({ score, size = 'md' }: MatchScoreBadgeProps) {
  const clamped = Math.max(0, Math.min(100, score));

  const variant =
    clamped >= 80 ? 'green' : clamped >= 60 ? 'amber' : clamped >= 40 ? 'orange' : 'red';

  const config = {
    green: { text: 'Excellent match', color: '#4ae176', bg: 'rgba(74, 225, 118, 0.12)' },
    amber: { text: 'Good match', color: '#facc15', bg: 'rgba(250, 204, 21, 0.12)' },
    orange: { text: 'Fair match', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)' },
    red: { text: 'Low match', color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)' },
  }[variant];

  const isSmall = size === 'sm';

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center rounded-full border',
        isSmall ? 'w-12 h-12' : 'w-16 h-16'
      )}
      style={{ borderColor: config.color, backgroundColor: config.bg }}
      title={config.text}
    >
      <span
        className={cn('font-bold leading-none', isSmall ? 'text-sm mt-2.5' : 'text-xl mt-3.5')}
        style={{ color: config.color }}
      >
        {clamped}
      </span>
      <span
        className={cn('font-medium', isSmall ? 'text-[8px]' : 'text-[9px]')}
        style={{ color: config.color }}
      >
        {isSmall ? '' : config.text.split(' ')[0]}
      </span>
    </div>
  );
}
