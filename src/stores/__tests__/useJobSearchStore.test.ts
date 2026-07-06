// src/stores/__tests__/useJobSearchStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useJobSearchStore } from '../useJobSearchStore';
import type { JobSearchResult } from '@/types/job-search';

function createMockResult(overrides?: Partial<JobSearchResult>): JobSearchResult {
  return {
    jobs: [
      {
        id: 'job-1',
        title: 'Senior Full Stack Engineer',
        company: 'Nexus Labs',
        location: 'Remote (US)',
        salary: '$150K-$200K',
        description: 'Lead product engineering...',
        matchScore: 85,
        matchedSkills: ['React', 'TypeScript'],
        missingSkills: ['Go'],
        postedDate: '2026-06-28',
        source: 'linkedin',
      },
    ],
    totalCount: 1,
    searchParams: { query: 'engineer', location: 'remote' },
    searchedAt: Date.now(),
    ...overrides,
  };
}

describe('useJobSearchStore', () => {
  beforeEach(() => {
    useJobSearchStore.setState({
      query: '',
      location: '',
      results: [],
      totalCount: 0,
      isLoading: false,
      error: null,
      lastSearchedAt: null,
    });
  });

  describe('default state', () => {
    it('should have empty query and location', () => {
      const state = useJobSearchStore.getState();
      expect(state.query).toBe('');
      expect(state.location).toBe('');
    });

    it('should have empty results', () => {
      const state = useJobSearchStore.getState();
      expect(state.results).toEqual([]);
      expect(state.totalCount).toBe(0);
    });

    it('should have isLoading as false', () => {
      expect(useJobSearchStore.getState().isLoading).toBe(false);
    });

    it('should have error as null', () => {
      expect(useJobSearchStore.getState().error).toBeNull();
    });

    it('should have lastSearchedAt as null', () => {
      expect(useJobSearchStore.getState().lastSearchedAt).toBeNull();
    });
  });

  describe('setQuery', () => {
    it('should set query', () => {
      useJobSearchStore.getState().setQuery('react developer');
      expect(useJobSearchStore.getState().query).toBe('react developer');
    });

    it('should set query to empty string', () => {
      useJobSearchStore.getState().setQuery('something');
      useJobSearchStore.getState().setQuery('');
      expect(useJobSearchStore.getState().query).toBe('');
    });
  });

  describe('setLocation', () => {
    it('should set location', () => {
      useJobSearchStore.getState().setLocation('Remote');
      expect(useJobSearchStore.getState().location).toBe('Remote');
    });
  });

  describe('setResults', () => {
    it('should set results, totalCount, and lastSearchedAt', () => {
      const result = createMockResult();
      useJobSearchStore.getState().setResults(result);
      const state = useJobSearchStore.getState();
      expect(state.results).toHaveLength(1);
      expect(state.results[0].title).toBe('Senior Full Stack Engineer');
      expect(state.totalCount).toBe(1);
      expect(state.lastSearchedAt).toBe(result.searchedAt);
    });

    it('should clear error when setting results', () => {
      useJobSearchStore.getState().setError('Previous error');
      useJobSearchStore.getState().setResults(createMockResult());
      expect(useJobSearchStore.getState().error).toBeNull();
    });

    it('should set empty results', () => {
      const result = createMockResult({ jobs: [], totalCount: 0 });
      useJobSearchStore.getState().setResults(result);
      const state = useJobSearchStore.getState();
      expect(state.results).toEqual([]);
      expect(state.totalCount).toBe(0);
    });
  });

  describe('setLoading', () => {
    it('should set isLoading to true', () => {
      useJobSearchStore.getState().setLoading(true);
      expect(useJobSearchStore.getState().isLoading).toBe(true);
    });

    it('should set isLoading to false', () => {
      useJobSearchStore.getState().setLoading(true);
      useJobSearchStore.getState().setLoading(false);
      expect(useJobSearchStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error', () => {
      useJobSearchStore.getState().setError('Network error');
      expect(useJobSearchStore.getState().error).toBe('Network error');
    });

    it('should set error to null', () => {
      useJobSearchStore.getState().setError('Error');
      useJobSearchStore.getState().setError(null);
      expect(useJobSearchStore.getState().error).toBeNull();
    });
  });

  describe('clearResults', () => {
    it('should clear results, totalCount, error, and lastSearchedAt', () => {
      useJobSearchStore.getState().setResults(createMockResult());
      useJobSearchStore.getState().setError('error');
      useJobSearchStore.getState().clearResults();
      const state = useJobSearchStore.getState();
      expect(state.results).toEqual([]);
      expect(state.totalCount).toBe(0);
      expect(state.error).toBeNull();
      expect(state.lastSearchedAt).toBeNull();
    });

    it('should preserve query and location', () => {
      useJobSearchStore.getState().setQuery('engineer');
      useJobSearchStore.getState().setLocation('remote');
      useJobSearchStore.getState().clearResults();
      const state = useJobSearchStore.getState();
      expect(state.query).toBe('engineer');
      expect(state.location).toBe('remote');
    });
  });
});
