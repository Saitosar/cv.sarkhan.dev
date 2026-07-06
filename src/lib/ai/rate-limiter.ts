export interface RateLimitState {
  remaining: number;
  resetAt: number;
  isLimited: boolean;
}

export interface RateLimiterOptions {
  requestsPerMinute: number;
  warnThreshold?: number; // 0-1 fraction of limit at which to warn (default 0.8)
}

export class RateLimiter {
  private queue: Array<{
    resolve: () => void;
    reject: (error: Error) => void;
  }> = [];
  private processing = false;
  private timestamps: number[] = [];
  private requestsPerMinute: number;
  private warnThreshold: number;

  constructor(options: RateLimiterOptions) {
    this.requestsPerMinute = options.requestsPerMinute;
    this.warnThreshold = options.warnThreshold ?? 0.8;
  }

  async acquire(signal?: AbortSignal): Promise<RateLimitState> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        resolve: () => {
          const state = this._recordRequest();
          resolve(state);
        },
        reject,
      });
      this._processQueue(signal);
    });
  }

  /**
   * Inspect an HTTP response for rate-limit headers and warn when exhausted.
   */
  handleRateLimit(response: Response): void {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetAt = response.headers.get('X-RateLimit-Reset');

    if (remaining === '0') {
      const waitMs = resetAt
        ? Math.max(0, parseInt(resetAt) * 1000 - Date.now())
        : 5000;
      console.warn(`[RateLimiter] Rate limited. Waiting ${waitMs}ms...`);
    }
  }

  get state(): RateLimitState {
    const now = Date.now();
    const windowStart = now - 60_000;
    this.timestamps = this.timestamps.filter((t) => t > windowStart);

    const used = this.timestamps.length;
    const remaining = Math.max(0, this.requestsPerMinute - used);
    const resetAt = this.timestamps.length > 0
      ? this.timestamps[0] + 60_000
      : now;

    return {
      remaining,
      resetAt,
      isLimited: remaining === 0,
    };
  }

  /**
   * Returns true if remaining requests are below the warning threshold.
   */
  isApproachingLimit(): boolean {
    const { remaining } = this.state;
    return remaining <= this.requestsPerMinute * (1 - this.warnThreshold);
  }

  private _recordRequest(): RateLimitState {
    const now = Date.now();
    const windowStart = now - 60_000;
    this.timestamps = this.timestamps.filter((t) => t > windowStart);
    this.timestamps.push(now);

    const used = this.timestamps.length;
    const remaining = Math.max(0, this.requestsPerMinute - used);

    if (remaining <= this.requestsPerMinute * (1 - this.warnThreshold)) {
      console.warn(`[RateLimiter] Approaching limit: ${remaining}/${this.requestsPerMinute} requests remaining`);
    }

    return {
      remaining,
      resetAt: this.timestamps[0] + 60_000,
      isLimited: remaining === 0,
    };
  }

  private async _processQueue(signal?: AbortSignal): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      if (signal?.aborted) {
        const queued = this.queue.splice(0);
        queued.forEach(({ reject }) => reject(new DOMException('Aborted', 'AbortError')));
        break;
      }

      const state = this.state;
      if (state.isLimited) {
        const waitMs = state.resetAt - Date.now();
        if (waitMs > 0) {
          await sleep(waitMs);
          continue;
        }
      }

      const next = this.queue.shift();
      if (next) next.resolve();
    }

    this.processing = false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
