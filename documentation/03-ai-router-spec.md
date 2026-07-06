# AI Router Architecture — Phase 3 SPEC

> **Status:** Draft  
> **Phase:** 3 — AI Router & Streaming  
> **Dependencies:** Phase 1 (stores, types) — ✅ Complete, Phase 2 (Core UI) — ✅ Complete  
> **Design Reference:** `documentation/01-architecture/03-model-routing-chain.md`, `documentation/04-ai/`  
> **Last Updated:** 2026-07-06

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Components](#3-components)
4. [Data Flow](#4-data-flow)
5. [API Contracts](#5-api-contracts)
6. [Error Handling](#6-error-handling)
7. [Caching Strategy](#7-caching-strategy)
8. [Integration Points](#8-integration-points)
9. [Implementation Order](#9-implementation-order)

---

## 1. Overview

### 1.1 Goal

Replace the current direct-Gemini API routes (`/api/generate`, `/api/update`, `/api/assess`) with a unified **AI Router** that:

- Routes requests to the correct model + prompt based on **task type**
- Supports **streaming (SSE)** for chat and **non-streaming** for batch operations
- Provides **fallback chain** when primary model fails
- Implements **in-memory caching** for repeatable operations (ATS scoring)
- Logs all requests/responses for observability
- Exposes a single **SSE endpoint** for real-time chat streaming

### 1.2 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Single AIRouter class** as the entry point | All AI calls go through one place — logging, caching, fallback, rate limiting |
| **SSE for chat, JSON for batch** | Chat needs real-time token streaming; ATS scoring and generation are request-response |
| **Gemini 2.5 Flash as primary** | Already in use, fast streaming, good quality for resume tasks |
| **In-memory cache with TTL** | ATS scores for the same resume data are idempotent; 5-min TTL prevents staleness |
| **Prompt templates as separate files** | Each task type has a distinct system prompt; separation keeps router.ts clean |
| **AbortController for cancellation** | User can cancel a streaming response mid-flight |
| **Exponential backoff retry** | Network errors are transient; 3 attempts with backoff covers most cases |

### 1.3 Route Changes

| Route | Before | After |
|-------|--------|-------|
| `/api/generate` | Direct Gemini call | Kept for backward compat, delegates to AIRouter |
| `/api/update` | Direct Gemini call | Kept for backward compat, delegates to AIRouter |
| `/api/assess` | Direct Gemini call | Kept for backward compat, delegates to AIRouter |
| `/api/sse/chat` | — | **NEW** — SSE streaming endpoint for chat |
| `/api/ai/route` | — | **NEW** — JSON endpoint for non-streaming AI tasks |

---

## 2. Architecture

### 2.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Router Layer                            │
│                                                                   │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────────┐   │
│  │ Task Router  │──▶│ Prompt       │──▶│ Model Executor       │   │
│  │ (task type)  │   │ Builder      │   │ (Gemini SDK)         │   │
│  └─────────────┘   └──────────────┘   └───────┬──────────────┘   │
│        │                                       │                  │
│        ▼                                       ▼                  │
│  ┌─────────────┐                       ┌──────────────┐          │
│  │ Cache       │                       │ Fallback     │          │
│  │ (TTL 5min)  │                       │ Chain        │          │
│  └─────────────┘                       └──────────────┘          │
│        │                                       │                  │
│        ▼                                       ▼                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Logger (request/response)              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer                                  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ /api/sse/chat │  │ /api/ai/route│  │ Legacy routes        │   │
│  │ (SSE stream)  │  │ (JSON batch) │  │ (delegate to router) │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                               │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ ChatSSE      │  │ useChatStore  │  │ useATSStore          │   │
│  │ Service      │  │ (messages)    │  │ (score, suggestions)  │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Task Types

```typescript
// src/lib/ai/router.ts

export type TaskType =
  | 'chat'        // Conversational AI Career Coach (Aether)
  | 'ats-score'   // ATS scoring engine (returns structured score)
  | 'generate'    // Resume content generation
  | 'tailor'      // Resume tailoring to job description
  | 'analyze'     // Deep resume analysis with recommendations
  | 'suggest';    // Quick improvement suggestions
```

### 2.3 AIRouter Class

```typescript
// src/lib/ai/router.ts

import type { TaskType } from './config';
import { MODEL_CONFIGS, type ModelConfig } from './config';
import { buildPrompt } from './prompts';
import { AICache } from './cache';
import { getGemini } from '@/lib/gemini';

export interface RouterRequest {
  task: TaskType;
  message?: string;
  resumeData?: Record<string, unknown>;
  jobDescription?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionId?: string;
  signal?: AbortSignal;
}

export interface RouterResponse {
  content: string;
  task: TaskType;
  model: string;
  cached: boolean;
  latencyMs: number;
  tokens?: {
    input: number;
    output: number;
  };
}

export interface RouterStreamEvent {
  type: 'token' | 'done' | 'error';
  data: string | RouterResponse | { error: string; code: string };
}

export class AIRouter {
  private cache: AICache;
  private logger: RouterLogger;

  constructor() {
    this.cache = new AICache({ ttlMs: 5 * 60 * 1000 });
    this.logger = new RouterLogger();
  }

  /**
   * Non-streaming route — returns complete response.
   * Used for: ats-score, generate, tailor, analyze, suggest
   */
  async route(request: RouterRequest): Promise<RouterResponse> {
    const startTime = Date.now();
    const config = MODEL_CONFIGS[request.task];

    // 1. Check cache (skip for chat — conversational context is unique)
    if (request.task !== 'chat') {
      const cacheKey = this.buildCacheKey(request);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.logger.log({ ...request, cached: true, latencyMs: Date.now() - startTime });
        return { ...cached, cached: true, latencyMs: Date.now() - startTime };
      }
    }

    // 2. Build prompt
    const prompt = buildPrompt(request.task, {
      message: request.message,
      resumeData: request.resumeData,
      jobDescription: request.jobDescription,
      history: request.history,
    });

    // 3. Execute with fallback chain
    const result = await this.executeWithFallback(
      config,
      prompt,
      request.signal
    );

    // 4. Cache result (skip for chat)
    if (request.task !== 'chat') {
      const cacheKey = this.buildCacheKey(request);
      this.cache.set(cacheKey, result);
    }

    // 5. Log
    const latencyMs = Date.now() - startTime;
    this.logger.log({ ...request, ...result, cached: false, latencyMs });

    return { ...result, cached: false, latencyMs };
  }

  /**
   * Streaming route — yields tokens via callback/async generator.
   * Used for: chat
   */
  async *routeStream(
    request: RouterRequest
  ): AsyncGenerator<RouterStreamEvent> {
    const startTime = Date.now();
    const config = MODEL_CONFIGS[request.task];

    // Build prompt (with history for chat context)
    const prompt = buildPrompt(request.task, {
      message: request.message,
      resumeData: request.resumeData,
      jobDescription: request.jobDescription,
      history: request.history,
    });

    try {
      const genAI = getGemini();
      const model = genAI.getGenerativeModel({
        model: config.model,
        systemInstruction: config.systemPrompt,
        generationConfig: {
          temperature: config.temperature,
          topP: config.topP,
          maxOutputTokens: config.maxOutputTokens,
        },
      });

      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      let fullContent = '';

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullContent += text;
          yield { type: 'token', data: text };
        }
      }

      const latencyMs = Date.now() - startTime;
      this.logger.log({ ...request, content: fullContent, cached: false, latencyMs });

      yield {
        type: 'done',
        data: {
          content: fullContent,
          task: request.task,
          model: config.model,
          cached: false,
          latencyMs,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      yield { type: 'error', data: { error: message, code: 'STREAM_ERROR' } };
    }
  }

  private async executeWithFallback(
    config: ModelConfig,
    prompt: string,
    signal?: AbortSignal
  ): Promise<{ content: string; model: string; tokens?: { input: number; output: number } }> {
    const models = [config, ...config.fallbacks];
    let lastError: Error | null = null;

    for (let i = 0; i < models.length; i++) {
      const modelConfig = models[i];
      try {
        const genAI = getGemini();
        const model = genAI.getGenerativeModel({
          model: modelConfig.model,
          systemInstruction: modelConfig.systemPrompt,
          generationConfig: {
            temperature: modelConfig.temperature,
            topP: modelConfig.topP,
            maxOutputTokens: modelConfig.maxOutputTokens,
          },
        });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const response = result.response;
        const content = response.text();

        return {
          content,
          model: modelConfig.model,
          tokens: {
            input: response.usageMetadata?.promptTokenCount ?? 0,
            output: response.usageMetadata?.candidatesTokenCount ?? 0,
          },
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`[AIRouter] Model "${modelConfig.model}" failed:`, lastError.message);
        // Continue to next fallback
      }
    }

    throw new Error(
      `All models failed for task "${config.task}". Last error: ${lastError?.message}`
    );
  }

  private buildCacheKey(request: RouterRequest): string {
    const data = JSON.stringify({
      task: request.task,
      resumeData: request.resumeData,
      jobDescription: request.jobDescription,
    });
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `${request.task}-${hash}`;
  }
}

// ── Logger ──

interface LogEntry {
  task: TaskType;
  model?: string;
  cached: boolean;
  latencyMs: number;
  error?: string;
  timestamp: number;
}

class RouterLogger {
  private entries: LogEntry[] = [];
  private maxEntries = 1000;

  log(entry: Partial<LogEntry> & { task: TaskType }): void {
    const logEntry: LogEntry = {
      task: entry.task,
      model: entry.model,
      cached: entry.cached ?? false,
      latencyMs: entry.latencyMs ?? 0,
      error: entry.error,
      timestamp: Date.now(),
    };
    this.entries.push(logEntry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
    // In production: send to OpenTelemetry / logging service
    if (process.env.NODE_ENV === 'development') {
      console.debug('[AIRouter]', logEntry);
    }
  }

  getRecent(count = 10): LogEntry[] {
    return this.entries.slice(-count);
  }

  getStats(): { totalRequests: number; avgLatency: number; cacheHitRate: number } {
    const total = this.entries.length;
    if (total === 0) return { totalRequests: 0, avgLatency: 0, cacheHitRate: 0 };
    const avgLatency = this.entries.reduce((s, e) => s + e.latencyMs, 0) / total;
    const cacheHits = this.entries.filter((e) => e.cached).length;
    return {
      totalRequests: total,
      avgLatency: Math.round(avgLatency),
      cacheHitRate: Math.round((cacheHits / total) * 100),
    };
  }
}
```

---

## 3. Components

### 3.1 Model Configuration (`src/lib/ai/config.ts`)

```typescript
// src/lib/ai/config.ts

import type { TaskType } from './router';

export interface ModelConfig {
  task: TaskType;
  model: string;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  systemPrompt: string;
  fallbacks: Array<{
    model: string;
    temperature: number;
    topP: number;
    maxOutputTokens: number;
    systemPrompt: string;
  }>;
}

export const MODEL_CONFIGS: Record<TaskType, ModelConfig> = {
  chat: {
    task: 'chat',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 4096,
    systemPrompt: `You are Aether, an AI Career Coach. You help users improve their resumes,
provide career advice, and guide them through the job search process.
Be supportive, professional, and actionable. Use markdown for formatting.
When suggesting resume changes, be specific and provide before/after examples.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 4096,
        systemPrompt: `You are Aether, an AI Career Coach. Be supportive and actionable.`,
      },
    ],
  },

  'ats-score': {
    task: 'ats-score',
    model: 'gemini-2.5-flash',
    temperature: 0.2,
    topP: 0.8,
    maxOutputTokens: 2048,
    systemPrompt: `You are an ATS (Applicant Tracking System) scoring engine.
Analyze the resume data and job description (if provided) and return a structured
ATS score with breakdown, matched/missing keywords, and actionable suggestions.
Return ONLY valid JSON matching the ATSScore interface.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 2048,
        systemPrompt: `You are an ATS scoring engine. Return JSON only.`,
      },
    ],
  },

  generate: {
    task: 'generate',
    model: 'gemini-2.5-flash',
    temperature: 0.6,
    topP: 0.9,
    maxOutputTokens: 4096,
    systemPrompt: `You are a professional resume writer. Generate compelling, ATS-friendly
resume content based on the user's data. Focus on achievements with quantifiable metrics.
Use strong action verbs. Return structured JSON matching the resume schema.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 4096,
        systemPrompt: `You are a professional resume writer. Return JSON only.`,
      },
    ],
  },

  tailor: {
    task: 'tailor',
    model: 'gemini-2.5-flash',
    temperature: 0.5,
    topP: 0.85,
    maxOutputTokens: 4096,
    systemPrompt: `You are a Resume Strategist and ATS Optimization Specialist.
Your mission: transform the provided resume to perfectly align with the target job.
Extract keywords from the job description, weave them naturally into the resume,
rewrite the summary to position the candidate as the ideal fit.
Return structured JSON matching the resume schema with an estimated atsScore.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.5,
        topP: 0.85,
        maxOutputTokens: 4096,
        systemPrompt: `You are a Resume Strategist. Tailor the resume to the job description. Return JSON.`,
      },
    ],
  },

  analyze: {
    task: 'analyze',
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    topP: 0.8,
    maxOutputTokens: 4096,
    systemPrompt: `You are a Resume Evaluator AI — a combination of an ATS scanner,
a seasoned recruiter, and a professional career coach. Analyze the resume deeply,
identify strengths, weaknesses, and provide actionable recommendations.
Return structured JSON with resume_score, strengths, weaknesses, recommendations.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 4096,
        systemPrompt: `You are a Resume Evaluator. Analyze and return JSON.`,
      },
    ],
  },

  suggest: {
    task: 'suggest',
    model: 'gemini-2.5-flash',
    temperature: 0.6,
    topP: 0.9,
    maxOutputTokens: 1024,
    systemPrompt: `You are a quick resume improvement assistant. Given a user's question
or a section of their resume, provide 2-3 concise, actionable suggestions.
Keep responses brief (under 200 words). Focus on the most impactful changes.`,
    fallbacks: [
      {
        model: 'gemini-2.5-flash',
        temperature: 0.6,
        topP: 0.9,
        maxOutputTokens: 1024,
        systemPrompt: `You are a quick resume assistant. Keep suggestions brief and actionable.`,
      },
    ],
  },
};
```

### 3.2 Prompt Templates (`src/lib/ai/prompts/`)

#### `chat.ts` — Conversational AI Career Coach

```typescript
// src/lib/ai/prompts/chat.ts

