# Phase 4 — Architecture: AI Suggestions, Voice Input, HR Coach, Job Search

> **Status:** Design Document  
> **Owner:** CV Team  
> **Last Updated:** 2026-07-06  
> **Phase 3 Base:** AI Router, SSE streaming, Zustand stores, ChatPanel, CanvasPanel

---

## Table of Contents

1. [AI Suggestions](#1-ai-suggestions)
2. [Voice Input](#2-voice-input)
3. [HR Coach](#3-hr-coach)
4. [Job Search](#4-job-search)
5. [File Structure Summary](#5-file-structure-summary)
6. [Backward Compatibility](#6-backward-compatibility)

---

## 1. AI Suggestions

### 1.1 Overview

When a user taps a resume section in CanvasPanel, the AI analyzes that section and returns structured suggestions. Suggestions appear in a SuggestionPanel overlay with Apply/Dismiss buttons. Uses the existing AI Router with task type `"suggestions"` (new task).

### 1.2 TypeScript Types

**New file: `src/types/suggestions.ts`**

```typescript
// ── Suggestion Types ──

export type SuggestionType =
  | 'missing_keywords'
  | 'weak_action_verbs'
  | 'format_issues'
  | 'content_gaps'
  | 'metrics_missing'
  | 'summary_improvement'
  | 'ats_score';

export type SuggestionSeverity = 'high' | 'medium' | 'low';

export type SuggestionSource = 'ai' | 'rule';

export type SuggestionActionType = 'apply' | 'replace' | 'insert' | 'delete';

export interface SuggestionAction {
  type: SuggestionActionType;
  /** Text to find and replace (for replace/apply) */
  targetText?: string;
  /** New text (for apply/replace) */
  replacementText?: string;
  /** Position for insert operations */
  position?: {
    section: string;
    index: number;
  };
}

export interface Suggestion {
  id: string;
  type: SuggestionType;
  severity: SuggestionSeverity;
  title: string;
  description: string;
  /** Target resume section key (e.g. "experience", "skills", "summary") */
  section: string;
  action: SuggestionAction;
  source: SuggestionSource;
  /** Estimated ATS points this suggestion adds (0-10) */
  atsImpact?: number;
  /** Whether the user has applied this suggestion */
  applied: boolean;
  /** Whether the user has dismissed this suggestion */
  dismissed: boolean;
  /** Timestamp when suggestion was generated */
  createdAt: number;
}

// ── Suggestion Panel Props ──

export interface SuggestionPanelProps {
  /** Suggestions for the currently active section */
  suggestions: Suggestion[];
  /** Whether AI is generating suggestions */
  isLoading: boolean;
  /** Called when user clicks Apply */
  onApply: (suggestion: Suggestion) => void;
  /** Called when user clicks Dismiss */
  onDismiss: (suggestionId: string) => void;
  /** Called when user clicks "Get AI Suggestions" */
  onRefresh: () => void;
  /** Currently active section key */
  activeSection: string | null;
  className?: string;
}

export interface SuggestionCardProps {
  suggestion: Suggestion;
  onApply: () => void;
  onDismiss: () => void;
}

export interface SeverityBadgeProps {
  severity: SuggestionSeverity;
}

// ── AI Router Integration ──

export interface SuggestionsRouterRequest {
  task: 'suggestions';
  /** The section key to analyze */
  section: string;
  /** The section content as text */
  sectionContent: string;
  /** Full resume data for context */
  resumeData: Record<string, unknown>;
  /** Optional job description for keyword gap analysis */
  jobDescription?: string;
}

export interface SuggestionsRouterResponse {
  suggestions: Array<{
    type: SuggestionType;
    severity: SuggestionSeverity;
    title: string;
    description: string;
    action: SuggestionAction;
    atsImpact?: number;
  }>;
}
```

### 1.3 Component Structure

```
src/components/SuggestionPanel/
├── SuggestionPanel.tsx        # Main panel — list of suggestions
├── SuggestionCard.tsx         # Single suggestion with Apply/Dismiss
├── SeverityBadge.tsx          # Color-coded severity indicator
└── index.ts                   # Re-exports
```

**SuggestionPanel** — positioned as an overlay or sidebar in CanvasPanel. Shows:
- Header: "AI Suggestions" + count + refresh button
- List of SuggestionCards sorted by severity (high → medium → low)
- Empty state when no suggestions
- Loading skeleton when AI is generating

**SuggestionCard** — per-suggestion:
- Severity badge (red/orange/blue)
- Title + description
- ATS impact badge (if applicable)
- Apply button → calls `onApply(suggestion)`
- Dismiss button (X) → calls `onDismiss(suggestion.id)`

**SeverityBadge** — small pill:
- `high` → red bg/text
- `medium` → amber bg/text
- `low` → blue bg/text

### 1.4 Store / State

**New store: `src/stores/useSuggestionStore.ts`**

```typescript
interface SuggestionState {
  /** All current suggestions, keyed by section */
  suggestionsBySection: Record<string, Suggestion[]>;
  /** Whether AI is generating for a specific section */
  loadingSection: string | null;
  /** Error message per section */
  errorBySection: Record<string, string | null>;

  // Actions
  setSuggestions: (section: string, suggestions: Suggestion[]) => void;
  addSuggestions: (section: string, suggestions: Suggestion[]) => void;
  applySuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  clearSection: (section: string) => void;
  clearAll: () => void;
  setLoading: (section: string | null) => void;
  setError: (section: string, error: string | null) => void;
}
```

**Integration with existing stores:**

- `useResumeStore.activeSection` — already exists, drives which section gets suggestions
- `useSuggestionStore` — new, independent store
- When `activeSection` changes → trigger suggestion generation
- When suggestion is applied → call `useResumeStore.applySuggestion()` (existing) + mark suggestion as applied

### 1.5 API Contract

**New task type in AI Router config: `"suggestions"`**

Add to `src/lib/ai/config.ts`:

```typescript
export type TaskType =
  | 'chat'
  | 'ats-score'
  | 'generate'
  | 'tailor'
  | 'analyze'
  | 'suggest'
  | 'suggestions'    // NEW
  | 'search';        // NEW (for Job Search)
```

Model config for `suggestions`:

```typescript
suggestions: {
  task: 'suggestions',
  model: 'deepseek-v4-flash',
  temperature: 0.3,
  topP: 0.8,
  maxOutputTokens: 2048,
  systemPrompt: `You are a resume improvement analyst. Given a specific section of a resume, analyze it and return structured suggestions. Focus on: missing keywords, weak action verbs, formatting issues, content gaps, and missing metrics. Return ONLY valid JSON matching the SuggestionsRouterResponse interface. Each suggestion must have a clear, actionable description.`,
  fallbacks: [
    {
      model: 'deepseek-v4-flash',
      temperature: 0.3,
      topP: 0.8,
      maxOutputTokens: 2048,
      systemPrompt: `You are a resume analyst. Return JSON only with suggestions array.`,
    },
  ],
}
```

**New prompt builder: `src/lib/ai/prompts/suggestions.ts`**

```typescript
export interface SuggestionsPromptInput {
  section: string;
  sectionContent: string;
  resumeData?: Record<string, unknown>;
  jobDescription?: string;
}

export function buildSuggestionsPrompt(input: SuggestionsPromptInput): string {
  // Builds a prompt focused on analyzing ONE section
}
```

**No new API route needed** — reuses `POST /api/ai/route` with `task: 'suggestions'`.

### 1.6 Integration Points

1. **CanvasPanel** — when `activeSection` changes, call suggestion generation
2. **ResumeSection** — already has `onTap` and `isActive`; no changes needed
3. **SuggestionPanel** — rendered inside CanvasPanel, positioned as overlay
4. **useResumeStore.applySuggestion()** — already exists, handles block application
5. **AI Router** — new task type `"suggestions"` added to config

**Flow:**
```
User taps section in CanvasPanel
  → useResumeStore.setActiveSection(section)
  → CanvasPanel detects activeSection change
  → Calls POST /api/ai/route with task: "suggestions"
  → Response parsed into Suggestion[]
  → useSuggestionStore.setSuggestions(section, suggestions)
  → SuggestionPanel re-renders with new suggestions
```

### 1.7 Rule-based Suggestions (Client-side)

For instant feedback without AI latency, add client-side rule checks:

```typescript
// src/lib/suggestions/rules.ts
export function generateRuleBasedSuggestions(
  section: string,
  content: string,
  resumeData: ResumeStoreData
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  switch (section) {
    case 'experience':
      // Check for metrics (%, numbers, $)
      if (!/\d+%|\d+x|\$\d+|\d+ (users|projects|clients)/i.test(content)) {
        suggestions.push(/* metrics_missing suggestion */);
      }
      // Check for weak action verbs
      if (/was responsible|was part of|worked on|helped/i.test(content)) {
        suggestions.push(/* weak_action_verbs suggestion */);
      }
      break;
    case 'summary':
      if (content.length < 50) {
        suggestions.push(/* content_gap suggestion */);
      }
      break;
    case 'skills':
      if (resumeData.targetJob?.description) {
        // Check keyword gaps against job description
        suggestions.push(/* missing_keywords suggestion */);
      }
      break;
  }

  return suggestions;
}
```

---

## 2. Voice Input

### 2.1 Overview

Browser-native voice input using Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`). A microphone button in ChatInput that, when pressed, starts listening and inserts transcribed text into the input field. No external services, no server calls.

### 2.2 TypeScript Types

**New file: `src/types/voice.ts`**

```typescript
// ── Voice Input States ──

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

export interface VoiceInputProps {
  /** Called with transcribed text when speech is recognized */
  onResult: (text: string) => void;
  /** Called when voice state changes */
  onStateChange?: (state: VoiceState) => void;
  /** Whether voice input is disabled */
  disabled?: boolean;
}

export interface VoiceButtonProps {
  state: VoiceState;
  onClick: () => void;
  disabled?: boolean;
}

// ── Browser Speech Recognition Types ──

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
```

### 2.3 Component Structure

```
src/components/ChatPanel/
├── VoiceButton.tsx            # Microphone button with state animation
└── (ChatInput.tsx modified)   # Integrates VoiceButton
```

**VoiceButton** — circular button with states:
- `idle` → microphone icon, gray
- `listening` → microphone icon, pulsing red ring, animated waves
- `processing` → spinner/loading
- `error` → microphone icon with exclamation, red

**ChatInput modification** — add VoiceButton next to the send button:
- VoiceButton on the left of the send button
- When voice result arrives, insert text at cursor position in textarea
- If textarea is empty, set value to transcribed text
- If textarea has text, append transcribed text with a space

### 2.4 Store / State

**No new store needed.** Voice state is local to the component via `useState` + `useRef` for the SpeechRecognition instance.

**Hook: `src/hooks/useVoiceInput.ts`**

```typescript
interface UseVoiceInputReturn {
  state: VoiceState;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

function useVoiceInput(onResult: (text: string) => void): UseVoiceInputReturn {
  // Manages SpeechRecognition lifecycle
  // Returns state, isSupported, startListening, stopListening, error
}
```

### 2.5 API Contract

**No API endpoints.** Everything is client-side via Web Speech API.

**Browser Support:**
- Chrome/Edge: `webkitSpeechRecognition` (full support)
- Firefox: not supported (show disabled button with tooltip)
- Safari: partial support via `SpeechRecognition` (iOS 14.4+)

**Fallback:** If `SpeechRecognition` is not available, VoiceButton is hidden or shown as disabled with tooltip "Voice input not supported in this browser".

### 2.6 Integration Points

1. **ChatInput** — add VoiceButton next to send button
2. **ChatPanel** — no changes needed (ChatInput handles voice internally)
3. **useChatStore.setInputValue** — existing, used to insert transcribed text

**Flow:**
```
User clicks microphone button
  → useVoiceInput.startListening()
  → Browser shows microphone permission dialog (first time)
  → SpeechRecognition starts, state → "listening"
  → User speaks
  → SpeechRecognition returns interim results (partial)
  → On final result: state → "processing" → "idle"
  → onResult(text) called
  → ChatInput.setInputValue(text) — text inserted into textarea
  → User can edit before sending

On error (no speech, permission denied):
  → state → "error"
  → Show error state for 2 seconds, then return to "idle"
```

### 2.7 VoiceButton Animation States

```typescript
const stateConfig = {
  idle: {
    icon: 'mic',
    className: 'text-[#c4c7c7] hover:text-[#d2bbff]',
    tooltip: 'Voice input',
  },
  listening: {
    icon: 'mic',
    className: 'text-red-400 animate-pulse',
    tooltip: 'Listening... click to stop',
  },
  processing: {
    icon: 'hourglass_top',
    className: 'text-yellow-400',
    tooltip: 'Processing...',
  },
  error: {
    icon: 'mic_off',
    className: 'text-red-500',
    tooltip: 'Voice input failed. Try again.',
  },
};
```

---

## 3. HR Coach

### 3.1 Overview

Two chat modes: "Aether" (AI Career Expert, existing) and "HR Coach" (hiring expert with stricter tone). A toggle in ChatHeader switches modes. Each mode has its own system prompt, color scheme, and icon. Messages are tagged with `source: "aether" | "hr-coach"`.

### 3.2 TypeScript Types

**Modified: `src/types/chat.ts`**

```typescript
// ── New types ──

export type ChatMode = 'aether' | 'hr-coach';

export interface ChatModeConfig {
  id: ChatMode;
  label: string;
  agentName: string;
  avatarIcon: string;
  color: string;           // Primary color for the mode
  borderColor: string;     // Border accent
  bgColor: string;         // Background tint
  description: string;     // Short description shown in tooltip
}

// ── Modified existing types ──

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  section?: SectionType;
  metadata?: Record<string, unknown>;
  hasActions?: boolean;
  isStreaming?: boolean;
  /** NEW: Which chat mode produced this message */
  source?: ChatMode;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  focusSection: SectionType | null;
  status: 'idle' | 'loading' | 'ready' | 'chatting' | 'suggesting';
  /** NEW: Current chat mode */
  mode: ChatMode;
}

// ── Modified props ──

export interface ChatHeaderProps {
  agentName: string;
  isOnline: boolean;
  avatarIcon?: string;
  /** NEW: Current chat mode */
  mode: ChatMode;
  /** NEW: Called when mode toggle is clicked */
  onModeToggle?: () => void;
}
```

**New file: `src/types/hr-coach.ts`**

```typescript
import type { ChatMode } from './chat';

export const CHAT_MODES: Record<ChatMode, import('./chat').ChatModeConfig> = {
  aether: {
    id: 'aether',
    label: 'Aether',
    agentName: 'Aether Coach',
    avatarIcon: 'smart_toy',
    color: '#d2bbff',
    borderColor: 'rgba(210, 187, 255, 0.3)',
    bgColor: 'rgba(96, 1, 209, 0.1)',
    description: 'AI Career Expert — supportive, actionable, ATS-focused',
  },
  'hr-coach': {
    id: 'hr-coach',
    label: 'HR Coach',
    agentName: 'HR Coach',
    avatarIcon: 'badge',
    color: '#f97316',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    bgColor: 'rgba(249, 115, 22, 0.1)',
    description: 'Hiring Expert — strict, interview-focused, realistic feedback',
  },
};
```

### 3.3 Component Structure

**Modified components:**

```
src/components/ChatPanel/
├── ChatHeader.tsx             # Modified — add mode toggle
├── ModeToggle.tsx             # NEW — toggle switch between modes
├── AgentMessage.tsx           # Modified — show source badge
└── ChatPanel.tsx              # Modified — pass mode to services
```

**ModeToggle** — pill-shaped toggle:
```
[ Aether  |  HR Coach ]
```
- Active mode has filled background with mode color
- Inactive mode is outlined
- Clicking switches modes
- Smooth transition animation

**ChatHeader modifications:**
- Add ModeToggle below the agent name/status row
- Change avatar icon and color based on mode
- Show mode description as subtitle

**AgentMessage modifications:**
- Show a small source badge ("Aether" or "HR Coach") with mode color
- Different border accent based on source

### 3.4 Store / State

**Modified: `src/stores/useChatStore.ts`**

```typescript
interface ChatState {
  session: ChatSession;       // Now includes `mode: ChatMode`
  inputValue: string;
  inputPlaceholder: string;
  isStreaming: boolean;

  // NEW actions
  setMode: (mode: ChatMode) => void;

  // Existing actions
  addMessage: (role: ChatMessage['role'], content: string, section?: SectionType) => void;
  // ... rest unchanged
}
```

**New fields in `ChatSession`:**
- `mode: ChatMode` — defaults to `'aether'`

**New actions:**
- `setMode(mode)` — updates session.mode, resets placeholder text

**Persist changes:** The `partialize` function already persists `session`, so `mode` is automatically persisted.

### 3.5 API Contract

**Modified: `src/lib/ai/config.ts`**

The `chat` task type gets a new field in `RouterRequest`:

```typescript
export interface RouterRequest {
  task: TaskType;
  message?: string;
  resumeData?: Record<string, unknown>;
  jobDescription?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionId?: string;
  signal?: AbortSignal;
  /** NEW: Chat mode for system prompt selection */
  mode?: ChatMode;
}
```

**Two system prompts in config:**

```typescript
chat: {
  task: 'chat',
  model: 'deepseek-v4-flash',
  temperature: 0.7,
  topP: 0.9,
  maxOutputTokens: 4096,
  systemPrompt: `You are Aether, an AI Career Coach...`,  // existing
  fallbacks: [...],
  // NEW: alternate system prompt for HR Coach mode
  alternateSystemPrompt?: `You are an HR Coach, a strict hiring expert...`,
}
```

**HR Coach system prompt:**

```
You are an HR Coach, a strict hiring expert with 15+ years of experience in talent acquisition.
Your role is to provide realistic, sometimes uncomfortable feedback that prepares the candidate
for real interviews. Be direct and critical — sugar-coating doesn't help in real interviews.
Focus on: interview preparation, behavioral questions (STAR method), resume gaps,
and what recruiters actually look for. Use a professional but firm tone.
When evaluating answers, provide specific scores and actionable improvement steps.
```

**Modified: `src/lib/ai/router.ts`** — `routeStream` method selects system prompt based on `request.mode`:

```typescript
const systemPrompt = request.mode === 'hr-coach'
  ? config.alternateSystemPrompt ?? config.systemPrompt
  : config.systemPrompt;
```

**Modified: `src/app/api/sse/chat/route.ts`** — accept `mode` in request body and pass to router.

**Modified: `src/services/chat-sse.ts`** — accept `mode` parameter in `send()` method.

### 3.6 Integration Points

1. **ChatHeader** — add ModeToggle, change colors/icons based on mode
2. **ChatPanel** — pass `mode` to ChatSSEService.send()
3. **ChatSSEService** — pass `mode` in API request body
4. **SSE Chat API** — accept `mode`, pass to router
5. **AI Router** — select system prompt based on mode
6. **ChatMessage** — new `source` field for message attribution
7. **AgentMessage** — show source badge with mode color

**Flow:**
```
User clicks mode toggle
  → useChatStore.setMode('hr-coach')
  → ChatHeader re-renders with new colors/icons
  → User sends message
  → ChatSSEService.send(mode: 'hr-coach')
  → POST /api/sse/chat { mode: 'hr-coach', ... }
  → AI Router selects HR Coach system prompt
  → Response streamed back
  → Messages tagged with source: 'hr-coach'
  → AgentMessage shows HR Coach badge
```

---

## 4. Job Search

### 4.1 Overview

A search panel with job title and location fields. Returns 3-5 mock job listings. Each listing shows title, company, location, salary range, match score (AI-calculated against user's resume), and description. Uses AI Router with task type `"search"`. Real integration (Firecrawl/APIs) deferred to Phase 5.

### 4.2 TypeScript Types

**New file: `src/types/job-search.ts`**

```typescript
// ── Job Listing ──

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;           // e.g. "$120K-$160K"
  description: string;
  matchScore: number;        // 0-100, AI-calculated
  matchedSkills: string[];
  missingSkills: string[];
  postedDate?: string;
  url?: string;
  source?: string;           // "linkedin", "indeed", etc.
}

// ── Search ──

export interface JobSearchParams {
  query: string;             // Job title / keywords
  location: string;
}

export interface JobSearchResult {
  jobs: JobListing[];
  totalCount: number;
  searchParams: JobSearchParams;
  /** Timestamp of the search */
  searchedAt: number;
}

// ── AI Scoring Result ──

export interface JobScoreResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
}

// ── Component Props ──

export interface JobSearchPanelProps {
  className?: string;
}

export interface JobSearchFormProps {
  query: string;
  location: string;
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: (params: JobSearchParams) => void;
  isLoading: boolean;
}

export interface JobCardProps {
  job: JobListing;
  onSelect?: (job: JobListing) => void;
}

export interface MatchScoreBadgeProps {
  score: number;             // 0-100
  size?: 'sm' | 'md';
}
```

### 4.3 Component Structure

```
src/components/JobSearch/
├── JobSearchPanel.tsx        # Main panel — form + results
├── JobSearchForm.tsx         # Search form (title + location inputs)
├── JobCard.tsx               # Single job listing card
├── MatchScoreBadge.tsx       # Color-coded match score
└── index.ts                  # Re-exports
```

**JobSearchPanel** — full panel with:
- Header: "Job Search" with icon
- JobSearchForm at top
- Results list (JobCards) below
- Empty state: "Search for jobs to see matches"
- Loading state: skeleton cards
- Error state: retry button

**JobSearchForm** — two inputs:
- Job title/query (text input, required)
- Location (text input, optional)
- Search button (disabled when query is empty or loading)

**JobCard** — per job:
- Title (bold)
- Company name
- Location + salary on same line
- MatchScoreBadge (circular or pill)
- Matched/missing skills chips
- Short description (2-3 lines, truncated)
- Click handler for future detail view

**MatchScoreBadge** — color-coded:
- 80-100: green ("Excellent match")
- 60-79: amber ("Good match")
- 40-59: orange ("Fair match")
- 0-39: red ("Low match")

### 4.4 Store / State

**New store: `src/stores/useJobSearchStore.ts`**

```typescript
interface JobSearchState {
  query: string;
  location: string;
  results: JobListing[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  lastSearchedAt: number | null;

  // Actions
  setQuery: (query: string) => void;
  setLocation: (location: string) => void;
  setResults: (result: JobSearchResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
}
```

### 4.5 API Contract

**New API route: `src/app/api/jobs/search/route.ts`**

```
POST /api/jobs/search

Request:
{
  query: string;        // Required: job title/keywords
  location?: string;    // Optional: city or remote
}

Response (mock):
{
  jobs: [
    {
      id: "job-1",
      title: "Senior DevOps Engineer",
      company: "TechCorp",
      location: "Berlin, Germany",
      salary: "$120K-$160K",
      description: "We are looking for a Senior DevOps Engineer...",
      matchScore: 87,
      matchedSkills: ["Kubernetes", "Docker", "CI/CD", "Terraform"],
      missingSkills: ["AWS EKS", "Helm"],
      postedDate: "2026-06-28",
      source: "linkedin"
    },
    // ... 4 more mock jobs
  ],
  totalCount: 5,
  searchParams: { query: "Senior DevOps Engineer", location: "Berlin" },
  searchedAt: 1712345678000
}
```

**Mock data strategy:** The API route returns hardcoded mock data that varies slightly based on the query (keyword matching). The mock data lives in `src/lib/jobs/mock-data.ts`.

**AI scoring integration:** After returning mock jobs, the API calls the AI Router with task `"search"` to score each job against the user's resume:

```typescript
// Inside POST /api/jobs/search
const scoreResult = await router.route({
  task: 'search',
  message: JSON.stringify({ job, resume }),
  resumeData: resume,
});
```

**New task type in AI Router config: `"search"`**

```typescript
search: {
  task: 'search',
  model: 'deepseek-v4-flash',
  temperature: 0.2,
  topP: 0.8,
  maxOutputTokens: 1024,
  systemPrompt: `You are a job match scoring engine. Given a job listing and a candidate's resume, calculate a match score (0-100). Consider: skills overlap, years of experience, industry relevance, and location. Return ONLY valid JSON matching the JobScoreResult interface.`,
  fallbacks: [
    {
      model: 'deepseek-v4-flash',
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 1024,
      systemPrompt: `You are a job match scorer. Return JSON only.`,
    },
  ],
}
```

**New prompt builder: `src/lib/ai/prompts/search.ts`**

```typescript
export interface SearchPromptInput {
  message: string;       // JSON with job + resume
  resumeData?: Record<string, unknown>;
}

export function buildSearchPrompt(input: SearchPromptInput): string {
  // Builds prompt for job match scoring
}
```

### 4.6 Integration Points

1. **Workspace page** — add JobSearchPanel as a third panel (tab or toggle)
2. **SplitScreen** — could add a third panel or use a tab system
3. **CanvasPanel** — no direct integration (JobSearch is standalone)
4. **ChatPanel** — could show job search results as chat messages (future)
5. **AI Router** — new task type `"search"`

**Placement options:**
- **Option A (recommended):** Add a "Job Search" tab in the mobile tab bar + a toggle button in the desktop header that swaps CanvasPanel for JobSearchPanel
- **Option B:** Add JobSearchPanel as a collapsible sidebar on the right
- **Option C:** Integrate into ChatPanel as a special message type

**Recommended (Option A):**

```
Workspace Page Layout:
┌─────────────────────────────────────────────────────┐
│  Header: [Chat] [Resume] [ATS Score] [🔍 Jobs]     │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  ChatPanel   │  CanvasPanel  OR  JobSearchPanel     │
│              │  (toggled by Jobs tab)               │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

**Modified: `src/types/split-screen.ts`**

```typescript
export type MobileTab = 'chat' | 'resume' | 'score' | 'jobs';  // NEW: 'jobs'
```

**Modified: `src/app/workspace/page.tsx`**

```typescript
// Add state for right panel mode: 'canvas' | 'jobs'
// Toggle between CanvasPanel and JobSearchPanel
```

---

## 5. File Structure Summary

### New Files

```
src/types/
├── suggestions.ts            # AI Suggestions types
├── voice.ts                  # Voice Input types
├── hr-coach.ts               # HR Coach mode configs
└── job-search.ts             # Job Search types

src/stores/
├── useSuggestionStore.ts      # Suggestions state
└── useJobSearchStore.ts      # Job Search state

src/hooks/
└── useVoiceInput.ts           # Voice input hook (SpeechRecognition)

src/components/
├── SuggestionPanel/
│   ├── SuggestionPanel.tsx
│   ├── SuggestionCard.tsx
│   ├── SeverityBadge.tsx
│   └── index.ts
├── ChatPanel/
│   ├── VoiceButton.tsx        # NEW
│   └── ModeToggle.tsx         # NEW
└── JobSearch/
    ├── JobSearchPanel.tsx
    ├── JobSearchForm.tsx
    ├── JobCard.tsx
    ├── MatchScoreBadge.tsx
    └── index.ts

src/lib/
├── suggestions/
│   └── rules.ts               # Rule-based suggestion engine
└── jobs/
    └── mock-data.ts            # Mock job listings

src/app/api/jobs/
└── search/
    └── route.ts               # Job search API (mock)

src/lib/ai/prompts/
├── suggestions.ts             # NEW: suggestions prompt builder
└── search.ts                  # NEW: search prompt builder
```

### Modified Files

```
src/types/
├── index.ts                   # Export new type modules
├── chat.ts                    # Add ChatMode, source field, mode in session
└── split-screen.ts            # Add 'jobs' to MobileTab

src/stores/
├── index.ts                   # Export new stores
└── useChatStore.ts            # Add mode field + setMode action

src/lib/ai/
├── config.ts                  # Add 'suggestions' and 'search' task types
├── router.ts                  # Support mode-based system prompt selection
└── prompts/index.ts           # Add suggestions + search prompt builders

src/services/
└── chat-sse.ts                # Accept mode parameter

src/app/api/
├── ai/route/route.ts          # Add 'suggestions' and 'search' to ALLOWED_TASKS
└── sse/chat/route.ts          # Accept mode in request body

src/components/
├── ChatPanel.tsx              # Pass mode to services
├── ChatPanel/ChatHeader.tsx   # Add ModeToggle, mode-based styling
├── ChatPanel/ChatInput.tsx    # Add VoiceButton
├── ChatPanel/AgentMessage.tsx # Show source badge
└── CanvasPanel.tsx            # Integrate SuggestionPanel

src/app/workspace/
└── page.tsx                   # Add JobSearch toggle
```

## 6. Backward Compatibility

### What does NOT change

| Component / Type | Status | Reason |
|---|---|---|
| `ResumeData` / `ResumeStoreData` | Unchanged | No new fields needed |
| `ATSScore` / `ATSScoreWidget` | Unchanged | Suggestions are separate from ATS |
| `CanvasPanel` layout | Unchanged | SuggestionPanel is additive overlay |
| `SplitScreen` component | Unchanged | Only `MobileTab` type changes |
| `useResumeStore` | Unchanged | `applySuggestion()` already exists |
| `useATSStore` | Unchanged | No new ATS features |
| `ResumeCanvas` / `ResumeSection` | Unchanged | Props unchanged |
| `MessageList` / `UserMessage` | Unchanged | No prop changes |
| `SessionBadge` / `TypingIndicator` | Unchanged | No changes |
| `SuggestionChips` | Unchanged | Existing feature untouched |

### What changes with fallback

| Change | Fallback |
|---|---|
| `ChatMessage.source` is optional (`undefined` = legacy) | Old messages render without source badge |
| `ChatSession.mode` defaults to `'aether'` | Old persisted sessions work as before |
| `ChatHeader` gets new `mode` prop | Old usage without `mode` defaults to `'aether'` |
| `MobileTab` gets `'jobs'` | Old tab bars still work, just don't show Jobs tab |
| `ChatInput` gets VoiceButton | Old usage without voice renders normal input |

### Persistence

- `useChatStore` persist version bump to 2 (add `mode` field)
- `useSuggestionStore` — NOT persisted (suggestions are ephemeral)
- `useJobSearchStore` — NOT persisted (search results are session-only)
- Migration: old persisted sessions without `mode` field default to `'aether'`

---

## Appendix A: AI Router Task Types (Updated)

```
Task Type       | Phase | Cached | Streaming | Used By
────────────────┼───────┼────────┼───────────┼──────────────────
chat            | 3     | No     | Yes       | ChatPanel
ats-score       | 3     | Yes    | No        | CanvasPanel (auto)
generate        | 3     | Yes    | No        | Resume generation
tailor          | 3     | Yes    | No        | Resume tailoring
analyze         | 3     | Yes    | No        | Deep analysis
suggest         | 3     | No     | No        | Quick suggestions
suggestions     | 4     | No     | No        | SuggestionPanel (NEW)
search          | 4     | No     | No        | Job Search (NEW)
```

## Appendix B: Data Flow Diagrams

### AI Suggestions Flow
```
User taps section → setActiveSection(section)
  → CanvasPanel detects change
  → Rule-based suggestions (instant, client-side)
  → AI suggestions (POST /api/ai/route, task: "suggestions")
  → Merge + sort by severity
  → useSuggestionStore.setSuggestions()
  → SuggestionPanel re-renders
  → User clicks Apply → useResumeStore.applySuggestion() + mark applied
  → User clicks Dismiss → remove from list
```

### Voice Input Flow
```
User clicks mic → useVoiceInput.startListening()
  → SpeechRecognition starts
  → Interim results (optional, for visual feedback)
  → Final result → onResult(text)
  → ChatInput.setInputValue(text)
  → User edits if needed → sends normally
```

### HR Coach Flow
```
User toggles mode → useChatStore.setMode('hr-coach')
  → ChatHeader updates colors/icons
  → User sends message
  → ChatSSEService.send(mode: 'hr-coach')
  → POST /api/sse/chat { mode: 'hr-coach', ... }
  → AI Router selects HR Coach system prompt
  → Response streamed, messages tagged source: 'hr-coach'
```

### Job Search Flow
```
User enters query + location → clicks Search
  → useJobSearchStore.setLoading(true)
  → POST /api/jobs/search { query, location, resume }
  → API returns mock jobs
  → For each job: AI Router scores match (task: "search")
  → Results sorted by matchScore
  → useJobSearchStore.setResults()
  → JobSearchPanel re-renders with JobCards
```
