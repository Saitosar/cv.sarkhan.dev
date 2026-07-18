// src/lib/resume-utils.ts
//
// Shared resume formatting helpers and re-exports used by templates and PDF renderers.
// Keep this file free of personal / placeholder data — only utilities and types.

import type {
  ResumeData,
  Experience,
  Project,
  Education,
  Language,
} from '@/types/resume';

export type { ResumeData, Experience, Project, Education, Language };

export function formatExperienceDate(job: Experience): string {
  if (!job.startDate?.month || !job.startDate?.year) return '';

  const start = `${job.startDate.month} ${job.startDate.year}`;

  if (job.endDate?.isCurrent) {
    return `${start} - Present`;
  }

  if (job.endDate?.month && job.endDate?.year) {
    return `${start} - ${job.endDate.month} ${job.endDate.year}`;
  }

  return start;
}
