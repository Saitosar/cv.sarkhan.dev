'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import type { SuggestionCardProps } from '@/types/suggestions';
import SeverityBadge from './SeverityBadge';

export default function SuggestionCard({
  suggestion,
  onApply,
  onDismiss,
}: SuggestionCardProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all',
        'bg-white/[0.03] border-white/[0.08] hover:border-[#d2bbff]/30'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={suggestion.severity} />
          {suggestion.atsImpact != null && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4ae176]/20 text-[#4ae176]">
              +{suggestion.atsImpact} ATS
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss suggestion"
          className="text-[#c4c7c7] hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <h4 className="text-sm font-medium text-[#e5e2e1] mb-1">{suggestion.title}</h4>
      <p className="text-xs text-[#c4c7c7] leading-relaxed mb-3">
        {suggestion.description}
      </p>

      <button
        type="button"
        onClick={onApply}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
          'bg-[#6001d1]/20 text-[#d2bbff] text-xs font-medium',
          'hover:bg-[#6001d1]/30 transition-colors'
        )}
      >
        <Check size={14} />
        Apply
      </button>
    </div>
  );
}
