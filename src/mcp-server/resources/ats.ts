// src/mcp-server/resources/ats.ts
//
// ats://score resource — returns ATS score breakdown from data/resume.json.

import { RESOURCES } from '../config';
import { loadResumeData } from '../lib/load-data';
import type { MCPResource, MCPResourceContent } from '../types';

export const atsResource: MCPResource = {
  uri: RESOURCES.ATS_SCORE,
  name: 'ATS Score',
  mimeType: 'application/json',
  description: 'ATS compatibility score with breakdown, suggestions, matched and missing keywords.',
};

export function readATSScore(): MCPResourceContent[] {
  const { ats } = loadResumeData();
  return [
    {
      uri: RESOURCES.ATS_SCORE,
      text: JSON.stringify(ats, null, 2),
      mimeType: 'application/json',
    },
  ];
}
