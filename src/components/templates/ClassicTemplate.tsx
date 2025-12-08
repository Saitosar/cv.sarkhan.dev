// src/components/templates/ClassicTemplate.tsx
import type { ColorScheme } from "@/lib/palettes";
import { type ResumeData, formatExperienceDate } from "@/lib/placeholder-data";

export function ClassicTemplate({ resume, accentColor }: { resume: ResumeData, accentColor: ColorScheme }) {
  const hasContent = (arr: unknown[] | undefined) => arr && arr.length > 0;

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-gray-700 mb-3 border-b-2 pb-1" style={{ borderColor: accentColor.primary }}>{title}</h2>
      <div className="text-sm space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-white text-gray-800 p-8 font-serif">
      
      <div className="text-center mb-8 border-b-2 pb-4" style={{ borderColor: accentColor.primary }}>
        <h1 className="text-4xl font-bold text-gray-800">{resume.fullName}</h1>
        <p className="text-lg text-gray-600">{resume.jobTitle}</p>
        <div className="text-xs text-gray-500 mt-4 flex justify-center items-center gap-x-4 flex-wrap">
          <span>{resume.contact.email}</span>
          {resume.contact.phone && <span className="before:content-['|'] before:mx-2">{resume.contact.phone}</span>}
          {resume.contact.linkedin && <span className="before:content-['|'] before:mx-2">{resume.contact.linkedin}</span>}
        </div>
      </div>
      
      {resume.summary && (
        <Section title="Professional Summary">
          <p className="text-justify" style={{ whiteSpace: 'pre-line' }}>{resume.summary}</p>
        </Section>
      )}
      
      {hasContent(resume.experience) && (
        <Section title="Work Experience">
          {resume.experience.map((job, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-bold">{job.position}</h3>
                {/* ИЗМЕНЕНИЕ ЗДЕСЬ */}
                <p className="text-sm font-medium text-gray-600">{formatExperienceDate(job)}</p>
              </div>
              <p className="font-semibold text-md">{job.company}</p>
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
              <h3 className="text-lg font-bold">{project.name}</h3>
              {project.technologies && <p className="text-sm font-semibold text-gray-600">{project.technologies}</p>}
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
                <h3 className="text-lg font-bold">{edu.institution}</h3>
                <p className="text-sm font-medium text-gray-600">{edu.years}</p>
              </div>
              <p className="font-semibold text-md">{edu.degree}</p>
            </div>
          ))}
        </Section>
      )}
      {hasContent(resume.skills) && (
        <Section title="Skills">
          <p>{resume.skills.join(', ')}</p>
        </Section>
      )}
      {hasContent(resume.languages) && (
        <Section title="Languages">
          <p>{resume.languages.map(lang => `${lang.language} (${lang.proficiency})`).join(', ')}</p>
        </Section>
      )}
      {hasContent(resume.achievements) && (
        <Section title="Achievements">
          <ul className="list-disc pl-5 space-y-1">
            {resume.achievements.map((ach, index) => <li key={index}>{ach}</li>)}
          </ul>
        </Section>
      )}
      {hasContent(resume.certifications) && (
        <Section title="Certifications">
          <ul className="list-disc pl-5 space-y-1">
            {resume.certifications.map((cert, index) => <li key={index}>{cert}</li>)}
          </ul>
        </Section>
      )}
      {hasContent(resume.trainings) && (
        <Section title="Trainings">
          <ul className="list-disc pl-5 space-y-1">
            {resume.trainings.map((train, index) => <li key={index}>{train}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}