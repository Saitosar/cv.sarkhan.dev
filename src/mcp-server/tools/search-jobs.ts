// src/mcp-server/tools/search-jobs.ts
//
// search_jobs tool — searches mock job listings by query and optional location.

import { TOOLS } from '../config';
import { searchJobs } from '@/lib/jobs/search-service';
import type { MCPTool } from '../types';

export const searchJobsTool: MCPTool = {
  name: TOOLS.SEARCH_JOBS,
  description: 'Search mock job listings by query and optional location.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Job search query (e.g. "Senior React Engineer").',
      },
      location: {
        type: 'string',
        description: 'Optional location filter (e.g. "Remote" or "Berlin").',
      },
    },
    required: ['query'],
  },
};

export function callSearchJobs(params: Record<string, unknown>): { text: string } {
  const query = typeof params.query === 'string' ? params.query : '';
  const location = typeof params.location === 'string' ? params.location : '';

  if (!query.trim()) {
    throw new Error('Missing required parameter: "query".');
  }

  const result = searchJobs({ query: query.trim(), location: location.trim() });
  return {
    text: JSON.stringify(
      {
        ...result,
        searchedAt: Date.now(),
      },
      null,
      2
    ),
  };
}
