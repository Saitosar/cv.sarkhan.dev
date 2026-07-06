'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { JobSearchFormProps } from '@/types/job-search';
import { Search, MapPin } from 'lucide-react';

export default function JobSearchForm({
  query,
  location,
  onQueryChange,
  onLocationChange,
  onSearch,
  isLoading,
}: JobSearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch({ query: query.trim(), location: location.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c7c7]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Job title"
          aria-label="Job query"
          className={cn(
            'w-full bg-[#1c1b1b] border border-[rgba(255,255,255,0.08)] rounded-xl',
            'pl-10 pr-4 py-3 text-sm text-[#e5e2e1] placeholder:text-[#c4c7c7]',
            'focus:outline-none focus:border-[#d2bbff]'
          )}
        />
      </div>
      <div className="flex-1 relative">
        <MapPin
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c7c7]"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Location or remote"
          aria-label="Job location"
          className={cn(
            'w-full bg-[#1c1b1b] border border-[rgba(255,255,255,0.08)] rounded-xl',
            'pl-10 pr-4 py-3 text-sm text-[#e5e2e1] placeholder:text-[#c4c7c7]',
            'focus:outline-none focus:border-[#d2bbff]'
          )}
        />
      </div>
      <button
        type="submit"
        disabled={!query.trim() || isLoading}
        className={cn(
          'px-6 py-3 rounded-xl text-sm font-medium transition-colors',
          'bg-[#6001d1] text-white hover:bg-[#6001d1]/90',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