export interface ChatPromptInput {
  message: string;
  resumeData?: Record<string, unknown>;
  jobDescription?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function buildChatPrompt(input: ChatPromptInput): string {
  const parts: string[] = [];

  // Resume context (if available)
  if (input.resumeData) {
    parts.push(`[CURRENT RESUME CONTEXT]\n${JSON.stringify(input.resumeData, null, 2)}\n`);
  }

  // Job description context (if available)
  if (input.jobDescription) {
    parts.push(`[TARGET JOB DESCRIPTION]\n${input.jobDescription}\n`);
  }

  // Conversation history (last 10 messages for context window management)
  if (input.history && input.history.length > 0) {
    const recentHistory = input.history.slice(-10);
    parts.push(`[CONVERSATION HISTORY]\n${recentHistory
      .map((m) => `${m.role === 'user' ? 'User' : 'Aether'}: ${m.content}`)
      .join('\n')}\n`);
  }

  // Current user message
  parts.push(`[USER MESSAGE]\n${input.message}\n`);

  return parts.join('\n---\n');
}
```

#### `ats-score.ts` — ATS Scoring Engine

```typescript
// src/lib/ai/prompts/ats-score.ts

export interface ATSScorePromptInput {
  resumeData: Record<string, unknown>;
  jobDescription?: string;
}

export function buildATSScorePrompt(input: ATSScorePromptInput): string {
  return `
Analyze the following resume data and job description (if provided) for ATS compatibility.

**Resume Data:**
${JSON.stringify(input.resumeData, null, 2)}

${input.jobDescription ? `**Target Job Description:**\n${input.jobDescription}\n` : ''}

**Instructions:**
- Score the resume 0-100 for ATS compatibility
- Provide breakdown scores for: keywords, formatting, completeness, readability
- List matched and missing keywords (if job description provided)
- Provide 3-5 actionable suggestions for improvement
- Return ONLY valid JSON — no markdown wrapping, no commentary

**Output Schema:**
{
  "overall": number,
  "breakdown": {
    "keywords": number,
    "formatting": number,
    "completeness": number,
    "readability": number
  },
  "suggestions": string[],
  "matchedKeywords": string[],
  "missingKeywords": string[]
}`;
}
```

#### `generate.ts` — Resume Content Generation

```typescript
// src/lib/ai/prompts/generate.ts

export interface GeneratePromptInput {
  resumeData: Record<string, unknown>;
  targetRole?: string;
}

export function buildGeneratePrompt(input: GeneratePromptInput): string {
  return `
You are an expert resume writer. Generate a professional resume for ${input.targetRole || 'the target role'}
based on the following user data.

**User Data:**
${JSON.stringify(input.resumeData, null, 2)}

**Instructions:**
- Use a clean, ATS-friendly format
- Highlight achievements with quantifiable metrics
- Write a compelling 3-4 sentence professional summary
- For each experience entry, generate 3-4 achievement-oriented bullet points
- Keep it to one page unless the user has >10 years of experience
- Return ONLY valid JSON matching the resume schema — no markdown wrapping`;
}
```

#### `tailor.ts` — Resume Tailoring

```typescript
// src/lib/ai/prompts/tailor.ts

export interface TailorPromptInput {
  resumeData: Record<string, unknown>;
  jobDescription: string;
  jobTitle?: string;
}

export function buildTailorPrompt(input: TailorPromptInput): string {
  return `
You are a Resume Strategist and ATS Optimization Specialist.

**Mission:** Transform the provided resume to PERFECTLY align with the target job.

**Original Resume:**
${JSON.stringify(input.resumeData, null, 2)}

**Target Job:**
Title: ${input.jobTitle || 'Not provided'}
Description: ${input.jobDescription}

**Instructions:**
1. Extract ALL critical keywords from the job description
2. Strategically weave keywords throughout the resume (summary, experience, skills)
3. Rewrite the summary to position the candidate as the ideal fit
4. Reframe experience to emphasize achievements relevant to the target role
5. Prioritize skills mentioned in the job posting
6. Return ONLY valid JSON — no markdown wrapping

**Output Schema:**
{
  "fullName": string,
  "jobTitle": string,
  "summary": string,
  "contact": { "email": string, "phone": string },
  "experience": [{ "company": string, "position": string, "description": string, "startDate": { "month": string, "year": string }, "endDate": { "month": string, "year": string, "isCurrent": boolean } }],
  "skills": [{ "value": string }],
  "education": [{ "institution": string, "degree": string }],
  "atsScore": number,
  "keywordsMatched": string[],
  "improvementNotes": string
}`;
}
```

#### `analyze.ts` — Deep Resume Analysis

```typescript
// src/lib/ai/prompts/analyze.ts

export interface AnalyzePromptInput {
  resumeData: Record<string, unknown>;
  jobDescription?: string;
}

export function buildAnalyzePrompt(input: AnalyzePromptInput): string {
  return `
You are a Resume Evaluator AI — a combination of an ATS scanner, a seasoned recruiter,
and a professional career coach.

**Resume Data:**
${JSON.stringify(input.resumeData, null, 2)}

${input.jobDescription ? `**Target Job Description:**\n${input.jobDescription}\n` : ''}

**Instructions:**
- Score the resume 0-100
- Identify 3-5 key strengths
- Identify 3-5 areas for improvement
- Provide 3-5 actionable, specific recommendations with before/after examples
- Include a short motivational message
- Return ONLY valid JSON — no markdown wrapping

**Output Schema:**
{
  "resume_score": number,
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "mentorship_tone_example": string
}`;
}
```

#### `suggest.ts` — Quick Suggestions

```typescript
// src/lib/ai/prompts/suggest.ts

export interface SuggestPromptInput {
  message: string;
  resumeData?: Record<string, unknown>;
  section?: string;
}

export function buildSuggestPrompt(input: SuggestPromptInput): string {
  return `
You are a quick resume improvement assistant.

${input.resumeData ? `**Resume Context:**\n${JSON.stringify(input.resumeData, null, 2)}\n` : ''}
${input.section ? `**Focus Section:** ${input.section}\n` : ''}

**User Question:**
${input.message}

**Instructions:**
- Provide 2-3 concise, actionable suggestions
- Keep response under 200 words
- Focus on the most impactful changes
- Use plain text (no markdown)`;
}
```

### 3.3 Prompt Builder (`src/lib/ai/prompts/index.ts`)

```typescript
// src/lib/ai/prompts/index.ts

import type { TaskType } from '../router';
import { buildChatPrompt, type ChatPromptInput } from './chat';
import { buildATSScorePrompt, type ATSScorePromptInput } from './ats-score';
import { buildGeneratePrompt, type GeneratePromptInput } from './generate';
import { buildTailorPrompt, type TailorPromptInput } from './tailor';
import { buildAnalyzePrompt, type AnalyzePromptInput } from './analyze';
import { buildSuggestPrompt, type SuggestPromptInput } from './suggest';

export type PromptInput =
  | { task: 'chat' } & ChatPromptInput
  | { task: 'ats-score' } & ATSScorePromptInput
  | { task: 'generate' } & GeneratePromptInput
  | { task: 'tailor' } & TailorPromptInput
  | { task: 'analyze' } & AnalyzePromptInput
  | { task: 'suggest' } & SuggestPromptInput;

export function buildPrompt(
  task: TaskType,
  input: Omit<PromptInput, 'task'>
): string {
  switch (task) {
    case 'chat':
      return buildChatPrompt(input as ChatPromptInput);
    case 'ats-score':
      return buildATSScorePrompt(input as ATSScorePromptInput);
    case 'generate':
      return buildGeneratePrompt(input as GeneratePromptInput);
    case 'tailor':
      return buildTailorPrompt(input as TailorPromptInput);
    case 'analyze':
      return buildAnalyzePrompt(input as AnalyzePromptInput);
    case 'suggest':
      return buildSuggestPrompt(input as SuggestPromptInput);
    default:
      throw new Error(`Unknown task type: ${task}`);
  }
}
```

### 3.4 Cache (`src/lib/ai/cache.ts`)

```typescript
// src/lib/ai/cache.ts

export interface CacheOptions {
  ttlMs: number; // Time-to-live in milliseconds
  maxSize?: number; // Max cache entries (default: 100)
}

interface CacheEntry {
  content: string;
  model: string;
  tokens?: { input: number; output: number };
  expiresAt: number;
}

export class AICache {
  private store = new Map<string, CacheEntry>();
  private ttlMs: number;
  private maxSize: number;

