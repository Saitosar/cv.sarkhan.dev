# Phase 1 — Foundation Architecture

> **Дата:** 2026-07-05
> **Проект:** cv.sarkhan.dev
> **Статус:** План
> **Цель:** Заложить архитектурную базу — Zustand store, TypeScript типы, Prisma schema, структура файлов

---

## 1. Zustand Store Architecture

### 1.1 Стратегия: один store или несколько?

**Решение: три отдельных store** с единым `useResumeStore` как ядром.

| Store | Назначение | persist | DevTools |
|-------|-----------|---------|----------|
| `useResumeStore` | Данные резюме + undo/redo | ✅ localStorage `resume-store` | ✅ |
| `useChatStore` | История чата + состояние AI | ✅ localStorage `chat-store` | ✅ |
| `useATSStore` | ATS Score + suggestions | ❌ (вычисляется на лету) | ✅ |

**Почему не один store:**
- Chat и ATS обновляются часто (каждое сообщение AI), не должны триггерить ре-рендер Canvas
- Разные ключи localStorage — раздельные лимиты 5MB
- undo/redo только для Resume, не для чата

### 1.2 Типы TypeScript

```typescript
// src/types/resume.ts
//
// ResumeData — публичный тип, совместимый с существующими компонентами
// (CreateResumeForm, LivePreview, ClassicTemplate, ATSScoreCard и др.)
// Rich-типы (Skill, Certification, Education) — для внутреннего использования
// в store и AI-адаптере.

// ── Contact ──
export interface Contact {
  email: string;
  phone: string;
  linkedin?: string;
}

// ── Experience ──
export interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: { month: string; year: string };
  endDate?: { month?: string; year?: string; isCurrent?: boolean };
  description: string;
  highlights?: string[];
}

// ── Education (существующая структура) ──
export interface Education {
  institution: string;
  degree: string;
  years?: string;
}

// ── Rich Education (для store/AI, с id и деталями) ──
export interface RichEducation {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  gpa?: string;
}

// ── Skill (существующая структура) ──
export interface SkillEntry {
  value: string;
}

// ── Rich Skill (для store/AI) ──
export interface Skill {
  id: string;
  name: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// ── Certification (существующая структура) ──
export interface CertificationEntry {
  value: string;
}

// ── Rich Certification (для store/AI) ──
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

// ── Achievement / Training (существующая структура) ──
export interface AchievementEntry {
  value: string;
}

export interface TrainingEntry {
  value: string;
}

// ── Language ──
export interface Language {
  language: string;
  proficiency: string;
}

// ── Project ──
export interface Project {
  id: string;
  name: string;
  description: string;
  technologies?: string;
  url?: string;
}

// ── ResumeData (публичный тип, совместим с существующим кодом) ──
export interface ResumeData {
  id?: string;
  fullName: string;
  jobTitle: string;
  contact: Contact;
  location?: string;
  github?: string;
  website?: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: SkillEntry[];
  certifications: CertificationEntry[];
  achievements: AchievementEntry[];
  trainings: TrainingEntry[];
  languages?: Language[];
  projects?: Project[];
  targetJob?: {
    title?: string;
    description?: string;
  };
}

// ── ResumeStoreData (внутренний тип store с rich-полями) ──
export interface ResumeStoreData {
  id?: string;
  fullName: string;
  jobTitle: string;
  contact: Contact;
  location?: string;
  github?: string;
  website?: string;
  summary: string;
  experience: Experience[];
  education: RichEducation[];
  skills: Skill[];
  certifications: Certification[];
  achievements: AchievementEntry[];
  trainings: TrainingEntry[];
  languages?: Language[];
  projects?: Project[];
  targetJob?: {
    title?: string;
    description?: string;
  };
}

// ── Adapter: преобразование между ResumeData и ResumeStoreData ──
export function resumeDataToStore(data: ResumeData): ResumeStoreData {
  return {
    ...data,
    education: data.education.map((e, i) => ({
      id: `edu-${i}`,
      institution: e.institution,
      degree: e.degree,
      field: undefined,
      startYear: undefined,
      endYear: e.years,
    })),
    skills: data.skills.map((s, i) => ({
      id: `sk-${i}`,
      name: s.value,
    })),
    certifications: data.certifications.map((c, i) => ({
      id: `cert-${i}`,
      name: c.value,
      issuer: '',
    })),
  };
}

export function storeToResumeData(data: ResumeStoreData): ResumeData {
  return {
    ...data,
    education: data.education.map((e) => ({
      institution: e.institution,
      degree: e.degree,
      years: e.endYear || `${e.startYear || ''} - ${e.endYear || ''}`,
    })),
    skills: data.skills.map((s) => ({ value: s.name })),
    certifications: data.certifications.map((c) => ({ value: c.name })),
  };
}
```

