import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { JobListing, JobSearchQuery, JobSearchResult } from '@/types/job-search';

export interface JobSearchState {
  query: string;
  location: string;
  results: JobListing[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  lastSearchedAt: number | null;

  // Actions
  setQuery: (query: string) => void;
  setLocation: (location: string) => void;
  setResults: (result: JobSearchResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
}

export const useJobSearchStore = create<JobSearchState>()(
  devtools(
    (set) => ({
      query: '',
      location: '',
      results: [],
      totalCount: 0,
      isLoading: false,
      error: null,
      lastSearchedAt: null,

      setQuery: (query) => set({ query }),
      setLocation: (location) => set({ location }),
      setResults: (result) =>
        set({
          results: result.jobs,
          totalCount: result.totalCount,
          lastSearchedAt: result.searchedAt,
          error: null,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearResults: () =>
        set({
          results: [],
          totalCount: 0,
          error: null,
          lastSearchedAt: null,
        }),
    }),
    { name: 'JobSearchStore' }
  )
);
