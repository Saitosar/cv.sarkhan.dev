'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { SeverityBadgeProps } from '@/types/suggestions';

const severityConfig = {
  high: {
    label: 'High',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  medium: {
    label: 'Medium',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  low: {
    label: 'Low',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