```typescript
// src/types/chat.ts

export type MessageRole = 'user' | 'assistant' | 'system';

export type SectionType =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'languages'
  | 'projects'
  | 'general';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  section?: SectionType;
  metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  focusSection: SectionType | null;
  status: 'idle' | 'loading' | 'ready' | 'chatting' | 'suggesting';
}
```

```typescript
// src/types/ats.ts
//
// ATSScore — совместим с существующим кодом (ats-scorer.ts, ATSScoreCard.tsx)
// breakdown — основное поле (используется в Object.entries(score.breakdown))
// sections — дополнительное поле для детального анализа

export interface ATSScore {
  overall: number;           // 0–100
  breakdown: {
    keywords: number;
    formatting: number;
    completeness: number;
    readability: number;
  };
  sections?: ATSSectionScore[];  // дополнительно, для детального анализа
  suggestions: string[];         // string[] — совместимо с ats-scorer.ts
  matchedKeywords: string[];
  missingKeywords: string[];
  lastAnalyzed: number | null;
}

export interface ATSSectionScore {
  section: SectionType;
  score: number;             // 0–100
  weight: number;            // вклад в overall (0–1)
  issues: string[];
}

export interface ATSSuggestion {
  id: string;
  section: SectionType;
  severity: 'high' | 'medium' | 'low';
  message: string;
  actionLabel?: string;
  applied: boolean;
}
```

```typescript
// src/types/canvas.ts
// Из Canvas Sync Protocol (05-canvas-sync-protocol.md)

export interface ResumeBlock {
  id: string;
  section: string;
  type: 'experience' | 'skill' | 'education' | 'summary' | 'certification' | 'project';
  content: Record<string, unknown>;
  order: number;
  version: number;
}

// ── Canvas Events ──
export type CanvasEvent =
  | { type: 'BLOCK_TAPPED'; blockId: string; section: string }
  | { type: 'BLOCK_DRAGGED'; blockId: string; x: number; y: number }
  | { type: 'BLOCK_RESIZED'; blockId: string; width: number; height: number }
  | { type: 'BLOCK_DELETED'; blockId: string }
  | { type: 'SECTION_REORDERED'; section: string; fromIndex: number; toIndex: number }
  | { type: 'CANVAS_ZOOM_CHANGED'; zoom: number };

// ── Chat Events ──
export type ChatEvent =
  | { type: 'AI_SUGGESTION'; suggestionId: string; section: string; content: unknown }
  | { type: 'AI_APPLIED'; suggestionId: string }
  | { type: 'AI_REJECTED'; suggestionId: string }
  | { type: 'USER_MESSAGE'; messageId: string; text: string }
  | { type: 'UNDO'; targetId?: string }
  | { type: 'REDO' };

// ── Sync Events (bridge between chat & canvas) ──
export type SyncEvent =
  | { type: 'FOCUS_CHAT'; section: string; blockId: string }
  | { type: 'FOCUS_CANVAS'; section: string }
  | { type: 'CANVAS_UPDATED'; blocks: ResumeBlock[] }
  | { type: 'CHAT_UPDATED'; history: ChatMessage[] };
```

### 1.3 useResumeStore

