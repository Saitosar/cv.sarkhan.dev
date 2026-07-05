// src/lib/schemas/resume.ts
import { z } from 'zod';

export const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(5),
  linkedin: z.string().url().optional(),
});

export const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  startDate: z.object({
    month: z.string().min(1),
    year: z.string().min(4),
  }),
  endDate: z.object({
    month: z.string().optional(),
    year: z.string().optional(),
    isCurrent: z.boolean().optional(),
  }).optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  years: z.string().optional(),
});

export const skillEntrySchema = z.object({
  value: z.string().min(1),
});

export const certificationEntrySchema = z.object({
  value: z.string().min(1),
});

export const achievementEntrySchema = z.object({
  value: z.string().min(1),
});

export const trainingEntrySchema = z.object({
  value: z.string().min(1),
});

// ResumeData schema — совместим с существующими компонентами
export const resumeSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2),
  jobTitle: z.string().min(2),
  contact: contactSchema,
  location: z.string().optional(),
  github: z.string().optional(),
  website: z.string().url().optional(),
  summary: z.string().min(10),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillEntrySchema).optional(),
  certifications: z.array(certificationEntrySchema).optional(),
  achievements: z.array(achievementEntrySchema).optional(),
  trainings: z.array(trainingEntrySchema).optional(),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.string(),
  })).optional(),
  projects: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    technologies: z.string().optional(),
    url: z.string().url().optional(),
  })).optional(),
  targetJob: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

export type ResumeFormData = z.infer<typeof resumeSchema>;

export const resumeStoreSchema = resumeSchema.extend({
  education: z.array(z.object({
    id: z.string(),
    institution: z.string().min(1),
    degree: z.string().min(1),
    field: z.string().optional(),
    startYear: z.string().optional(),
    endYear: z.string().optional(),
    gpa: z.string().optional(),
  })).optional(),
  skills: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    category: z.string().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  })).optional(),
  certifications: z.array(z.object({
    id: z.string(),
    name: z.string().min(1),
    issuer: z.string().min(1),
    date: z.string().optional(),
    url: z.string().url().optional(),
  })).optional(),
});

export type ResumeStoreFormData = z.infer<typeof resumeStoreSchema>;
