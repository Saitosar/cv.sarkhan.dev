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
  const hasContent = (arr: any[] | undefined) => arr && arr.length > 0;

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="font-display text-lg font-bold uppercase tracking-widest mb-4" style={{ color: accentColor.primary }}>{title}</h2>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-100 text-gray-700 p-8 font-sans">
      <div className="grid grid-cols-1 gap-8"> 
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h1 className="font-display text-5xl font-extrabold text-gray-800">{resume.summary?.split(':')[0]}</h1>
          <p className="text-xl text-gray-500 mt-2">{resume.summary?.split(':')[1]?.split('\n')[0]}</p>
          <div className="text-sm mt-4 tracking-wider flex justify-center items-center gap-x-2 flex-wrap" style={{ color: accentColor.primary }}>
            <span>{resume.contact?.email}</span>
            {resume.contact?.phone && <span className="before:content-['·'] before:mr-2">{resume.contact.phone}</span>}
            {resume.contact?.linkedin && <span className="before:content-['·'] before:mr-2">{resume.contact.linkedin}</span>}
          </div>
        </div>

        <Section title="Summary">
          <p className="text-sm text-justify" style={{ whiteSpace: 'pre-line' }}>{resume.summary?.split('\n').slice(1).join('\n')}</p>
        </Section>
        
        {hasContent(resume.skills) && (
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
                {resume.skills?.map(skill => (
                  <span key={skill} className="bg-cyan-50 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
            </div>
          </Section>
        )}
        
        {hasContent(resume.experience) && (
          <Section title="Experience">
            {resume.experience?.map((job, index) => (
              <div key={index} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-bold text-gray-800">{job.position}</h3>
                  <p className="text-sm font-medium text-gray-500">{job.years}</p>
                </div>
                <p className="font-semibold text-md text-gray-600">{job.company}</p>
                <p className="text-sm mt-1 text-justify" style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
              </div>
            ))}
          </Section>
        )}
        
        {hasContent(resume.projects) && (
          <Section title="Projects">
            {resume.projects?.map((project, index) => (
              <div key={index} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                <p className="text-sm font-medium text-gray-500 mb-1">Technologies: {project.technologies}</p>
                <p className="text-sm text-justify" style={{ whiteSpace: 'pre-line' }}>{project.description}</p>
              </div>
            ))}
          </Section>
        )}

        {hasContent(resume.education) && (
          <Section title="Education">
            {resume.education?.map((edu, index) => (
              <div key={index} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                <h3 className="text-lg font-bold text-gray-800">{edu.institution}</h3>
                <p className="font-semibold text-md text-gray-600">{edu.degree}</p>
                <p className="text-sm text-gray-500">{edu.years}</p>
              </div>
            ))}
          </Section>
        )}
        
        {(hasContent(resume.achievements) || hasContent(resume.certifications) || hasContent(resume.trainings)) && (
          <Section title="Accomplishments">
            {hasContent(resume.achievements) && (
              <div>
                  <h4 className="text-md font-bold text-gray-800 mb-2">Achievements</h4>
                  <ul className="list-disc list-inside text-sm space-y-2">
                      {resume.achievements?.map((ach, index) => ach && <li key={index}>{ach}</li>)}
                  </ul>
              </div>
            )}
            {hasContent(resume.certifications) && (
              <div className="mt-4">
                  <h4 className="text-md font-bold text-gray-800 mb-2">Certifications</h4>
                  <ul className="list-disc list-inside text-sm space-y-2">
                      {resume.certifications?.map((cert, index) => cert && <li key={index}>{cert}</li>)}
                  </ul>
              </div>
            )}
            {hasContent(resume.trainings) && (
              <div className="mt-4">
                  <h4 className="text-md font-bold text-gray-800 mb-2">Trainings</h4>
                  <ul className="list-disc list-inside text-sm space-y-2">
                      {resume.trainings?.map((train, index) => train && <li key={index}>{train}</li>)}
                  </ul>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}