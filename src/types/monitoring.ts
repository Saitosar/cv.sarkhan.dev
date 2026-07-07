// ============================================================
// Monitoring Types
// ============================================================

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;           // seconds since process start
  version: string;
  timestamp: number;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  latencyMs?: number;
}

export interface MetricsSnapshot {
  uptime: number;
  totalRequests: number;
  requestsByPath: Record<string, number>;
  requestsByMethod: Record<string, number>;
  errorCount: number;
  errorRate: number;        // 0–1 fraction
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  activeConnections: number;
  timestamp: number;
}

export interface LogEntry {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  latencyMs?: number;
  error?: string;
  [key: string]: unknown;
}

export interface AlertRule {
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  evaluate: (metrics: MetricsSnapshot) => AlertResult | null;
}

export interface AlertResult {
  rule: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}
