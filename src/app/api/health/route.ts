// ============================================================
// Health Check — GET /api/health
// ============================================================
// Returns system health, uptime, version, and component checks.
// ============================================================

import { NextResponse } from 'next/server';
import { getLogger } from '@/lib/monitoring/logger';
import { metrics } from '@/lib/monitoring/metrics';
import { evaluateAlerts } from '@/lib/monitoring/alerts';
import type { HealthCheckResponse, HealthCheck } from '@/types/monitoring';

const START_TIME = Date.now();
const VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.1.0';

export async function GET() {
  const log = getLogger();
  const snapshot = metrics.snapshot();
  const alerts = evaluateAlerts(snapshot);

  const checks: HealthCheck[] = [
    {
      name: 'uptime',
      status: 'pass',
      message: `Running for ${Math.floor(snapshot.uptime / 60)}m ${snapshot.uptime % 60}s`,
    },
    {
      name: 'error-rate',
      status: snapshot.errorRate > 0.05 ? 'fail' : snapshot.errorRate > 0.02 ? 'warn' : 'pass',
      message: `Error rate: ${(snapshot.errorRate * 100).toFixed(2)}%`,
    },
    {
      name: 'latency-p95',
      status: snapshot.p95ResponseTimeMs > 10000 ? 'fail' : snapshot.p95ResponseTimeMs > 5000 ? 'warn' : 'pass',
      message: `P95 latency: ${snapshot.p95ResponseTimeMs}ms`,
    },
    {
      name: 'active-connections',
      status: 'pass',
      message: `${snapshot.activeConnections} active`,
    },
  ];

  // Determine overall status
  const hasFail = checks.some((c) => c.status === 'fail');
  const hasWarn = checks.some((c) => c.status === 'warn');

  const response: HealthCheckResponse = {
    status: hasFail ? 'unhealthy' : hasWarn ? 'degraded' : 'healthy',
    uptime: snapshot.uptime,
    version: VERSION,
    timestamp: Date.now(),
    checks,
  };

  // Log health check result
  log.info({ ...response, alerts: alerts.length }, 'Health check');

  // If there are active alerts, include them in the response headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (alerts.length > 0) {
    headers['X-Health-Alerts'] = alerts.map((a) => a.rule).join(',');
  }

  const statusCode = response.status === 'unhealthy' ? 503 : response.status === 'degraded' ? 200 : 200;

  return NextResponse.json(response, { status: statusCode, headers });
}
