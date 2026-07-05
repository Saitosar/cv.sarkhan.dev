// src/stores/__tests__/useATSStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useATSStore } from '../useATSStore';
import type { ATSScore, ATSSuggestion } from '@/types/ats';

function createMockScore(overrides?: Partial<ATSScore>): ATSScore {
  return {
    overall: 75,
    breakdown: {
      keywords: 70,
      formatting: 80,
      completeness: 75,
      readability: 75,
    },
    suggestions: [],
    matchedKeywords: ['react', 'typescript'],
    missingKeywords: ['python', 'aws'],
    lastAnalyzed: Date.now(),
    ...overrides,
  };
}

function createMockSuggestion(overrides?: Partial<ATSSuggestion>): ATSSuggestion {
  return {
    id: 'sug-1',
    section: 'summary',
    severity: 'high',
    message: 'Add more keywords',
    applied: false,
    ...overrides,
  };
}

describe('useATSStore', () => {
  beforeEach(() => {
    useATSStore.setState({
      score: null,
      isAnalyzing: false,
      lastAnalyzed: null,
    });
  });

  describe('setScore', () => {
    it('should set the score', () => {
      const score = createMockScore();
      useATSStore.getState().setScore(score);
      const state = useATSStore.getState();
      expect(state.score).toEqual(score);
    });

    it('should set lastAnalyzed timestamp', () => {
      const before = Date.now();
      useATSStore.getState().setScore(createMockScore());
      const after = Date.now();
      const state = useATSStore.getState();
      expect(state.lastAnalyzed).toBeGreaterThanOrEqual(before);
      expect(state.lastAnalyzed).toBeLessThanOrEqual(after);
    });
  });

  describe('addSuggestion', () => {
    it('should add a suggestion when score exists', () => {
      useATSStore.getState().setScore(createMockScore({ suggestions: [] }));
      const suggestion = createMockSuggestion();
      useATSStore.getState().addSuggestion(suggestion);
      const state = useATSStore.getState();
      expect(state.score!.suggestions).toHaveLength(1);
    });

    it('should do nothing if score is null', () => {
      const suggestion = createMockSuggestion();
      useATSStore.getState().addSuggestion(suggestion);
      expect(useATSStore.getState().score).toBeNull();
    });
  });

  describe('applySuggestion', () => {
    it('should mark a suggestion as applied', () => {
      useATSStore.getState().setScore(createMockScore({ suggestions: [] }));
      useATSStore.getState().addSuggestion(createMockSuggestion({ id: 'sug-1' }));
      useATSStore.getState().applySuggestion('sug-1');
      const state = useATSStore.getState();
      const sug = state.score!.suggestions[0] as ATSSuggestion;
      expect(sug.applied).toBe(true);
    });

    it('should do nothing if score is null', () => {
      useATSStore.getState().applySuggestion('sug-1');
      expect(useATSStore.getState().score).toBeNull();
    });

    it('should do nothing if suggestion id does not exist', () => {
      useATSStore.getState().setScore(createMockScore({ suggestions: [] }));
      useATSStore.getState().addSuggestion(createMockSuggestion({ id: 'sug-1' }));
      useATSStore.getState().applySuggestion('non-existent');
      const state = useATSStore.getState();
      const sug = state.score!.suggestions[0] as ATSSuggestion;
      expect(sug.applied).toBe(false);
    });
  });

  describe('dismissSuggestion', () => {
    it('should remove a suggestion by id', () => {
      useATSStore.getState().setScore(createMockScore({ suggestions: [] }));
      useATSStore.getState().addSuggestion(createMockSuggestion({ id: 'sug-1' }));
      useATSStore.getState().addSuggestion(createMockSuggestion({ id: 'sug-2' }));
      useATSStore.getState().dismissSuggestion('sug-1');
      const state = useATSStore.getState();
      const suggestions = state.score!.suggestions as ATSSuggestion[];
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].id).toBe('sug-2');
    });

    it('should do nothing if score is null', () => {
      useATSStore.getState().dismissSuggestion('sug-1');
      expect(useATSStore.getState().score).toBeNull();
    });
  });

  describe('setSectionScore', () => {
    it('should update a section score when sections exist', () => {
      useATSStore.getState().setScore(createMockScore({
        sections: [
          { section: 'summary', score: 50, weight: 0.3, issues: ['too short'] },
        ],
      }));
      useATSStore.getState().setSectionScore('summary', 80, ['looks good']);
      const state = useATSStore.getState();
      expect(state.score!.sections![0].score).toBe(80);
      expect(state.score!.sections![0].issues).toEqual(['looks good']);
    });

    it('should do nothing if score is null', () => {
      useATSStore.getState().setSectionScore('summary', 80, []);
      expect(useATSStore.getState().score).toBeNull();
    });
  });

  describe('setIsAnalyzing', () => {
    it('should set isAnalyzing to true', () => {
      useATSStore.getState().setIsAnalyzing(true);
      expect(useATSStore.getState().isAnalyzing).toBe(true);
    });

    it('should set isAnalyzing to false', () => {
      useATSStore.getState().setIsAnalyzing(true);
      useATSStore.getState().setIsAnalyzing(false);
      expect(useATSStore.getState().isAnalyzing).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useATSStore.getState().setScore(createMockScore());
      useATSStore.getState().setIsAnalyzing(true);
      useATSStore.getState().reset();
      const state = useATSStore.getState();
      expect(state.score).toBeNull();
      expect(state.isAnalyzing).toBe(false);
      expect(state.lastAnalyzed).toBeNull();
    });
  });
});
