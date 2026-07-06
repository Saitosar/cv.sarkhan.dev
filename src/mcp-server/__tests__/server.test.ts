// src/mcp-server/__tests__/server.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPServer } from '../server';
import { MCP_ERROR_CODES } from '../types';
import type { JSONRPCRequest } from '../types';

// Mock loadResumeData to avoid filesystem dependency
vi.mock('../lib/load-data', () => ({
  loadResumeData: vi.fn(() => ({
    resume: {
      id: 'resume-1',
      fullName: 'Alex Mercer',
      jobTitle: 'Senior Full Stack Engineer',
      location: 'San Francisco, CA',
      contact: {
        email: 'alex.mercer@example.com',
        phone: '+1 (415) 555-0199',
        linkedin: 'https://linkedin.com/in/alexmercer',
      },
      summary: 'Results-driven Senior Full Stack Engineer with 8+ years of experience.',
      experience: [
        {
          id: 'exp-1',
          company: 'Nexus Labs',
          position: 'Senior Full Stack Engineer',
          startDate: { month: '03', year: '2022' },
          endDate: { month: '', year: '', isCurrent: true },
          description: 'Lead product engineering.',
          highlights: ['Reduced page load time by 40%'],
        },
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'UC Berkeley',
          degree: 'BS',
          field: 'CS',
          startYear: '2011',
          endYear: '2015',
        },
      ],
      skills: [
        { id: 'sk-1', name: 'TypeScript', category: 'Languages', level: 'expert' },
      ],
      certifications: [],
      achievements: [],
      trainings: [],
      languages: [],
      projects: [],
      targetJob: { title: 'Senior Full Stack Engineer', description: '' },
    },
    ats: {
      overall: 87,
      breakdown: { keywords: 90, formatting: 85, completeness: 88, readability: 84 },
      sections: [
        { section: 'summary', score: 85, weight: 0.15, issues: ['Summary is strong'] },
        { section: 'experience', score: 90, weight: 0.35, issues: ['Add quantifiable metrics'] },
      ],
      suggestions: ['Add more measurable outcomes'],
      matchedKeywords: ['TypeScript', 'React'],
      missingKeywords: ['Kubernetes'],
      lastAnalyzed: 1720411200000,
    },
  })),
}));

// Mock search-jobs tool to avoid importing from @/lib/jobs/search-service
vi.mock('../tools/search-jobs', async () => {
  const actual = await vi.importActual('../tools/search-jobs');
  return {
    ...actual,
    callSearchJobs: vi.fn((params: Record<string, unknown>) => {
      const query = typeof params.query === 'string' ? params.query : '';
      if (!query.trim()) {
        throw new Error('Missing required parameter: "query".');
      }
      return {
        text: JSON.stringify({
          jobs: [
            {
              id: 'job-1',
              title: 'Senior React Engineer',
              company: 'TechCorp',
              location: 'Remote',
              matchScore: 85,
            },
          ],
          total: 1,
          query,
          searchedAt: Date.now(),
        }),
      };
    }),
  };
});

function makeRequest(method: string, params?: Record<string, unknown>, id: string | number = 1): JSONRPCRequest {
  return { jsonrpc: '2.0', id, method, params };
}

