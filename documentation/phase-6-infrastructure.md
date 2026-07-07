# Phase 6: Infrastructure Architecture

## Overview

This document describes the infrastructure architecture for cv.sarkhan.dev:
1. **CI/CD Pipeline** — GitHub Actions → Vercel
2. **Monitoring** — structured logging, health checks, metrics, alerting
3. **Rate Limiting** — middleware-based API protection

---

## 1. CI/CD Pipeline

### Architecture

```
                    ┌─────────────────────┐
                    │   GitHub Actions     │
                    │  .github/workflows/  │
                    │     ci.yml           │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         Push main        PR open        PR sync
              │               │               │
              ▼               ▼               ▼
      ┌──────────────┐ ┌──────────────┐
      │ Quality Gate │ │ Quality Gate │
      │ (tsc, lint,  │ │ (tsc, lint,  │
      │  test, build)│ │  test, build)│
      └──────┬───────┘ └──────┬───────┘
             │                │
             ▼                ▼
      ┌──────────────┐ ┌──────────────┐
      │  Deploy Prod │ │ Deploy Prev  │
      │  (Vercel)    │ │  (Vercel)    │
      └──────────────┘ └──────┬───────┘
                              │
                              ▼
                     ┌────────────────┐
                     │ PR Comment:     │
                     │ Preview URL     │
                     └────────────────┘
```

### Workflow: `.github/workflows/ci.yml`

| Step | Trigger | Action |
|------|---------|--------|
| `quality` | push + PR | `tsc --noEmit` → `lint` → `test` → `build` |
| `deploy-production` | push main | `vercel build --prod` → `vercel deploy --prebuilt --prod` |
| `deploy-preview` | PR | `vercel build` → `vercel deploy --prebuilt` → comment URL |

### Required Secrets

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel API authentication |
| `VERCEL_ORG_ID` | Vercel team/org identifier |
| `VERCEL_PROJECT_ID` | Vercel project identifier |
| `OLLAMA_CLOUD_API_KEY` | AI model access (for tests) |

### Design Decisions

- **Quality gate before deploy**: prevents broken code from reaching any environment
- **Separate prod/preview jobs**: Vercel environments are isolated
- **PR comment with preview URL**: enables visual review without manual link sharing
- **`npm ci` instead of `npm install`**: deterministic installs, faster in CI

---

## 2. Monitoring

### Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Route Handler│────▶│ withMonitoring│────▶│  Metrics     │
│  (route.ts)   │     │  (middleware) │     │  Collector   │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                     │
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  pino Logger │     │  Alerts      │
                     │  (JSON logs) │     │  Evaluator   │
                     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │  GET /api/   │
                                          │  health      │
                                          └──────────────┘
```

### Components

#### `src/lib/monitoring/logger.ts`
- Wraps **pino** — structured JSON logging
- `getLogger()` — singleton logger instance
- `createRequestLogger(requestId, method, path)` — child logger with request context
- Auto-redacts sensitive fields (Authorization, cookies, apiKey)
- Production: JSON-only stdout; Dev: optional pretty-print

#### `src/lib/monitoring/metrics.ts`
- In-memory `MetricsCollector` singleton
- Tracks: request count (by path + method), error count, latency (avg/p95/p99), active connections
- `snapshot()` → `MetricsSnapshot` for health endpoint
- Rolling window of 1000 latency samples for percentile accuracy

#### `src/lib/monitoring/alerts.ts`
- Rule-based anomaly detection over `MetricsSnapshot`
- Rules:
  | Rule | Threshold | Severity |
  |------|-----------|----------|
  | `high-error-rate` | > 5% | critical |
  | `elevated-error-rate` | > 2% | warning |
  | `high-latency-p95` | > 5000ms | warning |
  | `critical-latency-p99` | > 10000ms | critical |
  | `zero-requests` | 0 requests, uptime > 60s | warning |

#### `src/lib/monitoring/middleware.ts`
- `withMonitoring(handler)` — wraps any Next.js route handler
- Injects: request counting, latency tracking, error counting, structured logging
- Attaches `X-Request-Id` and `X-Response-Time-Ms` headers

#### `src/app/api/health/route.ts`
- `GET /api/health` — returns `HealthCheckResponse`
- Status: `healthy` | `degraded` | `unhealthy`
- Includes: uptime, version, component checks, active alerts in `X-Health-Alerts` header
- Returns 503 when unhealthy, 200 otherwise

### Health Check Response

```json
{
  "status": "healthy",
  "uptime": 3600,
  "version": "0.1.0",
  "timestamp": 1712345678000,
  "checks": [
    { "name": "uptime", "status": "pass", "message": "Running for 60m 0s" },
    { "name": "error-rate", "status": "pass", "message": "Error rate: 0.50%" },
    { "name": "latency-p95", "status": "pass", "message": "P95 latency: 1200ms" },
    { "name": "active-connections", "status": "pass", "message": "3 active" }
  ]
}
```

### Design Decisions

- **pino over console.log**: structured JSON logs are parseable by log aggregators (Datadog, Logtail, Axiom)
- **In-memory metrics**: zero external dependencies; swap for Prometheus/OpenTelemetry when scaling
- **Alert rules in code**: no external monitoring service needed for basic anomaly detection
- **Health endpoint separate from monitoring middleware**: health must never be rate-limited

---

## 3. Rate Limiting

### Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Incoming     │────▶│  resolveTier │────▶│  checkRate   │
│  Request      │     │  (path→tier) │     │  Limit       │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                     │
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  SSE paths   │     │  Rate Limit  │
                     │  → null      │     │  Store       │
                     │  (excluded)  │     │  (in-memory) │
                     └──────────────┘     └──────┬───────┘
                                                  │
                     ┌──────────────┐             │
                     │  Allowed?    │◀────────────┘
                     └──────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              │ Yes                       │ No
              ▼                           ▼
      ┌──────────────┐           ┌──────────────┐
      │ Route Handler│           │ 429 Response │
      │  (proceed)   │           │ + RateLimit  │
      └──────────────┘           │   Headers    │
                                 └──────────────┘
```