  constructor(options: CacheOptions) {
    this.ttlMs = options.ttlMs;
    this.maxSize = options.maxSize ?? 100;
  }

  get(key: string): { content: string; model: string; tokens?: { input: number; output: number } } | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return { content: entry.content, model: entry.model, tokens: entry.tokens };
  }

  set(
    key: string,
    value: { content: string; model: string; tokens?: { input: number; output: number } }
  ): void {
    // Evict oldest if at capacity
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) this.store.delete(oldestKey);
    }

    this.store.set(key, {
      ...value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get size(): number {
    return this.store.size;
  }
}
```

### 3.5 SSE Streaming Service (`src/lib/ai/streaming.ts`)

```typescript
// src/lib/ai/streaming.ts

import type { RouterStreamEvent } from './router';

/**
 * Server-side: Writes SSE events to the response stream.
 */
export function writeSSEEvent(
  writer: WritableStreamDefaultWriter,
  event: RouterStreamEvent
): void {
  const encoder = new TextEncoder();

  switch (event.type) {
    case 'token':
      writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'token', content: event.data })}\n\n`));
      break;
    case 'done':
      writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'done', ...(event.data as object) })}\n\n`));
      break;
    case 'error':
      writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', ...(event.data as object) })}\n\n`));
      break;
  }
}

