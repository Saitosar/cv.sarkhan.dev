// src/components/LivePreview.tsx
"use client";

import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { type TemplateName } from './TemplateSelector';
import { resumeSchema } from '@/lib/validators';
import { placeholderResume, type ResumeData } from '@/lib/placeholder-data'; // Используем экспортированный тип ResumeData
import type { z } from 'zod';
import type { ColorScheme } from '@/lib/palettes';
import type { Theme } from './ThemeToggle';

type ResumeDataFromForm = z.infer<typeof resumeSchema>;

// ResumeDataForTemplate теперь просто ссылается на ResumeData из placeholder-data.ts
type ResumeDataForTemplate = ResumeData;

interface LivePreviewProps {
  data: ResumeDataFromForm | null;
  template: TemplateName;
  accentColor: ColorScheme;
  theme: Theme;
}

// --- НОВАЯ ФУНКЦИЯ ДЛЯ КОНВЕРТАЦИИ ДАТЫ (ДЛЯ ШАБЛОНОВ) ---
const formatExperienceYears = (exp: any): string => {
  // Проверяем, что exp.startDate существует перед доступом к его свойствам
  const start = exp.startDate ? `${exp.startDate.month} ${exp.startDate.year}`.trim() : '';
  
  if (exp.endDate?.isCurrent) {
    return `${start} - Present`;
  }
  
  if (exp.endDate?.month && exp.endDate?.year) {
    return `${start} - ${exp.endDate.month} ${exp.endDate.year}`;
  }
  
  if (exp.endDate?.year) {
    return `${start} - ${exp.endDate.year}`;
  }
  
  if (exp.startDate?.year) {
    return start;
  }

  return 'Date range missing';
};
// ------------------------------------------


export function LivePreview({ data, template, accentColor, theme }: LivePreviewProps) {
  
  let resumeContent: ResumeDataForTemplate;

  if (data) {
    // Преобразование данных формы в формат, ожидаемый шаблонами
    resumeContent = {
      fullName: data.fullName || '',
      jobTitle: data.jobTitle || '',
      summary: data.summary || '',
      contact: {
        email: data.contact?.email || '',
        phone: data.contact?.phone || '',
        linkedin: data.contact?.linkedin || '',
      },
      experience: data.experience?.map(exp => ({
        // ...exp включает startDate и endDate
        ...exp,
        years: formatExperienceYears(exp), // Форматированная строка 'years'
        description: exp.description || '',
        // Убедимся, что все поля, ожидаемые в ResumeData, присутствуют
        startDate: { month: exp.startDate.month, year: exp.startDate.year },
        endDate: exp.endDate || {},
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
    } as ResumeDataForTemplate;
    
  } else {
    // Используем placeholderResume
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
    <div className="w-full bg-white rounded-lg shadow-2xl overflow-hidden">
      <div className="w-full h-full origin-top-left overflow-y-auto custom-scrollbar">
        {renderTemplate()}
      </div>
    </div>
  );
}
