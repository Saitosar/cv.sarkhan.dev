// src/stores/useResumeStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  ResumeStoreData,
  Experience,
  Skill,
  Certification,
  RichEducation,
} from '@/types/resume';
import type { ResumeBlock } from '@/types/canvas';

const HISTORY_MAX = 50;

interface ResumeState {
  // ── Data ──
  resume: ResumeStoreData;
  activeSection: string | null;

  // ── History (undo/redo) ──
  history: ResumeStoreData[];
  historyIndex: number;

  // ── Actions ──
  updateField: <K extends keyof ResumeStoreData>(field: K, value: ResumeStoreData[K]) => void;
  updateNestedField: <T>(path: string[], value: T) => void;
  setResume: (resume: ResumeStoreData) => void;
  setActiveSection: (section: string | null) => void;

  // Experience
  addExperience: () => void;
  updateExperience: (id: string, data: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (fromIndex: number, toIndex: number) => void;

  // Education
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<RichEducation>) => void;
  removeEducation: (id: string) => void;

  // Skills
  addSkill: (name: string) => void;
  removeSkill: (id: string) => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;

  // Certifications
  addCertification: () => void;
  updateCertification: (id: string, data: Partial<Certification>) => void;
  removeCertification: (id: string) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Apply AI suggestion
  applySuggestion: (blocks: ResumeBlock[]) => void;
}

// Приватные методы — не включены в интерфейс, доступны через get()
type ResumeInternals = {
  _pushHistory: (newResume: ResumeStoreData) => void;
};

const defaultResume: ResumeStoreData = {
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
};

export const useResumeStore = create<ResumeState>()(
  devtools(
    persist(
      (set, get) => {
        // Internal helper — не экспортируется в интерфейсе
        const pushHistory = (newResume: ResumeStoreData) => {
          const { history, historyIndex } = get();
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(structuredClone(newResume));
          if (newHistory.length > HISTORY_MAX) newHistory.shift();
          set({ history: newHistory, historyIndex: newHistory.length - 1 });
        };

        return {
          resume: defaultResume,
          activeSection: null,
          history: [defaultResume],
          historyIndex: 0,

          updateField: (field, value) => {
            const state = get();
            const newResume = { ...state.resume, [field]: value };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          updateNestedField: (path, value) => {
            const state = get();
            const newResume = structuredClone(state.resume);
            let current: Record<string, unknown> = newResume as unknown as Record<string, unknown>;
            for (let i = 0; i < path.length - 1; i++) {
              current = current[path[i]] as Record<string, unknown>;
            }
            current[path[path.length - 1]] = value;
            set({ resume: newResume });
            pushHistory(newResume);
          },

          setResume: (resume) => {
            set({ resume, history: [resume], historyIndex: 0 });
          },

          setActiveSection: (section) => {
            set({ activeSection: section });
          },

          // Experience
          addExperience: () => {
            const state = get();
            const newExp: Experience = {
              id: nanoid(),
              company: '',
              position: '',
              startDate: { month: '', year: '' },
              description: '',
            };
            const newResume = {
              ...state.resume,
              experience: [...state.resume.experience, newExp],
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          updateExperience: (id, data) => {
            const state = get();
            const newResume = {
              ...state.resume,
              experience: state.resume.experience.map((e) =>
                e.id === id ? { ...e, ...data } : e
              ),
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          removeExperience: (id) => {
            const state = get();
            const newResume = {
              ...state.resume,
              experience: state.resume.experience.filter((e) => e.id !== id),
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          reorderExperience: (fromIndex, toIndex) => {
            const state = get();
            const items = [...state.resume.experience];
            const [moved] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, moved);
            const newResume = { ...state.resume, experience: items };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          // Education
          addEducation: () => {
            const state = get();
            const newEdu: RichEducation = {
              id: nanoid(),
              institution: '',
              degree: '',
            };
            const newResume = {
              ...state.resume,
              education: [...state.resume.education, newEdu],
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          updateEducation: (id, data) => {
            const state = get();
            const newResume = {
              ...state.resume,
              education: state.resume.education.map((e) =>
                e.id === id ? { ...e, ...data } : e
              ),
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          removeEducation: (id) => {
            const state = get();
            const newResume = {
              ...state.resume,
              education: state.resume.education.filter((e) => e.id !== id),
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          // Skills
          addSkill: (name) => {
            const state = get();
            const newSkill: Skill = { id: nanoid(), name };
            const newResume = {
              ...state.resume,
              skills: [...state.resume.skills, newSkill],
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          removeSkill: (id) => {
            const state = get();
            const newResume = {
              ...state.resume,
              skills: state.resume.skills.filter((s) => s.id !== id),
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          updateSkill: (id, data) => {
            const state = get();
            const newResume = {
              ...state.resume,
              skills: state.resume.skills.map((s) =>
                s.id === id ? { ...s, ...data } : s
              ),
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          // Certifications
          addCertification: () => {
            const state = get();
            const newCert: Certification = { id: nanoid(), name: '', issuer: '' };
            const newResume = {
              ...state.resume,
              certifications: [...state.resume.certifications, newCert],
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          updateCertification: (id, data) => {
            const state = get();
            const newResume = {
              ...state.resume,
              certifications: state.resume.certifications.map((c) =>
                c.id === id ? { ...c, ...data } : c
              ),
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          removeCertification: (id) => {
            const state = get();
            const newResume = {
              ...state.resume,
              certifications: state.resume.certifications.filter((c) => c.id !== id),
            };
            set({ resume: newResume });
            pushHistory(newResume);
          },

          // Undo/Redo
          undo: () => {
            const { historyIndex, history } = get();
            if (historyIndex > 0) {
              const newIndex = historyIndex - 1;
              set({
                resume: history[newIndex],
                historyIndex: newIndex,
              });
            }
          },

          redo: () => {
            const { historyIndex, history } = get();
            if (historyIndex < history.length - 1) {
              const newIndex = historyIndex + 1;
              set({
                resume: history[newIndex],
                historyIndex: newIndex,
              });
            }
          },

          canUndo: () => get().historyIndex > 0,
          canRedo: () => get().historyIndex < get().history.length - 1,

          // Apply AI suggestion (from Canvas Sync Protocol)
          applySuggestion: (blocks) => {
            const state = get();
            const newResume = structuredClone(state.resume);
            for (const block of blocks) {
              switch (block.type) {
                case 'summary':
                  newResume.summary = block.content.text as string;
                  break;
                case 'experience':
                  // merge or replace
                  break;
                // ... handle other types
              }
            }
            set({ resume: newResume });
            pushHistory(newResume);
          },
        };
      },
      {
        name: 'resume-store',
        version: 1,
        partialize: (state) => ({
          resume: state.resume,
          history: state.history,
          historyIndex: state.historyIndex,
        }),
      }
    ),
    { name: 'ResumeStore' }
  )
);

export type { ResumeState };
export type { ResumeInternals };
