// src/components/LivePreview.tsx
"use client";

import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { type TemplateName } from './TemplateSelector';
import { resumeSchema } from '@/lib/validators';
import { placeholderResume, type ResumeData as ResumeDataForTemplate } from '@/lib/placeholder-data';
import type { z } from 'zod';
import type { ColorScheme } from '@/lib/palettes';
import type { Theme } from './ThemeToggle';

type ResumeDataFromForm = z.infer<typeof resumeSchema>;

interface LivePreviewProps {
  data: ResumeDataFromForm | null;
  template: TemplateName;
  accentColor: ColorScheme;
  theme: Theme;
}

export function LivePreview({ data, template, accentColor, theme }: LivePreviewProps) {
  
  let resumeContent: ResumeDataForTemplate;

  if (data) {
    // --- ГЛАВНОЕ ИСПРАВЛЕНИЕ ---
    // Мы не просто подставляем значения, а преобразуем каждую секцию,
    // чтобы гарантировать соответствие всех полей.
    resumeContent = {
      fullName: data.fullName || '',
      jobTitle: data.jobTitle || '',
      summary: data.summary || '',
      // Гарантируем наличие всех полей в 'contact'
      contact: {
        email: data.contact?.email || '',
        phone: data.contact?.phone || '',
        linkedin: data.contact?.linkedin || '',
      },
      // Проходим по каждому элементу массива и добавляем недостающие поля
      experience: data.experience?.map(exp => ({
        ...exp,
        description: exp.description || '',
      })) || [],
      projects: data.projects?.map(proj => ({
        ...proj,
        description: proj.description || '',
        technologies: proj.technologies || '',
      })) || [],
      education: data.education?.map(edu => ({
        ...edu,
        years: edu.years || '',
      })) || [],
      languages: data.languages || [],
      skills: data.skills?.map(item => item.value) || [],
      achievements: data.achievements?.map(item => item.value) || [],
      certifications: data.certifications?.map(item => item.value) || [],
      trainings: data.trainings?.map(item => item.value) || [],
    };
  } else {
    resumeContent = placeholderResume;
  }
  // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

  const renderTemplate = () => {
    switch (template) {
      case "Современный":
        return <ModernTemplate resume={resumeContent} accentColor={accentColor} />;
      case "Креативный":
        return <CreativeTemplate resume={resumeContent} accentColor={accentColor} theme={theme} />;
      case "Классический":
      default:
        return <ClassicTemplate resume={resumeContent} accentColor={accentColor} />;
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-2xl overflow-hidden -m-4">
      <div className="w-full h-full scale-[0.9] origin-top-left overflow-y-auto">
        {renderTemplate()}
      </div>
    </div>
  );
}