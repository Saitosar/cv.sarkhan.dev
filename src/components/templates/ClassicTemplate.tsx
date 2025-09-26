// src/components/templates/ClassicTemplate.tsx
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


export function ClassicTemplate({ resume, accentColor }: { resume: ResumeData, accentColor: ColorScheme }) {
  const hasContent = (arr: any[] | undefined) => arr && arr.length > 0;

  // --- ФИНАЛЬНЫЙ, КРАСИВЫЙ СТИЛЬ СЕКЦИИ ---
  // Легкий фон и отступы для элегантного разделения
  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-4 p-5 rounded-md bg-gray-50/60">
     <h2 className="text-xl font-bold text-gray-700 mb-3 border-b-2 pb-1" style={{ borderColor: accentColor.primary }}>{title}</h2>
      <div className="text-sm space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-white text-gray-800 p-8 font-serif">
      
      <div className="p-6 rounded-md mb-8 border-b-4 text-center" style={{ backgroundColor: accentColor.primary, borderColor: accentColor.secondary }}>
        <h1 className="text-4xl font-bold text-gray-800">{resume.summary?.split(':')[0]}</h1>
        <p className="text-lg text-gray-600 mb-4">{resume.summary?.split(':')[1]?.split('\n')[0]}</p>
        <div className="text-xs text-gray-500 flex justify-center items-center gap-x-4 flex-wrap">
          <span>{resume.contact?.email}</span>
          {resume.contact?.phone && <span className="before:content-['|'] before:mr-4">{resume.contact.phone}</span>}
          {resume.contact?.linkedin && <span className="before:content-['|'] before:mr-4">{resume.contact.linkedin}</span>}
        </div>
      </div>
      
      <Section title="Professional Summary">
        <p className="text-justify" style={{ whiteSpace: 'pre-line' }}>{resume.summary?.split('\n').slice(1).join('\n')}</p>
      </Section>
      
      {hasContent(resume.experience) && (
        <Section title="Work Experience">
          {resume.experience?.map((job, index) => (
            <div key={index}>
              <h3 className="text-lg font-bold">{job.position}</h3>
              <p className="font-semibold text-sm text-gray-700">{job.company} | {job.years}</p>
              <p className="mt-1 text-justify" style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
            </div>
          ))}
        </Section>
      )}
      
      {hasContent(resume.projects) && (
        <Section title="Projects">
          {resume.projects?.map((project, index) => (
            <div key={index}>
              <h3 className="text-lg font-bold">{project.name}</h3>
              <p className="font-semibold text-sm text-gray-700">Technologies: {project.technologies}</p>
              <p className="mt-1 text-justify" style={{ whiteSpace: 'pre-line' }}>{project.description}</p>
            </div>
          ))}
        </Section>
      )}

      {hasContent(resume.education) && (
        <Section title="Education">
          {resume.education?.map((edu, index) => (
            <div key={index}>
              <h3 className="text-lg font-bold">{edu.institution}</h3>
              <p className="font-semibold text-sm text-gray-700">{edu.degree} | {edu.years}</p>
            </div>
          ))}
        </Section>
      )}

      {(hasContent(resume.skills) || hasContent(resume.languages)) && (
        <Section title="Skills & Languages">
          <div>
            {hasContent(resume.skills) && <p className="mb-2"><strong>Skills:</strong> {resume.skills?.join(', ')}</p>}
            {hasContent(resume.languages) && <p><strong>Languages:</strong> {resume.languages?.map(l => `${l.language} (${l.proficiency})`).join(', ')}</p>}
          </div>
        </Section>
      )}
      
      {(hasContent(resume.achievements) || hasContent(resume.certifications) || hasContent(resume.trainings)) && (
        <Section title="Accomplishments">
          {hasContent(resume.achievements) && (
            <div>
              <h4 className="text-md font-bold text-gray-600 mb-1">Achievements</h4>
              <ul className="list-disc list-inside space-y-1">
                  {resume.achievements?.map((ach, index) => ach && <li key={index}>{ach}</li>)}
              </ul>
            </div>
          )}
          {hasContent(resume.certifications) && (
            <div className="mt-3">
              <h4 className="text-md font-bold text-gray-600 mb-1">Certifications</h4>
              <ul className="list-disc list-inside space-y-1">
                  {resume.certifications?.map((cert, index) => cert && <li key={index}>{cert}</li>)}
              </ul>
            </div>
          )}
          {hasContent(resume.trainings) && (
            <div className="mt-3">
              <h4 className="text-md font-bold text-gray-600 mb-1">Trainings</h4>
              <ul className="list-disc list-inside space-y-1">
                  {resume.trainings?.map((train, index) => train && <li key={index}>{train}</li>)}
              </ul>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}