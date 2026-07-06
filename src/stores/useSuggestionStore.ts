// src/stores/useSuggestionStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  Suggestion,
  SuggestionSeverity,
  SuggestionType,
  SuggestionAction,
} from '@/types/suggestions';

interface SuggestionState {
  /** All current suggestions */
  suggestions: Suggestion[];
  /** Currently analyzed section */
  activeSection: string | null;
  /** Whether AI is generating suggestions */
  loading: boolean;
  /** Error message */
  error: string | null;

  // Actions
  setSuggestions: (suggestions: Suggestion[]) => void;
  setActiveSection: (section: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addSuggestions: (suggestions: Suggestion[]) => void;
  applySuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  clearSuggestions: () => void;
}

export const useSuggestionStore = create<SuggestionState>()(
  devtools(
    (set, get) => ({
      suggestions: [],
      activeSection: null,
      loading: false,
      error: null,

      setSuggestions: (suggestions) => set({ suggestions }),
      setActiveSection: (activeSection) => set({ activeSection }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      addSuggestions: (newSuggestions) => {
        const existing = get().suggestions;
        const merged = [...existing];
        for (const s of newSuggestions) {
          if (!merged.find((m) => m.id === s.id)) {
            merged.push(s);
          }
        }
        set({ suggestions: merged });
      },

      applySuggestion: (suggestionId) => {
        set({
          suggestions: get().suggestions.map((s) =>
            s.id === suggestionId ? { ...s, applied: true } : s
          ),
        });
      },

      dismissSuggestion: (suggestionId) => {
        set({
          suggestions: get().suggestions.filter((s) => s.id !== suggestionId),
        });
      },

      clearSuggestions: () => set({ suggestions: [], activeSection: null, error: null }),
    }),
    { name: 'SuggestionStore' }
  )
);

export type { SuggestionState };

/** Helper to build a suggestion idempotently from a raw AI response item. */
export function buildSuggestion(
  section: string,
  partial: {
    type: SuggestionType;
    severity: SuggestionSeverity;
    title: string;
    description: string;
    action: SuggestionAction;
    atsImpact?: number;
  },
  source: Suggestion['source'] = 'ai'
): Suggestion {
  return {
    id: nanoid(),
    ...partial,
    section,
    source,
    applied: false,
    dismissed: false,
    createdAt: Date.now(),
  };
}