```typescript
// src/stores/useResumeStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { ResumeStoreData, Experience, Skill, Certification, RichEducation } from '@/types/resume';

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
```

### 1.4 useChatStore

```typescript
// src/stores/useChatStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { ChatMessage, ChatSession, SectionType } from '@/types/chat';

interface ChatState {
  session: ChatSession;
  inputValue: string;
  inputPlaceholder: string;
  isStreaming: boolean;

  // Actions
  addMessage: (role: ChatMessage['role'], content: string, section?: SectionType) => void;
  updateLastMessage: (content: string) => void;
  setInputValue: (value: string) => void;
  setInputPlaceholder: (placeholder: string) => void;
  setFocusSection: (section: SectionType | null) => void;
  setStatus: (status: ChatSession['status']) => void;
  setIsStreaming: (streaming: boolean) => void;
  clearSession: () => void;
}

const defaultSession: ChatSession = {
  id: nanoid(),
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  focusSection: null,
  status: 'idle',
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        session: defaultSession,
        inputValue: '',
        inputPlaceholder: 'Tell Aether what to improve...',
        isStreaming: false,

        addMessage: (role, content, section) => {
          const { session } = get();
          const message: ChatMessage = {
            id: nanoid(),
            role,
            content,
            timestamp: Date.now(),
            section,
          };
          set({
            session: {
              ...session,
              messages: [...session.messages, message],
              updatedAt: Date.now(),
            },
          });
        },

        updateLastMessage: (content) => {
          const { session } = get();
          const messages = [...session.messages];
          if (messages.length > 0) {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              content,
            };
            set({ session: { ...session, messages } });
          }
        },

        setInputValue: (value) => set({ inputValue: value }),
        setInputPlaceholder: (placeholder) => set({ inputPlaceholder: placeholder }),
        setFocusSection: (section) =>
          set({ session: { ...get().session, focusSection: section } }),
        setStatus: (status) =>
          set({ session: { ...get().session, status } }),
        setIsStreaming: (streaming) => set({ isStreaming: streaming }),
        clearSession: () =>
          set({
            session: { ...defaultSession, id: nanoid() },
            inputValue: '',
            isStreaming: false,
          }),
      }),
      {
        name: 'chat-store',
        version: 1,
        partialize: (state) => ({
          session: state.session,
        }),
      }
    ),
    { name: 'ChatStore' }
  )
);
```

### 1.5 useATSStore

```typescript
// src/stores/useATSStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ATSScore, ATSSectionScore, ATSSuggestion } from '@/types/ats';

interface ATSState {
  score: ATSScore | null;
  isAnalyzing: boolean;
  lastAnalyzed: number | null;

  // Actions
  setScore: (score: ATSScore) => void;
  setSectionScore: (section: string, score: number, issues: string[]) => void;
  addSuggestion: (suggestion: ATSSuggestion) => void;
  applySuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  reset: () => void;
}

export const useATSStore = create<ATSState>()(
  devtools(
    (set, get) => ({
      score: null,
      isAnalyzing: false,
      lastAnalyzed: null,

      setScore: (score) =>
        set({ score, lastAnalyzed: Date.now() }),

      setSectionScore: (section, score, issues) => {
        const current = get().score;
        if (!current) return;
        set({
          score: {
            ...current,
            sections: current.sections.map((s) =>
              s.section === section ? { ...s, score, issues } : s
            ),
          },
        });
      },

      addSuggestion: (suggestion) => {
        const current = get().score;
        if (!current) return;
        set({
          score: {
            ...current,
            suggestions: [...current.suggestions, suggestion],
          },
        });
      },

      applySuggestion: (id) => {
        set({
          score: get().score
            ? {
                ...get().score!,
                suggestions: get().score!.suggestions.map((s) =>
                  s.id === id ? { ...s, applied: true } : s
                ),
              }
            : null,
        });
      },

      dismissSuggestion: (id) => {
        set({
          score: get().score
            ? {
                ...get().score!,
                suggestions: get().score!.suggestions.filter((s) => s.id !== id),
              }
            : null,
        });
      },

      setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

      reset: () =>
        set({
          score: null,
          isAnalyzing: false,
          lastAnalyzed: null,
        }),
    }),
    { name: 'ATSStore' }
  )
);
```

