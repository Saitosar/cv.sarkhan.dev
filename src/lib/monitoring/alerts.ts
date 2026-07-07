// ============================================================
// Alerting Rules — anomaly detection over metrics snapshots
// ============================================================
// Each rule evaluates a MetricsSnapshot and returns an AlertResult
// if a threshold is breached.
// ============================================================

import type { AlertRule, AlertResult, MetricsSnapshot } from '@/types/monitoring';

const RULES: AlertRule[] = [
  {
    name: 'high-error-rate',
    description: 'Error rate exceeds 5% in the current window',
    severity: 'critical',
    evaluate: (m: MetricsSnapshot): AlertResult | null => {
      if (m.errorRate > 0.05) {
        return {
          rule: 'high-error-rate',
          severity: 'critical',
          message: `Error rate is ${(m.errorRate * 100).toFixed(1)}% (threshold: 5%)`,
          value: m.errorRate,
          threshold: 0.05,
          timestamp: Date.now(),
        };
      }
      return null;
    },
  },
  {
    name: 'elevated-error-rate',
    description: 'Error rate exceeds 2% in the current window',
    severity: 'warning',
    evaluate: (m: MetricsSnapshot): AlertResult | null => {
      if (m.errorRate > 0.02 && m.errorRate <= 0.05) {
        return {
          rule: 'elevated-error-rate',
          severity: 'warning',
          message: `Error rate is ${(m.errorRate * 100).toFixed(1)}% (threshold: 2%)`,
          value: m.errorRate,
          threshold: 0.02,
          timestamp: Date.now(),
        };
      }
      return null;
    },
  },
  {
    name: 'high-latency-p95',
    description: 'P95 response time exceeds 5 seconds',
    severity: 'warning',
    evaluate: (m: MetricsSnapshot): AlertResult | null => {
      if (m.p95ResponseTimeMs > 5000) {
        return {
          rule: 'high-latency-p95',
          severity: 'warning',
          message: `P95 latency is ${m.p95ResponseTimeMs}ms (threshold: 5000ms)`,
          value: m.p95ResponseTimeMs,
          threshold: 5000,
          timestamp: Date.now(),
        };
      }
      return null;
    },
  },
  {
    name: 'critical-latency-p99',
    description: 'P99 response time exceeds 10 seconds',
    severity: 'critical',
    evaluate: (m: MetricsSnapshot): AlertResult | null => {
      if (m.p99ResponseTimeMs > 10000) {
        return {
          rule: 'critical-latency-p99',
          severity: 'critical',
          message: `P99 latency is ${m.p99ResponseTimeMs}ms (threshold: 10000ms)`,
          value: m.p99ResponseTimeMs,
          threshold: 10000,
          timestamp: Date.now(),
        };
      }
      return null;
    },
  },
  {
    name: 'zero-requests',
    description: 'No requests processed in the current window (possible outage)',
    severity: 'warning',
    evaluate: (m: MetricsSnapshot): AlertResult | null => {
      if (m.totalRequests === 0 && m.uptime > 60) {
        return {
          rule: 'zero-requests',
          severity: 'warning',
          message: 'No requests processed in the current window',
          value: 0,
          threshold: 1,
          timestamp: Date.now(),
        };
      }
      return null;
    },
  },
];

/**
 * Evaluate all alert rules against a metrics snapshot.
 * Returns only triggered alerts.
 */
export function evaluateAlerts(metrics: MetricsSnapshot): AlertResult[] {
  const alerts: AlertResult[] = [];
  for (const rule of RULES) {
    const result = rule.evaluate(metrics);
    if (result) {
      alerts.push(result);
    }
  }
  return alerts;
}

export { RULES };
