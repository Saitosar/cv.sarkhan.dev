// src/lib/placeholder-data.ts

import type {
  ResumeData,
  Experience,
  Project,
  Education,
  Language,
} from '@/types/resume';

export type { ResumeData, Experience, Project, Education, Language };
export function formatExperienceDate(job: Experience): string {
  if (!job.startDate?.month || !job.startDate?.year) return '';
  
  const start = `${job.startDate.month} ${job.startDate.year}`;
  
  if (job.endDate?.isCurrent) {
    return `${start} - Present`;
  }
  
  if (job.endDate?.month && job.endDate?.year) {
    return `${start} - ${job.endDate.month} ${job.endDate.year}`;
  }
  
  return start;
}

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
      id: "exp-1",
      company: "Tech Solutions Inc.",
      position: "Senior Frontend Developer",
      startDate: { month: 'Jan', year: '2020' },
      endDate: { isCurrent: true },
      description: "Led the development of a new e-commerce platform, resulting in a 30% increase in sales. Optimized application performance, reducing page load time by 50%.",
    },
    {
      id: "exp-2",
      company: "Web Innovators LLC",
      position: "Frontend Developer",
      startDate: { month: 'Jun', year: '2017' },
      endDate: { month: 'Dec', year: '2019' },
      description: "Developed and maintained user interfaces for various client websites using React and Vue.js. Collaborated with designers to create pixel-perfect, responsive designs.",
    },
  ],
  projects: [
    {
      id: "proj-1",
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
  skills: [
    { value: "React" },
    { value: "TypeScript" },
    { value: "Next.js" },
    { value: "Tailwind CSS" },
    { value: "GraphQL" },
  ],
  languages: [
    { language: 'English', proficiency: 'Fluent' },
    { language: 'Russian', proficiency: 'Native' },
  ],
  achievements: [
    { value: "Winner of the 2021 'Innovation in UI/UX' award." },
  ],
  trainings: [
    { value: 'Agile & Scrum Fundamentals Workshop (2022)' },
  ],
  certifications: [
    { value: 'Certified Scrum Master (CSM)' },
  ],
};