### 1.6 Canvas Sync Service (SSE)

```typescript
// src/services/canvas-sse.ts
// Из Canvas Sync Protocol — SSE для стриминга AI-обновлений

class CanvasSSEService {
  private eventSource: EventSource | null = null;

  connect(sessionId: string): void {
    this.eventSource = new EventSource(`/api/sse/canvas?session=${sessionId}`);

    this.eventSource.addEventListener('block-update', (e) => {
      const data = JSON.parse(e.data) as SyncEvent;
      if (data.type === 'CANVAS_UPDATED') {
        useResumeStore.getState().applySuggestion(data.blocks);
      }
    });

    this.eventSource.addEventListener('focus-chat', (e) => {
      const data = JSON.parse(e.data);
      window.dispatchEvent(
        new CustomEvent('focus-chat', { detail: data })
      );
    });

    this.eventSource.onerror = () => {
      console.warn('SSE connection lost, retrying...');
    };
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }
}

export const canvasSSE = new CanvasSSEService();
```

---

## 2. Data Model / TypeScript Types

### 2.1 Файловая структура типов

```
src/types/
├── index.ts          # re-exports
├── resume.ts         # ResumeData, Experience, Education, Skill, Certification
├── chat.ts           # ChatMessage, ChatSession, SectionType
├── ats.ts            # ATSScore, ATSSectionScore, ATSSuggestion
└── canvas.ts         # ResumeBlock, CanvasEvent, ChatEvent, SyncEvent
```

### 2.2 Миграция существующих типов

| Файл сейчас | Типы | Куда перенести |
|-------------|------|----------------|
| `src/lib/validators.ts` | `ResumeFormData` (Zod) | Оставить Zod schema, но переименовать в `resumeSchema` |
| `src/lib/placeholder-data.ts` | `ResumeData`, `Experience` | Удалить дубликаты, импортировать из `@/types/resume` |
| `src/lib/ats-scorer.ts` | `ATSScore` (устаревший) | Заменить на `@/types/ats` |

### 2.3 Zod schemas (обновление)

```typescript
// src/lib/schemas/resume.ts
import { z } from 'zod/v4';

export const contactSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(5),
  linkedin: z.string().url().optional(),
});

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  startDate: z.object({
    month: z.string().min(1),
    year: z.string().min(4),
  }),
  endDate: z.object({
    month: z.string().optional(),
    year: z.string().optional(),
    isCurrent: z.boolean().optional(),
  }).optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  years: z.string().optional(),
});

export const skillEntrySchema = z.object({
  value: z.string().min(1),
});

export const certificationEntrySchema = z.object({
  value: z.string().min(1),
});

export const achievementEntrySchema = z.object({
  value: z.string().min(1),
});

export const trainingEntrySchema = z.object({
  value: z.string().min(1),
});

// ResumeData schema — совместим с существующими компонентами
export const resumeSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2),
  jobTitle: z.string().min(2),
  contact: contactSchema,
  location: z.string().optional(),
  github: z.string().optional(),
  website: z.string().url().optional(),
  summary: z.string().min(10),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillEntrySchema).optional(),
  certifications: z.array(certificationEntrySchema).optional(),
  achievements: z.array(achievementEntrySchema).optional(),
  trainings: z.array(trainingEntrySchema).optional(),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.string(),
  })).optional(),
  projects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    technologies: z.string().optional(),
    url: z.string().url().optional(),
  })).optional(),
  targetJob: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

export type ResumeFormData = z.infer<typeof resumeSchema>;
```

---

## 3. DB Schema (Prisma)

