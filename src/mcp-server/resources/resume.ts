// src/mcp-server/resources/resume.ts
//
// resume://current resource — returns full resume data from data/resume.json.

import { RESOURCES } from '../config';
import { loadResumeData } from '../lib/load-data';
import type { MCPResource, MCPResourceContent } from '../types';

export const resumeResource: MCPResource = {
  uri: RESOURCES.RESUME_CURRENT,
  name: 'Current Resume',
  mimeType: 'application/json',
  description: 'Full resume data including contact, experience, education, skills, and projects.',
};

export function readResume(): MCPResourceContent[] {
  const { resume } = loadResumeData();
  return [
    {
      uri: RESOURCES.RESUME_CURRENT,
      text: JSON.stringify(resume, null, 2),
      mimeType: 'application/json',
    },
  ];
}
