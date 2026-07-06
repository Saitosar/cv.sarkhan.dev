// src/mcp-server/tools/analyze-resume.ts
//
// analyze_resume_section tool — placeholder section analysis.

import { TOOLS } from '../config';
import { loadResumeData } from '../lib/load-data';
import type { SectionType } from '@/types/chat';
import type { MCPTool } from '../types';

export const analyzeResumeSectionTool: MCPTool = {
  name: TOOLS.ANALYZE_RESUME_SECTION,
  description: 'Analyze a specific resume section and return ATS-focused improvement tips.',
  inputSchema: {
    type: 'object',
    properties: {
      section: {
        type: 'string',
        description: 'Resume section to analyze (summary, experience, education, skills, certifications, languages, projects, general).',
      },
    },
    required: ['section'],
  },
};

const ALLOWED_SECTIONS: SectionType[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'certifications',
  'languages',
  'projects',
  'general',
];

export function callAnalyzeResumeSection(params: Record<string, unknown>): { text: string } {
  const rawSection = typeof params.section === 'string' ? params.section : '';
  const section = rawSection as SectionType;

  if (!ALLOWED_SECTIONS.includes(section)) {
    throw new Error(`Unknown section: "${rawSection}". Allowed: ${ALLOWED_SECTIONS.join(', ')}`);
  }

  const { resume, ats } = loadResumeData();
  const sectionScore = ats.sections?.find((s) => s.section === section);

  const analysis = {
    section,
    score: sectionScore?.score ?? null,
    weight: sectionScore?.weight ?? null,
    issues: sectionScore?.issues ?? [],
    resumeSnippet: pickSnippet(resume, section),
    tips: getTips(section),
  };

  return {
    text: JSON.stringify(analysis, null, 2),
  };
}

function pickSnippet(resume: ReturnType<typeof loadResumeData>['resume'], section: SectionType): unknown {
  switch (section) {
    case 'summary':
      return resume.summary;
    case 'experience':
      return resume.experience.slice(0, 2);
    case 'education':
      return resume.education.slice(0, 1);
    case 'skills':
      return resume.skills.slice(0, 5);
    case 'certifications':
      return resume.certifications.slice(0, 2);
    case 'languages':
      return resume.languages?.slice(0, 2) ?? [];
    case 'projects':
      return resume.projects?.slice(0, 2) ?? [];
    default:
      return null;
  }
}

function getTips(section: SectionType): string[] {
  switch (section) {
    case 'summary':
      return [
        'Keep it under 3–4 lines.',
        'Mention years of experience and top relevant skills.',
        'Add one measurable outcome if possible.',
      ];
    case 'experience':
      return [
        'Start bullets with strong action verbs.',
        'Quantify impact whenever possible.',
        'Mirror keywords from target job descriptions.',
      ];
    case 'education':
      return ['List degrees in reverse chronological order.', 'Include GPA only if it strengthens the profile.'];
    case 'skills':
      return ['Use exact tool names from job postings.', 'Group skills by category for ATS parsers.'];
    case 'certifications':
      return ['Include issuer and date.', 'Add credential URL or ID when available.'];
    case 'languages':
      return ['Use standardized proficiency levels (e.g. CEFR or ILR).'];
    case 'projects':
      return ['Describe technologies and outcomes.', 'Link to live demos or repositories.'];
    default:
      return ['Ensure consistent formatting and plain ASCII contact characters.'];
  }
}
