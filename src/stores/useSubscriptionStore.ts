// src/stores/useSubscriptionStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  SubscriptionState,
  SubscriptionTier,
  SubscriptionStatus,
} from '@/types/billing';

function showToast(message: string): void {
  if (typeof window === 'undefined') return;

  // Prefer a simple event the app can hook into; fallback to alert in tests
  const event = new CustomEvent('subscription-toast', {
    detail: { message, type: 'info' },
    bubbles: true,
  });
  const wasDispatched = window.dispatchEvent(event);

  // The dispatched CustomEvent can be cancelled by a listener; if nothing catches
  // it, we intentionally do not fall back to alert to keep the store SSR-safe
  // and avoid blocking tests. The toast UI should listen for 'subscription-toast'.
  void wasDispatched;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  devtools(
    persist(
      (set) => ({
        tier: 'free',
        status: 'free' as SubscriptionStatus,
        error: null,

        subscribe: (tier: SubscriptionTier) => {
          if (tier === 'pro') {
            showToast('Coming Soon');
            return;
          }

          set({ tier, status: tier, error: null });
        },

        setTier: (tier: SubscriptionTier) => {
          set({ tier, status: tier, error: null });
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'SubscriptionStore',
        partialize: (state) => ({ tier: state.tier }),
      }
    ),
    { name: 'SubscriptionStore' }
  )
);

export type { SubscriptionState };
