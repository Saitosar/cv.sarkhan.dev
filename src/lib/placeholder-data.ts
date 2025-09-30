// src/lib/placeholder-data.ts

// Мы не экспортируем тип ResumeData явно здесь, чтобы избежать циклической зависимости.
// Тип ResumeData будет выводиться из константы placeholderResume в LivePreview.

export const placeholderResume = {
  // 2. Добавляем недостающие поля fullName и jobTitle
  fullName: "John Doe",
  jobTitle: "Senior Frontend Developer",
  // 3. Очищаем summary от лишней информации
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
      // --- КОРРЕКТИРОВКА: Включаем все структурированные поля ---
      years: "January 2020 - Present", 
      startDate: { month: "January", year: "2020" }, 
      endDate: { isCurrent: true, month: undefined, year: undefined }, // Указываем все опциональные поля
      // -----------------------------------------------------
      description: "Led the development of a new e-commerce platform, resulting in a 30% increase in sales. Optimized application performance, reducing page load time by 50%.",
    },
    {
      company: "Web Innovators LLC",
      position: "Frontend Developer",
      // --- КОРРЕКТИРОВКА: Включаем все структурированные поля ---
      years: "June 2017 - December 2020", 
      startDate: { month: "June", year: "2017" }, 
      endDate: { month: "December", year: "2020", isCurrent: false },
      // -----------------------------------------------------
      description: "Developed and maintained user interfaces for various client websites using React and Vue.js. Collaborated with designers to create pixel-perfect, responsive designs.",
    },
  ],
  projects: [
    {
      name: "Personal Portfolio Website",
      description: "Developed a personal portfolio to showcase my projects, using a modern tech stack and focusing on performance and SEO.",
      technologies: "Next.js, Tailwind CSS, Vercel",
    },
    {
      name: "E-commerce Analytics Dashboard",
      description: "Built a real-time analytics dashboard for an e-commerce client to track sales, user engagement, and inventory.",
      technologies: "React, D3.js, GraphQL",
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
    "Speaker at the annual Frontend Developers Conference.",
    "Contributed to several open-source projects.",
  ],
  trainings: [
    'Agile & Scrum Fundamentals Workshop (2022)',
    'Advanced React Performance (2023)',
  ],
  certifications: [
    'Certified Scrum Master (CSM)',
    'AWS Certified Developer - Associate',
  ],
};

// Экспортируем тип после определения константы, чтобы избежать ошибки в LivePreview
export type ResumeData = typeof placeholderResume;
