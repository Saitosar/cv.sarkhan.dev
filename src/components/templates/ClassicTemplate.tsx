// src/components/templates/ClassicTemplate.tsx

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

export function ClassicTemplate({ resume }: { resume: ResumeData }) {
  // --- ИСПРАВЛЕННЫЙ вспомогательный компонент для секций ---
  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6 bg-gray-50 p-4 rounded-md border-l-4 border-gray-300">
      <h2 className="text-xl font-bold text-gray-700 mb-3">{title}</h2>
      <div className="text-sm space-y-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-white text-gray-800 p-8 font-serif">
      {/* --- Верхний блок (Шапка) --- */}
      <div className="bg-gray-100 p-6 rounded-md mb-8 border-b-4 border-gray-300">
        <h1 className="text-4xl font-bold text-center text-gray-800">{resume.summary?.split(':')[0]}</h1>
        <p className="text-center text-lg text-gray-600 mb-4">{resume.summary?.split(':')[1]?.split('\n')[0]}</p>
        <div className="text-center text-xs text-gray-500">
          {resume.contact?.email} | {resume.contact?.phone} | {resume.contact?.linkedin}
        </div>
      </div>
      
      {/* --- Теперь каждая секция будет в красивой обертке --- */}
      <Section title="Professional Summary">
        <p>{resume.summary?.split('\n').slice(1).join('\n')}</p>
      </Section>
      
      <Section title="Work Experience">
        {resume.experience?.map((job, index) => (
          <div key={index}>
            <h3 className="text-lg font-bold">{job.position}</h3>
            <p className="font-semibold text-sm text-gray-700">{job.company} | {job.years}</p>
            <p className="mt-1">{job.description}</p>
          </div>
        ))}
      </Section>
      
      <Section title="Projects">
        {resume.projects?.map((project, index) => (
          <div key={index}>
            <h3 className="text-lg font-bold">{project.name}</h3>
            <p className="font-semibold text-sm text-gray-700">Technologies: {project.technologies}</p>
            <p className="mt-1">{project.description}</p>
          </div>
        ))}
      </Section>

      <Section title="Education">
        {resume.education?.map((edu, index) => (
          <div key={index}>
            <h3 className="text-lg font-bold">{edu.institution}</h3>
            <p className="font-semibold text-sm text-gray-700">{edu.degree} | {edu.years}</p>
          </div>
        ))}
      </Section>

      <Section title="Skills & Languages">
        <div>
          <p className="mb-2"><strong>Skills:</strong> {resume.skills?.join(', ')}</p>
          <p><strong>Languages:</strong> {resume.languages?.map(l => `${l.language} (${l.proficiency})`).join(', ')}</p>
        </div>
      </Section>
      
      <Section title="Accomplishments">
  {/* Achievements Sub-section */}
  <div>
      <h4 className="text-md font-bold text-gray-600 mb-1">Achievements</h4>
      <ul className="list-disc list-inside space-y-1">
          {resume.achievements?.map((ach, index) => <li key={index}>{ach}</li>)}
      </ul>
  </div>
  
  {/* Certifications Sub-section */}
  <div className="mt-3">
      <h4 className="text-md font-bold text-gray-600 mb-1">Certifications</h4>
      <ul className="list-disc list-inside space-y-1">
          {resume.certifications?.map((cert, index) => <li key={index}>{cert}</li>)}
      </ul>
  </div>

  {/* Trainings Sub-section */}
  <div className="mt-3">
      <h4 className="text-md font-bold text-gray-600 mb-1">Trainings</h4>
      <ul className="list-disc list-inside space-y-1">
          {resume.trainings?.map((train, index) => <li key={index}>{train}</li>)}
      </ul>
  </div>
</Section>
    </div>
  );
}