import type { TaskType } from './config';
import { MODEL_CONFIGS, type ModelConfig, type FallbackConfig, CACHEABLE_TASKS } from './config';
import { buildPrompt } from './prompts';
import { AICache } from './cache';
import { getGemini } from '@/lib/gemini';
import { withRetry } from './retry';
import { classifyError, AIRouterError } from './errors';
import type { ChatMode } from '@/types/chat';

export type { TaskType } from './config';

export interface RouterRequest {
  task: TaskType;
  message?: string;
  resumeData?: Record<string, unknown>;
  jobDescription?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionId?: string;
  signal?: AbortSignal;
  /** Chat mode for system prompt selection */
  mode?: ChatMode;
}

export interface RouterResponse {
  content: string;
  task: TaskType;
  model: string;
  cached: boolean;
  latencyMs: number;
  tokens?: {
    input: number;
    output: number;
  };
}

export type RouterStreamEvent =
  | { type: 'token'; data: string }
  | { type: 'done'; data: Omit<RouterResponse, 'cached'> }
  | { type: 'error'; data: { error: string; code: string } };

interface CacheValue {
  content: string;
  model: string;
  tokens?: { input: number; output: number };
}

export class AIRouter {
  private cache: AICache;
  private logger: RouterLogger;

  constructor(cache?: AICache, logger?: RouterLogger) {
    this.cache = cache ?? new AICache({ ttlMs: 5 * 60 * 1000 });
    this.logger = logger ?? new RouterLogger();
  }

  private selectSystemPrompt(config: ModelConfig | FallbackConfig, mode?: ChatMode): string {
    if (mode === 'hr-coach' && 'alternateSystemPrompt' in config && config.alternateSystemPrompt) {
      return config.alternateSystemPrompt;
    }
    return config.systemPrompt;
  }

  /**
   * Non-streaming route — returns complete response.
   */
  async route(request: RouterRequest): Promise<RouterResponse> {
    const startTime = Date.now();
    const config = MODEL_CONFIGS[request.task];

    const shouldCache = CACHEABLE_TASKS.includes(request.task);

    // 1. Check cache
    if (shouldCache) {
      const cacheKey = this.buildCacheKey(request);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        const latencyMs = Date.now() - startTime;
        this.logger.log({ task: request.task, model: cached.model, cached: true, latencyMs });
        return { ...cached, task: request.task, cached: true, latencyMs };
      }
    }

    // 2. Build prompt
    let prompt: string;
    try {
      prompt = buildPrompt(request.task, {
        message: request.message,
        resumeData: request.resumeData,
        jobDescription: request.jobDescription,
        history: request.history,
      });
    } catch (error) {
      const classified = classifyError(error, request.task);
      throw new AIRouterError(
        `Failed to build prompt: ${classified.message}`,
        classified.code === 'MODEL_ERROR' ? 'PROMPT_ERROR' : classified.code,
        request.task,
        config.model,
        error
      );
    }

    // 3. Execute with fallback chain + retry
    let result: CacheValue;
    try {
      result = await withRetry(
        () => this.executeWithFallback(config, prompt, request.signal, request.mode),
        { maxAttempts: 3, baseDelayMs: 1000, maxDelayMs: 10000 }
      );
    } catch (error) {
      const classified = classifyError(error, request.task, config.model);
      throw classified;
    }

    // 4. Cache result
    if (shouldCache) {
      const cacheKey = this.buildCacheKey(request);
      this.cache.set(cacheKey, result);
    }

    const latencyMs = Date.now() - startTime;
    this.logger.log({
      task: request.task,
      model: result.model,
      cached: false,
      latencyMs,
    });

