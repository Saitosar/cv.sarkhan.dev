# Rate Limiting

**Status:** Draft  
**Last Updated:** 2026-07-03  
**Owner:** CTO (Sarkhan)

## Overview

Anti-abuse protection для всех API endpoints.

## Limits by Tier

| Endpoint | Guest | Free | Pro |
|----------|-------|------|-----|
| `/api/generate` | 5/day | 20/day | 200/day |
| `/api/update` | 5/day | 20/day | 200/day |
| `/api/assess` | 3/day | 10/day | 100/day |
| `/api/ats-score` | — | 5/day | 100/day |
| `/api/search-jobs` | — | — | 50/day |
| `/api/transcribe` | 2/day | 5/day | 50/day |
| MCP Server | — | — | 100/hour |

## Implementation

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Per-user rate limiter
const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
});

// Middleware
export async function rateLimit(req: Request, tier: Tier): Promise<Response | null> {
  const userId = await getUserId(req) || req.headers.get('x-forwarded-for');
  
  const limits = {
    guest: { requests: 5, window: '1 d' },
    free: { requests: 20, window: '1 d' },
    pro: { requests: 200, window: '1 d' },
  };
  
  const limit = limits[tier];
  const identifier = `${tier}:${userId}`;
  
  const { success, remaining, reset } = await rateLimiter.limit(identifier);
  
  if (!success) {
    return new Response(JSON.stringify({
      error: 'rate_limited',
      message: `Too many requests. Limit: ${limit.requests}/${limit.window}`,
      retry_after: reset,
    }), {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        'X-RateLimit-Remaining': String(remaining),
      },
    });
  }
  
  return null; // Continue
}
```

## Headers

Every response includes:
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1625123456
```
