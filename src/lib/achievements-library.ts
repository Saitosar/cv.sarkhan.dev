/**
 * Achievements Library - Ready-made professional phrases by role
 * Reduces AI API calls by providing curated content
 */

export interface Achievement {
  text: string;
  category: 'leadership' | 'technical' | 'business' | 'creative' | 'operations';
}

export interface RoleTemplate {
  role: string;
  keywords: string[];
  summaries: string[];
  achievements: Achievement[];
  skills: string[];
}

export const ROLE_TEMPLATES: Record<string, RoleTemplate> = {
  // Software Development
  'software-engineer': {
    role: 'Software Engineer',
    keywords: ['software engineer', 'developer', 'programmer', 'swe'],
    summaries: [
      'Results-driven Software Engineer with expertise in building scalable web applications and microservices',
      'Full-stack developer specializing in modern JavaScript frameworks and cloud-native architectures',
      'Experienced software engineer with strong problem-solving skills and passion for clean code',
    ],
    achievements: [
      { text: 'Reduced application load time by 40% through code optimization and lazy loading', category: 'technical' },
      { text: 'Led migration of monolithic application to microservices architecture, improving scalability', category: 'technical' },
      { text: 'Implemented CI/CD pipeline reducing deployment time from hours to minutes', category: 'technical' },
      { text: 'Mentored 5 junior developers, improving team code quality and productivity', category: 'leadership' },
      { text: 'Architected and delivered RESTful API serving 1M+ requests daily', category: 'technical' },
      { text: 'Reduced bug count by 60% by implementing comprehensive test coverage', category: 'technical' },
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Git', 'PostgreSQL', 'MongoDB'],
  },

  // Product Management
  'product-manager': {
    role: 'Product Manager',
    keywords: ['product manager', 'pm', 'product owner', 'product lead'],
    summaries: [
      'Strategic Product Manager with track record of launching successful products and driving user growth',
      'Data-driven PM specializing in B2B SaaS products with focus on customer success',
      'Experienced product leader skilled in roadmap planning, stakeholder management, and agile methodologies',
    ],
    achievements: [
      { text: 'Launched MVP in 3 months, achieving 10K users in first quarter', category: 'business' },
      { text: 'Increased user retention by 35% through data-driven feature prioritization', category: 'business' },
      { text: 'Led cross-functional team of 12 to deliver product 2 weeks ahead of schedule', category: 'leadership' },
      { text: 'Reduced customer churn by 25% by implementing feedback-driven improvements', category: 'business' },
      { text: 'Defined product strategy resulting in $2M ARR growth within 6 months', category: 'business' },
      { text: 'Conducted 50+ user interviews to validate product-market fit', category: 'business' },
    ],
    skills: ['Product Strategy', 'Roadmap Planning', 'Agile/Scrum', 'User Research', 'A/B Testing', 'SQL', 'Jira', 'Figma', 'Analytics'],
  },

  // UX/UI Design
  'designer': {
    role: 'UX/UI Designer',
    keywords: ['designer', 'ux designer', 'ui designer', 'product designer'],
    summaries: [
      'Creative UX/UI Designer passionate about crafting intuitive user experiences and beautiful interfaces',
      'User-centered designer with expertise in design systems and design thinking methodologies',
      'Experienced product designer skilled in user research, prototyping, and visual design',
    ],
    achievements: [
      { text: 'Redesigned user onboarding flow, increasing completion rate by 45%', category: 'creative' },
      { text: 'Created design system adopted across 5 products, improving consistency', category: 'creative' },
      { text: 'Conducted usability testing with 100+ users to validate design decisions', category: 'creative' },
      { text: 'Reduced user support tickets by 30% through improved UI/UX', category: 'business' },
      { text: 'Led design sprint resulting in validated product concept in 5 days', category: 'creative' },
      { text: 'Collaborated with engineering to deliver pixel-perfect implementations', category: 'creative' },
    ],
    skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'HTML/CSS', 'Usability Testing'],
  },

  // Data Science
  'data-scientist': {
    role: 'Data Scientist',
    keywords: ['data scientist', 'ml engineer', 'machine learning', 'ai engineer'],
    summaries: [
      'Data Scientist specializing in machine learning and predictive analytics with business impact',
      'ML engineer experienced in building and deploying production-grade models at scale',
      'Results-oriented data scientist skilled in statistical analysis and data-driven decision making',
    ],
    achievements: [
      { text: 'Built recommendation system increasing user engagement by 40%', category: 'technical' },
      { text: 'Developed predictive model achieving 95% accuracy in fraud detection', category: 'technical' },
      { text: 'Automated data pipeline processing 10TB+ data daily', category: 'technical' },
      { text: 'Reduced customer churn by 20% using ML-based early warning system', category: 'business' },
      { text: 'Published 3 research papers on deep learning applications', category: 'technical' },
      { text: 'Led data science team of 4 delivering $5M in cost savings', category: 'leadership' },
    ],
    skills: ['Python', 'R', 'TensorFlow', 'PyTorch', 'SQL', 'Spark', 'AWS', 'Machine Learning', 'Deep Learning', 'Statistics'],
  },

  // Marketing
  'marketing-manager': {
    role: 'Marketing Manager',
    keywords: ['marketing manager', 'digital marketing', 'growth marketing', 'marketing lead'],
    summaries: [
      'Growth-focused Marketing Manager with proven track record in digital marketing and lead generation',
      'Strategic marketer specializing in data-driven campaigns and brand positioning',
      'Results-oriented marketing professional skilled in content strategy and performance marketing',
    ],
    achievements: [
      { text: 'Increased website traffic by 200% through SEO optimization and content strategy', category: 'business' },
      { text: 'Generated 500+ qualified leads monthly through multi-channel campaigns', category: 'business' },
      { text: 'Reduced customer acquisition cost by 35% while maintaining quality', category: 'business' },
      { text: 'Launched successful product campaign reaching 2M impressions', category: 'business' },
      { text: 'Managed $500K marketing budget with 150% ROI', category: 'business' },
      { text: 'Built marketing team from 2 to 8 members in 6 months', category: 'leadership' },
    ],
    skills: ['Digital Marketing', 'SEO/SEM', 'Google Analytics', 'Content Strategy', 'Social Media', 'Email Marketing', 'A/B Testing', 'HubSpot'],
  },

  // DevOps
  'devops-engineer': {
    role: 'DevOps Engineer',
    keywords: ['devops', 'sre', 'site reliability', 'infrastructure'],
    summaries: [
      'DevOps Engineer focused on automation, scalability, and system reliability',
      'SRE with expertise in cloud infrastructure and continuous deployment',
      'Experienced infrastructure engineer specializing in containerization and orchestration',
    ],
    achievements: [
      { text: 'Reduced deployment time by 80% through automated CI/CD pipelines', category: 'technical' },
      { text: 'Achieved 99.99% uptime by implementing robust monitoring and alerting', category: 'technical' },
      { text: 'Cut infrastructure costs by 40% through resource optimization', category: 'business' },
      { text: 'Migrated 50+ applications to Kubernetes with zero downtime', category: 'technical' },
      { text: 'Implemented disaster recovery strategy reducing RTO from 4 hours to 15 minutes', category: 'technical' },
      { text: 'Automated infrastructure provisioning using Terraform and Ansible', category: 'technical' },
    ],
    skills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'Python', 'Bash', 'Monitoring'],
  },
};

// Helper functions
export function findRoleTemplate(jobTitle: string): RoleTemplate | null {
  const normalizedTitle = jobTitle.toLowerCase();

  for (const template of Object.values(ROLE_TEMPLATES)) {
    if (template.keywords.some(keyword => normalizedTitle.includes(keyword))) {
      return template;
    }
  }

  return null;
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
