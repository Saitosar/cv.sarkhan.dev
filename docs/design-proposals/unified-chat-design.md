# Unified Chat Design Proposal — cv.sarkhan.dev

## 1. Problem Summary

| Issue | Current State | Impact |
|-------|--------------|--------|
| **Two explicit modes** | ModeToggle switches between Aether / HR Coach | User must manually toggle; confusing which to use |
| **Material Symbols** | 9 components use `material-symbols-outlined` | Icons don't load reliably (external Google Fonts dependency), look dated, inconsistent with Lucide rest of app |
| **Redundant state** | `ChatMode` type, `CHAT_MODES` config, store `mode` field, router `mode` param all propagate the toggle | Unnecessary complexity for what should be automatic |

## 2. Unified Chat Vision

**One chat interface. One agent persona. Two backend personalities selected automatically by context.**

The user talks to a single "Career AI" agent. The backend selects the system prompt based on the *content* of the user's message — not a manual toggle. The avatar, name, and accent color remain consistent (purple-indigo). The HR Coach personality manifests only in the *tone and content* of the response, not in a visible mode badge.

### How automatic personality selection works

The existing `AIRouter.selectSystemPrompt()` already supports mode-based prompt selection. Instead of a user-driven `mode` flag, the router (or a thin classifier layer) inspects the user's message for signals:

- **HR Coach triggers**: "interview", "salary negotiation", "behavioral question", "STAR method", "feedback on my answer", "what would a recruiter think", "how do I explain a gap"
- **Aether (default)**: everything else — resume optimization, ATS scoring, career advice, LinkedIn review

This can be implemented as:
1. **Simple keyword classifier** (zero-dependency, ~20 lines) in the chat-sse service or a new `lib/ai/classifier.ts`
2. **LLM-based routing** (more accurate): a tiny prompt to classify intent before the main call

The classifier runs before the main AI call and sets the `mode` parameter internally — the user never sees it.

## 3. Component Changes

### 3.1 REMOVE: `ModeToggle.tsx` (entire file)

Delete `src/components/ChatPanel/ModeToggle.tsx`. No replacement — the toggle is gone.

### 3.2 MODIFY: `ChatHeader.tsx`

**Changes:**
- Remove `ModeToggle` import and usage
- Remove `mode`, `onModeToggle` props
- Remove `CHAT_MODES` dependency
- Hardcode agent name to "Career AI" (or keep dynamic but single)
- Remove the mode badge (`config.label` pill)
- Replace material-symbols avatar icon with Lucide `Bot` or `Sparkles` icon

**Before:**
```tsx
import ModeToggle from './ModeToggle';
// ...
<ModeToggle mode={mode} onChange={handleModeChange} />
```

**After:**
```tsx
import { Bot } from 'lucide-react';
// ...
// No ModeToggle. Single avatar, single name.
```

### 3.3 MODIFY: `ChatHeaderProps` in `src/types/chat.ts`

**Changes:**
- Remove `mode?: ChatMode` and `onModeToggle?: () => void`
- Remove `avatarIcon?: string` (no longer a material icon name)
- Simplify to just `agentName: string` and `isOnline: boolean`

### 3.4 MODIFY: `AgentMessage.tsx`

**Changes:**
- Replace material-symbols avatar icon with Lucide `Bot` icon
- Remove the `source`-based color/badge logic — use a single consistent purple accent
- Remove the `config.label` badge from each agent message
- Keep the purple accent border (always `#d2bbff`)

**Before:**
```tsx
<span className="material-symbols-outlined text-white text-sm">
  {config.avatarIcon}
</span>
```

**After:**
```tsx
<Bot size={16} className="text-white" />
```

### 3.5 MODIFY: `ChatInput.tsx`

**Changes:**
- Replace material-symbols `send` icon with Lucide `Send` icon

**Before:**
```tsx
<span className="material-symbols-outlined">send</span>
```

**After:**
```tsx
<Send size={20} strokeWidth={2} />
```

### 3.6 MODIFY: `ChatPanel.tsx`

**Changes:**
- Remove `mode`, `setMode`, `handleModeToggle` — no more mode state
- Remove `CHAT_MODES[mode]` lookup
- Pass static props to `ChatHeader` (no mode, no toggle)
- The `chatSSE.send()` call still passes `mode` but it's now determined by the classifier, not user toggle

### 3.7 MODIFY: `useChatStore.ts`

**Changes:**
- Remove `mode` from `ChatSession` (or keep as internal-only, not user-facing)
- Remove `setMode` action
- Remove `resetModeOnError` (no HR Coach mode to fall back from)
- Remove mode-specific placeholders — single placeholder always
- Default welcome message becomes personality-agnostic

### 3.8 MODIFY: `src/types/chat.ts`

**Changes:**
- Remove `ChatMode` type (or keep as internal enum for the router only)
- Remove `mode` field from `ChatSession`
- Remove `source` field from `ChatMessage` (or keep for analytics only, not UI)
- Simplify `ChatHeaderProps`

### 3.9 MODIFY: `src/types/hr-coach.ts`

**Changes:**
- Remove `CHAT_MODES` config entirely (or keep as internal prompt config, not UI config)
- Remove `ChatModeConfig` interface (UI-facing fields like `avatarIcon`, `label`, `agentName` no longer needed)

### 3.10 MODIFY: `src/app/layout.tsx`

