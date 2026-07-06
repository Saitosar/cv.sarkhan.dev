import { AIRouterError, type ErrorCode } from './errors';

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableCodes?: ErrorCode[];
}

const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableCodes: ['MODEL_ERROR', 'NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMITED'],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY, ...options };
  const { maxAttempts, baseDelayMs, maxDelayMs, retryableCodes } = opts;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        break;
      }

      // Never retry aborted requests
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      const code = error instanceof AIRouterError ? error.code : undefined;

      // Don't retry on client/prompt/invalid response errors unless explicitly allowed
      if (code && !retryableCodes?.includes(code)) {
        throw error;
      }

      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000,
        maxDelayMs
      );

      console.warn(`[Retry] Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms...`);
      await sleep(delay);
    }
  }

  throw lastError;
}
