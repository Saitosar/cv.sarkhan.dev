// src/components/templates/ModernTemplate.tsx
import type { ColorScheme } from "@/lib/palettes";
import { type ResumeData, formatExperienceDate } from "@/lib/placeholder-data";

export function ModernTemplate({ resume, accentColor }: { resume: ResumeData, accentColor: ColorScheme }) {
  const hasContent = (arr: unknown[] | undefined) => arr && arr.length > 0;

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-1">
        <h2 className="font-bold uppercase tracking-widest text-sm" style={{ color: accentColor.primary }}>{title}</h2>
      </div>
      <div className="col-span-3 space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-white text-gray-700 p-10 font-sans">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-gray-800">{resume.fullName}</h1>
        <p className="text-xl text-gray-500 mt-2">{resume.jobTitle}</p>
        <div className="text-sm mt-4 tracking-wider flex justify-center items-center gap-x-2 flex-wrap" style={{ color: accentColor.primary }}>
          <span>{resume.contact.email}</span>
          {resume.contact.phone && <span className="before:content-['·'] before:mr-2">{resume.contact.phone}</span>}
          {resume.contact.linkedin && <span className="before:content-['·'] before:mr-2">{resume.contact.linkedin}</span>}
        </div>
      </div>

      <div className="space-y-8">
        {resume.summary && (
          <Section title="Summary">
            <p className="text-sm text-justify" style={{ whiteSpace: 'pre-line' }}>{resume.summary}</p>
          </Section>
        )}
        
        {hasContent(resume.skills) && (
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
                {resume.skills.map(skill => (
                  <span key={skill} className="bg-cyan-50 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
            </div>
          </Section>
        )}
        
        {hasContent(resume.experience) && (
          <Section title="Experience">
            {resume.experience.map((job, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-bold text-gray-800">{job.position}</h3>
                  {/* ИЗМЕНЕНИЕ ЗДЕСЬ */}
                  <p className="text-sm font-medium text-gray-500">{formatExperienceDate(job)}</p>
                </div>
                <p className="font-semibold text-md text-gray-600">{job.company}</p>
                <p className="text-sm mt-1 text-justify" style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
              </div>
            ))}
          </Section>
        )}
        
        {/* ... (остальная часть файла без изменений) ... */}
        {hasContent(resume.projects) && (
          <Section title="Projects">
            {resume.projects.map((project, index) => (
              <div key={index}>
                <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                {project.technologies && <p className="text-sm font-semibold text-gray-500 -mt-1">{project.technologies}</p>}
                <p className="text-sm mt-1 text-justify" style={{ whiteSpace: 'pre-line' }}>{project.description}</p>
              </div>
            ))}
          </Section>
        )}
        {hasContent(resume.education) && (
          <Section title="Education">
            {resume.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-bold text-gray-800">{edu.degree}</h3>
                  <p className="text-sm font-medium text-gray-500">{edu.years}</p>
                </div>
                <p className="font-semibold text-md text-gray-600">{edu.institution}</p>
              </div>
            ))}
          </Section>
        )}
        {hasContent(resume.languages) && (
          <Section title="Languages">
            <p className="text-sm">{resume.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(', ')}</p>
          </Section>
        )}
        {hasContent(resume.achievements) && (
          <Section title="Achievements">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {resume.achievements.map((ach, index) => <li key={index}>{ach}</li>)}
            </ul>
          </Section>
        )}
        {hasContent(resume.certifications) && (
          <Section title="Certifications">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {resume.certifications.map((cert, index) => <li key={index}>{cert}</li>)}
            </ul>
          </Section>
        )}
        {hasContent(resume.trainings) && (
          <Section title="Trainings">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {resume.trainings.map((train, index) => <li key={index}>{train}</li>)}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}