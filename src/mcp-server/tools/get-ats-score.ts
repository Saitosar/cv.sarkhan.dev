// src/mcp-server/tools/get-ats-score.ts
//
// get_ats_score tool — returns the ATS score from data/resume.json.

import { TOOLS } from '../config';
import { loadResumeData } from '../lib/load-data';
import type { MCPTool } from '../types';

export const getATSScoreTool: MCPTool = {
  name: TOOLS.GET_ATS_SCORE,
  description: 'Return the current ATS compatibility score and breakdown.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export function callGetATSScore(_params: Record<string, unknown>): { text: string } {
  const { ats } = loadResumeData();
  return {
    text: JSON.stringify(ats, null, 2),
  };
}
