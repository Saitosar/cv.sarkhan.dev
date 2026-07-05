// src/stores/useATSStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ATSScore, ATSSectionScore, ATSSuggestion } from '@/types/ats';

interface ATSState {
  score: ATSScore | null;
  isAnalyzing: boolean;
  lastAnalyzed: number | null;

  // Actions
  setScore: (score: ATSScore) => void;
  setSectionScore: (section: string, score: number, issues: string[]) => void;
  addSuggestion: (suggestion: ATSSuggestion) => void;
  applySuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  reset: () => void;
}

function isSuggestionArray(value: unknown): value is ATSSuggestion[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null && 'id' in item);
}

function getSuggestions(score: ATSScore): ATSSuggestion[] {
  return isSuggestionArray(score.suggestions) ? score.suggestions : [];
}

export const useATSStore = create<ATSState>()(
  devtools(
    (set, get) => ({
      score: null,
      isAnalyzing: false,
      lastAnalyzed: null,

      setScore: (score) =>
        set({ score, lastAnalyzed: Date.now() }),

      setSectionScore: (section, score, issues) => {
        const current = get().score;
        if (!current) return;
        set({
          score: {
            ...current,
            sections: current.sections?.map((s) =>
              s.section === section ? { ...s, score, issues } : s
            ) ?? [],
          },
        });
      },

      addSuggestion: (suggestion) => {
        const current = get().score;
        if (!current) return;
        set({
          score: {
            ...current,
            suggestions: [...getSuggestions(current), suggestion] as unknown as ATSScore['suggestions'],
          },
        });
      },

      applySuggestion: (id) => {
        const current = get().score;
        if (!current) return;
        set({
          score: {
            ...current,
            suggestions: getSuggestions(current).map((s) =>
              s.id === id ? { ...s, applied: true } : s
            ) as unknown as ATSScore['suggestions'],
          },
        });
      },

      dismissSuggestion: (id) => {
        const current = get().score;
        if (!current) return;
        set({
          score: {
            ...current,
            suggestions: getSuggestions(current).filter((s) => s.id !== id) as unknown as ATSScore['suggestions'],
          },
        });
      },

      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

      reset: () =>
        set({
          score: null,
          isAnalyzing: false,
          lastAnalyzed: null,
        }),
    }),
    { name: 'ATSStore' }
  )
);

export type { ATSState };
