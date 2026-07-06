'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { CanvasPanelProps } from '@/types/canvas';
import ResumeCanvas from './CanvasPanel/ResumeCanvas';
import ATSScoreWidget from './CanvasPanel/ATSScoreWidget';
import { useResumeStore } from '@/stores/useResumeStore';
import { useATSStore } from '@/stores/useATSStore';

const DEBOUNCE_MS = 2000;

export default function CanvasPanel({ className }: CanvasPanelProps) {
  const resume = useResumeStore((s) => s.resume);
  const activeSection = useResumeStore((s) => s.activeSection);
  const setActiveSection = useResumeStore((s) => s.setActiveSection);
  const score = useATSStore((s) => s.score);
  const isAnalyzing = useATSStore((s) => s.isAnalyzing);
  const setScore = useATSStore((s) => s.setScore);
  const setIsAnalyzing = useATSStore((s) => s.setIsAnalyzing);

  const handleSectionTap = React.useCallback(
    (section: string) => {
      setActiveSection(section);
      window.dispatchEvent(
        new CustomEvent('focus-chat', { detail: { section } })
      );
    },
    [setActiveSection]
  );

  // Debounced ATS scoring when resume data changes
  React.useEffect(() => {
    const handle = setTimeout(async () => {
      if (!resume.fullName && !resume.jobTitle) return;

      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/ai/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'ats-score',
            resumeData: resume,
            jobDescription: resume.targetJob?.description,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        const parsedScore = typeof result.content === 'string'
          ? JSON.parse(result.content)
          : result.content;
        setScore(parsedScore);
      } catch (error) {
        console.error('ATS analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [resume, setIsAnalyzing, setScore]);

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
