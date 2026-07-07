// ============================================================
// Monitoring Middleware — request tracking
// ============================================================
// Wraps a Next.js route handler with:
//   - Request counting (metrics)
//   - Latency tracking
//   - Error counting
//   - Structured logging via pino
// ============================================================

import { NextResponse } from 'next/server';
import { metrics } from '@/lib/monitoring/metrics';
import { createRequestLogger } from '@/lib/monitoring/logger';
import { nanoid } from 'nanoid';

/**
 * Higher-order function: wraps a Next.js route handler with monitoring.
 * Tracks request count, latency, errors, and logs structured data.
 *
 * Usage:
 *   export const POST = withMonitoring(async (req) => { ... });
 */
export function withMonitoring(
  handler: (req: Request) => Promise<NextResponse>
): (req: Request) => Promise<NextResponse> {
  return async (req: Request) => {
    const requestId = nanoid(12);
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname;

    const log = createRequestLogger(requestId, method, path);

    metrics.incrementRequest(method, path);
    metrics.incrementActive();

    const startTime = Date.now();

    try {
      const response = await handler(req);

      const latencyMs = Date.now() - startTime;
      metrics.recordLatency(latencyMs);

      if (response.status >= 500) {
        metrics.incrementError();
        log.error({ statusCode: response.status, latencyMs }, 'Request failed');
      } else {
        log.info({ statusCode: response.status, latencyMs }, 'Request completed');
      }

      // Attach request ID to response headers
      const headers = new Headers(response.headers);
      headers.set('X-Request-Id', requestId);
      headers.set('X-Response-Time-Ms', String(latencyMs));

      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      metrics.incrementError();
      metrics.recordLatency(latencyMs);

      const message = error instanceof Error ? error.message : 'Internal server error';
      log.error({ error: message, latencyMs }, 'Unhandled error in route handler');

      return NextResponse.json(
        { error: 'Internal server error', requestId },
        { status: 500, headers: { 'X-Request-Id': requestId } }
      );
    } finally {
      metrics.decrementActive();
    }
  };
}
