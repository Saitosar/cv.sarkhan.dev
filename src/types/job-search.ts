// src/types/job-search.ts

// ── Job Listing ──

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  postedDate?: string;
  url?: string;
  source?: string;
}

// ── Search ──

export interface JobSearchQuery {
  query: string;
  location: string;
}

export interface JobSearchResult {
  jobs: JobListing[];
  totalCount: number;
  searchParams: JobSearchQuery;
  searchedAt: number;
}

// ── AI Scoring Result ──

export interface MatchScore {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
}

// ── Component Props ──

export interface JobSearchPanelProps {
  className?: string;
}

export interface JobSearchFormProps {
  query: string;
  location: string;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: (params: JobSearchQuery) => void;
  isLoading: boolean;
}

export interface JobCardProps {
  job: JobListing;
  onSelect?: (job: JobListing) => void;
}

export interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md';
}
