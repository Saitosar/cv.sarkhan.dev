// src/components/templates/ModernTemplate.tsx

import type { ColorScheme } from "@/lib/palettes";

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


export function ModernTemplate({ resume, accentColor }: { resume: ResumeData, accentColor: ColorScheme }) {
  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="font-display text-lg font-bold uppercase tracking-widest mb-4" style={{ color: accentColor.primary }}>{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    // --- Основной фон, чтобы карточки выделялись ---
    <div className="bg-slate-50 text-gray-700 p-10 font-sans space-y-8">
      {/* --- Шапка (без карточки, она "над" всем) --- */}
      <div className="text-center">
        <h1 className="font-display text-5xl font-extrabold text-gray-800">{resume.summary?.split(':')[0]}</h1>
        <p className="text-xl text-gray-500 mt-2">{resume.summary?.split(':')[1]?.split('\n')[0]}</p>
        <p className="text-sm mt-4 tracking-wider" style={{ color: accentColor.primary }}>
          {resume.contact?.email} &middot; {resume.contact?.phone} &middot; {resume.contact?.linkedin}
        </p>
      </div>

      {/* --- Каждая секция теперь "плавающая карточка" --- */}
      <Section title="Summary">
        <p className="text-sm">{resume.summary?.split('\n').slice(1).join('\n')}</p>
      </Section>
      
      <Section title="Skills">
        <div className="flex flex-wrap gap-2">
            {resume.skills?.map(skill => (
              <span key={skill} className="bg-cyan-50 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">
                {skill}
              </span>
            ))}
        </div>
      </Section>
      
      <Section title="Experience">
        {resume.experience?.map((job, index) => (
          <div key={index} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
            <div className="flex justify-between items-baseline">
              <h3 className="text-lg font-bold text-gray-800">{job.position}</h3>
              <p className="text-sm font-medium text-gray-500">{job.years}</p>
            </div>
            <p className="font-semibold text-md text-gray-600">{job.company}</p>
            <p className="text-sm mt-1">{job.description}</p>
          </div>
        ))}
      </Section>
      
      <Section title="Projects">
        {resume.projects?.map((project, index) => (
          <div key={index} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
            <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
            <p className="text-sm font-medium text-gray-500 mb-1">Technologies: {project.technologies}</p>
            <p className="text-sm">{project.description}</p>
          </div>
        ))}
      </Section>

      <Section title="Education">
        {resume.education?.map((edu, index) => (
           <div key={index} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
            <h3 className="text-lg font-bold text-gray-800">{edu.institution}</h3>
            <p className="font-semibold text-md text-gray-600">{edu.degree}</p>
            <p className="text-sm text-gray-500">{edu.years}</p>
          </div>
        ))}
      </Section>
      
      <Section title="Accomplishments">
        <div>
            <h4 className="text-md font-bold text-gray-800 mb-2">Achievements</h4>
            <ul className="list-disc list-inside text-sm space-y-2">
                {resume.achievements?.map((ach, index) => <li key={index}>{ach}</li>)}
            </ul>
        </div>
        <div className="mt-4">
            <h4 className="text-md font-bold text-gray-800 mb-2">Certifications</h4>
            <ul className="list-disc list-inside text-sm space-y-2">
                {resume.certifications?.map((cert, index) => <li key={index}>{cert}</li>)}
            </ul>
        </div>
        <div className="mt-4">
            <h4 className="text-md font-bold text-gray-800 mb-2">Trainings</h4>
            <ul className="list-disc list-inside text-sm space-y-2">
                {resume.trainings?.map((train, index) => <li key={index}>{train}</li>)}
            </ul>
        </div>
      </Section>
    </div>
  );
}