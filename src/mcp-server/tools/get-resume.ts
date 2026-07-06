// src/mcp-server/tools/get-resume.ts
//
// get_resume tool — returns the full resume or a requested section.

import { TOOLS } from '../config';
import { loadResumeData } from '../lib/load-data';
import type { ResumeStoreData } from '@/types/resume';
import type { MCPTool } from '../types';

const ALLOWED_SECTIONS = [
  'summary',
  'experience',
  'education',
  'skills',
  'certifications',
  'achievements',
  'trainings',
  'languages',
  'projects',
  'targetJob',
  'contact',
  'fullName',
  'jobTitle',
  'location',
  'github',
  'website',
] as const;

type ResumeSection = (typeof ALLOWED_SECTIONS)[number];

export const getResumeTool: MCPTool = {
  name: TOOLS.GET_RESUME,
  description: 'Return the current resume data. Optionally return a single section by name.',
  inputSchema: {
    type: 'object',
    properties: {
      section: {
        type: 'string',
        description: `Optional section name. Allowed: ${ALLOWED_SECTIONS.join(', ')}`,
      },
    },
  },
};

export function callGetResume(params: Record<string, unknown>): { text: string } {
  const { resume } = loadResumeData();
  const section = typeof params.section === 'string' ? (params.section as ResumeSection) : undefined;

  if (section && !isAllowedSection(section)) {
    throw new Error(`Unknown resume section: "${section}". Allowed sections: ${ALLOWED_SECTIONS.join(', ')}`);
  }

  const payload = section ? resume[section] : resume;

  return {
    text: JSON.stringify(payload ?? null, null, 2),
  };
}

function isAllowedSection(value: string): value is ResumeSection {
  return ALLOWED_SECTIONS.includes(value as ResumeSection);
}
