import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIRouter, RouterLogger, type RouterRequest } from '../router';
import { AICache } from '../cache';
import * as gemini from '@/lib/gemini';

vi.mock('@/lib/gemini', () => ({
  getGemini: vi.fn(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
    getGenerativeModel: mockGetGenerativeModel,
  })),
}));

const mockCreate = vi.fn();
const mockGenerateContent = vi.fn();
const mockGenerateContentStream = vi.fn();
const mockGetGenerativeModel = vi.fn(() => ({
  generateContent: mockGenerateContent,
  generateContentStream: mockGenerateContentStream,
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
    mockCreate.mockReset();
    mockGenerateContent.mockReset();
    mockGenerateContentStream.mockReset();
    cache = new AICache({ ttlMs: 60_000 });
    logger = new RouterLogger();
    router = new AIRouter(cache, logger);
  });

  it('returns AI response for a non-streaming request', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{"overall":85}' } }],
      usage: { prompt_tokens: 10, completion_tokens: 5 },
    });

    const result = await router.route(request);

    expect(result.content).toBe('{"overall":85}');
    expect(result.task).toBe('ats-score');
    expect(result.model).toBe('deepseek-v4-flash');
    expect(result.cached).toBe(false);
    expect(result.tokens).toEqual({ input: 10, output: 5 });
    expect(gemini.getGemini).toHaveBeenCalled();
  });

  it('uses cache on repeated requests', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{"overall":85}' } }],
      usage: {},
    });

    await router.route(request);
    const cached = await router.route(request);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(cached.cached).toBe(true);
  });

  it('does not cache chat requests', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Hello' } }],
      usage: {},
    });

    const chatRequest: RouterRequest = { task: 'chat', message: 'hi' };

    await router.route(chatRequest);
    await router.route(chatRequest);

    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it('falls back to next model on failure', async () => {
    mockCreate
      .mockRejectedValueOnce(new Error('Primary failed'))
      .mockResolvedValueOnce({
        choices: [{ message: { content: '{"overall":70}' } }],
        usage: {},
      });

    const result = await router.route(request);

    expect(mockCreate).toHaveBeenCalledTimes(2);
    expect(result.content).toBe('{"overall":70}');
  });

  it('throws when all models fail', async () => {
    mockCreate.mockRejectedValue(new Error('Model down'));

    await expect(router.route(request)).rejects.toThrow('All models failed');
    expect(mockCreate).toHaveBeenCalledTimes(6); // primary + fallback per retry
  });

  it('streams tokens for chat', async () => {
    mockCreate.mockResolvedValue({
      [Symbol.asyncIterator]: async function* () {
        yield { choices: [{ delta: { content: 'Hello ' } }] };
        yield { choices: [{ delta: { content: 'world' } }] };
      },
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
          model: 'deepseek-v4-flash',
        }),
      },
    ]);
  });

  it('emits error event when streaming fails', async () => {
    mockCreate.mockRejectedValue(new Error('Stream broken'));

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
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{}' } }],
      usage: {},
    });

    await router.route(request);
    const stats = router.getStats();

    expect(stats.totalRequests).toBe(1);
  });
});
