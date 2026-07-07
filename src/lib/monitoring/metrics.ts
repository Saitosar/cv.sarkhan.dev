// ============================================================
// Metrics Collector — in-memory request metrics
// ============================================================
// Tracks: request count by path/method, error rate, latency
// percentiles, active connections, uptime.
// Designed for /api/health consumption.
// ============================================================

import type { MetricsSnapshot } from '@/types/monitoring';

interface LatencyBucket {
  count: number;
  totalMs: number;
  samples: number[];  // rolling window for percentile calc
}

const MAX_SAMPLES = 1000;

class MetricsCollector {
  private startTime = Date.now();
  private totalRequests = 0;
  private requestsByPath = new Map<string, number>();
  private requestsByMethod = new Map<string, number>();
  private errorCount = 0;
  private latency: LatencyBucket = { count: 0, totalMs: 0, samples: [] };
  private activeConnections = 0;

  /** Call at the start of every request */
  incrementRequest(method: string, path: string): void {
    this.totalRequests++;
    this.requestsByMethod.set(method, (this.requestsByMethod.get(method) ?? 0) + 1);
    this.requestsByPath.set(path, (this.requestsByPath.get(path) ?? 0) + 1);
  }

  /** Call when a request completes */
  recordLatency(latencyMs: number): void {
    this.latency.count++;
    this.latency.totalMs += latencyMs;
    this.latency.samples.push(latencyMs);
    if (this.latency.samples.length > MAX_SAMPLES) {
      this.latency.samples.shift();
    }
  }

  /** Call on 5xx responses */
  incrementError(): void {
    this.errorCount++;
  }

  /** Track concurrent connections */
  incrementActive(): void {
    this.activeConnections++;
  }

  decrementActive(): void {
    this.activeConnections = Math.max(0, this.activeConnections - 1);
  }

  /** Compute percentile from sorted samples */
  private percentile(p: number): number {
    const sorted = [...this.latency.samples].sort((a, b) => a - b);
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /** Snapshot current metrics */
  snapshot(): MetricsSnapshot {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const total = this.totalRequests || 1; // avoid div-by-zero

    return {
      uptime,
      totalRequests: this.totalRequests,
      requestsByPath: Object.fromEntries(this.requestsByPath),
      requestsByMethod: Object.fromEntries(this.requestsByMethod),
      errorCount: this.errorCount,
      errorRate: this.errorCount / total,
      avgResponseTimeMs: this.latency.count > 0
        ? Math.round(this.latency.totalMs / this.latency.count)
        : 0,
      p95ResponseTimeMs: this.percentile(95),
      p99ResponseTimeMs: this.percentile(99),
      activeConnections: this.activeConnections,
      timestamp: Date.now(),
    };
  }

  /** Reset all counters (e.g. after a metrics push) */
  reset(): void {
    this.totalRequests = 0;
    this.requestsByPath.clear();
    this.requestsByMethod.clear();
    this.errorCount = 0;
    this.latency = { count: 0, totalMs: 0, samples: [] };
    this.activeConnections = 0;
  }
}

// Singleton
export const metrics = new MetricsCollector();