### Components

#### `src/lib/rate-limit/config.ts`
- `RATE_LIMIT_CONFIGS` — three tiers:
  | Tier | Limit | Window | Use Case |
  |------|-------|--------|----------|
  | `auth` | 10 | 60s | Login, register |
  | `api` | 60 | 60s | AI routes, job search |
  | `public` | 120 | 60s | Static pages, public data |
- `resolveTier(path)` — maps path to tier; returns `null` for SSE/health (excluded)

#### `src/lib/rate-limit/store.ts`
- `InMemoryRateLimitStore` — sliding window counter per key
- Key format: `ratelimit:{tier}:{identifier}` (identifier = API key or IP)
- Auto-cleanup of expired entries every 60s
- **Production**: swap for Redis-based store

#### `src/lib/rate-limit/index.ts`
- `checkRateLimit(req, tier?)` — returns `RateLimitResult` with `.toResponse()` method
- `withRateLimit(handler, tier?)` — HOF wrapper for route handlers
- Extracts IP from `x-forwarded-for` / `x-real-ip`
- Extracts API key from `Authorization: Bearer` or `?api_key=`
- Sets headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`

### SSE Exclusion

The SSE streaming endpoint (`/api/sse/chat`) is **explicitly excluded** from rate limiting:
- `resolveTier()` returns `null` for paths starting with `/api/sse/` or `/api/chat/stream`
- When tier is `null`, `checkRateLimit` returns `{ allowed: true }` immediately
- No counters incremented, no headers set

### Usage in Route Handlers

```typescript
// Option 1: Inline check
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const rl = await checkRateLimit(req, 'api');
  if (!rl.allowed) return rl.toResponse();
  // ... handler logic
}

// Option 2: HOF wrapper
import { withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(async (req: Request) => {
  // ... handler logic
}, 'api');
```

### Design Decisions

- **Middleware, not Next.js `middleware.ts`**: App Router route-level middleware gives per-route control without affecting static assets
- **SSE exclusion by path prefix**: streaming connections are long-lived; rate limiting them would break the chat UX
- **IP + API key dual keying**: authenticated users get higher effective limits via their API key
- **In-memory store**: zero infrastructure; Redis adapter can be swapped without changing the interface
- **`toResponse()` pattern**: caller decides how to handle rejection; the rate limiter provides a ready-made 429 response

---

## 4. Integration Points

### Existing Routes — No Changes Required

| Route | Phase | Rate Limit Tier | Monitoring |
|-------|-------|----------------|------------|
| `POST /api/sse/chat` | 2 | **Excluded** (SSE) | via `withMonitoring` |
| `POST /api/ai/route` | 2 | `api` | via `withMonitoring` |
| `POST /api/assess` | 3 | `api` | via `withMonitoring` |
| `POST /api/generate` | 3 | `api` | via `withMonitoring` |
| `POST /api/update` | 3 | `api` | via `withMonitoring` |
| `POST /api/jobs/search` | 4 | `api` | via `withMonitoring` |
| `GET /api/health` | 6 | **Excluded** | native |

### New Files Summary

```
.github/workflows/ci.yml              # CI/CD pipeline
src/types/monitoring.ts                # Monitoring type definitions
src/types/rate-limit.ts                # Rate limit type definitions
src/lib/monitoring/logger.ts           # pino logger wrapper
src/lib/monitoring/metrics.ts          # Metrics collector
src/lib/monitoring/alerts.ts           # Alert rules
src/lib/monitoring/middleware.ts       # Request monitoring HOF
src/lib/monitoring/index.ts            # Barrel export
src/lib/rate-limit/store.ts            # In-memory rate limit store
src/lib/rate-limit/config.ts           # Rate limit configuration
src/lib/rate-limit/index.ts            # Rate limit check + HOF
src/app/api/health/route.ts            # Health check endpoint
```

### Backward Compatibility

- All new code is **additive** — no existing files modified except `src/types/index.ts` (added 2 exports)
- Rate limiter is **opt-in**: existing routes continue working without it
- Monitoring middleware is **opt-in**: existing routes continue working without it
- Health endpoint is a **new route** — no existing route affected
- pino replaces `console.log`/`console.error` only in new code; existing `console.*` calls remain untouched
