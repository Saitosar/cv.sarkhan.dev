// src/lib/jobs/__tests__/search-service.test.ts
import { describe, it, expect } from 'vitest';
import { searchJobs } from '../search-service';
import type { JobSearchQuery } from '@/types/job-search';

describe('searchJobs', () => {
  it('should return matching jobs for a relevant query', () => {
    const result = searchJobs({ query: 'React TypeScript frontend', location: '' });
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.totalCount).toBeGreaterThan(0);
    // Should match Staff Frontend Developer, UX Engineer, etc.
    const titles = result.jobs.map((j) => j.title);
    expect(titles.some((t) => t.toLowerCase().includes('frontend'))).toBe(true);
  });

  it('should return jobs sorted by matchScore descending', () => {
    const result = searchJobs({ query: 'engineer', location: '' });
    for (let i = 1; i < result.jobs.length; i++) {
      expect(result.jobs[i - 1].matchScore).toBeGreaterThanOrEqual(result.jobs[i].matchScore);
    }
  });

  it('should return at most 5 results', () => {
    const result = searchJobs({ query: 'engineer', location: '' });
    expect(result.jobs.length).toBeLessThanOrEqual(5);
  });

  it('should return empty results for a completely unrelated query', () => {
    const result = searchJobs({ query: 'zzzxyznonexistent', location: '' });
    expect(result.jobs).toEqual([]);
    expect(result.totalCount).toBe(0);
  });

  it('should handle empty query gracefully', () => {
    const result = searchJobs({ query: '', location: '' });
    // Empty query returns all jobs with matchScore 1 (all pass > 0.25)
    expect(result.jobs.length).toBeGreaterThan(0);
  });

  it('should handle partial matches', () => {
    const result = searchJobs({ query: 'Go backend', location: '' });
    // Should match Senior Backend Engineer (Go) and possibly others
    expect(result.jobs.length).toBeGreaterThan(0);
    const titles = result.jobs.map((j) => j.title);
    expect(titles.some((t) => t.toLowerCase().includes('backend'))).toBe(true);
  });

  it('should include searchParams in the result', () => {
    const query: JobSearchQuery = { query: 'react', location: 'remote' };
    const result = searchJobs(query);
    expect(result.searchParams).toEqual(query);
  });

  it('should return jobs with matchScore between 0 and 100', () => {
    const result = searchJobs({ query: 'developer', location: '' });
    for (const job of result.jobs) {
      expect(job.matchScore).toBeGreaterThanOrEqual(0);
      expect(job.matchScore).toBeLessThanOrEqual(100);
    }
  });

  it('should match DevOps query to DevOps Engineer', () => {
    const result = searchJobs({ query: 'DevOps Kubernetes', location: '' });
    const titles = result.jobs.map((j) => j.title);
    expect(titles.some((t) => t.toLowerCase().includes('devops'))).toBe(true);
  });

  it('should match data query to Data Engineer', () => {
    const result = searchJobs({ query: 'data engineer SQL', location: '' });
    const titles = result.jobs.map((j) => j.title);
    expect(titles.some((t) => t.toLowerCase().includes('data'))).toBe(true);
  });

  it('should handle location filter in query text', () => {
    const result = searchJobs({ query: 'engineer', location: 'Berlin' });
    // Location is part of search params but not used in filtering (Phase 4)
    expect(result.searchParams.location).toBe('Berlin');
  });
});
