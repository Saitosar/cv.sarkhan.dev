export type ErrorCode =
  | 'MODEL_ERROR'       // All models in fallback chain failed
  | 'TIMEOUT'           // Request exceeded timeout
  | 'RATE_LIMITED'      // 429 from API
  | 'INVALID_RESPONSE'  // Response couldn't be parsed
  | 'CACHE_MISS'        // Cache read/write failure or miss
  | 'PROMPT_ERROR'      // Prompt building failed
  | 'ABORTED'           // Request was cancelled by user
  | 'NETWORK_ERROR';    // Network/fetch failure

export class AIRouterError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly task?: string,
    public readonly model?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AIRouterError';
  }
}

function newAIRouterError(
  message: string,
  code: ErrorCode,
  task?: string,
  model?: string,
  cause?: unknown
): AIRouterError {
  return new AIRouterError(message, code, task, model, cause);
}

export function classifyError(error: unknown, task?: string, model?: string): AIRouterError {
  if (error instanceof AIRouterError) return error;

  const message = error instanceof Error ? error.message : 'Unknown error';

  if (error instanceof DOMException && error.name === 'AbortError') {
    return newAIRouterError('Request was cancelled', 'ABORTED', task, model, error);
  }

  const text = message.toLowerCase();

  if (text.includes('timeout') || text.includes('deadline exceeded')) {
    return newAIRouterError(message, 'TIMEOUT', task, model, error);
  }

  if (text.includes('429') || text.includes('rate limit') || text.includes('quota')) {
    return newAIRouterError(message, 'RATE_LIMITED', task, model, error);
  }

  if (text.includes('network') || text.includes('fetch') || text.includes('connection')) {
    return newAIRouterError(message, 'NETWORK_ERROR', task, model, error);
  }

  return newAIRouterError(message, 'MODEL_ERROR', task, model, error);
}
