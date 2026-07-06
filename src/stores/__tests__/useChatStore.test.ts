// src/stores/__tests__/useChatStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '../useChatStore';

describe('useChatStore', () => {
  beforeEach(() => {
    // Reset store state
    useChatStore.setState({
      session: {
        id: 'test-session',
        messages: [],
        createdAt: 0,
        updatedAt: 0,
        focusSection: null,
        status: 'idle',
        mode: 'aether',
      },
      inputValue: '',
      inputPlaceholder: 'Tell Aether what to improve...',
      isStreaming: false,
    });
    localStorage.clear();
  });

  describe('addMessage', () => {
    it('should add a user message', () => {
      useChatStore.getState().addMessage('user', 'Hello');
      const state = useChatStore.getState();
      expect(state.session.messages).toHaveLength(1);
      expect(state.session.messages[0].role).toBe('user');
      expect(state.session.messages[0].content).toBe('Hello');
    });

    it('should add an assistant message', () => {
      useChatStore.getState().addMessage('assistant', 'Hi there!');
      const state = useChatStore.getState();
      expect(state.session.messages).toHaveLength(1);
      expect(state.session.messages[0].role).toBe('assistant');
    });

    it('should add a message with a section tag', () => {
      useChatStore.getState().addMessage('user', 'Fix my summary', 'summary');
      const state = useChatStore.getState();
      expect(state.session.messages[0].section).toBe('summary');
    });

    it('should assign an id and timestamp to each message', () => {
      useChatStore.getState().addMessage('user', 'test');
      const msg = useChatStore.getState().session.messages[0];
      expect(msg.id).toBeDefined();
      expect(typeof msg.id).toBe('string');
      expect(msg.timestamp).toBeGreaterThan(0);
    });

    it('should update updatedAt timestamp', () => {
      const before = useChatStore.getState().session.updatedAt;
      useChatStore.getState().addMessage('user', 'test');
      const after = useChatStore.getState().session.updatedAt;
      expect(after).toBeGreaterThanOrEqual(before);
    });
  });

  describe('updateLastMessage', () => {
    it('should update the content of the last message', () => {
      useChatStore.getState().addMessage('assistant', 'Hello');
      useChatStore.getState().updateLastMessage('Hello world');
      const state = useChatStore.getState();
      expect(state.session.messages).toHaveLength(1);
      expect(state.session.messages[0].content).toBe('Hello world');
    });

    it('should do nothing if there are no messages', () => {
      useChatStore.getState().updateLastMessage('Should not appear');
      expect(useChatStore.getState().session.messages).toHaveLength(0);
    });

    it('should preserve other message fields', () => {
      useChatStore.getState().addMessage('assistant', 'Initial', 'summary');
      const msgId = useChatStore.getState().session.messages[0].id;
      useChatStore.getState().updateLastMessage('Updated');
      const msg = useChatStore.getState().session.messages[0];
      expect(msg.id).toBe(msgId);
      expect(msg.role).toBe('assistant');
      expect(msg.section).toBe('summary');
    });
  });

  describe('clearSession', () => {
    it('should clear all messages', () => {
      useChatStore.getState().addMessage('user', 'Hello');
      useChatStore.getState().addMessage('assistant', 'Hi');
      useChatStore.getState().clearSession();
      const state = useChatStore.getState();
      expect(state.session.messages).toHaveLength(0);
    });

    it('should reset inputValue and isStreaming', () => {
      useChatStore.getState().setInputValue('typing...');
      useChatStore.setState({ isStreaming: true });
      useChatStore.getState().clearSession();
      const state = useChatStore.getState();
      expect(state.inputValue).toBe('');
      expect(state.isStreaming).toBe(false);
    });

    it('should generate a new session id', () => {
      const oldId = useChatStore.getState().session.id;
      useChatStore.getState().clearSession();
      const newId = useChatStore.getState().session.id;
      expect(newId).not.toBe(oldId);
    });
  });

  describe('setStatus', () => {
    it('should set status to idle', () => {
      useChatStore.getState().setStatus('idle');
      expect(useChatStore.getState().session.status).toBe('idle');
    });

    it('should set status to loading', () => {
      useChatStore.getState().setStatus('loading');
      expect(useChatStore.getState().session.status).toBe('loading');
    });

    it('should set status to chatting', () => {
      useChatStore.getState().setStatus('chatting');
      expect(useChatStore.getState().session.status).toBe('chatting');
    });

    it('should set status to ready', () => {
      useChatStore.getState().setStatus('ready');
      expect(useChatStore.getState().session.status).toBe('ready');
    });

    it('should set status to suggesting', () => {
      useChatStore.getState().setStatus('suggesting');
      expect(useChatStore.getState().session.status).toBe('suggesting');
    });
  });

  describe('setInputValue / setInputPlaceholder', () => {
    it('should set inputValue', () => {
      useChatStore.getState().setInputValue('new value');
      expect(useChatStore.getState().inputValue).toBe('new value');
    });

    it('should set inputPlaceholder', () => {
      useChatStore.getState().setInputPlaceholder('Type here...');
      expect(useChatStore.getState().inputPlaceholder).toBe('Type here...');
    });
  });

  describe('setFocusSection', () => {
    it('should set focusSection', () => {
      useChatStore.getState().setFocusSection('experience');
      expect(useChatStore.getState().session.focusSection).toBe('experience');
    });

    it('should set focusSection to null', () => {
      useChatStore.getState().setFocusSection('skills');
      useChatStore.getState().setFocusSection(null);
      expect(useChatStore.getState().session.focusSection).toBeNull();
    });
  });

  describe('setIsStreaming', () => {
    it('should set isStreaming to true', () => {
      useChatStore.getState().setIsStreaming(true);
      expect(useChatStore.getState().isStreaming).toBe(true);
    });

    it('should set isStreaming to false', () => {
      useChatStore.getState().setIsStreaming(true);
      useChatStore.getState().setIsStreaming(false);
      expect(useChatStore.getState().isStreaming).toBe(false);
    });
  });

  describe('persist (localStorage)', () => {
    it('should persist session to localStorage', () => {
      useChatStore.getState().addMessage('user', 'Hello');
      const stored = localStorage.getItem('chat-store');
      expect(stored).not.toBeNull();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.session.messages).toHaveLength(1);
      }
    });

    it('should not persist inputValue or isStreaming', () => {
      useChatStore.getState().setInputValue('secret');
      useChatStore.setState({ isStreaming: true });
      const stored = localStorage.getItem('chat-store');
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.inputValue).toBeUndefined();
        expect(parsed.state.isStreaming).toBeUndefined();
      }
    });
  });
});