    return { ...result, task: request.task, cached: false, latencyMs };
  }

  /**
   * Streaming route — yields tokens via async generator.
   * Used primarily for chat.
   */
  async *routeStream(request: RouterRequest): AsyncGenerator<RouterStreamEvent> {
    const startTime = Date.now();
    const config = MODEL_CONFIGS[request.task];

    const prompt = buildPrompt(request.task, {
      message: request.message,
      resumeData: request.resumeData,
      jobDescription: request.jobDescription,
      history: request.history,
    });

    try {
      const openai = getGemini();

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: this.selectSystemPrompt(config, request.mode) },
      ];

      if (request.history) {
        for (const msg of request.history) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      messages.push({ role: 'user', content: prompt });

      const stream = await openai.chat.completions.create({
        model: config.model,
        messages,
        temperature: config.temperature,
        top_p: config.topP,
        max_tokens: config.maxOutputTokens,
        stream: true,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        if (request.signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const text = chunk.choices?.[0]?.delta?.content ?? '';
        // DeepSeek models may return content in the 'reasoning' field
        const delta = chunk.choices?.[0]?.delta as unknown as { reasoning?: string };
        const textContent = text || delta.reasoning || '';
        if (textContent) {
          fullContent += textContent;
          yield { type: 'token', data: textContent };
        }
      }

      const latencyMs = Date.now() - startTime;
      this.logger.log({
        task: request.task,
        content: fullContent,
        model: config.model,
        cached: false,
        latencyMs,
      });

      yield {
        type: 'done',
        data: {
          content: fullContent,
          task: request.task,
          model: config.model,
          latencyMs,
        },
      };
    } catch (error) {
      const classified = classifyError(error, request.task, config.model);

      if (classified.code === 'ABORTED') {
        return;
      }

      this.logger.log({
        task: request.task,
        model: config.model,
        cached: false,
        latencyMs: Date.now() - startTime,
        error: classified.message,
      });

      yield { type: 'error', data: { error: classified.message, code: classified.code } };
    }
  }

  private async executeWithFallback(
    config: ModelConfig,
    prompt: string,
    signal?: AbortSignal,
    mode?: ChatMode
  ): Promise<CacheValue> {
    const models: Array<ModelConfig | FallbackConfig> = [config, ...config.fallbacks];
    let lastError: Error | null = null;

    for (let i = 0; i < models.length; i++) {
      const modelConfig = models[i];
      try {
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        const openai = getGemini();

        const completion = await openai.chat.completions.create({
          model: modelConfig.model,
          messages: [
            { role: 'system', content: this.selectSystemPrompt(modelConfig, mode) },
            { role: 'user', content: prompt },
          ],
          temperature: modelConfig.temperature,
          top_p: modelConfig.topP,
          max_tokens: modelConfig.maxOutputTokens,
        });

        const content = completion.choices[0]?.message?.content ?? '';
        // DeepSeek models may return content in the 'reasoning' field
        const msg = completion.choices[0]?.message as unknown as { reasoning?: string };
        const finalContent = content || msg.reasoning || '';

        return {
          content: finalContent,
          model: modelConfig.model,
          tokens: {
            input: completion.usage?.prompt_tokens ?? 0,
            output: completion.usage?.completion_tokens ?? 0,
          },
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`[AIRouter] Model "${modelConfig.model}" failed:`, lastError.message);
      }
    }

    throw new Error(
      `All models failed for task "${config.task}". Last error: ${lastError?.message ?? 'unknown'}`
    );
  }

  private buildCacheKey(request: RouterRequest): string {
    const data = JSON.stringify({
      task: request.task,
      resumeData: request.resumeData,
      jobDescription: request.jobDescription,
    });

    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return `${request.task}-${hash}`;
  }

  getStats(): { totalRequests: number; avgLatency: number; cacheHitRate: number } {
    return this.logger.getStats();
  }
}

interface LogEntry {
  task: TaskType;
  model?: string;
  cached: boolean;
  latencyMs: number;
  content?: string;
  error?: string;
  timestamp: number;
}

class RouterLogger {
  private entries: LogEntry[] = [];
  private maxEntries = 1000;

  log(entry: Partial<LogEntry> & { task: TaskType }): void {
    const logEntry: LogEntry = {
      task: entry.task,
      model: entry.model,
      cached: entry.cached ?? false,
      latencyMs: entry.latencyMs ?? 0,
      error: entry.error,
      timestamp: Date.now(),
    };
    this.entries.push(logEntry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
    if (process.env.NODE_ENV === 'development') {
      console.debug('[AIRouter]', logEntry);
    }
  }

  getRecent(count = 10): LogEntry[] {
    return this.entries.slice(-count);
  }

  getStats(): { totalRequests: number; avgLatency: number; cacheHitRate: number } {
    const total = this.entries.length;
    if (total === 0) return { totalRequests: 0, avgLatency: 0, cacheHitRate: 0 };
    const avgLatency = this.entries.reduce((s, e) => s + e.latencyMs, 0) / total;
    const cacheHits = this.entries.filter((e) => e.cached).length;
    return {
      totalRequests: total,
      avgLatency: Math.round(avgLatency),
      cacheHitRate: Math.round((cacheHits / total) * 100),
    };
  }
}

export { RouterLogger };
