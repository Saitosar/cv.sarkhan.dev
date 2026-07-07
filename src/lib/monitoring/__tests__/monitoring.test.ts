import { describe, it, expect, beforeEach } from 'vitest';
import { metrics } from '@/lib/monitoring/metrics';
import { evaluateAlerts, RULES } from '@/lib/monitoring/alerts';
import type { MetricsSnapshot } from '@/types/monitoring';

describe('Metrics Collector', () => {
  beforeEach(() => {
    metrics.reset();
  });

  it('starts with zero counts', () => {
    const snap = metrics.snapshot();
    expect(snap.totalRequests).toBe(0);
    expect(snap.errorCount).toBe(0);
    expect(snap.activeConnections).toBe(0);
  });

  it('tracks request count by method and path', () => {
    metrics.incrementRequest('POST', '/api/assess');
    metrics.incrementRequest('POST', '/api/assess');
    metrics.incrementRequest('GET', '/api/health');

    const snap = metrics.snapshot();
    expect(snap.totalRequests).toBe(3);
    expect(snap.requestsByMethod['POST']).toBe(2);
    expect(snap.requestsByMethod['GET']).toBe(1);
    expect(snap.requestsByPath['/api/assess']).toBe(2);
    expect(snap.requestsByPath['/api/health']).toBe(1);
  });

  it('tracks error count', () => {
    metrics.incrementError();
    metrics.incrementError();
    const snap = metrics.snapshot();
    expect(snap.errorCount).toBe(2);
  });

  it('tracks active connections', () => {
    metrics.incrementActive();
    metrics.incrementActive();
    metrics.decrementActive();
    const snap = metrics.snapshot();
    expect(snap.activeConnections).toBe(1);
  });

  it('tracks latency', () => {
    metrics.recordLatency(100);
    metrics.recordLatency(200);
    const snap = metrics.snapshot();
    expect(snap.avgResponseTimeMs).toBe(150);
  });

  it('computes uptime', () => {
    const snap = metrics.snapshot();
    expect(snap.uptime).toBeGreaterThanOrEqual(0);
  });

  it('resets all counters', () => {
    metrics.incrementRequest('GET', '/api/test');
    metrics.incrementError();
    metrics.reset();
    const snap = metrics.snapshot();
    expect(snap.totalRequests).toBe(0);
    expect(snap.errorCount).toBe(0);
  });
});

describe('Alert Rules', () => {
  it('triggers high-error-rate at > 5%', () => {
    const snapshot: MetricsSnapshot = {
      uptime: 100,
      totalRequests: 100,
      requestsByPath: {},
      requestsByMethod: {},
      errorCount: 10,
      errorRate: 0.1,
      avgResponseTimeMs: 100,
      p95ResponseTimeMs: 200,
      p99ResponseTimeMs: 500,
      activeConnections: 5,
      timestamp: Date.now(),
    };
    const alerts = evaluateAlerts(snapshot);
    expect(alerts.some((a) => a.rule === 'high-error-rate')).toBe(true);
  });

  it('triggers elevated-error-rate between 2% and 5%', () => {
    const snapshot: MetricsSnapshot = {
      uptime: 100,
      totalRequests: 100,
      requestsByPath: {},
      requestsByMethod: {},
      errorCount: 3,
      errorRate: 0.03,
      avgResponseTimeMs: 100,
      p95ResponseTimeMs: 200,
      p99ResponseTimeMs: 500,
      activeConnections: 5,
      timestamp: Date.now(),
    };
    const alerts = evaluateAlerts(snapshot);
    expect(alerts.some((a) => a.rule === 'elevated-error-rate')).toBe(true);
    expect(alerts.some((a) => a.rule === 'high-error-rate')).toBe(false);
  });

  it('triggers high-latency-p95 at > 5000ms', () => {
    const snapshot: MetricsSnapshot = {
      uptime: 100,
      totalRequests: 10,
      requestsByPath: {},
      requestsByMethod: {},
      errorCount: 0,
      errorRate: 0,
      avgResponseTimeMs: 6000,
      p95ResponseTimeMs: 6000,
      p99ResponseTimeMs: 8000,
      activeConnections: 5,
      timestamp: Date.now(),
    };
    const alerts = evaluateAlerts(snapshot);
    expect(alerts.some((a) => a.rule === 'high-latency-p95')).toBe(true);
  });

  it('triggers zero-requests when no traffic after 60s', () => {
    const snapshot: MetricsSnapshot = {
      uptime: 120,
      totalRequests: 0,
      requestsByPath: {},
      requestsByMethod: {},
      errorCount: 0,
      errorRate: 0,
      avgResponseTimeMs: 0,
      p95ResponseTimeMs: 0,
      p99ResponseTimeMs: 0,
      activeConnections: 0,
      timestamp: Date.now(),
    };
    const alerts = evaluateAlerts(snapshot);
    expect(alerts.some((a) => a.rule === 'zero-requests')).toBe(true);
  });

  it('returns no alerts for healthy system', () => {
    const snapshot: MetricsSnapshot = {
      uptime: 100,
      totalRequests: 100,
      requestsByPath: {},
      requestsByMethod: {},
      errorCount: 0,
      errorRate: 0,
      avgResponseTimeMs: 50,
      p95ResponseTimeMs: 100,
      p99ResponseTimeMs: 200,
      activeConnections: 3,
      timestamp: Date.now(),
    };
    const alerts = evaluateAlerts(snapshot);
    expect(alerts.length).toBe(0);
  });
});