/**
 * Server-side: Creates an SSE response with proper headers.
 */
export function createSSEResponse(): Response {
  return new Response(
    new ReadableStream({
      start(controller) {
        // The controller is passed to the caller
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    }
  );
}

/**
 * Client-side: Parses SSE events from a ReadableStream.
 */
export function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<RouterStreamEvent> {
  const decoder = new TextDecoder();
  let buffer = '';

  return (async function* () {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            yield parsed as RouterStreamEvent;
          } catch {
            // Skip malformed events
          }
        }
      }
    }
  })();
}
```

### 3.6 SSE API Endpoint (`src/app/api/sse/chat/route.ts`)

```typescript
// src/app/api/sse/chat/route.ts

import { AIRouter } from '@/lib/ai/router';
import { writeSSEEvent } from '@/lib/ai/streaming';

const router = new AIRouter();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, sessionId, resumeData, jobDescription, history } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create abort controller for timeout
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 30_000);

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const writer = controller as unknown as WritableStreamDefaultWriter;

        try {
          const generator = router.routeStream({
            task: 'chat',
            message,
            resumeData,
            jobDescription,
            history,
            sessionId,
            signal: abortController.signal,
          });

          for await (const event of generator) {
            writeSSEEvent(writer, event);

            if (event.type === 'done' || event.type === 'error') {
              controller.close();
              return;
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          writeSSEEvent(writer, {
            type: 'error',
            data: { error: message, code: 'INTERNAL_ERROR' },
          });
          controller.close();
        } finally {
          clearTimeout(timeout);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[SSE Chat] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### 3.7 JSON API Endpoint (`src/app/api/ai/route/route.ts`)

```typescript
// src/app/api/ai/route/route.ts

import { AIRouter } from '@/lib/ai/router';
import type { TaskType } from '@/lib/ai/router';

const router = new AIRouter();

const ALLOWED_TASKS: TaskType[] = [
  'ats-score',
  'generate',
  'tailor',
  'analyze',
  'suggest',
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { task, message, resumeData, jobDescription, history } = body;

    if (!task || !ALLOWED_TASKS.includes(task)) {
      return new Response(
        JSON.stringify({
          error: `Invalid task. Allowed: ${ALLOWED_TASKS.join(', ')}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await router.route({
      task,
      message,
      resumeData,
      jobDescription,
      history,
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[AI Route] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### 3.8 Client-Side Chat SSE Service (`src/services/chat-sse.ts`)

```typescript
// src/services/chat-sse.ts

import { useChatStore } from '@/stores/useChatStore';
import type { ResumeStoreData } from '@/types/resume';

interface ChatSSEOptions {
  onToken?: (token: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

class ChatSSEService {
  private abortController: AbortController | null = null;

  /**
   * Send a message to the AI and stream the response.
   */
  async send(
    message: string,
    resumeData: ResumeStoreData | null,
    jobDescription?: string,
    options?: ChatSSEOptions
  ): Promise<void> {
    const store = useChatStore.getState();

    // Add user message
    store.addMessage('user', message);
    store.setIsStreaming(true);
    store.setStatus('chatting');

    // Add empty assistant message for streaming
    store.addMessage('assistant', '');

    // Create abort controller
    this.abortController = new AbortController();

    try {
      const response = await fetch('/api/sse/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: store.session.id,
          resumeData,
          jobDescription,
          history: store.session.messages
            .slice(-20) // Last 20 messages for context
            .map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));

              switch (event.type) {
                case 'token':
                  store.updateLastMessage(
                    (store.session.messages[store.session.messages.length - 1]?.content ?? '') + event.content
                  );
                  options?.onToken?.(event.content);
                  break;

                case 'done':
                  store.setIsStreaming(false);
                  store.setStatus('ready');
                  options?.onDone?.();
                  break;

                case 'error':
                  store.setIsStreaming(false);
                  store.setStatus('ready');
                  options?.onError?.(event.error);
                  break;
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      }
    } catch (error) {
      store.setIsStreaming(false);
      store.setStatus('ready');

      if (error instanceof DOMException && error.name === 'AbortError') {
        // User cancelled — do nothing
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      store.updateLastMessage(
        `⚠️ **Error:** ${errorMessage}\n\nPlease try again or check your connection.`
      );
      options?.onError?.(errorMessage);
    }
  }

  /**
   * Cancel the current streaming request.
   */
  cancel(): void {
    this.abortController?.abort();
    this.abortController = null;
    useChatStore.getState().setIsStreaming(false);
  }
}

export const chatSSE = new ChatSSEService();
export { ChatSSEService };
```

---

## 4. Data Flow

### 4.1 Chat Streaming Flow

```
User types message in ChatPanel
  → useChatStore.setInputValue() / onSend()
  → ChatSSEService.send(message, resumeData, jobDescription)
  → POST /api/sse/chat
  → AIRouter.routeStream({ task: 'chat', message, resumeData, history })
  → buildChatPrompt() — assembles context + history + message
  → Gemini model.generateContentStream()
  → SSE stream: 'token' events (each word/chunk)
  → ChatSSEService receives tokens via ReadableStream
  → useChatStore.updateLastMessage() — appends token to last assistant message
  → React re-renders MessageList with streaming text
  → When done: SSE 'done' event
  → useChatStore.setIsStreaming(false)
  → CanvasPanel may update via SyncEvent if AI modified resume data
```

### 4.2 Non-Streaming Flow (ATS Score, Generate, etc.)

```
User clicks "Analyze ATS" in CanvasPanel
  → useATSStore.setIsAnalyzing(true)
  → POST /api/ai/route { task: 'ats-score', resumeData, jobDescription }
  → AIRouter.route({ task: 'ats-score', ... })
  → Check cache → miss
  → buildATSScorePrompt()
  → Gemini model.generateContent()
  → Parse JSON response
  → Store in cache
  → Return RouterResponse
  → useATSStore.setScore(parsedScore)
  → useATSStore.setIsAnalyzing(false)
  → CanvasPanel re-renders with new score
```

### 4.3 Context Window Management

| Task | History Included | Max Tokens | Rationale |
|------|-----------------|------------|-----------|
| `chat` | Last 10 messages | 4096 | Conversational context needs recent history |
| `ats-score` | None | 2048 | Stateless scoring, full resume data in prompt |
| `generate` | None | 4096 | Full resume data + generation instructions |
| `tailor` | None | 4096 | Resume + job description + tailoring instructions |
| `analyze` | None | 4096 | Full resume + analysis instructions |
| `suggest` | Last 2 messages | 1024 | Quick suggestions, minimal context needed |

---

## 5. API Contracts

### 5.1 `POST /api/sse/chat` — Streaming Chat

**Request:**
```typescript
interface SSEChatRequest {
  message: string;                    // User's message
  sessionId?: string;                 // Current chat session ID
  resumeData?: Record<string, unknown>; // Current resume data (optional)
  jobDescription?: string;            // Target job description (optional)
  history?: Array<{                   // Conversation history (optional)
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

**Response (SSE stream):**
```typescript
// Token event (sent for each chunk)
interface SSETokenEvent {
  type: 'token';
  content: string;
}

// Done event (sent when streaming completes)
interface SSEDoneEvent {
  type: 'done';
  content: string;
  task: 'chat';
  model: string;
  cached: boolean;
  latencyMs: number;
}

// Error event (sent on failure)
interface SSEErrorEvent {
  type: 'error';
  error: string;
  code: string;
}
```

**Example stream:**
```
data: {"type":"token","content":"Based on your resume"}

data: {"type":"token","content":", I recommend adding"}

data: {"type":"token","content":" more quantifiable metrics."}

data: {"type":"done","content":"Based on your resume, I recommend adding more quantifiable metrics.","task":"chat","model":"gemini-2.5-flash","cached":false,"latencyMs":2847}
```

### 5.2 `POST /api/ai/route` — Non-Streaming AI Tasks

**Request:**
```typescript
interface AIRouteRequest {
  task: 'ats-score' | 'generate' | 'tailor' | 'analyze' | 'suggest';
  message?: string;                   // User message (for suggest)
  resumeData?: Record<string, unknown>; // Resume data
  jobDescription?: string;            // Target job description
  history?: Array<{                   // Conversation history (optional)
    role: 'user' | 'assistant';
    content: string;
  }>;
}
```

**Response:**
```typescript
interface AIRouteResponse {
  content: string;                    // AI response text (may be JSON)
  task: TaskType;
  model: string;                      // Model that served the request
  cached: boolean;                    // Whether result was from cache
  latencyMs: number;                  // Total request latency
  tokens?: {
    input: number;
    output: number;
  };
}
```

### 5.3 Legacy Routes (Backward Compatible)

The existing routes (`/api/generate`, `/api/update`, `/api/assess`) remain functional but internally delegate to `AIRouter`:

```typescript
// Example: /api/assess delegates to AIRouter
// No change to request/response contract — same as before
// Internally:
//   const result = await router.route({
//     task: 'analyze',
//     resumeData: parsedResumeData,
//     jobDescription: targetJob?.description,
//   });
//   return Response.json(JSON.parse(result.content));
```

---

## 6. Error Handling

### 6.1 Error Types

```typescript
// src/lib/ai/errors.ts

export class AIRouterError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly task?: string,
    public readonly model?: string
  ) {
    super(message);
    this.name = 'AIRouterError';
  }
}

export type ErrorCode =
  | 'MODEL_FAILED'        // All models in fallback chain failed
  | 'TIMEOUT'             // Request exceeded 30s timeout
  | 'RATE_LIMITED'        // 429 from API
  | 'INVALID_RESPONSE'    // Response couldn't be parsed
  | 'CACHE_ERROR'         // Cache read/write failure
  | 'PROMPT_ERROR'        // Prompt building failed
  | 'ABORTED'             // Request was cancelled by user
  | 'NETWORK_ERROR';      // Network/fetch failure
```

### 6.2 Retry with Exponential Backoff

```typescript
// src/lib/ai/retry.ts

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxAttempts, baseDelayMs, maxDelayMs } = { ...DEFAULT_RETRY, ...options };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;

      // Don't retry on abort
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      // Don't retry on 4xx (client errors)
      if (error instanceof AIRouterError && error.code === 'INVALID_RESPONSE') {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000,
        maxDelayMs
      );

      console.warn(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Unreachable');
}
```

### 6.3 Error Response Mapping

| Error Code | HTTP Status | SSE Event | User Message |
|------------|-------------|-----------|--------------|
| `MODEL_FAILED` | 500 | `{ type: 'error', error: 'AI service unavailable', code: 'MODEL_FAILED' }` | "AI service is temporarily unavailable. Please try again." |
| `TIMEOUT` | 504 | `{ type: 'error', error: 'Request timed out', code: 'TIMEOUT' }` | "The request took too long. Please try a simpler query." |
| `RATE_LIMITED` | 429 | `{ type: 'error', error: 'Too many requests', code: 'RATE_LIMITED' }` | "You're sending requests too quickly. Please wait a moment." |
| `INVALID_RESPONSE` | 500 | `{ type: 'error', error: 'Invalid AI response', code: 'INVALID_RESPONSE' }` | "Received an unexpected response. Please try again." |
| `ABORTED` | 499 | — (stream closed) | — (silent cancellation) |
| `NETWORK_ERROR` | 502 | `{ type: 'error', error: 'Network error', code: 'NETWORK_ERROR' }` | "Network connection failed. Please check your internet." |

### 6.4 Rate Limiting Awareness

```typescript
// src/lib/ai/rate-limiter.ts

export interface RateLimitState {
  remaining: number;
  resetAt: number;
  isLimited: boolean;
}

export class RateLimiter {
  private queue: Array<{
    resolve: () => void;
    reject: (error: Error) => void;
  }> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minIntervalMs = 200; // 5 requests per second max

  async acquire(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minIntervalMs) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, this.minIntervalMs - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
  }

  handleRateLimit(response: Response): void {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetAt = response.headers.get('X-RateLimit-Reset');

    if (remaining === '0') {
      const waitMs = resetAt
        ? Math.max(0, parseInt(resetAt) * 1000 - Date.now())
        : 5000;

      console.warn(`[RateLimiter] Rate limited. Waiting ${waitMs}ms...`);
      // In production: queue the request and retry after wait
    }
  }
}
```

---

## 7. Caching Strategy

### 7.1 Cache Key Generation

```typescript
// Cache key = hash of (task + resumeData + jobDescription)
// Chat is NEVER cached (conversational context is unique)

function generateCacheKey(task: TaskType, data: {
  resumeData?: Record<string, unknown>;
  jobDescription?: string;
}): string | null {
  if (task === 'chat') return null; // Never cache chat

  const input = `${task}|${JSON.stringify(data.resumeData ?? {})}|${data.jobDescription ?? ''}`;

  // Simple hash
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }

  return `${task}-${Math.abs(hash)}`;
}
```

### 7.2 Cache Invalidation Triggers

| Trigger | Action |
|---------|--------|
| Resume data changes | Invalidate all cache entries for that resume |
| Job description changes | Invalidate ats-score and tailor entries |
| User explicitly requests re-analysis | Invalidate and re-fetch |
| TTL expires (5 min) | Automatic eviction on next get |
| Cache full (100 entries) | Evict oldest entry (FIFO) |

### 7.3 Cache Hit/Miss Decision Matrix

| Task | Cacheable? | Key Includes | TTL |
|------|-----------|-------------|-----|
| `chat` | ❌ No | — | — |
| `ats-score` | ✅ Yes | resumeData + jobDescription | 5 min |
| `generate` | ✅ Yes | resumeData | 5 min |
| `tailor` | ✅ Yes | resumeData + jobDescription | 5 min |
| `analyze` | ✅ Yes | resumeData + jobDescription | 5 min |
| `suggest` | ❌ No | — | — |

---

## 8. Integration Points

### 8.1 ChatPanel → ChatSSEService

```typescript
// In ChatPanel.tsx (Phase 2 component)
// Already has ChatInput, MessageList, TypingIndicator

