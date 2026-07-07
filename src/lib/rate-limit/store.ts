// ============================================================
// In-Memory Rate Limit Store
// ============================================================
// Sliding window counter per key.
// Production: swap for Redis-based store.
// ============================================================

import type { RateLimitStore } from '@/types/rate-limit';

interface WindowEntry {
  count: number;
  expiresAt: number;
}

export class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, WindowEntry>();

  async increment(key: string, windowSeconds: number): Promise<{ count: number; expiresAt: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.expiresAt) {
      const expiresAt = now + windowSeconds * 1000;
      this.store.set(key, { count: 1, expiresAt });
      return { count: 1, expiresAt };
    }

    existing.count++;
    return { count: existing.count, expiresAt: existing.expiresAt };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  /** Periodic cleanup of expired entries */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton
export const rateLimitStore = new InMemoryRateLimitStore();

// Run cleanup every 60 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimitStore.cleanup(), 60_000);
}
