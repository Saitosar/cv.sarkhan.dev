'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { CanvasPanelProps } from '@/types/canvas';
import ResumeCanvas from './CanvasPanel/ResumeCanvas';
import ATSScoreWidget from './CanvasPanel/ATSScoreWidget';
import { useResumeStore } from '@/stores/useResumeStore';
import { useATSStore } from '@/stores/useATSStore';

export default function CanvasPanel({ className }: CanvasPanelProps) {
  const resume = useResumeStore((s) => s.resume);
  const activeSection = useResumeStore((s) => s.activeSection);
  const setActiveSection = useResumeStore((s) => s.setActiveSection);
  const score = useATSStore((s) => s.score);
  const isAnalyzing = useATSStore((s) => s.isAnalyzing);

  const handleSectionTap = React.useCallback(
    (section: string) => {
      setActiveSection(section);
      window.dispatchEvent(
        new CustomEvent('focus-chat', { detail: { section } })
      );
    },
    [setActiveSection]
  );

  const overallScore = score?.overall ?? 0;

  return (
    <div className={cn('w-full h-full relative', className)}>
      <ATSScoreWidget
        score={overallScore}
        isAnalyzing={isAnalyzing}
        className="absolute -top-4 -right-4 z-20"
      />
      <ResumeCanvas
        resume={resume}
        activeSection={activeSection}
        onSectionTap={handleSectionTap}
      />
    </div>
  );
}
