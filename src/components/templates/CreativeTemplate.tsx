// src/components/templates/CreativeTemplate.tsx

import type { ColorScheme } from "@/lib/palettes";
import type { Theme } from "@/components/ThemeToggle";

interface ResumeData {
  summary?: string;
  contact?: {
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  experience?: Array<{
    company?: string;
    position?: string;
    years?: string;
    description?: string;
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    years?: string;
  }>;
  skills?: string[];
  languages?: Array<{
    language?: string;
    proficiency?: string;
  }>;
  achievements?: string[];
  trainings?: string[];
  certifications?: string[];
}

export function CreativeTemplate({ resume, accentColor, theme }: { resume: ResumeData, accentColor: ColorScheme, theme: Theme }) {

  // Определяем классы и стили в зависимости от темы
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const subTextColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const sectionBg = isDark ? 'bg-black bg-opacity-20' : 'bg-gray-50';

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-bold border-b pb-1 mb-4" style={{ borderColor: accentColor.primary }}>
      {children}
    </h2>
  );

  return (
    <div className={`${bgColor} ${textColor} p-8 font-mono relative overflow-hidden transition-colors duration-300`}>
      {isDark && <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-2xl" style={{ backgroundColor: accentColor.primary }}></div>}
      
      {/* --- Header --- */}
      <h1 className="text-4xl font-bold text-center mb-2" style={{ color: accentColor.primary }}>{resume.summary?.split(':')[0]}</h1>
      <p className={`text-center mb-6 ${subTextColor}`}>{resume.summary?.split(':')[1]?.split('\n')[0]}</p>
      <div className={`text-center text-xs mb-8 ${subTextColor}`} style={{ color: accentColor.primary }}>
        {resume.contact?.email} // {resume.contact?.linkedin}
      </div>

      {/* --- Experience --- */}
      <SectionTitle>EXPERIENCE.log</SectionTitle>
      {resume.experience?.map((job, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg" style={{ color: accentColor.primary }}> {job.position}</h3>
          <p className={`text-sm pl-4 ${subTextColor}`}>{job.company} -- [{job.years}]</p>
          <p className="text-sm mt-1 pl-4">{job.description}</p>
        </div>
      ))}

      {/* --- Projects (ИСПРАВЛЕНО) --- */}
      <SectionTitle>PROJECTS.md</SectionTitle>
      {resume.projects?.map((project, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg" style={{ color: accentColor.primary }}># {project.name}</h3>
          <p className={`text-sm mt-1 pl-4 ${subTextColor}`}>- {project.description}</p>
          <p className={`text-xs mt-1 pl-4 ${sectionBg} rounded p-1 inline-block`}>`{project.technologies}`</p>
        </div>
      ))}
      
      {/* --- Education (ДОБАВЛЕНО) --- */}
      <SectionTitle>EDUCATION.txt</SectionTitle>
      {resume.education?.map((edu, index) => (
        <p key={index} className={`text-sm mb-2 ${subTextColor}`}>* {edu.degree} at {edu.institution} ({edu.years})</p>
      ))}

      {/* --- Skills (ДОБАВЛЕНО) --- */}
      <SectionTitle>SKILLS.csv</SectionTitle>
      <p className={`text-sm ${subTextColor} ${sectionBg} p-2 rounded`}>
        {resume.skills?.join(', ')}
      </p>

      {/* --- Languages (ДОБАВЛЕНО) --- */}
      <SectionTitle>LANGUAGES.json</SectionTitle>
      <pre className={`text-sm ${subTextColor} ${sectionBg} p-2 rounded`}>
        {JSON.stringify(resume.languages, null, 2)}
      </pre>

      {/* --- Achievements (ИСПРАВЛЕНО) --- */}
      <SectionTitle>ACHIEVEMENTS.ini</SectionTitle>
      <div className={`text-sm ${subTextColor} space-y-1`}>
        {resume.achievements?.map((ach, index) => (
            <p key={index}>{`achievement_${index + 1} = "${ach}"`}</p>
        ))}
      </div>
      
       {/* --- Certifications & Trainings (ДОБАВЛЕНО) --- */}
       <SectionTitle>CERTS_TRAINING.pem</SectionTitle>
       <div className={`text-sm ${subTextColor} space-y-2`}>
        {resume.certifications?.map((cert, index) => (
          <p key={index}>-----BEGIN CERTIFICATE-----<br/>{cert}<br/>-----END CERTIFICATE-----</p>
        ))}
        {resume.trainings?.map((train, index) => (
          <p key={index}> {train}</p>
        ))}
       </div>
    </div>
  );
}