// ============================================================
// Rate Limit Configuration
// ============================================================

import type { RateLimitConfig, RateLimitTier } from '@/types/rate-limit';

export const RATE_LIMIT_CONFIGS: Record<RateLimitTier, RateLimitConfig> = {
  /** Auth endpoints — strictest limits */
  auth: {
    tier: 'auth',
    limit: 10,
    windowSeconds: 60,
    statusCode: 429,
    errorMessage: 'Too many authentication attempts. Please try again later.',
  },

  /** General API endpoints — moderate limits */
  api: {
    tier: 'api',
    limit: 60,
    windowSeconds: 60,
    statusCode: 429,
    errorMessage: 'API rate limit exceeded. Please slow down.',
  },

  /** Public/read-only endpoints — generous limits */
  public: {
    tier: 'public',
    limit: 120,
    windowSeconds: 60,
    statusCode: 429,
    errorMessage: 'Rate limit exceeded. Please try again later.',
  },
};

/**
 * Map request path to a rate limit tier.
 * SSE streaming endpoints are excluded (return null).
 */
export function resolveTier(path: string): RateLimitTier | null {
  // SSE streaming — no rate limiting
  if (path.startsWith('/api/sse/') || path.startsWith('/api/chat/stream')) {
    return null;
  }

  // Health check — no rate limiting
  if (path === '/api/health') {
    return null;
  }

  // Auth-like paths
  if (path.startsWith('/api/auth/') || path.startsWith('/api/login') || path.startsWith('/api/register')) {
    return 'auth';
  }

  // All other API paths
  if (path.startsWith('/api/')) {
    return 'api';
  }

  // Public/static paths
  return 'public';
}
