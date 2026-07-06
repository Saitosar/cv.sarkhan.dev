// src/stores/__tests__/useSubscriptionStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useSubscriptionStore } from '../useSubscriptionStore';

describe('useSubscriptionStore', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({
      tier: 'free',
      status: 'free',
      error: null,
    });
  });

  describe('initial state', () => {
    it('should start with free tier', () => {
      const state = useSubscriptionStore.getState();
      expect(state.tier).toBe('free');
      expect(state.status).toBe('free');
      expect(state.error).toBeNull();
    });
  });

  describe('subscribe', () => {
    it('should set tier and status when subscribing to free', () => {
      useSubscriptionStore.getState().subscribe('free');
      const state = useSubscriptionStore.getState();
      expect(state.tier).toBe('free');
      expect(state.status).toBe('free');
      expect(state.error).toBeNull();
    });

    it('should not change tier when subscribing to pro (Coming Soon)', () => {
      useSubscriptionStore.getState().subscribe('pro');
      const state = useSubscriptionStore.getState();
      expect(state.tier).toBe('free');
      expect(state.status).toBe('free');
      expect(state.error).toBeNull();
    });
  });

  describe('setTier', () => {
    it('should set tier to pro', () => {
      useSubscriptionStore.getState().setTier('pro');
      const state = useSubscriptionStore.getState();
      expect(state.tier).toBe('pro');
      expect(state.status).toBe('pro');
      expect(state.error).toBeNull();
    });

    it('should set tier back to free', () => {
      useSubscriptionStore.getState().setTier('pro');
      useSubscriptionStore.getState().setTier('free');
      const state = useSubscriptionStore.getState();
      expect(state.tier).toBe('free');
      expect(state.status).toBe('free');
    });
  });

  describe('clearError', () => {
    it('should clear the error', () => {
      useSubscriptionStore.setState({ error: 'Something went wrong' });
      useSubscriptionStore.getState().clearError();
      const state = useSubscriptionStore.getState();
      expect(state.error).toBeNull();
    });

    it('should be a no-op when error is already null', () => {
      useSubscriptionStore.getState().clearError();
      expect(useSubscriptionStore.getState().error).toBeNull();
    });
  });
});
