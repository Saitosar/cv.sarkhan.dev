// src/components/__tests__/JobSearchPanel.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobSearchPanel from '../JobSearch/JobSearchPanel';
import { useJobSearchStore } from '@/stores/useJobSearchStore';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

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
  mockFetch.mockReset();
});

describe('JobSearchPanel', () => {
  it('should render the panel header', () => {
    render(<JobSearchPanel />);
    expect(screen.getByText('Job Search')).toBeInTheDocument();
    expect(
      screen.getByText('Find roles matched to your resume')
    ).toBeInTheDocument();
  });

  it('should show empty state when no results', () => {
    render(<JobSearchPanel />);
    expect(
      screen.getByText('Search for jobs')
    ).toBeInTheDocument();
  });

  it('should render the search form', () => {
    render(<JobSearchPanel />);
    expect(screen.getByLabelText('Job query')).toBeInTheDocument();
    expect(screen.getByLabelText('Job location')).toBeInTheDocument();
  });

  it('should show loading skeletons when isLoading and no results', () => {
    useJobSearchStore.setState({ isLoading: true, results: [] });
    const { container } = render(<JobSearchPanel />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render job results when available', () => {
    useJobSearchStore.setState({
      results: [
        {
          id: 'job-1',
          title: 'Senior Full Stack Engineer',
          company: 'Nexus Labs',
          location: 'Remote (US)',
          salary: '$150K-$200K',
          description: 'Lead product engineering...',
          matchScore: 85,
          matchedSkills: ['React'],
          missingSkills: ['Go'],
          postedDate: '2026-06-28',
          source: 'linkedin',
        },
      ],
      totalCount: 1,
    });
    render(<JobSearchPanel />);
    expect(screen.getByText('Senior Full Stack Engineer')).toBeInTheDocument();
    expect(screen.getByText('1 jobs found')).toBeInTheDocument();
  });

  it('should show error state with retry button', () => {
    useJobSearchStore.setState({ error: 'Network error' });
    render(<JobSearchPanel />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should call fetch on search and update results', async () => {
    const mockResults = {
      jobs: [
        {
          id: 'job-1',
          title: 'Senior Full Stack Engineer',
          company: 'Nexus Labs',
          location: 'Remote (US)',
          salary: '$150K-$200K',
          description: 'Lead product engineering...',
          matchScore: 85,
          matchedSkills: ['React'],
          missingSkills: ['Go'],
          postedDate: '2026-06-28',
          source: 'linkedin',
        },
      ],
      totalCount: 1,
      searchParams: { query: 'engineer', location: '' },
      searchedAt: Date.now(),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResults),
    });

    useJobSearchStore.setState({ query: 'engineer' });
    render(<JobSearchPanel />);

    // Submit the form
    const form = screen.getByRole('button', { name: /search/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'engineer', location: '' }),
      });
    });
  });

  it('should show error when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    useJobSearchStore.setState({ query: 'engineer' });
    render(<JobSearchPanel />);

    const form = screen.getByRole('button', { name: /search/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should show error when fetch returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'query is required' }),
    });

    useJobSearchStore.setState({ query: 'engineer' });
    render(<JobSearchPanel />);

    const form = screen.getByRole('button', { name: /search/i }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('query is required')).toBeInTheDocument();
    });
  });
});
