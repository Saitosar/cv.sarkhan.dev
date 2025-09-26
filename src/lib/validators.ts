// src/lib/validators.ts
import { z } from 'zod';

export const resumeSchema = z.object({
  // --- ДОБАВЛЕННЫЕ ПОЛЯ ---
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters."),
  
  // --- СТАРЫЕ ПОЛЯ ---
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  contact: z.object({
    email: z.string().email("Invalid email address."),
    phone: z.string().optional(),
    linkedin: z.string().url("Invalid URL.").optional(),
  }),
  experience: z.array(z.object({
    company: z.string().min(1, "Company name is required."),
    position: z.string().min(1, "Position is required."),
    years: z.string().min(1, "Years are required."),
    description: z.string().optional(),
  })).optional(),
  projects: z.array(z.object({
    name: z.string().min(1, "Project name is required."),
    description: z.string().optional(),
    technologies: z.string().optional(),
  })).optional(),
  education: z.array(z.object({
    institution: z.string().min(1, "Institution is required."),
    degree: z.string().min(1, "Degree is required."),
    years: z.string().optional(),
  })).optional(),
  skills: z.array(z.object({
    value: z.string().min(1, "Skill cannot be empty."),
  })).optional(),
  languages: z.array(z.object({
    language: z.string().min(1, "Language is required."),
    proficiency: z.string().min(1, "Proficiency is required."),
  })).optional(),
  achievements: z.array(z.object({
    value: z.string().min(1, "Achievement cannot be empty."),
  })).optional(),
  trainings: z.array(z.object({
    value: z.string().min(1, "Training cannot be empty."),
  })).optional(),
  certifications: z.array(z.object({
    value: z.string().min(1, "Certification cannot be empty."),
  })).optional(),
});