// src/components/templates/CreativeTemplate.tsx
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

export function CreativeTemplate({ resume }: { resume: ResumeData }) {
  return (
    <div className="bg-gray-800 text-white p-8 font-mono relative overflow-hidden">
      {/* ... Header ... */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-neonViolet rounded-full opacity-30 blur-2xl"></div>
      <h1 className="text-4xl font-bold text-center text-neonViolet">{resume.summary?.split(':')[0]}</h1>
      <p className="text-center text-gray-400 mb-6">{resume.summary?.split(':')[1]?.split('\n')[0]}</p>
      <div className="text-center text-xs text-cyan-400 mb-6">
        {resume.contact?.email} // {resume.contact?.linkedin}
      </div>

      {/* ... Experience ... */}
      <h2 className="text-lg font-bold border-b border-neonViolet pb-1 mb-3">EXPERIENCE.log</h2>
      {resume.experience?.map((job, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg text-cyan-400"> {job.position}</h3>
          <p className="text-sm text-gray-400 pl-4">{job.company} -- [{job.years}]</p>
          <p className="text-sm mt-1 pl-4">{job.description}</p>
        </div>
      ))}

      <h2 className="text-lg font-bold border-b border-neonViolet pb-1 mb-3">PROJECTS.md</h2>
      {resume.projects?.map((project, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg text-cyan-400"># {project.name}</h3>
          <p className="text-sm mt-1 pl-4">{project.description}</p>
          <p className="text-xs mt-1 pl-4 bg-black bg-opacity-20 rounded p-1">`{project.technologies}`</p>
        </div>
      ))}
      
      {/* ... Education, Languages, Certifications ... */}
      <h2 className="text-lg font-bold border-b border-neonViolet pb-1 mt-6 mb-3">ACHIEVEMENTS.ini</h2>
      <div className="text-sm text-gray-400 space-y-1">
    {resume.achievements?.map((ach, index) => (
        <p key={index}>{`achievement_${index + 1} = "${ach}"`}</p>
    ))}
</div>
    </div>
  );
}