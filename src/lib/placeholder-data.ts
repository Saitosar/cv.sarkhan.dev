// src/lib/placeholder-data.ts
//
// Generic sample resume data used for preview / demo states only.
// No real personal information — replace at runtime with the user's own data.

import type {
  ResumeData,
  Experience,
  Project,
  Education,
  Language,
} from '@/types/resume';

export type { ResumeData, Experience, Project, Education, Language };
export { formatExperienceDate } from './resume-utils';

export const placeholderResume: ResumeData = {
  fullName: 'Sample Candidate',
  jobTitle: 'Senior Frontend Engineer',
  summary:
    'Results-driven frontend engineer with 7+ years of experience building scalable web applications, design systems, and AI-powered user interfaces.',
  contact: {
    email: 'candidate@example.com',
    phone: '+1 (555) 000-0000',
    linkedin: 'linkedin.com/in/samplecandidate',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Example Tech Inc.',
      position: 'Senior Frontend Engineer',
      startDate: { month: 'Jan', year: '2021' },
      endDate: { isCurrent: true },
      description:
        'Led the development of a high-traffic SaaS platform, improving core web vitals by 35% and establishing a reusable component library adopted by 8 product teams.',
    },
    {
      id: 'exp-2',
      company: 'Another Startup LLC',
      position: 'Frontend Developer',
      startDate: { month: 'Jun', year: '2018' },
      endDate: { month: 'Dec', year: '2020' },
      description:
        'Built responsive customer-facing features with React and TypeScript, collaborated with product designers to implement accessible UI patterns.',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Open Source Component Library',
      description:
        'Published a TypeScript-first UI kit focused on accessibility and theming, used by 1,000+ weekly downloads.',
      technologies: 'React, TypeScript, Tailwind CSS, Storybook',
    },
  ],
  education: [
    {
      institution: 'University of Example',
      degree: 'B.S. in Computer Science',
      years: '2014 - 2018',
    },
  ],
  skills: [
    { value: 'React' },
    { value: 'TypeScript' },
    { value: 'Next.js' },
    { value: 'Tailwind CSS' },
    { value: 'Node.js' },
  ],
  languages: [
    { language: 'English', proficiency: 'Fluent' },
  ],
  achievements: [
    { value: 'Speaker at Example Frontend Conference 2023' },
  ],
  trainings: [
    { value: 'Accessibility and Inclusive Design (2022)' },
  ],
  certifications: [
    { value: 'AWS Certified Cloud Practitioner' },
  ],
};
