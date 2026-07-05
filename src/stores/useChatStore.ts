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

export type { ChatState };
