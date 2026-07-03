# Model Routing

## Routing Table

| Task | Primary Model | Fallback |
|------|---------------|----------|
| **Dialogue** (chat, Q&A) | `Gemini2.5Flash` / `DeepSeekV4Flash` | Gemini2.5Flash |
| **Parsing** (resume, structured data) | `DeepSeekV4Pro` | Gemini2.5Flash |
| **ATS Optimization** | `KimiK2.7Code` | Gemini2.5Flash |
| **Search** (semantic, vector) | `Gemini2.5FlashLite` | Gemini2.5Flash |
| **Voice** (STT) | `Whisper` / `Deepgram` | — |
| **Scoring** (ranking, evaluation) | `DeepSeekV4Flash` | Gemini2.5Flash |

## TypeScript: `MODEL_ROUTES`

```typescript
// src/ai/routing.ts

export interface ModelRoute {
  primary: string;
  fallbacks: string[];
}

export const MODEL_ROUTES: Record<string, ModelRoute> = {
  dialogue: {
    primary: 'gemini-2.5-flash',
    fallbacks: ['deepseek-v4-flash', 'gemini-2.5-flash'],
  },
  parsing: {
    primary: 'deepseek-v4-pro',
    fallbacks: ['gemini-2.5-flash', 'deepseek-v4-flash'],
  },
  ats: {
    primary: 'kimi-k2.7-code',
    fallbacks: ['gemini-2.5-flash'],
  },
  search: {
    primary: 'gemini-2.5-flash-lite',
    fallbacks: ['gemini-2.5-flash'],
  },
  voice: {
    primary: 'whisper',
    fallbacks: ['deepgram'],
  },
  scoring: {
    primary: 'deepseek-v4-flash',
    fallbacks: ['gemini-2.5-flash'],
  },
};
```

> **Note:** This file defines the routing table only. For the full model-routing-chain architecture (provider abstraction, retry logic, cost tracking), see `01-architecture/03-model-routing-chain.md`.
