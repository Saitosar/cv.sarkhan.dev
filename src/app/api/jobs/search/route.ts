import { NextResponse } from 'next/server';
import { searchJobs } from '@/lib/jobs/search-service';
import type { JobSearchQuery, JobSearchResult, JobListing } from '@/types/job-search';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, location } = body as Partial<JobSearchQuery>;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }

    const searchParams: JobSearchQuery = {
      query: query.trim(),
      location: typeof location === 'string' ? location.trim() : '',
    };

    const searchResult = searchJobs(searchParams);

    // For Phase 4 we return deterministic mock scores.
    // Phase 5 will integrate the AI Router to score each job against the resume.
    const jobs: JobListing[] = searchResult.jobs.map((job, index) => ({
      ...job,
      id: `${job.id}-${index}`,
      // Seed plausible mock values so the UI has data to display.
      matchScore: Math.max(40, Math.min(98, 92 - index * 8)),
      matchedSkills: deriveMatchedSkills(searchParams.query),
      missingSkills: deriveMissingSkills(searchParams.query, index),
    }));

    const result: JobSearchResult = {
      jobs,
      totalCount: jobs.length,
      searchParams,
      searchedAt: Date.now(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Jobs Search] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to search jobs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function deriveMatchedSkills(query: string): string[] {
  const q = query.toLowerCase();
  const skills: string[] = [];
  if (q.includes('react') || q.includes('frontend')) skills.push('React');
  if (q.includes('node') || q.includes('backend')) skills.push('Node.js');
  if (q.includes('typescript') || q.includes('ts')) skills.push('TypeScript');
  if (q.includes('python')) skills.push('Python');
  if (q.includes('aws') || q.includes('cloud')) skills.push('AWS');
  if (q.includes('kubernetes') || q.includes('k8s')) skills.push('Kubernetes');
  if (q.includes('docker')) skills.push('Docker');
  if (q.includes('sql') || q.includes('data')) skills.push('SQL');
  if (skills.length === 0) skills.push('JavaScript');
  return skills.slice(0, 4);
}

function deriveMissingSkills(query: string, index: number): string[] {
  const q = query.toLowerCase();
  const candidates: string[] = [];
  if (!q.includes('go')) candidates.push('Go');
  if (!q.includes('rust')) candidates.push('Rust');
  if (!q.includes('java')) candidates.push('Java');
  if (!q.includes('aws')) candidates.push('AWS');
  if (!q.includes('terraform')) candidates.push('Terraform');
  if (!q.includes('ml')) candidates.push('Machine Learning');
  if (!q.includes('mobile')) candidates.push('React Native');

  const start = (index * 2) % Math.max(1, candidates.length);
  const end = Math.min(candidates.length, start + 2);
  return candidates.slice(start, end).length > 0
    ? candidates.slice(start, end)
    : ['Domain-specific tooling'];
}
