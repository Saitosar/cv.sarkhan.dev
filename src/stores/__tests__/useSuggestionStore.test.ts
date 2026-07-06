// src/stores/__tests__/useSuggestionStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useSuggestionStore } from '../useSuggestionStore';
import type { Suggestion } from '@/types/suggestions';

function createMockSuggestion(overrides?: Partial<Suggestion>): Suggestion {
  return {
    id: 'sug-1',
    type: 'missing_keywords',
    severity: 'high',
    title: 'Add more keywords',
    description: 'Your summary is missing key terms',
    section: 'summary',
    action: { type: 'apply', targetText: 'old', replacementText: 'new' },
    source: 'ai',
    atsImpact: 5,
    applied: false,
    dismissed: false,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('useSuggestionStore', () => {
  beforeEach(() => {
    useSuggestionStore.setState({
      suggestions: [],
      activeSection: null,
      loading: false,
      error: null,
    });
  });

  describe('default state', () => {
    it('should have empty suggestions', () => {
      const state = useSuggestionStore.getState();
      expect(state.suggestions).toEqual([]);
    });

    it('should have activeSection as null', () => {
      const state = useSuggestionStore.getState();
      expect(state.activeSection).toBeNull();
    });

    it('should have loading as false', () => {
      const state = useSuggestionStore.getState();
      expect(state.loading).toBe(false);
    });

    it('should have error as null', () => {
      const state = useSuggestionStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('setSuggestions', () => {
    it('should set suggestions', () => {
      const suggestions = [createMockSuggestion()];
      useSuggestionStore.getState().setSuggestions(suggestions);
      const state = useSuggestionStore.getState();
      expect(state.suggestions).toHaveLength(1);
      expect(state.suggestions[0].id).toBe('sug-1');
    });

    it('should replace existing suggestions', () => {
      useSuggestionStore.getState().setSuggestions([createMockSuggestion({ id: 'sug-1' })]);
      useSuggestionStore.getState().setSuggestions([createMockSuggestion({ id: 'sug-2' })]);
      const state = useSuggestionStore.getState();
      expect(state.suggestions).toHaveLength(1);
      expect(state.suggestions[0].id).toBe('sug-2');
    });
  });

  describe('setActiveSection', () => {
    it('should set activeSection', () => {
      useSuggestionStore.getState().setActiveSection('experience');
      expect(useSuggestionStore.getState().activeSection).toBe('experience');
    });

    it('should set activeSection to null', () => {
      useSuggestionStore.getState().setActiveSection('experience');
      useSuggestionStore.getState().setActiveSection(null);
      expect(useSuggestionStore.getState().activeSection).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      useSuggestionStore.getState().setLoading(true);
      expect(useSuggestionStore.getState().loading).toBe(true);
    });

    it('should set loading to false', () => {
      useSuggestionStore.getState().setLoading(true);
      useSuggestionStore.getState().setLoading(false);
      expect(useSuggestionStore.getState().loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error', () => {
      useSuggestionStore.getState().setError('Something went wrong');
      expect(useSuggestionStore.getState().error).toBe('Something went wrong');
    });

    it('should set error to null', () => {
      useSuggestionStore.getState().setError('Error');
      useSuggestionStore.getState().setError(null);
      expect(useSuggestionStore.getState().error).toBeNull();
    });
  });

  describe('addSuggestions', () => {
    it('should add new suggestions to existing ones', () => {
      useSuggestionStore.getState().setSuggestions([createMockSuggestion({ id: 'sug-1' })]);
      useSuggestionStore.getState().addSuggestions([createMockSuggestion({ id: 'sug-2' })]);
      const state = useSuggestionStore.getState();
      expect(state.suggestions).toHaveLength(2);
    });

    it('should not add duplicate suggestions by id', () => {
      useSuggestionStore.getState().setSuggestions([createMockSuggestion({ id: 'sug-1' })]);
      useSuggestionStore.getState().addSuggestions([createMockSuggestion({ id: 'sug-1' })]);
      const state = useSuggestionStore.getState();
      expect(state.suggestions).toHaveLength(1);
    });

    it('should merge unique and skip duplicates', () => {
      useSuggestionStore.getState().setSuggestions([createMockSuggestion({ id: 'sug-1' })]);
      useSuggestionStore.getState().addSuggestions([
        createMockSuggestion({ id: 'sug-1' }),
        createMockSuggestion({ id: 'sug-2' }),
      ]);
      const state = useSuggestionStore.getState();
      expect(state.suggestions).toHaveLength(2);
    });
  });

  describe('applySuggestion', () => {
    it('should mark a suggestion as applied', () => {
      useSuggestionStore.getState().setSuggestions([createMockSuggestion({ id: 'sug-1' })]);
      useSuggestionStore.getState().applySuggestion('sug-1');
      const state = useSuggestionStore.getState();
      expect(state.suggestions[0].applied).toBe(true);
    });

    it('should not affect other suggestions', () => {
      useSuggestionStore.getState().setSuggestions([
        createMockSuggestion({ id: 'sug-1' }),
        createMockSuggestion({ id: 'sug-2' }),
      ]);
      useSuggestionStore.getState().applySuggestion('sug-1');
      const state = useSuggestionStore.getState();
      expect(state.suggestions[0].applied).toBe(true);
      expect(state.suggestions[1].applied).toBe(false);
    });

    it('should do nothing if suggestion id does not exist', () => {
      useSuggestionStore.getState().setSuggestions([createMockSuggestion({ id: 'sug-1' })]);
      useSuggestionStore.getState().applySuggestion('non-existent');
      const state = useSuggestionStore.getState();
      expect(state.suggestions[0].applied).toBe(false);
    });
  });

  describe('dismissSuggestion', () => {
    it('should remove a suggestion by id', () => {
      useSuggestionStore.getState().setSuggestions([
        createMockSuggestion({ id: 'sug-1' }),
        createMockSuggestion({ id: 'sug-2' }),
      ]);
      useSuggestionStore.getState().dismissSuggestion('sug-1');
      const state = useSuggestionStore.getState();
      expect(state.suggestions).toHaveLength(1);
      expect(state.suggestions[0].id).toBe('sug-2');
    });

    it('should do nothing if suggestion id does not exist', () => {
      useSuggestionStore.getState().setSuggestions([createMockSuggestion({ id: 'sug-1' })]);
      useSuggestionStore.getState().dismissSuggestion('non-existent');
      const state = useSuggestionStore.getState();
      expect(state.suggestions).toHaveLength(1);
    });
  });

  describe('clearSuggestions', () => {
    it('should clear all suggestions, activeSection, and error', () => {
      useSuggestionStore.getState().setSuggestions([createMockSuggestion()]);
      useSuggestionStore.getState().setActiveSection('experience');
      useSuggestionStore.getState().setError('error');
      useSuggestionStore.getState().clearSuggestions();
      const state = useSuggestionStore.getState();
      expect(state.suggestions).toEqual([]);
      expect(state.activeSection).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should preserve loading state', () => {
      useSuggestionStore.getState().setLoading(true);
      useSuggestionStore.getState().clearSuggestions();
      expect(useSuggestionStore.getState().loading).toBe(true);
    });
  });
});
