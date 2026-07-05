// src/types/__tests__/resume-adapter.test.ts
import { describe, it, expect } from 'vitest';
import { resumeDataToStore, storeToResumeData } from '@/types/resume';
import type { ResumeData, ResumeStoreData } from '@/types/resume';

function createSampleResumeData(): ResumeData {
  return {
    fullName: 'John Doe',
    jobTitle: 'Software Engineer',
    contact: { email: 'john@example.com', phone: '+1234567890' },
    location: 'New York',
    github: 'https://github.com/johndoe',
    website: 'https://johndoe.dev',
    summary: 'Experienced developer',
    experience: [
      {
        id: 'exp-1',
        company: 'Acme Corp',
        position: 'Senior Developer',
        location: 'NYC',
        startDate: { month: '01', year: '2020' },
        endDate: { month: '12', year: '2023', isCurrent: false },
        description: 'Built stuff',
        highlights: ['Led team', 'Shipped product'],
      },
    ],
    education: [
      { institution: 'MIT', degree: 'BS Computer Science', years: '2016-2020' },
    ],
    skills: [{ value: 'TypeScript' }, { value: 'React' }],
    certifications: [{ value: 'AWS Certified' }],
    achievements: [{ value: 'Employee of the Month' }],
    trainings: [{ value: 'Leadership Training' }],
    languages: [{ language: 'English', proficiency: 'Native' }],
    projects: [
      {
        id: 'proj-1',
        name: 'My App',
        description: 'A cool app',
        technologies: 'React, Node',
      },
    ],
    targetJob: {
      title: 'Senior Software Engineer',
      description: 'Looking for a challenging role',
    },
  };
}

describe('resumeDataToStore', () => {
  it('should convert ResumeData to ResumeStoreData', () => {
    const data = createSampleResumeData();
    const store = resumeDataToStore(data);

    // Top-level fields should be preserved
    expect(store.fullName).toBe('John Doe');
    expect(store.jobTitle).toBe('Software Engineer');
    expect(store.contact).toEqual({ email: 'john@example.com', phone: '+1234567890' });
    expect(store.summary).toBe('Experienced developer');

    // Experience should be preserved as-is
    expect(store.experience).toHaveLength(1);
    expect(store.experience[0].company).toBe('Acme Corp');

    // Education should be converted to RichEducation with ids
    expect(store.education).toHaveLength(1);
    expect(store.education[0].id).toBe('edu-0');
    expect(store.education[0].institution).toBe('MIT');
    expect(store.education[0].degree).toBe('BS Computer Science');
    expect(store.education[0].endYear).toBe('2016-2020');
    expect(store.education[0].field).toBeUndefined();
    expect(store.education[0].startYear).toBeUndefined();

    // Skills should be converted with ids
    expect(store.skills).toHaveLength(2);
    expect(store.skills[0].id).toBe('sk-0');
    expect(store.skills[0].name).toBe('TypeScript');
    expect(store.skills[1].id).toBe('sk-1');
    expect(store.skills[1].name).toBe('React');

    // Certifications should be converted with ids
    expect(store.certifications).toHaveLength(1);
    expect(store.certifications[0].id).toBe('cert-0');
    expect(store.certifications[0].name).toBe('AWS Certified');
    expect(store.certifications[0].issuer).toBe('');

    // Other fields should be preserved
    expect(store.achievements).toEqual([{ value: 'Employee of the Month' }]);
    expect(store.trainings).toEqual([{ value: 'Leadership Training' }]);
    expect(store.languages).toEqual([{ language: 'English', proficiency: 'Native' }]);
    expect(store.projects).toHaveLength(1);
    expect(store.targetJob?.title).toBe('Senior Software Engineer');
  });

  it('should handle empty arrays', () => {
    const data: ResumeData = {
      fullName: '',
      jobTitle: '',
      contact: { email: '', phone: '' },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      achievements: [],
      trainings: [],
    };
    const store = resumeDataToStore(data);
    expect(store.education).toEqual([]);
    expect(store.skills).toEqual([]);
    expect(store.certifications).toEqual([]);
  });
});

