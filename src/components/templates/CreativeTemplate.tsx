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
    years?:string;
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
  const hasContent = (arr: any[] | undefined) => arr && arr.length > 0;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-gray-900' : 'bg-white';
  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const subTextColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const sectionBg = isDark ? 'bg-black bg-opacity-20' : 'bg-gray-50';

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mt-6">
      <h2 className="text-lg font-bold border-b pb-1 mb-4" style={{ borderColor: accentColor.primary }}>
        {title}
      </h2>
      <div className={`${sectionBg} p-4 rounded-md border-l-4`} style={{ borderColor: accentColor.secondary }}>
        {children}
      </div>
    </div>
  );

  return (
    <div className={`${bgColor} ${textColor} p-8 font-mono relative overflow-hidden transition-colors duration-300`}>
      {isDark && <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-2xl" style={{ backgroundColor: accentColor.primary }}></div>}
      
      <h1 className="text-4xl font-bold text-center mb-2" style={{ color: accentColor.primary }}>{resume.summary?.split(':')[0]}</h1>
      <p className={`text-center mb-6 ${subTextColor}`}>{resume.summary?.split(':')[1]?.split('\n')[0]}</p>
      <div className={`text-center text-xs mb-8 ${subTextColor} flex justify-center items-center gap-x-2 flex-wrap`} style={{ color: accentColor.primary }}>
        <span>{resume.contact?.email}</span>
        {resume.contact?.phone && <span className="before:content-['//'] before:mr-2">{resume.contact.phone}</span>}
        {resume.contact?.linkedin && <span className="before:content-['//'] before:mr-2">{resume.contact.linkedin}</span>}
      </div>
      
      {hasContent(resume.experience) && (
          <Section title="EXPERIENCE.log">
            {resume.experience?.map((job, index) => (
                <div key={index} className="mb-4 last:mb-0">
                <h3 className="text-md" style={{ color: accentColor.primary }}> {job.position}</h3>
                <p className={`text-sm pl-4 ${subTextColor}`}>{job.company} -- [{job.years}]</p>
                <p className="text-sm mt-1 pl-4 text-justify" style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
                </div>
            ))}
          </Section>
      )}

      {hasContent(resume.projects) && (
        <Section title="PROJECTS.md">
            {resume.projects?.map((project, index) => (
                <div key={index} className="mb-4 last:mb-0">
                <h3 className="text-md" style={{ color: accentColor.primary }}># {project.name}</h3>
                <p className={`text-sm mt-1 pl-4 ${subTextColor} text-justify`} style={{ whiteSpace: 'pre-line' }}>- {project.description}</p>
                <p className={`text-xs mt-1 pl-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded p-1 inline-block`}>`{project.technologies}`</p>
                </div>
            ))}
        </Section>
      )}
      
      {hasContent(resume.education) && (
          <Section title="EDUCATION.txt">
            {resume.education?.map((edu, index) => (
                <p key={index} className={`text-sm mb-2 last:mb-0 ${subTextColor}`}>* {edu.degree} at {edu.institution} ({edu.years})</p>
            ))}
          </Section>
      )}
      
      {hasContent(resume.skills) && (
        <Section title="SKILLS.csv">
            <p className={`text-sm ${subTextColor}`}>
                {resume.skills?.join(', ')}
            </p>
        </Section>
      )}

      {hasContent(resume.languages) && (
          <Section title="LANGUAGES.json">
            <pre className={`text-sm ${subTextColor}`}>
                {JSON.stringify(resume.languages, null, 2)}
            </pre>
          </Section>
      )}
      
      {hasContent(resume.achievements) && (
          <Section title="ACHIEVEMENTS.ini">
            <div className={`text-sm ${subTextColor} space-y-1`}>
                {resume.achievements?.map((ach, index) => ach && (
                    <p key={index}>{`achievement_${index + 1} = "${ach}"`}</p>
                ))}
            </div>
          </Section>
      )}

       {(hasContent(resume.certifications) || hasContent(resume.trainings)) && (
           <Section title="CERTS_TRAINING.pem">
            <div className={`text-sm ${subTextColor} space-y-2`}>
                {hasContent(resume.certifications) && resume.certifications?.map((cert, index) => cert && (
                <p key={index}>-----BEGIN CERTIFICATE-----<br/>{cert}<br/>-----END CERTIFICATE-----</p>
                ))}
                {hasContent(resume.trainings) && resume.trainings?.map((train, index) => train && (
                <p key={index} className="mt-2">- {train}</p>
                ))}
            </div>
           </Section>
       )}
    </div>
  );
}