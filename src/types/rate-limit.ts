// ============================================================
// Rate Limiting Types
// ============================================================

export type RateLimitTier = 'auth' | 'api' | 'public';

export interface RateLimitConfig {
  /** Unique key for this tier */
  tier: RateLimitTier;
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** HTTP status code on limit exceeded (default 429) */
  statusCode?: number;
  /** Error message on limit exceeded */
  errorMessage?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;          // Unix timestamp (ms)
  limit: number;
  retryAfterSeconds: number;
}

export interface RateLimitStore {
  /** Increment counter for key, returns current count + expiry */
  increment(key: string, windowSeconds: number): Promise<{
    count: number;
    expiresAt: number;
  }>;
  /** Reset counter for key */
  reset(key: string): Promise<void>;
}

export interface RateLimitContext {
  ip: string;
  apiKey?: string;
  path: string;
  method: string;
}