describe('storeToResumeData', () => {
  it('should convert ResumeStoreData to ResumeData', () => {
    const store: ResumeStoreData = {
      fullName: 'Jane Doe',
      jobTitle: 'Designer',
      contact: { email: 'jane@example.com', phone: '+9876543210' },
      location: 'SF',
      summary: 'Creative designer',
      experience: [
        {
          id: 'exp-1',
          company: 'Design Co',
          position: 'Lead Designer',
          startDate: { month: '01', year: '2019' },
          description: 'Designed things',
        },
      ],
      education: [
        {
          id: 'edu-0',
          institution: 'RISD',
          degree: 'BFA Design',
          endYear: '2018',
        },
      ],
      skills: [{ id: 'sk-0', name: 'Figma' }, { id: 'sk-1', name: 'Photoshop' }],
      certifications: [{ id: 'cert-0', name: 'Adobe Certified', issuer: 'Adobe' }],
      achievements: [],
      trainings: [],
    };
    const data = storeToResumeData(store);

    // Top-level fields preserved
    expect(data.fullName).toBe('Jane Doe');
    expect(data.jobTitle).toBe('Designer');

    // Education converted back
    expect(data.education).toHaveLength(1);
    expect(data.education[0].institution).toBe('RISD');
    expect(data.education[0].degree).toBe('BFA Design');
    expect(data.education[0].years).toBe('2018');

    // Skills converted back
    expect(data.skills).toHaveLength(2);
    expect(data.skills[0].value).toBe('Figma');
    expect(data.skills[1].value).toBe('Photoshop');

    // Certifications converted back
    expect(data.certifications).toHaveLength(1);
    expect(data.certifications[0].value).toBe('Adobe Certified');
  });

  it('should handle education with startYear and no endYear', () => {
    const store: ResumeStoreData = {
      fullName: '',
      jobTitle: '',
      contact: { email: '', phone: '' },
      summary: '',
      experience: [],
      education: [
        {
          id: 'edu-0',
          institution: 'UCLA',
          degree: 'BS',
          startYear: '2020',
          endYear: undefined,
        },
      ],
      skills: [],
      certifications: [],
      achievements: [],
      trainings: [],
    };
    const data = storeToResumeData(store);
    expect(data.education[0].years).toBe('2020 - ');
  });
});

describe('roundtrip (data → store → data)', () => {
  it('should preserve all top-level fields through a roundtrip', () => {
    const original = createSampleResumeData();
    const store = resumeDataToStore(original);
    const result = storeToResumeData(store);

    // Top-level fields should match
    expect(result.fullName).toBe(original.fullName);
    expect(result.jobTitle).toBe(original.jobTitle);
    expect(result.contact).toEqual(original.contact);
    expect(result.location).toBe(original.location);
    expect(result.github).toBe(original.github);
    expect(result.website).toBe(original.website);
    expect(result.summary).toBe(original.summary);
    expect(result.languages).toEqual(original.languages);
    expect(result.targetJob).toEqual(original.targetJob);
  });

  it('should preserve experience through a roundtrip', () => {
    const original = createSampleResumeData();
    const store = resumeDataToStore(original);
    const result = storeToResumeData(store);

    expect(result.experience).toHaveLength(1);
    expect(result.experience[0].company).toBe('Acme Corp');
    expect(result.experience[0].position).toBe('Senior Developer');
    expect(result.experience[0].description).toBe('Built stuff');
  });

  it('should convert education through a roundtrip (years string)', () => {
    const original = createSampleResumeData();
    const store = resumeDataToStore(original);
    const result = storeToResumeData(store);

    expect(result.education).toHaveLength(1);
    expect(result.education[0].institution).toBe('MIT');
    expect(result.education[0].degree).toBe('BS Computer Science');
    expect(result.education[0].years).toBe('2016-2020');
  });

  it('should convert skills through a roundtrip', () => {
    const original = createSampleResumeData();
    const store = resumeDataToStore(original);
    const result = storeToResumeData(store);

    expect(result.skills).toHaveLength(2);
    expect(result.skills[0].value).toBe('TypeScript');
    expect(result.skills[1].value).toBe('React');
  });

  it('should convert certifications through a roundtrip', () => {
    const original = createSampleResumeData();
    const store = resumeDataToStore(original);
    const result = storeToResumeData(store);

    expect(result.certifications).toHaveLength(1);
    expect(result.certifications[0].value).toBe('AWS Certified');
  });

  it('should preserve achievements, trainings, projects through a roundtrip', () => {
    const original = createSampleResumeData();
    const store = resumeDataToStore(original);
    const result = storeToResumeData(store);

    expect(result.achievements).toEqual(original.achievements);
    expect(result.trainings).toEqual(original.trainings);
    expect(result.projects).toEqual(original.projects);
  });
});
