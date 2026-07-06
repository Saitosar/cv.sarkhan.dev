import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIRouter, RouterLogger, type RouterRequest } from '../router';
import { AICache } from '../cache';
import * as gemini from '@/lib/gemini';

const mockGenerateContent = vi.fn();
const mockGenerateContentStream = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
  generateContentStream: mockGenerateContentStream,
}));

vi.mock('@/lib/gemini', () => ({
  getGemini: vi.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

describe('AIRouter', () => {
  let router: AIRouter;
  let cache: AICache;
  let logger: RouterLogger;

  const request: RouterRequest = {
    task: 'ats-score',
    resumeData: { fullName: 'Jane Doe', jobTitle: 'Engineer' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cache = new AICache({ ttlMs: 60_000 });
    logger = new RouterLogger();
    router = new AIRouter(cache, logger);
  });

  it('returns AI response for a non-streaming request', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '{"overall":85}',
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
      },
    });

    const result = await router.route(request);

    expect(result.content).toBe('{"overall":85}');
    expect(result.task).toBe('ats-score');
    expect(result.model).toBe('gemini-2.5-flash');
    expect(result.cached).toBe(false);
    expect(result.tokens).toEqual({ input: 10, output: 5 });
    expect(gemini.getGemini).toHaveBeenCalled();
  });

  it('uses cache on repeated requests', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '{"overall":85}',
        usageMetadata: {},
      },
    });

    await router.route(request);
    const cached = await router.route(request);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(cached.cached).toBe(true);
  });

  it('does not cache chat requests', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'Hello',
        usageMetadata: {},
      },
    });

    const chatRequest: RouterRequest = { task: 'chat', message: 'hi' };

    await router.route(chatRequest);
    await router.route(chatRequest);

    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it('falls back to next model on failure', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new Error('Primary failed'))
      .mockResolvedValueOnce({
        response: {
          text: () => '{"overall":70}',
          usageMetadata: {},
        },
      });

    const result = await router.route(request);

    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('{"overall":70}');
  });

  it('throws when all models fail', async () => {
    mockGenerateContent.mockRejectedValue(new Error('Model down'));

    await expect(router.route(request)).rejects.toThrow('All models failed');
    expect(mockGenerateContent).toHaveBeenCalledTimes(6); // primary + fallback per retry
  });

  it('streams tokens for chat', async () => {
    mockGenerateContentStream.mockResolvedValue({
      stream: [
        { text: () => 'Hello ' },
        { text: () => 'world' },
      ][Symbol.iterator](),
    });

    const events = [];
    for await (const event of router.routeStream({ task: 'chat', message: 'hi' })) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: 'token', data: 'Hello ' },
      { type: 'token', data: 'world' },
      {
        type: 'done',
        data: expect.objectContaining({
          content: 'Hello world',
          task: 'chat',
          model: 'gemini-2.5-flash',
        }),
      },
    ]);
  });

  it('emits error event when streaming fails', async () => {
    mockGenerateContentStream.mockRejectedValue(new Error('Stream broken'));

    const events = [];
    for await (const event of router.routeStream({ task: 'chat', message: 'hi' })) {
      events.push(event);
    }

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: 'error',
      data: { error: 'Stream broken', code: 'MODEL_ERROR' },
    });
  });

  it('logs requests and reports stats', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '{}',
        usageMetadata: {},
      },
    });

    await router.route(request);
    const stats = router.getStats();

    expect(stats.totalRequests).toBe(1);
  });
});
