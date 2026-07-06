// src/components/__tests__/JobCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JobCard from '../JobSearch/JobCard';
import type { JobListing } from '@/types/job-search';

function createJob(overrides?: Partial<JobListing>): JobListing {
  return {
    id: 'job-1',
    title: 'Senior Full Stack Engineer',
    company: 'Nexus Labs',
    location: 'Remote (US)',
    salary: '$150K-$200K',
    description: 'Lead product engineering for a high-growth fintech platform.',
    matchScore: 85,
    matchedSkills: ['React', 'TypeScript'],
    missingSkills: ['Go'],
    postedDate: '2026-06-28',
    source: 'linkedin',
    ...overrides,
  };
}

describe('JobCard', () => {
  it('should render job title and company', () => {
    const job = createJob();
    render(<JobCard job={job} />);
    expect(screen.getByText('Senior Full Stack Engineer')).toBeInTheDocument();
    expect(screen.getByText('Nexus Labs')).toBeInTheDocument();
  });

  it('should render location, salary, and posted date', () => {
    const job = createJob();
    render(<JobCard job={job} />);
    expect(screen.getByText(/Remote \(US\)/)).toBeInTheDocument();
    expect(screen.getByText(/\$150K-\$200K/)).toBeInTheDocument();
    expect(screen.getByText(/2026-06-28/)).toBeInTheDocument();
  });

  it('should render description', () => {
    const job = createJob();
    render(<JobCard job={job} />);
    expect(
      screen.getByText('Lead product engineering for a high-growth fintech platform.')
    ).toBeInTheDocument();
  });

  it('should render matched skills', () => {
    const job = createJob({ matchedSkills: ['React', 'TypeScript'] });
    render(<JobCard job={job} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('should render missing skills', () => {
    const job = createJob({ missingSkills: ['Go'] });
    render(<JobCard job={job} />);
    expect(screen.getByText('Go')).toBeInTheDocument();
  });

  it('should render match score badge', () => {
    const job = createJob({ matchScore: 85 });
    render(<JobCard job={job} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn();
    const job = createJob();
    render(<JobCard job={job} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(job);
  });

  it('should not fail when onSelect is not provided', () => {
    const job = createJob();
    render(<JobCard job={job} />);
    fireEvent.click(screen.getByRole('button'));
    // Should not throw
  });

  it('should render without location', () => {
    const job = createJob({ location: '' });
    render(<JobCard job={job} />);
    expect(screen.queryByText(/MapPin/)).not.toBeInTheDocument();
  });

  it('should render without salary', () => {
    const job = createJob({ salary: '' });
    render(<JobCard job={job} />);
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });

  it('should render without postedDate', () => {
    const job = createJob({ postedDate: undefined });
    render(<JobCard job={job} />);
    expect(screen.queryByText(/Calendar/)).not.toBeInTheDocument();
  });

  it('should render with empty matched and missing skills', () => {
    const job = createJob({ matchedSkills: [], missingSkills: [] });
    render(<JobCard job={job} />);
    expect(screen.getByText('Senior Full Stack Engineer')).toBeInTheDocument();
  });
});
