'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { CanvasPanelProps } from '@/types/canvas';
import type { Suggestion } from '@/types/suggestions';
import ResumeCanvas from './CanvasPanel/ResumeCanvas';
import ATSScoreWidget from './CanvasPanel/ATSScoreWidget';
import SuggestionPanel from './CanvasPanel/SuggestionPanel';
import { useResumeStore } from '@/stores/useResumeStore';
import { useATSStore } from '@/stores/useATSStore';
import { useSuggestionStore, buildSuggestion } from '@/stores/useSuggestionStore';

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

  const suggestions = useSuggestionStore((s) => s.suggestions);
  const activeSuggestionSection = useSuggestionStore((s) => s.activeSection);
  const suggestionLoading = useSuggestionStore((s) => s.loading);
  const suggestionError = useSuggestionStore((s) => s.error);
  const setSuggestionLoading = useSuggestionStore((s) => s.setLoading);
  const setSuggestionError = useSuggestionStore((s) => s.setError);
  const setSuggestions = useSuggestionStore((s) => s.setSuggestions);
  const setActiveSuggestionSection = useSuggestionStore((s) => s.setActiveSection);
  const applyStoreSuggestion = useSuggestionStore((s) => s.applySuggestion);
  const dismissStoreSuggestion = useSuggestionStore((s) => s.dismissSuggestion);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const lastFetchedSectionRef = React.useRef<string | null>(null);

  const handleSectionTap = React.useCallback(
    (section: string) => {
      setActiveSection(section);
      setActiveSuggestionSection(section);
      window.dispatchEvent(
        new CustomEvent('focus-chat', { detail: { section } })
      );
    },
    [setActiveSection, setActiveSuggestionSection]
  );

  // Fetch AI suggestions when active section changes
  React.useEffect(() => {
    if (!activeSection) return;
    if (lastFetchedSectionRef.current === activeSection) return;
    lastFetchedSectionRef.current = activeSection;

    const abortController = new AbortController();
    setSuggestionLoading(true);
    setSuggestionError(null);

    const sectionContent = getSectionContent(resume, activeSection);

    fetch('/api/ai/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
      body: JSON.stringify({
        task: 'suggestions',
        section: activeSection,
        sectionContent,
        resumeData: resume,
        jobDescription: resume.targetJob?.description,
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        const raw =
          typeof result.content === 'string' ? JSON.parse(result.content) : result.content;
        const items = Array.isArray(raw.suggestions) ? raw.suggestions : [];
        setSuggestions(
          items.map((item: Record<string, unknown>) => buildSuggestion(activeSection, item as Parameters<typeof buildSuggestion>[1]))
        );
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('[Suggestions] Failed:', error);
        setSuggestionError(error instanceof Error ? error.message : 'Failed');
      })
      .finally(() => {
        setSuggestionLoading(false);
      });

    return () => {
      abortController.abort();
    };
  }, [activeSection, resume, setSuggestionLoading, setSuggestionError, setSuggestions]);

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

  const handleApplySuggestion = React.useCallback(
    (suggestion: Suggestion) => {
      if (!suggestion.action?.replacementText) return;
      const { type, targetText, replacementText } = suggestion.action;
      const section = suggestion.section;

      if (section === 'summary' && type === 'apply') {
        useResumeStore.getState().updateField('summary', replacementText);
      } else if (section === 'skills' && type === 'insert' && replacementText) {
        useResumeStore.getState().addSkill(replacementText);
      } else if (type === 'replace' && targetText) {
        const current = getSectionContent(useResumeStore.getState().resume, section);
        const next = current.replace(targetText, replacementText);
        if (section === 'summary') {
          useResumeStore.getState().updateField('summary', next);
        }
      }

      applyStoreSuggestion(suggestion.id);
    },
    [applyStoreSuggestion]
  );

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
      <SuggestionPanel
        suggestions={suggestions}
        isLoading={suggestionLoading}
        error={suggestionError}
        activeSection={activeSuggestionSection}
        onApply={handleApplySuggestion}
        onDismiss={dismissStoreSuggestion}
        onRefresh={() => {
          lastFetchedSectionRef.current = null;
          setActiveSection(activeSuggestionSection);
        }}
        className={activeSection ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      />
    </div>
  );
}

function getSectionContent(
  resume: ReturnType<typeof useResumeStore.getState>['resume'],
  section: string
): string {
  switch (section) {
    case 'summary':
      return resume.summary;
    case 'experience':
      return resume.experience
        .map(
          (exp) =>
            `• ${exp.position} at ${exp.company}${exp.description ? ` — ${exp.description}` : ''}`
        )
        .join('\n');
    case 'education':
      return resume.education
        .map((edu) => `• ${edu.degree}, ${edu.institution}${edu.endYear ? ` (${edu.endYear})` : ''}`)
        .join('\n');
    case 'skills':
      return resume.skills.map((s) => s.name).join(', ');
    case 'certifications':
      return resume.certifications
        .map((c) => `• ${c.name}${c.issuer ? ` — ${c.issuer}` : ''}`)
        .join('\n');
    case 'projects':
      return (resume.projects ?? [])
        .map((p) => `• ${p.name}${p.description ? ` — ${p.description}` : ''}`)
        .join('\n');
    default:
      return '';
  }
}
