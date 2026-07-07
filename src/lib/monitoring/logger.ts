// ============================================================
// Structured Logging — pino-based JSON logger
// ============================================================
// Wraps pino with request-context helpers.
// Logs are always JSON — parseable by any log aggregator.
// ============================================================

import pino from 'pino';
import type { LogEntry } from '@/types/monitoring';

// Re-export pino's Logger type for consumers
export type Logger = pino.Logger;

let loggerInstance: pino.Logger | null = null;

export interface LoggerOptions {
  level?: pino.Level;
  prettyPrint?: boolean;
}

/**
 * Get or create the application logger.
 * In production: JSON-only output to stdout.
 * In development: optional pretty-print for readability.
 */
export function getLogger(options?: LoggerOptions): pino.Logger {
  if (loggerInstance && !options) {
    return loggerInstance;
  }

  const level = options?.level ?? (process.env.LOG_LEVEL as pino.Level) ?? 'info';
  const isDev = process.env.NODE_ENV === 'development';

  loggerInstance = pino({
    level,
    transport: isDev && options?.prettyPrint
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss.l' } }
      : undefined,
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err,
    },
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'body.apiKey', 'body.password'],
      censor: '[REDACTED]',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  return loggerInstance;
}

/**
 * Create a child logger with request-scoped context.
 * Attach requestId, method, path to every log line from this request.
 */
export function createRequestLogger(
  requestId: string,
  method: string,
  path: string
): pino.Logger {
  const base = getLogger();
  return base.child({ requestId, method, path });
}

/**
 * Convert a pino log entry to our canonical LogEntry shape.
 * Useful when forwarding logs to an external aggregator.
 */
export function toLogEntry(log: Record<string, unknown>): LogEntry {
  return {
    level: (log.level as LogEntry['level']) ?? 'info',
    message: (log.msg as string) ?? '',
    timestamp: (log.time as string) ?? new Date().toISOString(),
    requestId: log.requestId as string | undefined,
    method: log.method as string | undefined,
    path: log.path as string | undefined,
    statusCode: log.statusCode as number | undefined,
    latencyMs: log.latencyMs as number | undefined,
    error: log.err ? (log.err as { message?: string }).message : undefined,
  };
}