### 3.1 prisma/schema.prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── User ──
model User {
  id            BigInt   @id @default(autoincrement())
  telegramId    BigInt   @unique @map("telegram_id")
  email         String?  @unique
  googleId      String?  @unique @map("google_id")
  appleId       String?  @unique @map("apple_id")
  authProvider  String   @default("telegram") @map("auth_provider")
  displayName   String?  @map("display_name")
  avatarUrl     String?  @map("avatar_url")
  locale        String   @default("ru")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")

  subscriptions  Subscription[]
  consentLogs    ConsentLog[]
  resumes        Resume[]
  resumeVersions ResumeVersion[]
  chatSessions   ChatSession[]
  atsScores      ATSScore[]
  mcpTokens      McpToken[]

  @@index([telegramId])
  @@index([email])
  @@index([googleId])
  @@index([appleId])
  @@index([deletedAt])
  @@map("users")
}

// ── Subscription ──
enum SubscriptionTier {
  free
  basic
  pro
  enterprise
  @map("subscription_tier")
}

enum SubscriptionProvider {
  telegram_stars
  stripe
  apple_pay
  google_pay
  @map("subscription_provider")
}

enum SubscriptionPeriod {
  monthly
  yearly
  lifetime
  @map("subscription_period")
}

model Subscription {
  id        BigInt              @id @default(autoincrement())
  userId    BigInt              @map("user_id")
  tier      SubscriptionTier    @default(free)
  provider  SubscriptionProvider?
  period    SubscriptionPeriod?
  startedAt DateTime            @default(now()) @map("started_at")
  expiresAt DateTime?           @map("expires_at")
  autoRenew Boolean             @default(true) @map("auto_renew")
  canceledAt DateTime?          @map("canceled_at")
  createdAt DateTime            @default(now()) @map("created_at")
  updatedAt DateTime            @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tier])
  @@index([expiresAt])
  @@map("subscriptions")
}

// ── Consent Log ──
enum ConsentType {
  terms_of_service
  privacy_policy
  data_processing
  marketing
  analytics
  third_party_sharing
  @map("consent_type")
}

model ConsentLog {
  id          BigInt      @id @default(autoincrement())
  userId      BigInt      @map("user_id")
  consentType ConsentType @map("consent_type")
  granted     Boolean
  ipAddress   String?     @map("ip_address")
  userAgent   String?     @map("user_agent")
  metadata    Json        @default("{}")
  createdAt   DateTime    @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([consentType])
  @@index([createdAt])
  @@index([userId, consentType, createdAt(sort: Desc)])
  @@map("consent_log")
}

// ── Resume ──
model Resume {
  id          BigInt   @id @default(autoincrement())
  userId      BigInt   @map("user_id")
  title       String   @default("My Resume")
  data        Json
  version     Int      @default(1)
  atsScore    Decimal? @map("ats_score")
  isPublished Boolean  @default(false) @map("is_published")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  user    User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  versions ResumeVersion[]
  chatSessions ChatSession[]
  atsScores    ATSScore[]

  @@unique([userId, id])
  @@index([userId])
  @@index([userId, isPublished])
  @@index([atsScore(sort: Desc)])
  @@map("resumes")
}

