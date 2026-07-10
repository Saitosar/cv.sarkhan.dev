// src/lib/ai/__tests__/model-diversity.test.ts
// RED: Tests for multi-model routing (task→model mapping, fallback chain)
// Implementation does not exist yet
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the AI providers
vi.mock('@/lib/ai/providers/openai', () => ({
  createOpenAICompletion: vi.fn(),
}));

vi.mock('@/lib/ai/providers/gemini', () => ({
  createGeminiCompletion: vi.fn(),
}));

vi.mock('@/lib/ai/providers/anthropic', () => ({
  createAnthropicCompletion: vi.fn(),
}));

vi.mock('@/lib/ai/providers/deepseek', () => ({
  createDeepSeekCompletion: vi.fn(),
}));

describe('ModelDiversityRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('task-to-model mapping', () => {
    it('should route ats-score task to deepseek model', async () => {
      const { routeTask } = await import('../model-diversity');
      const result = await routeTask({ task: 'ats-score', resumeData: {} });
      expect(result.model).toBe('deepseek-v4-flash');
    });

    it('should route chat task to gemini model', async () => {
      const { routeTask } = await import('../model-diversity');
      const result = await routeTask({ task: 'chat', message: 'hello' });
      expect(result.model).toBe('gemini-2.0-flash');
    });

    it('should route generate task to openai model', async () => {
      const { routeTask } = await import('../model-diversity');
      const result = await routeTask({ task: 'generate', resumeData: {} });
      expect(result.model).toBe('gpt-4o');
    });

    it('should route tailor task to anthropic model', async () => {
      const { routeTask } = await import('../model-diversity');
      const result = await routeTask({ task: 'tailor', resumeData: {}, jobDescription: '...' });
      expect(result.model).toBe('claude-3.5-sonnet');
    });

    it('should route analyze task to gemini model', async () => {
      const { routeTask } = await import('../model-diversity');
      const result = await routeTask({ task: 'analyze', resumeData: {} });
      expect(result.model).toBe('gemini-2.0-flash');
    });

    it('should route suggest task to deepseek model', async () => {
      const { routeTask } = await import('../model-diversity');
      const result = await routeTask({ task: 'suggest', message: 'improve' });
      expect(result.model).toBe('deepseek-v4-flash');
    });
  });

  describe('fallback chain', () => {
    it('should fall back to secondary model when primary fails', async () => {
      const { createDeepSeekCompletion } = await import('@/lib/ai/providers/deepseek');
      const { createGeminiCompletion } = await import('@/lib/ai/providers/gemini');

      (createDeepSeekCompletion as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Primary model unavailable')
      );
      (createGeminiCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: 'Fallback response',
        model: 'gemini-2.0-flash',
      });

      const { routeTask } = await import('../model-diversity');
      const result = await routeTask({ task: 'ats-score', resumeData: {} });

      expect(result.model).toBe('gemini-2.0-flash');
      expect(result.content).toBe('Fallback response');
      expect(result.fallbackUsed).toBe(true);
    });

    it('should fall back through entire chain when all models fail', async () => {
      const { createDeepSeekCompletion } = await import('@/lib/ai/providers/deepseek');
      const { createGeminiCompletion } = await import('@/lib/ai/providers/gemini');
      const { createOpenAICompletion } = await import('@/lib/ai/providers/openai');
      const { createAnthropicCompletion } = await import('@/lib/ai/providers/anthropic');

      (createDeepSeekCompletion as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Down'));
      (createGeminiCompletion as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Down'));
      (createOpenAICompletion as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Down'));
      (createAnthropicCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: 'Last resort response',
        model: 'claude-3.5-sonnet',
      });

      const { routeTask } = await import('../model-diversity');
      const result = await routeTask({ task: 'ats-score', resumeData: {} });

      expect(result.model).toBe('claude-3.5-sonnet');
      expect(result.fallbackUsed).toBe(true);
    });

    it('should throw when all models in fallback chain fail', async () => {
      const { createDeepSeekCompletion } = await import('@/lib/ai/providers/deepseek');
      const { createGeminiCompletion } = await import('@/lib/ai/providers/gemini');
      const { createOpenAICompletion } = await import('@/lib/ai/providers/openai');
      const { createAnthropicCompletion } = await import('@/lib/ai/providers/anthropic');

      (createDeepSeekCompletion as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Down'));
      (createGeminiCompletion as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Down'));
      (createOpenAICompletion as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Down'));
      (createAnthropicCompletion as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Down'));

      const { routeTask } = await import('../model-diversity');
      await expect(routeTask({ task: 'ats-score', resumeData: {} })).rejects.toThrow(
        /all models failed|no model available/i
      );
    });
  });

  describe('model configuration', () => {
    it('should return model config for each task type', async () => {
      const { getModelConfig } = await import('../model-diversity');
      const config = getModelConfig('ats-score');
      expect(config).toHaveProperty('primary');
      expect(config).toHaveProperty('fallbacks');
      expect(Array.isArray(config.fallbacks)).toBe(true);
    });

    it('should return undefined for unknown task type', async () => {
      const { getModelConfig } = await import('../model-diversity');
      const config = getModelConfig('unknown-task' as never);
      expect(config).toBeUndefined();
    });

    it('should have at least one fallback for each task', async () => {
      const { getModelConfig } = await import('../model-diversity');
      const tasks = ['ats-score', 'chat', 'generate', 'tailor', 'analyze', 'suggest'];
      for (const task of tasks) {
        const config = getModelConfig(task);
        expect(config.fallbacks.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('cost tracking', () => {
    it('should track model usage per task', async () => {
      const { createDeepSeekCompletion } = await import('@/lib/ai/providers/deepseek');
      (createDeepSeekCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: 'Result',
        model: 'deepseek-v4-flash',
        tokens: { input: 100, output: 50 },
      });

      const { routeTask, getUsageStats } = await import('../model-diversity');
      await routeTask({ task: 'ats-score', resumeData: {} });
      const stats = getUsageStats();

      expect(stats).toHaveProperty('totalRequests');
      expect(stats.totalRequests).toBe(1);
      expect(stats.models).toHaveProperty('deepseek-v4-flash');
    });

    it('should track fallback usage separately', async () => {
      const { createDeepSeekCompletion } = await import('@/lib/ai/providers/deepseek');
      const { createGeminiCompletion } = await import('@/lib/ai/providers/gemini');

      (createDeepSeekCompletion as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Down'));
      (createGeminiCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: 'Fallback',
        model: 'gemini-2.0-flash',
      });

      const { routeTask, getUsageStats } = await import('../model-diversity');
      await routeTask({ task: 'ats-score', resumeData: {} });
      const stats = getUsageStats();

      expect(stats.fallbackCount).toBe(1);
    });
  });

  describe('streaming', () => {
    it('should stream tokens for chat tasks', async () => {
      const { createGeminiCompletion } = await import('@/lib/ai/providers/gemini');
      (createGeminiCompletion as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: 'Hello world',
        model: 'gemini-2.0-flash',
      });

      const { routeTaskStream } = await import('../model-diversity');
      const events: Array<{ type: string; data: unknown }> = [];
      for await (const event of routeTaskStream({ task: 'chat', message: 'hi' })) {
        events.push(event);
      }

      expect(events.length).toBeGreaterThan(0);
      expect(events[events.length - 1].type).toBe('done');
    });

    it('should emit error event when streaming fails', async () => {
      const { createGeminiCompletion } = await import('@/lib/ai/providers/gemini');
      (createGeminiCompletion as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Stream failed')
      );

      const { routeTaskStream } = await import('../model-diversity');
      const events: Array<{ type: string; data: unknown }> = [];
      for await (const event of routeTaskStream({ task: 'chat', message: 'hi' })) {
        events.push(event);
      }

      expect(events.some((e) => e.type === 'error')).toBe(true);
    });
  });
});
