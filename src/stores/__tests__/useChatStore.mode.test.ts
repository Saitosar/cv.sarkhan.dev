// src/stores/__tests__/useChatStore.mode.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '../useChatStore';

describe('useChatStore — mode switching', () => {
  beforeEach(() => {
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

  describe('setMode', () => {
    it('should set mode to hr-coach', () => {
      useChatStore.getState().setMode('hr-coach');
      const state = useChatStore.getState();
      expect(state.session.mode).toBe('hr-coach');
    });

    it('should set mode to aether', () => {
      useChatStore.getState().setMode('hr-coach');
      useChatStore.getState().setMode('aether');
      const state = useChatStore.getState();
      expect(state.session.mode).toBe('aether');
    });

    it('should update inputPlaceholder when switching to hr-coach', () => {
      useChatStore.getState().setMode('hr-coach');
      expect(useChatStore.getState().inputPlaceholder).toBe(
        'Ask HR Coach about interviews or hiring...'
      );
    });

    it('should update inputPlaceholder when switching to aether', () => {
      useChatStore.getState().setMode('hr-coach');
      useChatStore.getState().setMode('aether');
      expect(useChatStore.getState().inputPlaceholder).toBe(
        'Tell Aether what to improve...'
      );
    });

    it('should preserve messages when switching mode', () => {
      useChatStore.getState().addMessage('user', 'Hello');
      useChatStore.getState().setMode('hr-coach');
      const state = useChatStore.getState();
      expect(state.session.messages).toHaveLength(1);
      expect(state.session.messages[0].content).toBe('Hello');
    });

    it('should tag new messages with the current mode as source', () => {
      useChatStore.getState().setMode('hr-coach');
      useChatStore.getState().addMessage('user', 'Interview tips');
      const state = useChatStore.getState();
      expect(state.session.messages[0].source).toBe('hr-coach');
    });

    it('should tag messages with aether source in aether mode', () => {
      useChatStore.getState().addMessage('user', 'Hello');
      const state = useChatStore.getState();
      expect(state.session.messages[0].source).toBe('aether');
    });
  });
});
