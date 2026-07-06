// src/lib/jobs/search-service.ts

import type { JobSearchQuery, JobSearchResult, JobListing } from '@/types/job-search';
import { MOCK_JOBS } from './mock-data';

const MAX_RESULTS = 5;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function keywordMatches(query: string, job: JobListing): number {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (terms.length === 0) return 1;

  const jobText = normalize(`${job.title} ${job.company} ${job.description}`);
  let matches = 0;
  for (const term of terms) {
    if (jobText.includes(term)) matches += 1;
  }
  return matches / terms.length;
}

export function searchJobs(query: JobSearchQuery): Omit<JobSearchResult, 'searchedAt'> {
  const filtered = MOCK_JOBS.filter((job) => {
    const relevance = keywordMatches(query.query, job);
    return relevance > 0.25;
  })
    .map((job) => ({
      ...job,
      // Base relevance score used until AI scoring is applied
      matchScore: Math.round(keywordMatches(query.query, job) * 100),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, MAX_RESULTS);

  return {
    jobs: filtered,
    totalCount: filtered.length,
    searchParams: query,
  };
}
