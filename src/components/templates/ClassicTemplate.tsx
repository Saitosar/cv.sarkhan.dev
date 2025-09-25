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

// Этот компонент принимает уже распарсенные данные резюме

export function ClassicTemplate({ resume }: { resume: ResumeData }) {
  return (
    <div className="bg-white text-gray-800 p-8 font-serif">
      {/* ... Summary, Contact ... */}
      <h1 className="text-4xl font-bold text-center">{resume.summary?.split(':')[0]}</h1>
      <p className="text-center text-lg text-gray-600 mb-4">{resume.summary?.split(':')[1]?.split('\n')[0]}</p>
      <div className="text-center text-xs text-gray-500 mb-6">
        {resume.contact?.email} | {resume.contact?.phone} | {resume.contact?.linkedin}
      </div>

      <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3">Professional Summary</h2>
      <p className="text-sm mb-6">{resume.summary?.split('\n').slice(1).join('\n')}</p>

      <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3">Work Experience</h2>
      {resume.experience?.map((job, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg font-bold">{job.position}</h3>
          <p className="font-semibold text-sm text-gray-700">{job.company} | {job.years}</p>
          <p className="text-sm mt-1">{job.description}</p>
        </div>
      ))}
      
      <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3">Projects</h2>
      {resume.projects?.map((project, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg font-bold">{project.name}</h3>
          <p className="font-semibold text-sm text-gray-700">Technologies: {project.technologies}</p>
          <p className="text-sm mt-1">{project.description}</p>
        </div>
      ))}

      <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3">Education</h2>
      {/* ... Education ... */}
      {resume.education?.map((edu, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg font-bold">{edu.institution}</h3>
          <p className="font-semibold text-sm text-gray-700">{edu.degree} | {edu.years}</p>
        </div>
      ))}

      <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-3">Skills & Languages</h2>
      <p className="text-sm mb-2"><strong>Skills:</strong> {resume.skills?.join(', ')}</p>
      <p className="text-sm"><strong>Languages:</strong> {resume.languages?.map(l => `${l.language} (${l.proficiency})`).join(', ')}</p>

      <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mt-6 mb-3">Achievements & Certifications</h2>
      <ul className="list-disc list-inside text-sm space-y-1">
        {resume.achievements?.map((ach, index) => <li key={index}>{ach}</li>)}
        {resume.certifications?.map((cert, index) => <li key={index}>{cert}</li>)}
      </ul>
    </div>
  );
}