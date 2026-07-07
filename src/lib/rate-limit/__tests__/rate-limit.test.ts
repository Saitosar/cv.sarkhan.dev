import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRateLimitStore } from '@/lib/rate-limit/store';
import { RATE_LIMIT_CONFIGS, resolveTier } from '@/lib/rate-limit/config';
import { checkRateLimit } from '@/lib/rate-limit/checker';

describe('Rate Limit Store', () => {
  let store: InMemoryRateLimitStore;

  beforeEach(() => {
    store = new InMemoryRateLimitStore();
  });

  it('increments counter for a new key', async () => {
    const result = await store.increment('test-key', 60);
    expect(result.count).toBe(1);
    expect(result.expiresAt).toBeGreaterThan(Date.now());
  });

  it('increments counter for an existing key', async () => {
    await store.increment('test-key', 60);
    const result = await store.increment('test-key', 60);
    expect(result.count).toBe(2);
  });

  it('resets counter', async () => {
    await store.increment('test-key', 60);
    await store.reset('test-key');
    const result = await store.increment('test-key', 60);
    expect(result.count).toBe(1);
  });

  it('expires entries after window', async () => {
    await store.increment('test-key', 0); // 0-second window = immediate expiry
    await new Promise((r) => setTimeout(r, 10));
    const result = await store.increment('test-key', 60);
    expect(result.count).toBe(1); // fresh window
  });

  it('cleanup removes expired entries', async () => {
    await store.increment('expired-key', 0);
    await store.increment('valid-key', 60);
    // Wait for the 0-second window entry to expire
    await new Promise((r) => setTimeout(r, 10));
    store.cleanup();
    // After cleanup, expired-key should start fresh
    const result = await store.increment('expired-key', 60);
    expect(result.count).toBe(1);
  });
});

describe('resolveTier', () => {
  it('returns null for SSE paths', () => {
    expect(resolveTier('/api/sse/chat')).toBeNull();
    expect(resolveTier('/api/sse/')).toBeNull();
  });

  it('returns null for health endpoint', () => {
    expect(resolveTier('/api/health')).toBeNull();
  });

  it('returns auth for auth paths', () => {
    expect(resolveTier('/api/auth/login')).toBe('auth');
    expect(resolveTier('/api/login')).toBe('auth');
    expect(resolveTier('/api/register')).toBe('auth');
  });

  it('returns api for API paths', () => {
    expect(resolveTier('/api/assess')).toBe('api');
    expect(resolveTier('/api/generate')).toBe('api');
    expect(resolveTier('/api/jobs/search')).toBe('api');
  });

  it('returns public for non-API paths', () => {
    expect(resolveTier('/')).toBe('public');
    expect(resolveTier('/workspace')).toBe('public');
    expect(resolveTier('/pricing')).toBe('public');
  });
});

describe('RATE_LIMIT_CONFIGS', () => {
  it('has all three tiers', () => {
    expect(RATE_LIMIT_CONFIGS.auth).toBeDefined();
    expect(RATE_LIMIT_CONFIGS.api).toBeDefined();
    expect(RATE_LIMIT_CONFIGS.public).toBeDefined();
  });

  it('auth has strictest limits', () => {
    expect(RATE_LIMIT_CONFIGS.auth.limit).toBeLessThan(RATE_LIMIT_CONFIGS.api.limit);
    expect(RATE_LIMIT_CONFIGS.api.limit).toBeLessThan(RATE_LIMIT_CONFIGS.public.limit);
  });

  it('all configs have valid window', () => {
    for (const config of Object.values(RATE_LIMIT_CONFIGS)) {
      expect(config.windowSeconds).toBeGreaterThan(0);
      expect(config.limit).toBeGreaterThan(0);
    }
  });
});

describe('checkRateLimit', () => {
  it('allows requests under the limit', async () => {
    const req = new Request('http://localhost/api/test');
    const result = await checkRateLimit(req, 'public');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it('returns 429 headers on rejection', async () => {
    const req = new Request('http://localhost/api/test');
    const result = await checkRateLimit(req, 'public');
    const res = result.toResponse();
    expect(res.status).toBe(429);
    expect(res.headers.get('X-RateLimit-Limit')).toBeDefined();
    expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();
    expect(res.headers.get('Retry-After')).toBeDefined();
  });

  it('excludes SSE paths', async () => {
    const req = new Request('http://localhost/api/sse/chat');
    const result = await checkRateLimit(req);
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(Infinity);
  });

  it('excludes health endpoint', async () => {
    const req = new Request('http://localhost/api/health');
    const result = await checkRateLimit(req);
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(Infinity);
  });
});
