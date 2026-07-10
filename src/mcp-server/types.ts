import { z } from 'zod';

export const RESUME_SCHEMA = z.object({
  basics: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    url: z.string().url().optional(),
    summary: z.string().optional(),
  }).optional(),
  skills: z.array(z.object({
    name: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    keywords: z.array(z.string()).optional(),
  })).optional(),
  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    current: z.boolean().optional(),
    summary: z.string().optional(),
    highlights: z.array(z.string()).optional(),
  })).optional(),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    gpa: z.string().optional(),
  })).optional(),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    url: z.string().url().optional(),
    technologies: z.array(z.string()).optional(),
    highlights: z.array(z.string()).optional(),
  })).optional(),
  certificates: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    url: z.string().url().optional(),
  })).optional(),
  languages: z.array(z.object({
    language: z.string(),
    fluency: z.enum(['native', 'fluent', 'advanced', 'intermediate', 'basic']).optional(),
  })).optional(),
});

export type Resume = z.infer<typeof RESUME_SCHEMA>;

export interface TokenValidationResult {
  valid: boolean;
  user?: { id: string; plan: string };
  error?: 'unauthorized' | 'expired' | 'revoked' | 'rate_limited';
  retryAfter?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export interface ServerInfo {
  name: string;
  version: string;
}

export interface ServerCapabilities {
  resources: any;
  tools: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  mimeType?: string;
  description?: string;
}

export interface MCPResourceContent {
  uri: string;
  text: string;
  mimeType?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}
