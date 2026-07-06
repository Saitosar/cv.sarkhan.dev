import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AICache } from '../cache';

describe('AICache', () => {
  let cache: AICache;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new AICache({ ttlMs: 1000, maxSize: 3 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores and retrieves values', () => {
    cache.set('a', { content: 'hello', model: 'm1' });
    expect(cache.get('a')).toEqual({ content: 'hello', model: 'm1' });
  });

  it('returns null for missing keys', () => {
    expect(cache.get('missing')).toBeNull();
  });

  it('expires entries after TTL', () => {
    cache.set('a', { content: 'hello', model: 'm1' });
    vi.advanceTimersByTime(1001);
    expect(cache.get('a')).toBeNull();
  });

  it('evicts oldest entry when over capacity', () => {
    cache.set('a', { content: '1', model: 'm' });
    cache.set('b', { content: '2', model: 'm' });
    cache.set('c', { content: '3', model: 'm' });
    cache.set('d', { content: '4', model: 'm' });

    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).not.toBeNull();
    expect(cache.get('c')).not.toBeNull();
    expect(cache.get('d')).not.toBeNull();
    expect(cache.size).toBe(3);
  });

  it('updates existing key without evicting others', () => {
    cache.set('a', { content: '1', model: 'm' });
    cache.set('b', { content: '2', model: 'm' });
    cache.set('a', { content: '1-updated', model: 'm' });

    expect(cache.get('a')).toEqual({ content: '1-updated', model: 'm' });
    expect(cache.get('b')).not.toBeNull();
    expect(cache.size).toBe(2);
  });

  it('clears all entries', () => {
    cache.set('a', { content: '1', model: 'm' });
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get('a')).toBeNull();
  });

  it('invalidates a specific key', () => {
    cache.set('a', { content: '1', model: 'm' });
    cache.invalidate('a');
    expect(cache.get('a')).toBeNull();
  });
});
