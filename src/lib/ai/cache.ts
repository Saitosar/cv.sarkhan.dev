export interface CacheOptions {
  ttlMs: number;
  maxSize?: number;
}

interface CacheEntry {
  content: string;
  model: string;
  tokens?: { input: number; output: number };
  expiresAt: number;
}

export class AICache {
  private store = new Map<string, CacheEntry>();
  private ttlMs: number;
  private maxSize: number;

  constructor(options: CacheOptions) {
    this.ttlMs = options.ttlMs;
    this.maxSize = options.maxSize ?? 100;
  }

  get(key: string): { content: string; model: string; tokens?: { input: number; output: number } } | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // Move to end to keep LRU ordering
    this.store.delete(key);
    this.store.set(key, entry);

    return { content: entry.content, model: entry.model, tokens: entry.tokens };
  }

  set(
    key: string,
    value: { content: string; model: string; tokens?: { input: number; output: number } }
  ): void {
    // Evict oldest if at capacity (FIFO over insertion order)
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      ...value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}
