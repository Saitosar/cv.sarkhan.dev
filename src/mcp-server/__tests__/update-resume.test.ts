// src/mcp-server/__tests__/update-resume.test.ts
// RED: Tests for update_resume MCP tool — implementation does not exist yet
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the resume data loader
vi.mock('../lib/load-data', () => ({
  loadResumeData: vi.fn(() => ({
    resume: {
      id: 'resume-1',
      fullName: 'Alex Mercer',
      jobTitle: 'Senior Full Stack Engineer',
      location: 'San Francisco, CA',
      contact: {
        email: 'alex.mercer@example.com',
        phone: '+1 (415) 555-0199',
        linkedin: 'https://linkedin.com/in/alexmercer',
      },
      summary: 'Results-driven Senior Full Stack Engineer with 8+ years of experience.',
      experience: [
        {
          id: 'exp-1',
          company: 'Nexus Labs',
          position: 'Senior Full Stack Engineer',
          startDate: { month: '03', year: '2022' },
          endDate: { month: '', year: '', isCurrent: true },
          description: 'Lead product engineering.',
          highlights: ['Reduced page load time by 40%'],
        },
      ],
      education: [],
      skills: [
        { id: 'sk-1', name: 'TypeScript', category: 'Languages', level: 'expert' },
      ],
      certifications: [],
      achievements: [],
      trainings: [],
      languages: [],
      projects: [],
      targetJob: { title: 'Senior Full Stack Engineer', description: '' },
    },
    ats: { overall: 87, breakdown: {}, sections: [], suggestions: [], matchedKeywords: [], missingKeywords: [], lastAnalyzed: 0 },
  })),
}));

vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock('path', () => ({
  join: vi.fn((...args: string[]) => args.join('/')),
  resolve: vi.fn((...args: string[]) => args.join('/')),
}));

describe('update_resume tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic updates', () => {
    it('should update fullName', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ fullName: 'John Doe' });
      expect(result.success).toBe(true);
      expect(result.resume.fullName).toBe('John Doe');
    });

    it('should update jobTitle', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ jobTitle: 'Lead Engineer' });
      expect(result.success).toBe(true);
      expect(result.resume.jobTitle).toBe('Lead Engineer');
    });

    it('should update location', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ location: 'New York, NY' });
      expect(result.success).toBe(true);
      expect(result.resume.location).toBe('New York, NY');
    });

    it('should update summary', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ summary: 'New summary text' });
      expect(result.success).toBe(true);
      expect(result.resume.summary).toBe('New summary text');
    });
  });

  describe('contact updates', () => {
    it('should update email', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ contact: { email: 'new@example.com' } });
      expect(result.success).toBe(true);
      expect(result.resume.contact.email).toBe('new@example.com');
    });

    it('should update phone', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ contact: { phone: '+1 (555) 123-4567' } });
      expect(result.success).toBe(true);
      expect(result.resume.contact.phone).toBe('+1 (555) 123-4567');
    });

    it('should update linkedin URL', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ contact: { linkedin: 'https://linkedin.com/in/newprofile' } });
      expect(result.success).toBe(true);
      expect(result.resume.contact.linkedin).toBe('https://linkedin.com/in/newprofile');
    });
  });

  describe('experience updates', () => {
    it('should add new experience entry', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const newExp = {
        company: 'New Corp',
        position: 'Developer',
        startDate: { month: '01', year: '2024' },
        endDate: { month: '', year: '', isCurrent: true },
        description: 'New role',
        highlights: ['Built feature X'],
      };
      const result = await updateResume({ experience: { add: [newExp] } });
      expect(result.success).toBe(true);
      expect(result.resume.experience.length).toBeGreaterThanOrEqual(2);
    });

    it('should update existing experience entry', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({
        experience: { update: { id: 'exp-1', position: 'Lead Full Stack Engineer' } },
      });
      expect(result.success).toBe(true);
      const updated = result.resume.experience.find((e: { id: string }) => e.id === 'exp-1');
      expect(updated.position).toBe('Lead Full Stack Engineer');
    });

    it('should remove experience entry', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ experience: { remove: ['exp-1'] } });
      expect(result.success).toBe(true);
      expect(result.resume.experience.find((e: { id: string }) => e.id === 'exp-1')).toBeUndefined();
    });
  });

  describe('skills updates', () => {
    it('should add new skill', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const newSkill = { name: 'Python', category: 'Languages', level: 'advanced' };
      const result = await updateResume({ skills: { add: [newSkill] } });
      expect(result.success).toBe(true);
      expect(result.resume.skills.some((s: { name: string }) => s.name === 'Python')).toBe(true);
    });

    it('should update existing skill level', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({
        skills: { update: { id: 'sk-1', level: 'master' } },
      });
      expect(result.success).toBe(true);
      const updated = result.resume.skills.find((s: { id: string }) => s.id === 'sk-1');
      expect(updated.level).toBe('master');
    });

    it('should remove skill', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ skills: { remove: ['sk-1'] } });
      expect(result.success).toBe(true);
      expect(result.resume.skills.find((s: { id: string }) => s.id === 'sk-1')).toBeUndefined();
    });
  });

  describe('validation', () => {
    it('should return error when no fields provided', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('No fields to update');
    });

    it('should validate email format', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ contact: { email: 'not-an-email' } });
      expect(result.success).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should validate phone format', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ contact: { phone: 'abc' } });
      expect(result.success).toBe(false);
      expect(result.error).toContain('phone');
    });

    it('should validate skill level', async () => {
      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({
        skills: { add: [{ name: 'Python', category: 'Languages', level: 'invalid-level' }] },
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('level');
    });
  });

  describe('file persistence', () => {
    it('should write updated resume to file', async () => {
      const fs = await import('fs/promises');
      (fs.writeFile as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const { updateResume } = await import('../tools/update-resume');
      await updateResume({ fullName: 'John Doe' });

      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should return error when file write fails', async () => {
      const fs = await import('fs/promises');
      (fs.writeFile as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Permission denied')
      );

      const { updateResume } = await import('../tools/update-resume');
      const result = await updateResume({ fullName: 'John Doe' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Permission denied');
    });
  });

  describe('MCP tool registration', () => {
    it('should register as an MCP tool with correct schema', async () => {
      const { updateResumeToolDefinition } = await import('../tools/update-resume');
      expect(updateResumeToolDefinition).toHaveProperty('name', 'update_resume');
      expect(updateResumeToolDefinition).toHaveProperty('description');
      expect(updateResumeToolDefinition).toHaveProperty('inputSchema');
      expect(updateResumeToolDefinition.inputSchema).toHaveProperty('type', 'object');
    });
  });
});
