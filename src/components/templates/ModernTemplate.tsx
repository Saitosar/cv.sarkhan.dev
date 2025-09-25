// src/components/templates/ModernTemplate.tsx
// 1. Описываем структуру
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
export function ModernTemplate({ resume }: { resume: ResumeData }) {
  return (
    <div className="bg-white text-gray-800 p-8 font-sans">
      {/* ... Header ... */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700">{resume.summary?.split(':')[0]}</h1>
        <p className="text-lg text-gray-600 mt-1">{resume.summary?.split(':')[1]?.split('\n')[0]}</p>
        <p className="text-xs text-gray-500 mt-4">
          {resume.contact?.email} &middot; {resume.contact?.phone} &middot; {resume.contact?.linkedin}
        </p>
      </div>

      {/* ... Summary, Experience ... */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-blue-700 uppercase tracking-wider border-b-2 border-blue-200 pb-2 mb-3">Experience</h2>
        {resume.experience?.map((job, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-bold">{job.position}</h3>
            <p className="font-semibold text-sm text-gray-700">{job.company} | {job.years}</p>
            <p className="text-sm mt-1">{job.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-blue-700 uppercase tracking-wider border-b-2 border-blue-200 pb-2 mb-3">Projects</h2>
        {resume.projects?.map((project, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-bold">{project.name}</h3>
            <p className="font-semibold text-sm text-gray-700">Technologies: {project.technologies}</p>
            <p className="text-sm mt-1">{project.description}</p>
          </div>
        ))}
      </div>

      {/* ... Education, Skills, Languages, Certifications ... */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-blue-700 uppercase tracking-wider border-b-2 border-blue-200 pb-2 mb-3">Skills & Languages</h2>
        <p className="text-sm mb-2"><strong>Skills:</strong> {resume.skills?.join(', ')}</p>
        <p className="text-sm"><strong>Languages:</strong> {resume.languages?.map(l => `${l.language} (${l.proficiency})`).join(', ')}</p>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-blue-700 uppercase tracking-wider border-b-2 border-blue-200 pb-2 mb-3">Achievements & Certifications</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
            {resume.achievements?.map((ach, index) => <li key={index}>{ach}</li>)}
            {resume.certifications?.map((cert, index) => <li key={index}>{cert}</li>)}
        </ul>
      </div>
    </div>
  );
}