# Monitoring

**Status:** Draft  
**Last Updated:** 2026-07-03  
**Owner:** CTO (Sarkhan)

## Monitoring Stack

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking, performance monitoring |
| **Vercel Analytics** | Web vitals, page views |
| **Custom logging** | AI model calls, latency, fallback usage |

## Sentry Setup

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  profilesSampleRate: 0.1,
  
  // Ignore auth errors (expected)
  ignoreErrors: ['Unauthorized', 'Rate limited'],
});
```

## AI Model Monitoring

```typescript
// Log every AI call
async function monitoredCall(config: ModelConfig, prompt: string): Promise<string> {
  const start = Date.now();
  
  try {
    const result = await callModel(config, prompt);
    
    await logAICall({
      model: config.model,
      provider: config.provider,
      latency: Date.now() - start,
      promptTokens: estimateTokens(prompt),
      success: true,
    });
    
    return result;
  } catch (error) {
    await logAICall({
      model: config.model,
      provider: config.provider,
      latency: Date.now() - start,
      success: false,
      error: error.message,
    });
    
    throw error;
  }
}

// Log to database
async function logAICall(data: AICallLog) {
  await db.insert(ai_call_logs).values({
    ...data,
    timestamp: new Date(),
  });
}
```

## Alerts

| Condition | Action |
|-----------|--------|
| Error rate > 5% | Sentry alert → Telegram |
| AI latency > 30s | Telegram notification |
| Fallback chain exhausted | Telegram notification |
| Rate limit exceeded | Log + auto-block |
| Payment failed | Email + Telegram notification |
