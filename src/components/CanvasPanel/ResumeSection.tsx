'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ResumeSectionProps } from '@/types/canvas';

export default function ResumeSection({
  title,
  children,
  isActive,
  onTap,
  atsScore,
}: ResumeSectionProps) {
  return (
    <section
      role="button"
      tabIndex={0}
      aria-label={`${title} section`}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTap?.();
        }
      }}
      className={cn(
        'mb-8 p-4 -mx-4 rounded-xl transition-all duration-200 cursor-pointer',
        'outline-none focus-visible:ring-2 focus-visible:ring-[#d2bbff]/50',
        isActive
          ? 'bg-[#6001d1]/10 border border-[#6001d1]/40'
          : 'border border-transparent hover:bg-white/[0.03]',
        atsScore != null && atsScore < 50
          ? 'border-l-2 border-l-red-500/50'
          : atsScore != null && atsScore < 80
            ? 'border-l-2 border-l-yellow-500/50'
            : atsScore != null && atsScore >= 80
              ? 'border-l-2 border-l-[#4ae176]/50'
              : undefined
      )}
    >
      <h3 className="text-2xl text-[#e5e2e1] mb-3">{title}</h3>
      <div className="text-lg text-[#c4c7c7] leading-relaxed">{children}</div>
    </section>
  );
}
