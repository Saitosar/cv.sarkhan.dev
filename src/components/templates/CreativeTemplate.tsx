// src/components/templates/CreativeTemplate.tsx
import type { ColorScheme } from "@/lib/palettes";
import type { Theme } from "@/components/ThemeToggle";
import { type ResumeData, formatExperienceDate } from "@/lib/placeholder-data";

export function CreativeTemplate({ resume, accentColor, theme }: { resume: ResumeData, accentColor: ColorScheme, theme: Theme }) {
  const hasContent = (arr: unknown[] | undefined) => arr && arr.length > 0;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const subTextColor = isDark ? 'text-gray-400' : 'text-gray-500';

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
      <h2 className="text-lg font-bold border-b pb-1 mb-3" style={{ borderColor: accentColor.primary }}>
        {title}
      </h2>
      <div className="text-sm">
        {children}
      </div>
    </div>
  );

  return (
    <div className={`${bgColor} ${textColor} p-8 font-mono relative overflow-hidden transition-colors duration-300`}>
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-repeat" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${accentColor.primary.replace('#', '')}' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
      
      <h1 className="text-4xl font-bold text-center mb-2" style={{ color: accentColor.primary }}>{resume.fullName}</h1>
      <p className={`text-center mb-6 ${subTextColor}`}>{resume.jobTitle}</p>
      <div className={`text-center text-xs mb-8 ${subTextColor} flex justify-center items-center gap-x-2 flex-wrap`}>
        <span>{resume.contact.email}</span>
        {resume.contact.phone && <span className="before:content-['//'] before:mx-2">{resume.contact.phone}</span>}
        {resume.contact.linkedin && <span className="before:content-['//'] before:mx-2">{resume.contact.linkedin}</span>}
      </div>
      
      <div className="space-y-6">
        {resume.summary && (
          <div>
            <p className="italic text-center" style={{ whiteSpace: 'pre-line' }}>{resume.summary}</p>
          </div>
        )}
        
        {hasContent(resume.experience) && (
          <Section title=">> Experience">
            <div className="space-y-4">
              {resume.experience.map((job, index) => (
                <div key={index}>
                  <p className="font-bold">{job.position} <span className={subTextColor}>@ {job.company}</span></p>
                  {/* ИЗМЕНЕНИЕ ЗДЕСЬ */}
                  <p className="text-xs" style={{ color: accentColor.primary }}>{formatExperienceDate(job)}</p>
                  <p className="mt-1" style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
        
        {/* ... (остальная часть файла без изменений) ... */}
        {hasContent(resume.projects) && (
          <Section title=">> Projects">
            <div className="space-y-4">
              {resume.projects.map((project, index) => (
                <div key={index}>
                  <p className="font-bold">{project.name}</p>
                  {project.technologies && <p className={`text-xs ${subTextColor}`}>{project.technologies}</p>}
                  <p className="mt-1" style={{ whiteSpace: 'pre-line' }}>{project.description}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
        {hasContent(resume.skills) && (
          <Section title=">> Skills">
            <p>{resume.skills.join(' | ')}</p>
          </Section>
        )}
        {hasContent(resume.education) && (
          <Section title=">> Education">
            {resume.education.map((edu, index) => (
              <div key={index}>
                <p className="font-bold">{edu.degree} <span className={subTextColor}>- {edu.institution}</span></p>
                <p className={`text-xs ${subTextColor}`}>{edu.years}</p>
              </div>
            ))}
          </Section>
        )}
        {hasContent(resume.languages) && (
          <Section title=">> Languages">
            <p>{resume.languages.map(lang => `${lang.language} (${lang.proficiency})`).join('; ')}</p>
          </Section>
        )}
        {hasContent(resume.achievements) && (
          <Section title=">> Achievements">
            <ul className="list-disc list-inside space-y-1">
              {resume.achievements.map((ach, index) => <li key={index}>{ach}</li>)}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}