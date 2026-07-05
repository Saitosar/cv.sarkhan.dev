// src/types/resume.ts
//
// ResumeData — публичный тип, совместимый с существующими компонентами
// (CreateResumeForm, LivePreview, ClassicTemplate, ATSScoreCard и др.)
// Rich-типы (Skill, Certification, RichEducation) — для внутреннего использования
// в store и AI-адаптере.

// ── Contact ──
export interface Contact {
  email: string;
  phone: string;
  linkedin?: string;
}

// ── Experience ──
// `id` optional to stay compatible with existing form components (react-hook-form field arrays)
export interface Experience {
  id?: string;
  company: string;
  position: string;
  location?: string;
  startDate: { month: string; year: string };
  endDate?: { month?: string; year?: string; isCurrent?: boolean };
  description?: string;
  highlights?: string[];
}

// ── Education (существующая структура) ──
export interface Education {
  institution: string;
  degree: string;
  years?: string;
}

// ── Rich Education (для store/AI, с id и деталями) ──
export interface RichEducation {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  gpa?: string;
}

// ── Skill (существующая структура) ──
export interface SkillEntry {
  value: string;
}

// ── Rich Skill (для store/AI) ──
export interface Skill {
  id: string;
  name: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// ── Certification (существующая структура) ──
export interface CertificationEntry {
  value: string;
}

// ── Rich Certification (для store/AI) ──
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

// ── Achievement / Training (существующая структура) ──
export interface AchievementEntry {
  value: string;
}

export interface TrainingEntry {
  value: string;
}

// ── Language ──
export interface Language {
  language: string;
  proficiency: string;
}

// ── Project ──
export interface Project {
  id?: string;
  name: string;
  description?: string;
  technologies?: string;
  url?: string;
}

// ── ResumeData (публичный тип, совместим с существующим кодом) ──
export interface ResumeData {
  id?: string;
  fullName: string;
  jobTitle: string;
  contact: Contact;
  location?: string;
  github?: string;
  website?: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: SkillEntry[];
  certifications: CertificationEntry[];
  achievements: AchievementEntry[];
  trainings: TrainingEntry[];
  languages?: Language[];
  projects?: Project[];
  targetJob?: {
    title?: string;
    description?: string;
  };
}

// ── ResumeStoreData (внутренний тип store с rich-полями) ──
export interface ResumeStoreData {
  id?: string;
  fullName: string;
  jobTitle: string;
  contact: Contact;
  location?: string;
  github?: string;
  website?: string;
  summary: string;
  experience: Experience[];
  education: RichEducation[];
  skills: Skill[];
  certifications: Certification[];
  achievements: AchievementEntry[];
  trainings: TrainingEntry[];
  languages?: Language[];
  projects?: Project[];
  targetJob?: {
    title?: string;
    description?: string;
  };
}

// ── Adapter: преобразование между ResumeData и ResumeStoreData ──
export function resumeDataToStore(data: ResumeData): ResumeStoreData {
  return {
    ...data,
    education: data.education.map((e, i) => ({
      id: `edu-${i}`,
      institution: e.institution,
      degree: e.degree,
      field: undefined,
      startYear: undefined,
      endYear: e.years,
    })),
    skills: data.skills.map((s, i) => ({
      id: `sk-${i}`,
      name: s.value,
    })),
    certifications: data.certifications.map((c, i) => ({
      id: `cert-${i}`,
      name: c.value,
      issuer: '',
    })),
  };
}

export function storeToResumeData(data: ResumeStoreData): ResumeData {
  return {
    ...data,
    education: data.education.map((e) => ({
      institution: e.institution,
      degree: e.degree,
      years: e.endYear || `${e.startYear || ''} - ${e.endYear || ''}`,
    })),
    skills: data.skills.map((s) => ({ value: s.name })),
    certifications: data.certifications.map((c) => ({ value: c.name })),
  };
}
