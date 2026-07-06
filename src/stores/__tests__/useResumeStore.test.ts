// src/stores/__tests__/useResumeStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useResumeStore } from '../useResumeStore';
import type { ResumeStoreData } from '@/types/resume';

// Helper to get fresh store state for each test
function createTestResume(overrides?: Partial<ResumeStoreData>): ResumeStoreData {
  return {
    fullName: '',
    jobTitle: '',
    contact: { email: '', phone: '' },
    location: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    achievements: [],
    trainings: [],
    ...overrides,
  };
}

describe('useResumeStore', () => {
  beforeEach(() => {
    // Reset the store between tests
    useResumeStore.setState({
      resume: createTestResume(),
      activeSection: null,
      history: [createTestResume()],
      historyIndex: 0,
    });
    // Clear localStorage so persist doesn't restore stale data
    localStorage.clear();
  });

  describe('default state', () => {
    it('should have empty resume fields', () => {
      const state = useResumeStore.getState();
      expect(state.resume.fullName).toBe('');
      expect(state.resume.jobTitle).toBe('');
      expect(state.resume.contact).toEqual({ email: '', phone: '' });
      expect(state.resume.summary).toBe('');
    });

    it('should have empty arrays for collections', () => {
      const state = useResumeStore.getState();
      expect(state.resume.experience).toEqual([]);
      expect(state.resume.education).toEqual([]);
      expect(state.resume.skills).toEqual([]);
      expect(state.resume.certifications).toEqual([]);
      expect(state.resume.achievements).toEqual([]);
      expect(state.resume.trainings).toEqual([]);
    });

    it('should have activeSection as null', () => {
      const state = useResumeStore.getState();
      expect(state.activeSection).toBeNull();
    });

    it('should have history initialized with one entry', () => {
      const state = useResumeStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.historyIndex).toBe(0);
    });
  });

  describe('updateField', () => {
    it('should update a top-level field', () => {
      useResumeStore.getState().updateField('fullName', 'John Doe');
      const state = useResumeStore.getState();
      expect(state.resume.fullName).toBe('John Doe');
    });

    it('should update jobTitle', () => {
      useResumeStore.getState().updateField('jobTitle', 'Software Engineer');
      const state = useResumeStore.getState();
      expect(state.resume.jobTitle).toBe('Software Engineer');
    });

    it('should update summary', () => {
      useResumeStore.getState().updateField('summary', 'Experienced developer');
      const state = useResumeStore.getState();
      expect(state.resume.summary).toBe('Experienced developer');
    });

    it('should push history after update', () => {
      useResumeStore.getState().updateField('fullName', 'Jane Doe');
      const state = useResumeStore.getState();
      expect(state.historyIndex).toBe(1);
      expect(state.history).toHaveLength(2);
    });
  });

  describe('addExperience / removeExperience', () => {
    it('should add an experience entry', () => {
      useResumeStore.getState().addExperience();
      const state = useResumeStore.getState();
      expect(state.resume.experience).toHaveLength(1);
      expect(state.resume.experience[0]).toHaveProperty('id');
      expect(state.resume.experience[0].company).toBe('');
      expect(state.resume.experience[0].position).toBe('');
    });

    it('should add multiple experiences', () => {
      useResumeStore.getState().addExperience();
      useResumeStore.getState().addExperience();
      const state = useResumeStore.getState();
      expect(state.resume.experience).toHaveLength(2);
    });

    it('should remove an experience by id', () => {
      useResumeStore.getState().addExperience();
      const expId = useResumeStore.getState().resume.experience[0].id;
      useResumeStore.getState().removeExperience(expId!);
      const state = useResumeStore.getState();
      expect(state.resume.experience).toHaveLength(0);
    });

    it('should not remove if id does not match', () => {
      useResumeStore.getState().addExperience();
      useResumeStore.getState().removeExperience('non-existent-id');
      const state = useResumeStore.getState();
      expect(state.resume.experience).toHaveLength(1);
    });

    it('should push history on add', () => {
      useResumeStore.getState().addExperience();
      expect(useResumeStore.getState().historyIndex).toBe(1);
    });

    it('should push history on remove', () => {
      useResumeStore.getState().addExperience();
      const expId = useResumeStore.getState().resume.experience[0].id;
      useResumeStore.getState().removeExperience(expId!);
      expect(useResumeStore.getState().historyIndex).toBe(2);
    });
  });

  describe('updateExperience', () => {
    it('should update specific fields of an experience', () => {
      useResumeStore.getState().addExperience();
      const expId = useResumeStore.getState().resume.experience[0].id;
      useResumeStore.getState().updateExperience(expId!, {
        company: 'Acme Corp',
        position: 'Developer',
      });
      const state = useResumeStore.getState();
      expect(state.resume.experience[0].company).toBe('Acme Corp');
      expect(state.resume.experience[0].position).toBe('Developer');
    });
  });

  describe('addEducation / removeEducation', () => {
    it('should add an education entry', () => {
      useResumeStore.getState().addEducation();
      const state = useResumeStore.getState();
      expect(state.resume.education).toHaveLength(1);
      expect(state.resume.education[0]).toHaveProperty('id');
      expect(state.resume.education[0].institution).toBe('');
    });

    it('should remove an education entry by id', () => {
      useResumeStore.getState().addEducation();
      const eduId = useResumeStore.getState().resume.education[0].id;
      useResumeStore.getState().removeEducation(eduId);
      expect(useResumeStore.getState().resume.education).toHaveLength(0);
    });
  });

  describe('addSkill / removeSkill / updateSkill', () => {
    it('should add a skill', () => {
      useResumeStore.getState().addSkill('TypeScript');
      const state = useResumeStore.getState();
      expect(state.resume.skills).toHaveLength(1);
      expect(state.resume.skills[0].name).toBe('TypeScript');
    });

    it('should remove a skill by id', () => {
      useResumeStore.getState().addSkill('TypeScript');
      const skillId = useResumeStore.getState().resume.skills[0].id;
      useResumeStore.getState().removeSkill(skillId);
      expect(useResumeStore.getState().resume.skills).toHaveLength(0);
    });

    it('should update a skill', () => {
      useResumeStore.getState().addSkill('TS');
      const skillId = useResumeStore.getState().resume.skills[0].id;
      useResumeStore.getState().updateSkill(skillId, { name: 'TypeScript', level: 'expert' });
      const state = useResumeStore.getState();
      expect(state.resume.skills[0].name).toBe('TypeScript');
      expect(state.resume.skills[0].level).toBe('expert');
    });
  });

  describe('addCertification / removeCertification / updateCertification', () => {
    it('should add a certification', () => {
      useResumeStore.getState().addCertification();
      const state = useResumeStore.getState();
      expect(state.resume.certifications).toHaveLength(1);
      expect(state.resume.certifications[0]).toHaveProperty('id');
      expect(state.resume.certifications[0].name).toBe('');
    });

    it('should remove a certification by id', () => {
      useResumeStore.getState().addCertification();
      const certId = useResumeStore.getState().resume.certifications[0].id;
      useResumeStore.getState().removeCertification(certId);
      expect(useResumeStore.getState().resume.certifications).toHaveLength(0);
    });

    it('should update a certification', () => {
      useResumeStore.getState().addCertification();
      const certId = useResumeStore.getState().resume.certifications[0].id;
      useResumeStore.getState().updateCertification(certId, { name: 'AWS Certified', issuer: 'Amazon' });
      const state = useResumeStore.getState();
      expect(state.resume.certifications[0].name).toBe('AWS Certified');
      expect(state.resume.certifications[0].issuer).toBe('Amazon');
    });
  });

  describe('undo / redo', () => {
    it('should undo a field change', () => {
      const initialName = useResumeStore.getState().resume.fullName;
      useResumeStore.getState().updateField('fullName', 'New Name');
      expect(useResumeStore.getState().resume.fullName).toBe('New Name');
      useResumeStore.getState().undo();
      expect(useResumeStore.getState().resume.fullName).toBe(initialName);
    });

    it('should redo after undo', () => {
      useResumeStore.getState().updateField('fullName', 'New Name');
      useResumeStore.getState().undo();
      useResumeStore.getState().redo();
      expect(useResumeStore.getState().resume.fullName).toBe('New Name');
    });

    it('should not undo when at the beginning of history', () => {
      useResumeStore.getState().undo();
      expect(useResumeStore.getState().historyIndex).toBe(0);
    });

    it('should not redo when at the end of history', () => {
      useResumeStore.getState().updateField('fullName', 'Name');
      useResumeStore.getState().redo();
      expect(useResumeStore.getState().historyIndex).toBe(1);
    });

    it('canUndo should return false at initial state', () => {
      expect(useResumeStore.getState().canUndo()).toBe(false);
    });

    it('canUndo should return true after a change', () => {
      useResumeStore.getState().updateField('fullName', 'Name');
      expect(useResumeStore.getState().canUndo()).toBe(true);
    });

    it('canRedo should return false at initial state', () => {
      expect(useResumeStore.getState().canRedo()).toBe(false);
    });

    it('canRedo should return true after undo', () => {
      useResumeStore.getState().updateField('fullName', 'Name');
      useResumeStore.getState().undo();
      expect(useResumeStore.getState().canRedo()).toBe(true);
    });

    it('should clear future history on new action after undo', () => {
      useResumeStore.getState().updateField('fullName', 'A');
      useResumeStore.getState().updateField('fullName', 'B');
      useResumeStore.getState().undo(); // back to 'A'
      useResumeStore.getState().updateField('fullName', 'C'); // should clear 'B' from future
      useResumeStore.getState().undo(); // back to 'A'
      useResumeStore.getState().redo(); // forward to 'C'
      expect(useResumeStore.getState().resume.fullName).toBe('C');
    });
  });

  describe('_pushHistory privacy', () => {
    it('should not expose _pushHistory on the store interface', () => {
      const state = useResumeStore.getState() as unknown as Record<string, unknown>;
      expect(state._pushHistory).toBeUndefined();
    });
  });

  describe('setActiveSection', () => {
    it('should set activeSection', () => {
      useResumeStore.getState().setActiveSection('experience');
      expect(useResumeStore.getState().activeSection).toBe('experience');
    });

    it('should set activeSection to null', () => {
      useResumeStore.getState().setActiveSection('experience');
      useResumeStore.getState().setActiveSection(null);
      expect(useResumeStore.getState().activeSection).toBeNull();
    });
  });

  describe('setResume', () => {
    it('should replace the entire resume and reset history', () => {
      useResumeStore.getState().updateField('fullName', 'Old Name');
      const newResume = createTestResume({ fullName: 'Brand New', jobTitle: 'Engineer' });
      useResumeStore.getState().setResume(newResume);
      const state = useResumeStore.getState();
      expect(state.resume.fullName).toBe('Brand New');
      expect(state.history).toHaveLength(1);
      expect(state.historyIndex).toBe(0);
    });
  });

  describe('reorderExperience', () => {
    it('should reorder experience entries', () => {
      useResumeStore.getState().addExperience();
      useResumeStore.getState().addExperience();
      useResumeStore.getState().updateExperience(
        useResumeStore.getState().resume.experience[0].id!,
        { company: 'First' }
      );
      useResumeStore.getState().updateExperience(
        useResumeStore.getState().resume.experience[1].id!,
        { company: 'Second' }
      );
      useResumeStore.getState().reorderExperience(0, 1);
      const state = useResumeStore.getState();
      expect(state.resume.experience[0].company).toBe('Second');
      expect(state.resume.experience[1].company).toBe('First');
    });
  });

  describe('persist (localStorage)', () => {
    it('should persist resume data to localStorage', () => {
      useResumeStore.getState().updateField('fullName', 'Persisted User');
      const stored = localStorage.getItem('resume-store');
      expect(stored).not.toBeNull();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.resume.fullName).toBe('Persisted User');
      }
    });

    it('should persist history state', () => {
      useResumeStore.getState().updateField('fullName', 'User');
      const stored = localStorage.getItem('resume-store');
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.history).toBeDefined();
        expect(parsed.state.historyIndex).toBe(1);
      }
    });
  });
});
