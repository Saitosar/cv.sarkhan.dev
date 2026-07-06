// src/mcp-server/config.ts
//
// Static configuration for the standalone MCP server.

import type { ServerCapabilities, ServerInfo } from './types';

export const SERVER_NAME = 'cv-mcp-server';
export const SERVER_VERSION = '1.0.0';
export const PROTOCOL_VERSION = '2024-11-05';

export const serverInfo: ServerInfo = {
  name: SERVER_NAME,
  version: SERVER_VERSION,
};

export const serverCapabilities: ServerCapabilities = {
  resources: {},
  tools: {},
};

/** Absolute-ish path relative to the project root for the shared resume data file. */
export const RESUME_DATA_PATH = './data/resume.json';

/** Resource URIs exposed by this server. */
export const RESOURCES = {
  RESUME_CURRENT: 'resume://current',
  ATS_SCORE: 'ats://score',
  CHAT_HISTORY: 'chat://history',
} as const;

/** Tool names exposed by this server. */
export const TOOLS = {
  GET_RESUME: 'get_resume',
  GET_ATS_SCORE: 'get_ats_score',
  SEARCH_JOBS: 'search_jobs',
  ANALYZE_RESUME_SECTION: 'analyze_resume_section',
} as const;
