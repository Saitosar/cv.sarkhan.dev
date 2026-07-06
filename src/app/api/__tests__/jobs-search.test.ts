// src/app/api/__tests__/jobs-search.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock NextResponse before importing the route
const mockJson = vi.fn();
vi.mock('next/server', () => ({
  NextResponse: {
    json: (...args: unknown[]) => {
      mockJson(...args);
      return {
        json: () => Promise.resolve(args[0]),
        status: args[1]?.status || 200,
        ok: (args[1]?.status || 200) < 400,
      };
    },
  },
}));

// We'll test the route logic by importing and calling the handler
import { POST } from '../jobs/search/route';

describe('POST /api/jobs/search', () => {
  beforeEach(() => {
    mockJson.mockClear();
  });

  it('should return jobs for a valid query', async () => {
    const req = {
      json: () => Promise.resolve({ query: 'React frontend', location: '' }),
    } as Request;

    const response = await POST(req);
    const data = await response.json();

    expect(data.jobs).toBeDefined();
    expect(Array.isArray(data.jobs)).toBe(true);
    expect(data.jobs.length).toBeGreaterThan(0);
    expect(data.totalCount).toBeGreaterThan(0);
    expect(data.searchParams).toEqual({ query: 'React frontend', location: '' });
    expect(data.searchedAt).toBeGreaterThan(0);
  });

  it('should return 400 when query is missing', async () => {
    const req = {
      json: () => Promise.resolve({ location: '' }),
    } as Request;

    const response = await POST(req);
    const data = await response.json();

    expect(data.error).toBe('query is required');
    expect(response.status).toBe(400);
  });

  it('should return 400 when query is empty string', async () => {
    const req = {
      json: () => Promise.resolve({ query: '   ', location: '' }),
    } as Request;

    const response = await POST(req);
    const data = await response.json();

    expect(data.error).toBe('query is required');
    expect(response.status).toBe(400);
  });

  it('should return 400 when query is not a string', async () => {
    const req = {
      json: () => Promise.resolve({ query: 123, location: '' }),
    } as Request;

    const response = await POST(req);
    const data = await response.json();

    expect(data.error).toBe('query is required');
    expect(response.status).toBe(400);
  });

  it('should return jobs with matchScore between 40 and 98', async () => {
    const req = {
      json: () => Promise.resolve({ query: 'engineer', location: '' }),
    } as Request;

    const response = await POST(req);
    const data = await response.json();

    for (const job of data.jobs) {
      expect(job.matchScore).toBeGreaterThanOrEqual(40);
      expect(job.matchScore).toBeLessThanOrEqual(98);
    }
  });

  it('should return jobs with matchedSkills and missingSkills', async () => {
    const req = {
      json: () => Promise.resolve({ query: 'React TypeScript', location: '' }),
    } as Request;

    const response = await POST(req);
    const data = await response.json();

    for (const job of data.jobs) {
      expect(Array.isArray(job.matchedSkills)).toBe(true);
      expect(Array.isArray(job.missingSkills)).toBe(true);
    }
  });

  it('should return at most 5 jobs', async () => {
    const req = {
      json: () => Promise.resolve({ query: 'engineer', location: '' }),
    } as Request;

    const response = await POST(req);
    const data = await response.json();

    expect(data.jobs.length).toBeLessThanOrEqual(5);
  });

  it('should handle location parameter', async () => {
    const req = {
      json: () => Promise.resolve({ query: 'engineer', location: 'Berlin' }),
    } as Request;

    const response = await POST(req);
    const data = await response.json();

    expect(data.searchParams.location).toBe('Berlin');
  });

  it('should return 500 on unexpected error', async () => {
    const req = {
      json: () => {
        throw new Error('Unexpected parse error');
      },
    } as Request;

    const response = await POST(req);
    const data = await response.json();

    expect(data.error).toBe('Unexpected parse error');
    expect(response.status).toBe(500);
  });

  it('should derive matchedSkills from query', async () => {
    const req = {
      json: () => Promise.resolve({ query: 'React frontend TypeScript', location: '' }),
    } as Request;

    const response = await POST(req);
    const data = await response.json();

    // At least one job should have React or TypeScript in matchedSkills
    const allSkills = data.jobs.flatMap((j: { matchedSkills: string[] }) => j.matchedSkills);
    expect(allSkills.some((s: string) => s === 'React' || s === 'TypeScript')).toBe(true);
  });
});
