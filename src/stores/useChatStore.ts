// src/stores/useChatStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { ChatMessage, ChatSession, SectionType, ChatMode } from '@/types/chat';

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
  setMode: (mode: ChatMode) => void;
  clearSession: () => void;
}

const defaultSession: ChatSession = {
  id: nanoid(),
  messages: [
    {
      id: nanoid(),
      role: 'assistant',
      content: "Hello! I'm Aether — your AI career assistant. How can I help you today?",
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
            source: session.mode,
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
            source: session.mode,
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
        setMode: (mode) => {
          const { session } = get();
          const placeholders: Record<ChatMode, string> = {
            aether: 'Tell Aether what to improve...',
            'hr-coach': 'Ask HR Coach about interviews or hiring...',
          };
          set({
            session: { ...session, mode },
            inputPlaceholder: placeholders[mode],
          });
        },
        clearSession: () =>
          set({
            session: { ...defaultSession, id: nanoid() },
            inputValue: '',
            inputPlaceholder: 'Tell Aether what to improve...',
            isStreaming: false,
          }),
      }),
      {
        name: 'chat-store',
        version: 2,
        partialize: (state) => ({
          session: state.session,
        }),
      }
    ),
    { name: 'ChatStore' }
  )
);

export type { ChatState };
