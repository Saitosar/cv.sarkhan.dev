// src/components/LivePreview.tsx
"use client";

import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import type { TemplateName } from './TemplateSelector';
import { resumeSchema } from '@/lib/validators';
import { placeholderResume, type ResumeData as ResumeDataForTemplate } from '@/lib/placeholder-data';
import type { z } from 'zod';
import type { ColorScheme } from '@/lib/palettes';
import type { Theme } from './ThemeToggle';

// Тип данных, приходящих с основной формы создания
type ResumeDataFromForm = z.infer<typeof resumeSchema>;
// Тип данных со страниц update/import
type SimplePreviewData = { result: string };

interface LivePreviewProps {
  data: ResumeDataFromForm | SimplePreviewData | null;
  template: TemplateName;
  accentColor: ColorScheme;
  theme: Theme;
}

// Вспомогательная функция для проверки типа данных
function isResumeFormData(data: any): data is ResumeDataFromForm {
  return data && typeof data === 'object' && 'fullName' in data;
}

export function LivePreview({ data, template, accentColor, theme }: LivePreviewProps) {
  
  let resumeContent: ResumeDataForTemplate;

  if (isResumeFormData(data)) {
    // Если это полные данные из формы, преобразуем их
    resumeContent = {
      fullName: data.fullName || '',
      jobTitle: data.jobTitle || '',
      summary: data.summary || '',
      contact: {
        email: data.contact?.email || '',
        phone: data.contact?.phone || '',
        linkedin: data.contact?.linkedin || '',
      },
      experience: data.experience?.map(exp => ({ ...exp, description: exp.description || '' })) || [],
      projects: data.projects?.map(proj => ({ ...proj, description: proj.description || '', technologies: proj.technologies || '' })) || [],
      education: data.education?.map(edu => ({ ...edu, years: edu.years || '' })) || [],
      languages: data.languages || [],
      skills: data.skills?.map(item => item.value).filter(Boolean) || [],
      achievements: data.achievements?.map(item => item.value).filter(Boolean) || [],
      certifications: data.certifications?.map(item => item.value).filter(Boolean) || [],
      trainings: data.trainings?.map(item => item.value).filter(Boolean) || [],
    };
  } else if (data && 'result' in data) {
    // Если это простые данные со страниц update/import, используем placeholder и меняем только summary
    resumeContent = {
      ...placeholderResume,
      summary: data.result,
    };
  } else {
    // Если данных нет, показываем стандартный placeholder
    resumeContent = placeholderResume;
  }

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
    <div id="resume-preview-content" className="w-full bg-white rounded-lg shadow-2xl overflow-hidden">
      <div className="w-full h-full origin-top-left overflow-y-auto custom-scrollbar">
        {renderTemplate()}
      </div>
    </div>
  );
}