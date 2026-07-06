'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { CanvasPanelProps } from '@/types/canvas';
import ResumeCanvas from './CanvasPanel/ResumeCanvas';
import ATSScoreWidget from './CanvasPanel/ATSScoreWidget';
import { useResumeStore } from '@/stores/useResumeStore';
import { useATSStore } from '@/stores/useATSStore';

const DEBOUNCE_MS = 2000;

const FALLBACK_SCORE = {
  overall: 0,
  breakdown: {
    keywords: 0,
    formatting: 0,
    completeness: 0,
    readability: 0,
  },
  suggestions: ['Unable to analyze resume. Please try again later.'],
  matchedKeywords: [],
  missingKeywords: [],
  lastAnalyzed: null,
};

export default function CanvasPanel({ className }: CanvasPanelProps) {
  const resume = useResumeStore((s) => s.resume);
  const activeSection = useResumeStore((s) => s.activeSection);
  const setActiveSection = useResumeStore((s) => s.setActiveSection);
  const score = useATSStore((s) => s.score);
  const isAnalyzing = useATSStore((s) => s.isAnalyzing);
  const setScore = useATSStore((s) => s.setScore);
  const setIsAnalyzing = useATSStore((s) => s.setIsAnalyzing);

  const abortControllerRef = React.useRef<AbortController | null>(null);

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
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const handle = setTimeout(async () => {
      if (!resume.fullName && !resume.jobTitle) return;

      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/ai/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
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
        let parsedScore;
        try {
          parsedScore = typeof result.content === 'string'
            ? JSON.parse(result.content)
            : result.content;
        } catch {
          parsedScore = FALLBACK_SCORE;
        }
        setScore(parsedScore);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('ATS analysis failed:', error);
        setScore(FALLBACK_SCORE);
      } finally {
        setIsAnalyzing(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(handle);
      abortController.abort();
    };
  }, [resume, setIsAnalyzing, setScore]);

  const overallScore = score?.overall ?? 0;

  return (
    <div className={cn('w-full h-full relative', className)}>
      <ATSScoreWidget
        score={overallScore}
        isAnalyzing={isAnalyzing}
        className="absolute -top-4 -right-4 z-20 pointer-events-auto"
      />
      <div className="pt-20 pr-36 md:pr-40">
        <ResumeCanvas
          resume={resume}
          activeSection={activeSection}
          onSectionTap={handleSectionTap}
        />
      </div>
    </div>
  );
}