**Changes:**
- Remove the two `<link>` tags loading Material Symbols from Google Fonts
- Remove the `<style>` block defining `.material-symbols-outlined` CSS class
- Saves ~30KB+ external font download

### 3.11 MODIFY: `SplitScreen.tsx` (2 occurrences)

**Changes:**
- Replace material-symbols icons with Lucide equivalents (likely `PanelRightOpen` / `PanelRightClose` or similar)

### 3.12 MODIFY: `SuggestionPanel.tsx`

**Changes:**
- Replace material-symbols `refresh` with Lucide `RefreshCw`

### 3.13 MODIFY: `ATSScoreCard.tsx`

**Changes:**
- Replace material-symbols `chat` with Lucide `MessageSquare` or `Bot`

## 4. New File: `src/lib/ai/classifier.ts`

```typescript
// Simple keyword-based classifier to select AI personality
// No external dependencies — pure string matching

const HR_COACH_KEYWORDS = [
  'interview', 'salary', 'negotiation', 'behavioral',
  'star method', 'recruiter think', 'feedback on',
  'explain a gap', 'why should we hire', 'tell me about yourself',
  'strengths and weaknesses', 'where do you see yourself',
  'why do you want', 'cultural fit', 'red flag',
  'hr coach', 'mock interview',
];

export function classifyMode(message: string): 'aether' | 'hr-coach' {
  const lower = message.toLowerCase();
  return HR_COACH_KEYWORDS.some(kw => lower.includes(kw))
    ? 'hr-coach'
    : 'aether';
}
```

This is called in `chat-sse.ts` before the API call:

```typescript
const effectiveMode = classifyMode(message);
// ... pass effectiveMode to the API
```

## 5. Icon Migration Summary

| Location | Current Icon | Lucide Replacement |
|----------|-------------|-------------------|
| `ChatHeader.tsx` avatar | `smart_toy` (material) | `<Bot size={18} />` |
| `AgentMessage.tsx` avatar | `badge` / `smart_toy` (material) | `<Bot size={16} />` |
| `ChatInput.tsx` send | `send` (material) | `<Send size={20} />` |
| `SplitScreen.tsx` (×2) | material icons | `<PanelRightOpen />` / `<PanelRightClose />` |
| `SuggestionPanel.tsx` | `refresh` (material) | `<RefreshCw size={18} />` |
| `ATSScoreCard.tsx` | `chat` (material) | `<MessageSquare size={24} />` |

## 6. Migration Order

1. **Remove Material Symbols from `layout.tsx`** (Google Fonts link + CSS class) — this is the root cause of "icons don't load"
2. **Create `classifier.ts`** — the automatic personality selection engine
3. **Update `chat-sse.ts`** — integrate classifier, remove mode from user control
4. **Update `useChatStore.ts`** — remove mode state, simplify
5. **Update `types/chat.ts` and `types/hr-coach.ts`** — remove UI-facing mode types
6. **Delete `ModeToggle.tsx`**
7. **Update `ChatHeader.tsx`** — remove toggle, Lucide avatar
8. **Update `AgentMessage.tsx`** — Lucide avatar, remove source badge
9. **Update `ChatInput.tsx`** — Lucide send icon
10. **Update `ChatPanel.tsx`** — remove mode wiring
11. **Update `SplitScreen.tsx`, `SuggestionPanel.tsx`, `ATSScoreCard.tsx`** — remaining icon swaps

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Keyword classifier misclassifies | Start with simple classifier; upgrade to LLM-based routing if accuracy is insufficient |
| Users who explicitly wanted HR Coach lose control | Add a subtle "Switch to interview mode" suggestion chip when the classifier detects interview intent — gives user a visible hint without a permanent toggle |
| Backend API still expects `mode` param | Keep `mode` in the API contract but derive it from classifier instead of store state |
| Removing Material Symbols breaks other pages | Audit all 9 occurrences (listed above) — all are in components we're updating |

## 8. Visual Mockup (text)

```
┌─────────────────────────────────────┐
│  ● Bot  Career AI        ● Online  │  ← Single agent, no toggle
├─────────────────────────────────────┤
│  Session: Senior DevOps             │
│                                     │
│  ● Bot  Career AI                   │  ← Always purple avatar
│  ┌─────────────────────────────┐    │
│  │ Your resume needs stronger  │    │  ← Aether-style response
│  │ action verbs in the...      │    │
│  └─────────────────────────────┘    │
│                                     │
│  You: Can you mock interview me     │  ← User asks interview Q
│  for a Senior DevOps role?          │
│                                     │
│  ● Bot  Career AI                   │  ← Same avatar, no badge change
│  ┌─────────────────────────────┐    │
│  │ Let's start. Tell me about   │    │  ← HR Coach tone (strict, direct)
│  │ a time you handled a...      │    │     but same visual identity
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 📎 Attach  🔗 Send  📝 ...  │    │  ← Suggestion chips
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Type a message...       [Send] │  │  ← Lucide Send icon
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## 9. Summary of Benefits

- **Removes user confusion**: no "which mode should I use?" decision
- **Removes external dependency**: Material Symbols Google Fonts no longer loaded
- **Consistent iconography**: all Lucide, matching the rest of the app
- **Simpler state**: no mode toggle, no mode store, no mode badge logic
- **Faster page load**: no external font request for Material Symbols (~30KB+)
- **Backend flexibility**: classifier can be upgraded to LLM-based routing without UI changes