import { chatSSE } from '@/services/chat-sse';
import { useChatStore } from '@/stores/useChatStore';
import { useResumeStore } from '@/stores/useResumeStore';

function ChatPanel() {
  const { inputValue, setInputValue, isStreaming } = useChatStore();
  const resume = useResumeStore((s) => s.resume);

  const handleSend = async (message: string) => {
    if (!message.trim() || isStreaming) return;

    await chatSSE.send(
      message,
      resume,
      resume.targetJob?.description
    );
  };

  const handleCancel = () => {
    chatSSE.cancel();
  };

  // ... render ChatInput, MessageList, TypingIndicator
}
```

### 8.2 CanvasPanel → AIRouter (ATS Score)

```typescript
// In CanvasPanel.tsx (Phase 2 component)
// ATSScoreWidget calls AIRouter for AI-powered scoring

import { useATSStore } from '@/stores/useATSStore';
import { useResumeStore } from '@/stores/useResumeStore';

function CanvasPanel() {
  const { score, isAnalyzing, setScore, setIsAnalyzing } = useATSStore();
  const resume = useResumeStore((s) => s.resume);

  const analyzeATS = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'ats-score',
          resumeData: resume,
          jobDescription: resume.targetJob?.description,
        }),
      });

      const result = await response.json();
      const parsedScore = JSON.parse(result.content);
      setScore(parsedScore);
    } catch (error) {
      console.error('ATS analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ... render ATSScoreWidget with analyze button
}
```

### 8.3 useResumeStore → applySuggestion

```typescript
// When AI generates resume content, apply it via useResumeStore
// The applySuggestion method already exists in useResumeStore

import { useResumeStore } from '@/stores/useResumeStore';
import type { ResumeBlock } from '@/types/canvas';

// After receiving AI-generated content:
const blocks: ResumeBlock[] = [
  {
    id: 'summary-1',
    section: 'summary',
    type: 'summary',
    content: { text: 'New professional summary...' },
    order: 0,
    version: 1,
  },
];

useResumeStore.getState().applySuggestion(blocks);
```

### 8.4 useATSStore → setScore

```typescript
// After receiving ATS score from AIRouter:
import { useATSStore } from '@/stores/useATSStore';

const score = {
  overall: 82,
  breakdown: {
    keywords: 75,
    formatting: 90,
    completeness: 80,
    readability: 85,
  },
  suggestions: [
    'Add more quantifiable achievements',
    'Include missing keywords: Terraform, Kubernetes',
  ],
  matchedKeywords: ['AWS', 'Docker', 'CI/CD'],
  missingKeywords: ['Terraform', 'Kubernetes'],
  lastAnalyzed: Date.now(),
};

useATSStore.getState().setScore(score);
```

### 8.5 Canvas Sync Protocol Integration

```typescript
// When AI modifies resume data, emit SyncEvent for Canvas
// The canvas-sse.ts service already handles SyncEvent

import { canvasSSE } from '@/services/canvas-sse';
import type { SyncEvent } from '@/types/canvas';

// After AI generates or tailors resume:
const syncEvent: SyncEvent = {
  type: 'CANVAS_UPDATED',
  blocks: [
    {
      id: 'summary-1',
      section: 'summary',
      type: 'summary',
      content: { text: 'Generated summary...' },
      order: 0,
      version: 2,
    },
  ],
};

// canvasSSE already listens for 'block-update' events
// and calls useResumeStore.applySuggestion()
```

---

## 9. Implementation Order

### Phase 3.1 — Foundation (Day 1)

| # | File | Description |
|---|------|-------------|
| 1 | `src/lib/ai/config.ts` | Model configurations per task type |
| 2 | `src/lib/ai/cache.ts` | In-memory cache with TTL |
| 3 | `src/lib/ai/errors.ts` | Error types and codes |
| 4 | `src/lib/ai/retry.ts` | Exponential backoff retry |
| 5 | `src/lib/ai/rate-limiter.ts` | Rate limiting awareness |

### Phase 3.2 — Prompt Templates (Day 1-2)

| # | File | Description |
|---|------|-------------|
| 6 | `src/lib/ai/prompts/chat.ts` | Chat system prompt + template |
| 7 | `src/lib/ai/prompts/ats-score.ts` | ATS scoring prompt |
| 8 | `src/lib/ai/prompts/generate.ts` | Resume generation prompt |
| 9 | `src/lib/ai/prompts/tailor.ts` | Resume tailoring prompt |
| 10 | `src/lib/ai/prompts/analyze.ts` | Deep analysis prompt |
| 11 | `src/lib/ai/prompts/suggest.ts` | Quick suggestions prompt |
| 12 | `src/lib/ai/prompts/index.ts` | Prompt builder (dispatcher) |

### Phase 3.3 — Router Core (Day 2)

| # | File | Description |
|---|------|-------------|
| 13 | `src/lib/ai/router.ts` | AIRouter class (main entry point) |
| 14 | `src/lib/ai/streaming.ts` | SSE streaming helpers (server + client) |

### Phase 3.4 — API Endpoints (Day 2-3)

| # | File | Description |
|---|------|-------------|
| 15 | `src/app/api/sse/chat/route.ts` | SSE streaming endpoint |
| 16 | `src/app/api/ai/route/route.ts` | JSON batch endpoint |

### Phase 3.5 — Client Integration (Day 3)

| # | File | Description |
|---|------|-------------|
| 17 | `src/services/chat-sse.ts` | Client-side SSE service |
| 18 | Update `src/components/ChatPanel.tsx` | Integrate ChatSSEService with ChatInput |
| 19 | Update `src/components/CanvasPanel.tsx` | Integrate AIRouter for ATS scoring |

### Phase 3.6 — Legacy Migration (Day 3-4)

| # | File | Description |
|---|------|-------------|
| 20 | Update `src/app/api/generate/route.ts` | Delegate to AIRouter |
| 21 | Update `src/app/api/update/route.ts` | Delegate to AIRouter |
| 22 | Update `src/app/api/assess/route.ts` | Delegate to AIRouter |

### Phase 3.7 — Testing & Verification (Day 4)

| # | File | Description |
|---|------|-------------|
| 23 | `src/lib/ai/__tests__/router.test.ts` | Unit tests for AIRouter |
| 24 | `src/lib/ai/__tests__/cache.test.ts` | Unit tests for AICache |
| 25 | `src/lib/ai/__tests__/prompts.test.ts` | Unit tests for prompt builders |
| 26 | `src/services/__tests__/chat-sse.test.ts` | Unit tests for ChatSSEService |
| 27 | Integration test: SSE streaming | Manual test with browser |
| 28 | Integration test: Fallback chain | Simulate model failure |

---

## Appendix A: File Structure (Final)

```
src/
  lib/
    ai/
      router.ts          — AIRouter class (main entry point)
      config.ts           — Model configs per task type
      cache.ts            — In-memory cache with TTL
      errors.ts           — Error types and codes
      retry.ts            — Exponential backoff retry
      rate-limiter.ts     — Rate limiting awareness
      streaming.ts        — SSE streaming helpers (server + client)
      prompts/
        index.ts          — Prompt builder (dispatcher)
        chat.ts           — Chat system prompt + template
        ats-score.ts      — ATS scoring prompt
        generate.ts       — Resume generation prompt
        tailor.ts         — Resume tailoring prompt
        analyze.ts        — Deep analysis prompt
        suggest.ts        — Quick suggestions prompt
      __tests__/
        router.test.ts    — Unit tests for AIRouter
        cache.test.ts     — Unit tests for AICache
        prompts.test.ts   — Unit tests for prompt builders
  app/
    api/
      sse/
        chat/
          route.ts        — SSE endpoint for chat streaming
      ai/
        route/
          route.ts        — JSON endpoint for non-streaming AI tasks
  services/
    chat-sse.ts           — Client-side SSE service
    canvas-sse.ts          — Existing SSE service (unchanged)
```

## Appendix B: Dependencies

No new npm packages required. The AI Router uses:

- `@google/generative-ai` 0.24.1 — already installed
- `nanoid` — already installed (for session IDs)
- `zustand` — already installed (for stores)
- Web Streams API — built into Next.js runtime
- `AbortController` — built into modern runtimes

## Appendix C: Migration Notes

### Legacy Route Migration

The existing routes (`/api/generate`, `/api/update`, `/api/assess`) should be updated to delegate to `AIRouter` rather than calling Gemini directly. This ensures:

1. All AI calls go through the same caching layer
2. All AI calls are logged consistently
3. Fallback chain applies to all routes
4. Future model changes only need config.ts updates

### Backward Compatibility

- Legacy routes keep the same request/response contracts
- No changes needed in existing form components
- The new SSE endpoint is additive — existing functionality is unaffected
- `canvas-sse.ts` remains unchanged; `chat-sse.ts` is a new service