// ── Resume Version ──
model ResumeVersion {
  id            BigInt   @id @default(autoincrement())
  resumeId      BigInt   @map("resume_id")
  userId        BigInt   @map("user_id")
  version       Int
  data          Json
  atsScore      Decimal? @map("ats_score")
  changeSummary String?  @map("change_summary")
  createdAt     DateTime @default(now()) @map("created_at")

  resume Resume @relation(fields: [resumeId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([resumeId, version])
  @@index([resumeId])
  @@index([userId])
  @@index([createdAt(sort: Desc)])
  @@map("resume_versions")
}

// ── Chat Session ──
model ChatSession {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt   @map("user_id")
  resumeId  BigInt?  @map("resume_id")
  title     String   @default("New Chat")
  messages  Json     @default("[]")
  status    String   @default("idle")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  resume Resume? @relation(fields: [resumeId], references: [id])

  @@index([userId])
  @@index([resumeId])
  @@index([updatedAt(sort: Desc)])
  @@map("chat_sessions")
}

// ── ATS Score ──
model ATSScore {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt   @map("user_id")
  resumeId  BigInt?  @map("resume_id")
  overall   Decimal
  sections  Json     @default("[]")
  suggestions Json  @default("[]")
  matchedKeywords String[] @map("matched_keywords")
  missingKeywords  String[] @map("missing_keywords")
  createdAt DateTime @default(now()) @map("created_at")

  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  resume Resume? @relation(fields: [resumeId], references: [id])

  @@index([userId])
  @@index([resumeId])
  @@index([overall(sort: Desc)])
  @@index([createdAt(sort: Desc)])
  @@map("ats_scores")
}

// ── MCP Token ──
model McpToken {
  id          BigInt    @id @default(autoincrement())
  userId      BigInt    @map("user_id")
  tokenHash   String    @unique @map("token_hash")
  description String?
  scopes      String[]
  isActive    Boolean   @default(true) @map("is_active")
  lastUsedAt  DateTime? @map("last_used_at")
  expiresAt   DateTime? @map("expires_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([tokenHash])
  @@index([userId, isActive])
  @@map("mcp_tokens")
}
```

### 3.2 ER-диаграмма

```
User 1──* Resume
User 1──* ResumeVersion
User 1──* ChatSession
User 1──* ATSScore
User 1──* Subscription
User 1──* ConsentLog
User 1──* McpToken

Resume 1──* ResumeVersion
Resume 1──* ChatSession
Resume 1──* ATSScore
```

### 3.3 Индексы производительности

| Таблица | Индекс | Назначение |
|---------|--------|-----------|
| `users` | `telegram_id` | Быстрый вход через Telegram |
| `resumes` | `(user_id, is_published)` | Публичные резюме |
| `resumes` | `ats_score DESC` | Топ ATS-резюме |
| `resume_versions` | `(resume_id, version)` | Версионирование |
| `chat_sessions` | `updated_at DESC` | Последние чаты |
| `ats_scores` | `(user_id, created_at DESC)` | История ATS |
| `consent_log` | `(user_id, consent_type, created_at DESC)` | Последнее согласие |

---

## 4. File Structure

### 4.1 Новая структура

```
src/
├── stores/
│   ├── index.ts              # re-export всех store
│   ├── useResumeStore.ts     # Resume data + undo/redo
│   ├── useChatStore.ts       # Chat messages + state
│   └── useATSStore.ts        # ATS score + suggestions
│
├── types/
│   ├── index.ts              # re-export
│   ├── resume.ts             # ResumeData, ResumeStoreData, adapter, Experience, Skill, Certification, etc.
│   ├── chat.ts               # ChatMessage, ChatSession, SectionType
│   ├── ats.ts                # ATSScore (с breakdown), ATSSectionScore, ATSSuggestion
│   └── canvas.ts             # ResumeBlock, CanvasEvent, ChatEvent, SyncEvent
│
├── lib/
│   ├── schemas/
│   │   └── resume.ts         # Zod schemas (обновлённые)
│   ├── validators.ts         # → удалить дубликаты, оставить только re-export
│   ├── placeholder-data.ts   # → обновить импорты из @/types/resume
│   └── ats-scorer.ts         # → обновить импорты из @/types/ats
│
├── services/
│   └── canvas-sse.ts         # CanvasSSEService (SSE streaming)
│
└── hooks/
    ├── useAutoSave.ts        # Оставить (пока CreateResumeForm не переписан)
    └── useAIStatus.ts        # оставить как есть

prisma/
└── schema.prisma             # Prisma schema

.env                          # DATABASE_URL
```

### 4.2 Порядок создания файлов

| Шаг | Файл | Действие |
|-----|------|----------|
| 1 | `src/types/resume.ts` | Создать (ResumeData + ResumeStoreData + adapter) |
| 2 | `src/types/chat.ts` | Создать |
| 3 | `src/types/ats.ts` | Создать (ATSScore с breakdown + sections?) |
| 4 | `src/types/canvas.ts` | Создать |
| 5 | `src/types/index.ts` | Создать |
| 6 | `src/stores/useResumeStore.ts` | Создать (оперирует ResumeStoreData) |
| 7 | `src/stores/useChatStore.ts` | Создать |
| 8 | `src/stores/useATSStore.ts` | Создать (оперирует ATSScore с breakdown) |
| 9 | `src/stores/index.ts` | Создать |
| 10 | `src/lib/schemas/resume.ts` | Создать (Zod схемы, совместимые с существующими) |
| 11 | `src/services/canvas-sse.ts` | Создать |
| 12 | `prisma/schema.prisma` | Создать |
| 13 | `src/lib/placeholder-data.ts` | Обновить импорты из `@/types/resume` |
| 14 | `src/lib/ats-scorer.ts` | Обновить импорты из `@/types/ats` |
| 15 | `src/lib/validators.ts` | Оставить как есть (Zod схемы уже совместимы) |

### 4.3 Что удалить/заменить

| Компонент | Действие | Причина |
|-----------|----------|---------|
| `src/hooks/useAutoSave.ts` | **Оставить** | Пока `CreateResumeForm` не переписан на store, удаление сломает форму. В Phase 2 заменить на persist |
| `src/lib/validators.ts` | **Оставить** | Zod схемы уже совместимы с существующими компонентами. Новые схемы в `src/lib/schemas/resume.ts` — дополнительно |
| `src/lib/placeholder-data.ts` | Обновить импорты | Типы теперь в `@/types/resume` |
| `src/lib/ats-scorer.ts` | Обновить импорты | Типы теперь в `@/types/ats` |

---

## 5. Dependencies

### 5.1 Установка пакетов

```bash
# 1. Zustand (state management)
npm install zustand@^5

# 2. nanoid (генерация ID для блоков/сообщений)
npm install nanoid@^5

# 3. Prisma (ORM)
npm install prisma@^6 --save-dev
npm install @prisma/client@^6

# 4. Инициализация Prisma
npx prisma init

# 5. PostgreSQL клиент (если ещё нет)
npm install pg
```

### 5.2 Порядок установки

1. `npm install zustand@^5` — ядро state management
2. `npm install nanoid@^5` — генерация ID
3. `npm install prisma@^6 --save-dev` + `npm install @prisma/client@^6` — ORM
4. `npx prisma init` — создаст `prisma/schema.prisma` и `.env`
5. `npm install pg` — PostgreSQL клиент

### 5.3 tsconfig paths (уже должно быть)

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 5.4 .env

```env
# Prisma
DATABASE_URL="postgresql://user:password@localhost:5432/cv_sarkhan?schema=public"
```

---

## 6. Integration Points

### 6.1 Связь с существующими компонентами

| Компонент | Будет использовать | Изменения |
|-----------|-------------------|-----------|
| `CreateResumeForm` | `useResumeStore` через adapter | Добавить `resumeDataToStore()` при записи, `storeToResumeData()` при чтении. Пока не переписан — оставить `useAutoSave`/`AutoSaveIndicator` |
| `UpdateResumeForm` | `useResumeStore` через adapter | Заменить локальный state на store + adapter |
| `LivePreview` | `useResumeStore` (read-only) | Подписаться на `resume`, преобразовать через `storeToResumeData()` |
| `ATSScoreCard` | `useATSStore` | Заменить локальный расчёт. `score.breakdown` остаётся основным полем |
| `AutoSaveIndicator` | **Оставить** | Пока `CreateResumeForm` не переписан на store, удаление сломает форму |
| `useAutoSave` | **Оставить** | Пока `CreateResumeForm` не переписан на store, удаление сломает форму |
| `Header` | `useChatStore` (status) | Показывать статус AI |

### 6.2 Canvas Sync Protocol

```
CanvasBlock (tap)
  → dispatch BLOCK_TAPPED
  → useResumeStore.setActiveSection()
  → window.dispatchEvent('focus-chat')
  → ChatPanel scrolls to section

AI generates content (SSE)
  → CanvasSSEService receives 'block-update'
  → useResumeStore.applySuggestion()
  → Canvas re-renders with new blocks
```

### 6.3 Undo/Redo Architecture

```
pushHistory() вызывается перед каждым изменением
  → structuredClone текущего resume
  → добавляется в history[]
  → historyIndex++
  → макс 50 записей (shift при превышении)

undo() → historyIndex--, resume = history[historyIndex]
redo() → historyIndex++, resume = history[historyIndex]

persist сохраняет history[] + historyIndex
  → undo/redo работает после перезагрузки страницы
```

---

## 7. Migration Plan

### Шаг 1: Типы (без изменения логики)
1. Создать `src/types/resume.ts` — `ResumeData` (совместимый), `ResumeStoreData` (внутренний), adapter-функции
2. Создать `src/types/chat.ts`, `ats.ts`, `canvas.ts`
3. Обновить `placeholder-data.ts` — импортировать `ResumeData` из `@/types/resume`
4. Обновить `ats-scorer.ts` — импортировать `ATSScore` из `@/types/ats`

### Шаг 2: Store (параллельно с существующим кодом)
5. Создать `src/stores/useResumeStore.ts` — оперирует `ResumeStoreData`, использует adapter для общения с компонентами
6. Создать `src/stores/useChatStore.ts`
7. Создать `src/stores/useATSStore.ts` — оперирует `ATSScore` с `breakdown` как основным полем
8. Убедиться, что `npm run build` проходит

### Шаг 3: Интеграция (постепенная замена useState)
9. `CreateResumeForm` → подключить `useResumeStore` через adapter (`resumeDataToStore`/`storeToResumeData`). **Пока не переписан — оставить `useAutoSave`/`AutoSaveIndicator`**
10. `UpdateResumeForm` → подключить `useResumeStore` через adapter
11. `LivePreview` → подключить `useResumeStore`, преобразовать через `storeToResumeData()`
12. `ATSScoreCard` → подключить `useATSStore` (использует `score.breakdown`)

### Шаг 4: Prisma (когда появится PostgreSQL)
13. Создать `prisma/schema.prisma`
14. `npx prisma generate`
15. `npx prisma db push` (dev) / `npx prisma migrate dev` (prod)

---

## 8. Проверка (Definition of Done)

- [ ] `npm run build` проходит без ошибок
- [ ] `src/types/` содержит все типы из секции 2
- [ ] `ResumeData` совместим с существующими компонентами (`fullName`, `jobTitle`, `contact`, `skills: {value:string}[]`, `certifications: {value:string}[]`, `achievements: {value:string}[]`, `trainings: {value:string}[]`)
- [ ] `ResumeStoreData` (внутренний тип) содержит rich-поля (`Skill[]`, `Certification[]`, `RichEducation[]`)
- [ ] Adapter-функции (`resumeDataToStore`/`storeToResumeData`) экспортируются из `@/types/resume`
- [ ] `ATSScore.breakdown` сохранён как основное поле (совместимость с `ATSScoreCard`)
- [ ] `src/stores/` содержит 3 store с persist + devtools
- [ ] `_pushHistory` — приватная функция (не в интерфейсе `ResumeState`)
- [ ] `prisma/schema.prisma` содержит все 7 моделей, `@@unique([userId, id])` на Resume
- [ ] Zustand persist сохраняет/восстанавливает resume после перезагрузки
- [ ] Undo/redo работает (Ctrl+Z / Ctrl+Shift+Z)
- [ ] Canvas Sync Protocol типы экспортируются из `@/types/canvas`
- [ ] `useAutoSave.ts` и `AutoSaveIndicator` **НЕ удалены** (пока CreateResumeForm не переписан)
- [ ] `placeholder-data.ts` и `ats-scorer.ts` используют новые типы
