// src/lib/placeholder-data.ts

// Явно определяем типы для каждой секции
type Contact = {
  email: string;
  phone: string;
  linkedin: string;
};

type Experience = {
  company: string;
  position: string;
  description?: string;
  startDate: { month: string; year: string };
  endDate?: {
    month?: string;
    year?: string;
    isCurrent?: boolean;
  };
};

type Project = {
  name: string;
  description?: string;
  technologies?: string;
};

type Education = {
  institution: string;
  degree: string;
  years?: string;
};

type Language = {
  language: string;
  proficiency: string;
};

// --- ГЛАВНОЕ ИЗМЕНЕНИЕ: Явное определение типа ResumeData ---
export type ResumeData = {
  fullName: string;
  jobTitle: string;
  summary: string;
  contact: Contact;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  skills: string[];
  languages: Language[];
  achievements: string[];
  trainings: string[];
  certifications: string[];
};

// Улучшенная функция форматирования дат
export function formatExperienceDate(job: Experience): string {
  if (!job.startDate.month || !job.startDate.year) return '';
  
  const start = `${job.startDate.month} ${job.startDate.year}`;
  
  if (job.endDate?.isCurrent) {
    return `${start} - Present`;
  }
  
  if (job.endDate?.month && job.endDate?.year) {
    return `${start} - ${job.endDate.month} ${job.endDate.year}`;
  }
  
  return start;
}

// Placeholder теперь соответствует строгому типу ResumeData
export const placeholderResume: ResumeData = {
  fullName: "John Doe",
  jobTitle: "Senior Frontend Developer",
  summary: "A highly skilled and motivated frontend developer with over 8 years of experience in creating responsive and user-friendly web applications.",
  contact: {
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    linkedin: "linkedin.com/in/johndoe",
  },
  experience: [
    {
      company: "Tech Solutions Inc.",
      position: "Senior Frontend Developer",
      startDate: { month: 'Jan', year: '2020' },
      endDate: { isCurrent: true },
      description: "Led the development of a new e-commerce platform, resulting in a 30% increase in sales. Optimized application performance, reducing page load time by 50%.",
    },
    {
      company: "Web Innovators LLC",
      position: "Frontend Developer",
      startDate: { month: 'Jun', year: '2017' },
      endDate: { month: 'Dec', year: '2019' },
      description: "Developed and maintained user interfaces for various client websites using React and Vue.js. Collaborated with designers to create pixel-perfect, responsive designs.",
    },
  ],
  projects: [
    {
      name: "Personal Portfolio Website",
      description: "Developed a personal portfolio to showcase my projects, using a modern tech stack and focusing on performance and SEO.",
      technologies: "Next.js, Tailwind CSS, Vercel",
    },
  ],
  education: [
    {
      institution: "State University",
      degree: "B.S. in Computer Science",
      years: "2013 - 2017",
    },
  ],
  skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL"],
  languages: [
    { language: 'English', proficiency: 'Fluent' },
    { language: 'Russian', proficiency: 'Native' },
  ],
  achievements: [
    "Winner of the 2021 'Innovation in UI/UX' award.",
  ],
  trainings: [
    'Agile & Scrum Fundamentals Workshop (2022)',
  ],
  certifications: [
    'Certified Scrum Master (CSM)',
  ],
};