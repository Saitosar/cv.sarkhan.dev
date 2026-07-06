'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { JobSearchPanelProps } from '@/types/job-search';
import JobSearchForm from './JobSearchForm';
import JobCard from './JobCard';
import { useJobSearchStore } from '@/stores/useJobSearchStore';
import { Briefcase, RefreshCw } from 'lucide-react';

export default function JobSearchPanel({ className }: JobSearchPanelProps) {
  const query = useJobSearchStore((s) => s.query);
  const location = useJobSearchStore((s) => s.location);
  const results = useJobSearchStore((s) => s.results);
  const totalCount = useJobSearchStore((s) => s.totalCount);
  const isLoading = useJobSearchStore((s) => s.isLoading);
  const error = useJobSearchStore((s) => s.error);
  const setQuery = useJobSearchStore((s) => s.setQuery);
  const setLocation = useJobSearchStore((s) => s.setLocation);
  const setResults = useJobSearchStore((s) => s.setResults);
  const setLoading = useJobSearchStore((s) => s.setLoading);
  const setError = useJobSearchStore((s) => s.setError);

  const handleSearch = React.useCallback(
    async (params: { query: string; location: string }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/jobs/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        setResults(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to search jobs';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setResults]
  );

  return (
    <div
      className={cn(
        'flex flex-col h-full glass-panel rounded-2xl overflow-hidden',
        className
      )}
    >
      <div className="p-6 border-b border-[rgba(255,255,255,0.08)] bg-[#141313]/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#6001d1]/20 flex items-center justify-center border border-[#d2bbff]/30">
            <Briefcase size={16} className="text-[#d2bbff]" />
          </div>
          <div>
            <h2 className="text-lg text-[#e5e2e1]">Job Search</h2>
            <p className="text-[11px] text-[#c4c7c7]">Find roles matched to your resume</p>
          </div>
        </div>

        <JobSearchForm
          query={query}
          location={location}
          onQueryChange={setQuery}
          onLocationChange={setLocation}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="mb-4 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => handleSearch({ query, location })}
                className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-white"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          </div>
        )}

        {isLoading && results.length === 0 && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-[#1c1b1b]/40 animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && results.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <Briefcase size={40} className="text-[#c4c7c7] mb-4 opacity-50" />
            <p className="text-sm text-[#c4c7c7] max-w-[260px]">Search for jobs</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-[#c4c7c7] mb-1">
              <span>{totalCount} jobs found</span>
            </div>
            {results.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
