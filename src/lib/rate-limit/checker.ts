// ============================================================
// Rate Limiter — middleware for Next.js App Router
// ============================================================
// Usage in route.ts:
//   const rl = await checkRateLimit(req, 'api');
//   if (!rl.allowed) return rl.toResponse();
// ============================================================

import { NextResponse } from 'next/server';
import { rateLimitStore } from './store';
import { RATE_LIMIT_CONFIGS, resolveTier } from './config';
import type { RateLimitResult, RateLimitTier } from '@/types/rate-limit';

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly result: RateLimitResult
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Extract client IP from request.
 * Respects Vercel's forwarded headers, then x-forwarded-for, then fallback.
 */
function extractIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

/**
 * Extract API key from Authorization header or query param.
 */
function extractApiKey(req: Request): string | undefined {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  const url = new URL(req.url);
  return url.searchParams.get('api_key') ?? undefined;
}

/**
 * Build a rate limit key from request context.
 * Prefers API key over IP for authenticated requests.
 */
function buildKey(ip: string, apiKey?: string, tier?: RateLimitTier): string {
  const identifier = apiKey ?? ip;
  return `ratelimit:${tier ?? 'api'}:${identifier}`;
}

/**
 * Check if a request is rate limited.
 * Returns the rate limit result with remaining count and reset time.
 */
export async function checkRateLimit(
  req: Request,
  tierOverride?: RateLimitTier
): Promise<RateLimitResult & { toResponse: () => NextResponse }> {
  const url = new URL(req.url);
  const path = url.pathname;

  // Resolve tier from path if not overridden
  const tier = tierOverride ?? resolveTier(path);

  // Paths that return null are excluded from rate limiting
  if (tier === null) {
    return {
      allowed: true,
      remaining: Infinity,
      resetAt: 0,
      limit: Infinity,
      retryAfterSeconds: 0,
      toResponse: () => NextResponse.json({}, { status: 200 }),
    };
  }

  const config = RATE_LIMIT_CONFIGS[tier];
  const ip = extractIP(req);
  const apiKey = extractApiKey(req);
  const key = buildKey(ip, apiKey, tier);

  const { count, expiresAt } = await rateLimitStore.increment(key, config.windowSeconds);
  const remaining = Math.max(0, config.limit - count);
  const retryAfterSeconds = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));

  const result: RateLimitResult = {
    allowed: count <= config.limit,
    remaining,
    resetAt: expiresAt,
    limit: config.limit,
    retryAfterSeconds,
  };

  return {
    ...result,
    toResponse: () => {
      const headers: Record<string, string> = {
        'X-RateLimit-Limit': String(config.limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(Math.ceil(expiresAt / 1000)),
        'Retry-After': String(retryAfterSeconds),
      };

      return NextResponse.json(
        {
          error: config.errorMessage,
          retryAfterSeconds,
        },
        {
          status: config.statusCode ?? 429,
          headers,
        }
      );
    },
  };
}

/**
 * Higher-order function: wraps a Next.js route handler with rate limiting.
 * Usage:
 *   export const POST = withRateLimit(async (req) => { ... }, 'api');
 */
export function withRateLimit(
  handler: (req: Request) => Promise<NextResponse>,
  tier?: RateLimitTier
): (req: Request) => Promise<NextResponse> {
  return async (req: Request) => {
    const result = await checkRateLimit(req, tier);
    if (!result.allowed) {
      return result.toResponse();
    }
    return handler(req);
  };
}