describe('MCPServer', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer();
  });

  describe('initialize', () => {
    it('should return server info and capabilities', () => {
      const response = server.handleRequest(makeRequest('initialize'));
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toEqual({
        protocolVersion: '2024-11-05',
        capabilities: { resources: {}, tools: {} },
        serverInfo: { name: 'cv-mcp-server', version: '1.0.0' },
      });
    });
  });

  describe('resources/list', () => {
    it('should return all registered resources', () => {
      server.handleRequest(makeRequest('initialize'));
      const response = server.handleRequest(makeRequest('resources/list'));
      const resources = (response.result as { resources: unknown[] }).resources;
      expect(resources).toHaveLength(3);
      const uris = resources.map((r) => (r as { uri: string }).uri);
      expect(uris).toContain('resume://current');
      expect(uris).toContain('ats://score');
      expect(uris).toContain('chat://history');
    });
  });

  describe('resources/read', () => {
    beforeEach(() => {
      server.handleRequest(makeRequest('initialize'));
    });

    it('should read resume://current', () => {
      const response = server.handleRequest(makeRequest('resources/read', { uri: 'resume://current' }));
      const contents = (response.result as { contents: unknown[] }).contents;
      expect(contents).toHaveLength(1);
      expect((contents[0] as { uri: string }).uri).toBe('resume://current');
      const text = JSON.parse((contents[0] as { text: string }).text);
      expect(text.fullName).toBe('Alex Mercer');
    });

    it('should read ats://score', () => {
      const response = server.handleRequest(makeRequest('resources/read', { uri: 'ats://score' }));
      const contents = (response.result as { contents: unknown[] }).contents;
      expect(contents).toHaveLength(1);
      const text = JSON.parse((contents[0] as { text: string }).text);
      expect(text.overall).toBe(87);
    });

    it('should read chat://history', () => {
      const response = server.handleRequest(makeRequest('resources/read', { uri: 'chat://history' }));
      const contents = (response.result as { contents: unknown[] }).contents;
      expect(contents).toHaveLength(1);
      const text = JSON.parse((contents[0] as { text: string }).text);
      expect(text).toHaveLength(3);
      expect(text[0].role).toBe('assistant');
    });

    it('should return error for unknown resource URI', () => {
      const response = server.handleRequest(makeRequest('resources/read', { uri: 'resume://unknown' }));
      expect(response.error).toBeDefined();
      expect(response.error!.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS);
      expect(response.error!.message).toContain('Unknown resource URI');
    });

    it('should return error for missing uri parameter', () => {
      const response = server.handleRequest(makeRequest('resources/read', {}));
      expect(response.error).toBeDefined();
      expect(response.error!.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS);
      expect(response.error!.message).toContain('Missing or invalid "uri"');
    });
  });

  describe('tools/list', () => {
    it('should return all registered tools', () => {
      server.handleRequest(makeRequest('initialize'));
      const response = server.handleRequest(makeRequest('tools/list'));
      const tools = (response.result as { tools: unknown[] }).tools;
      expect(tools).toHaveLength(4);
      const names = tools.map((t) => (t as { name: string }).name);
      expect(names).toContain('get_resume');
      expect(names).toContain('get_ats_score');
      expect(names).toContain('search_jobs');
      expect(names).toContain('analyze_resume_section');
    });
  });

  describe('tools/call', () => {
    beforeEach(() => {
      server.handleRequest(makeRequest('initialize'));
    });

    it('should call get_resume', () => {
      const response = server.handleRequest(makeRequest('tools/call', { name: 'get_resume', arguments: {} }));
      const content = (response.result as { content: { text: string }[] }).content;
      expect(content).toHaveLength(1);
      const text = JSON.parse(content[0].text);
      expect(text.fullName).toBe('Alex Mercer');
    });

    it('should call get_resume with section filter', () => {
      const response = server.handleRequest(
        makeRequest('tools/call', { name: 'get_resume', arguments: { section: 'summary' } })
      );
      const content = (response.result as { content: { text: string }[] }).content;
      const text = JSON.parse(content[0].text);
      expect(text).toBe('Results-driven Senior Full Stack Engineer with 8+ years of experience.');
    });

    it('should call get_ats_score', () => {
      const response = server.handleRequest(makeRequest('tools/call', { name: 'get_ats_score', arguments: {} }));
      const content = (response.result as { content: { text: string }[] }).content;
      const text = JSON.parse(content[0].text);
      expect(text.overall).toBe(87);
    });

    it('should call search_jobs', () => {
      const response = server.handleRequest(
        makeRequest('tools/call', { name: 'search_jobs', arguments: { query: 'React Engineer' } })
      );
      const content = (response.result as { content: { text: string }[] }).content;
      const text = JSON.parse(content[0].text);
      expect(text.jobs).toHaveLength(1);
      expect(text.jobs[0].title).toBe('Senior React Engineer');
    });

    it('should call analyze_resume_section', () => {
      const response = server.handleRequest(
        makeRequest('tools/call', { name: 'analyze_resume_section', arguments: { section: 'summary' } })
      );
      const content = (response.result as { content: { text: string }[] }).content;
      const text = JSON.parse(content[0].text);
      expect(text.section).toBe('summary');
      expect(text.score).toBe(85);
      expect(text.tips).toBeDefined();
      expect(text.tips.length).toBeGreaterThan(0);
    });

    it('should return error for unknown tool name', () => {
      const response = server.handleRequest(
        makeRequest('tools/call', { name: 'unknown_tool', arguments: {} })
      );
      expect(response.error).toBeDefined();
      expect(response.error!.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS);
      expect(response.error!.message).toContain('Unknown tool');
    });

    it('should return error for missing name parameter', () => {
      const response = server.handleRequest(makeRequest('tools/call', {}));
      expect(response.error).toBeDefined();
      expect(response.error!.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS);
      expect(response.error!.message).toContain('Missing or invalid "name"');
    });
  });

  describe('error handling', () => {
    it('should return SERVER_NOT_INITIALIZED error before initialize', () => {
      const response = server.handleRequest(makeRequest('resources/list'));
      expect(response.error).toBeDefined();
      expect(response.error!.code).toBe(MCP_ERROR_CODES.SERVER_NOT_INITIALIZED);
      expect(response.error!.message).toContain('Server not initialized');
    });

    it('should return METHOD_NOT_FOUND for unknown method', () => {
      server.handleRequest(makeRequest('initialize'));
      const response = server.handleRequest(makeRequest('unknown_method'));
      expect(response.error).toBeDefined();
      expect(response.error!.code).toBe(MCP_ERROR_CODES.METHOD_NOT_FOUND);
      expect(response.error!.message).toContain('Method not found');
    });

    it('should handle invalid arguments type', () => {
      server.handleRequest(makeRequest('initialize'));
      const response = server.handleRequest(
        makeRequest('tools/call', { name: 'get_resume', arguments: 'not-an-object' })
      );
      expect(response.error).toBeDefined();
      expect(response.error!.code).toBe(MCP_ERROR_CODES.INVALID_PARAMS);
      expect(response.error!.message).toContain('Invalid "arguments"');
    });
  });
});
