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
  addErrorMessage: (content: string, retryInput?: string) => void;
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
  messages: [
    {
      id: nanoid(),
      role: 'assistant',
      content:
        "Hello! I'm Aether — your specialized AI career expert. Unlike general chatbots, I'm built specifically for resumes: I know ATS parsers, optimize for real recruiters, and show you live visual feedback. No prompt engineering needed — just send me a LinkedIn link, an old resume, or describe your experience. I'll read it, analyze it, and craft something ATS-optimized. No forms, no fuss.",
      timestamp: Date.now(),
      source: 'aether',
    },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  focusSection: null,
  status: 'idle',
  mode: 'aether',
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        session: defaultSession,
        inputValue: '',
        inputPlaceholder: 'Send a LinkedIn link, resume, or describe your experience...',
        isStreaming: false,

        addMessage: (role, content, section) => {
          const { session } = get();
          const message: ChatMessage = {
            id: nanoid(),
            role,
            content,
            timestamp: Date.now(),
            section,
            source: 'aether',
          };
          set({
            session: {
              ...session,
              messages: [...session.messages, message],
              updatedAt: Date.now(),
            },
          });
        },

        addErrorMessage: (content: string, retryInput?: string) => {
          const { session } = get();
          const message: ChatMessage = {
            id: nanoid(),
            role: 'assistant',
            content,
            timestamp: Date.now(),
            isError: true,
            retryInput,
            source: 'aether',
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
            inputPlaceholder: 'Send a LinkedIn link, resume, or describe your experience...',
            isStreaming: false,
          }),
      }),
      {
        name: 'chat-store',
        version: 3,
        partialize: (state) => ({
          session: state.session,
        }),
      }
    ),
    { name: 'ChatStore' }
  )
);

export type { ChatState };
