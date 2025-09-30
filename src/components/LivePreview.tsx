// src/components/LivePreview.tsx
"use client";

// forwardRef БОЛЬШЕ НЕ НУЖЕН
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import type { TemplateName } from './TemplateSelector';
import { type ResumeFormData } from '@/lib/validators';
import { placeholderResume, type ResumeData } from '@/lib/placeholder-data';
import type { ColorScheme } from '@/lib/palettes';
import type { Theme } from './ThemeToggle';

type SimplePreviewData = { result: string };

interface LivePreviewProps {
  data: ResumeFormData | SimplePreviewData | null;
  template: TemplateName;
  accentColor: ColorScheme;
  theme: Theme;
}

function isResumeFormData(data: any): data is ResumeFormData {
  return data && typeof data === 'object' && 'fullName' in data;
}

// --- ИЗМЕНЕНИЕ: Убираем обертку forwardRef ---
export function LivePreview({ data, template, accentColor, theme }: LivePreviewProps) {
    
  let resumeContent: ResumeData;

  if (isResumeFormData(data)) {
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
        company: exp.company,
        position: exp.position,
        description: exp.description,
        startDate: {
          month: exp.startDate?.month || '',
          year: exp.startDate?.year || '',
        },
        endDate: {
          month: exp.endDate?.month,
          year: exp.endDate?.year,
          isCurrent: exp.endDate?.isCurrent,
        },
      })) || [],
      projects: data.projects?.map(proj => ({
        name: proj.name,
        description: proj.description,
        technologies: proj.technologies,
      })) || [],
      education: data.education?.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        years: edu.years,
      })) || [],
      languages: data.languages?.filter(lang => lang.language && lang.proficiency) || [],
      skills: data.skills?.map(item => item.value).filter(Boolean) || [],
      achievements: data.achievements?.map(item => item.value).filter(Boolean) || [],
      certifications: data.certifications?.map(item => item.value).filter(Boolean) || [],
      trainings: data.trainings?.map(item => item.value).filter(Boolean) || [],
    };
  } else if (data && 'result' in data) {
    resumeContent = {
      ...placeholderResume,
      summary: data.result,
    };
  } else {
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
    // --- ИЗМЕНЕНИЕ: ref убран, но класс для печати ОСТАЕТСЯ ---
    <div className="w-full bg-white rounded-lg shadow-2xl overflow-hidden resume-print-container">
      <div className="w-full h-full origin-top-left overflow-y-auto custom-scrollbar">
        {renderTemplate()}
      </div>
    </div>
  );
}