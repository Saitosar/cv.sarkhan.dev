# Phase 2 — Core UI SPEC

> **Status:** Draft  
> **Phase:** 2 — Core UI  
> **Dependencies:** Phase 1 (Zustand stores, types) — ✅ Complete  
> **Design Reference:** `designs/stitch-confidence-final.html`  
> **Last Updated:** 2026-07-05

---

## Table of Contents

1. [Overview](#1-overview)
2. [Component Tree](#2-component-tree)
3. [SplitScreen](#3-splitscreen)
4. [ChatPanel](#4-chatpanel)
5. [CanvasPanel](#5-canvaspanel)
6. [Mobile Adaptation](#6-mobile-adaptation)
7. [Animations](#7-animations)
8. [Styling System](#8-styling-system)
9. [Data Flow](#9-data-flow)
10. [Implementation Order](#10-implementation-order)

---

## 1. Overview

### 1.1 Goal

Replace the current form-based `/create` and `/update` pages with a unified **AI-first Workspace** consisting of a split-screen layout: Chat (40%) + Canvas (60%). The ChatPanel hosts the Aether Coach AI agent; the CanvasPanel renders the live resume preview with an ATS Score widget.

### 1.2 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **CSS Grid** for split layout | Native resize support via `grid-template-columns` + `resize` polyfill |
| **Zustand** for all state | Already in use; stores are Phase 1 complete |
| **react-circular-progressbar** for ATS score | Already in `package.json` and used in `ScoreCircle` |
| **Custom CSS animations** (not Framer Motion) | Keep bundle small; animations are simple CSS keyframes |
| **`use-debounce` or manual RAF** for splitter | Avoid layout thrashing during drag |
| **Mobile: tabs at bottom** | Reuse `MobileNav` pattern; no structural change to layout |

### 1.3 Route Changes

| Route | Before | After |
|-------|--------|-------|
| `/create` | Form + Preview | Redirect to `/workspace` or keep as workspace entry |
| `/update` | Form + Preview | Redirect to `/workspace` or keep as workspace entry |
| `/workspace` | — | **NEW** — SplitScreen with ChatPanel + CanvasPanel |

The `/workspace` route is the primary workspace. `/create` and `/update` can remain as entry points that redirect to `/workspace` with appropriate initial state.

---

## 2. Component Tree

```
AppShell (implicit in layout.tsx)
├── BackgroundFX (existing)
├── Header (existing — hide on /workspace)
├── SplitScreen                          ← NEW
│   ├── Splitter (draggable divider)     ← NEW
│   ├── ChatPanel (left, 40%)            ← NEW
│   │   ├── ChatHeader                  ← NEW
│   │   ├── SessionBadge                ← NEW
│   │   ├── MessageList                 ← NEW
│   │   │   ├── AgentMessage            ← NEW
│   │   │   ├── UserMessage             ← NEW
│   │   │   └── TypingIndicator         ← NEW
│   │   ├── SuggestionChips             ← NEW
│   │   └── ChatInput                   ← NEW
│   └── CanvasPanel (right, 60%)        ← NEW
│       ├── ResumeCanvas                ← NEW
│       │   ├── ResumeHeader            ← NEW
│       │   ├── ResumeSection           ← NEW
│       │   └── ResumeSection           ← NEW
│       └── ATSScoreWidget              ← NEW
│           ├── CircularScore           ← uses react-circular-progressbar
│           └── PulseRing               ← NEW (CSS animation)
├── MobileTabBar (replaces MobileNav on /workspace)  ← NEW
└── MobileNav (existing — hidden on /workspace)
```

---

## 3. SplitScreen

### 3.1 File

`src/components/SplitScreen.tsx`

### 3.2 Props / Interface

```typescript
// src/types/split-screen.ts (NEW)
export type SplitOrientation = 'horizontal' | 'vertical';

export interface SplitScreenProps {
  /** Left/top panel content */
  left: React.ReactNode;
  /** Right/bottom panel content */
  right: React.ReactNode;
  /** Initial left panel ratio (0–1). Default 0.4 */
  defaultLeftRatio?: number;
  /** Minimum left ratio. Default 0.25 */
  minLeftRatio?: number;
  /** Maximum left ratio. Default 0.6 */
  maxLeftRatio?: number;
  /** Orientation. Default 'horizontal' on desktop, 'vertical' on mobile */
  orientation?: SplitOrientation;
  /** Called when ratio changes */
  onRatioChange?: (ratio: number) => void;
  /** CSS class override */
  className?: string;
}

export interface SplitScreenState {
  /** Current left panel ratio (0–1) */
  leftRatio: number;
  /** Whether user is currently dragging the splitter */
  isDragging: boolean;
  /** Orientation */
  orientation: SplitOrientation;
}
```

### 3.3 States

| State | Visual |
|-------|--------|
| **Default** | Left panel at 40%, right at 60%, splitter visible |
| **Dragging** | Splitter highlighted (purple glow), cursor `col-resize` |
| **Mobile** | Orientation switches to `vertical` (tabs), splitter hidden |
| **Min/Max** | Splitter stops at 25% / 60% boundaries |

### 3.4 Styling

```tsx
// Container
<div className="flex h-full w-full overflow-hidden relative">
  {/* Left Panel */}
  <div
    className="overflow-hidden"
    style={{ width: `${leftRatio * 100}%` }}
  >
    {left}
  </div>

  {/* Splitter */}
  <div
    className={cn(
      "relative w-1.5 cursor-col-resize flex-shrink-0 group",
      "hover:bg-purple-500/20 transition-colors duration-200"
    )}
    onMouseDown={startDrag}
    role="separator"
    tabIndex={0}
    aria-label="Resize panels"
  >
    {/* Visual indicator line */}
    <div className={cn(
      "absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2",
      "bg-white/10 group-hover:bg-purple-500/60",
      "transition-colors duration-200",
      isDragging && "bg-purple-500 shadow-[0_0_8px_rgba(96,1,209,0.6)]"
    )} />
  </div>

  {/* Right Panel */}
  <div
    className="flex-1 overflow-hidden"
  >
    {right}
  </div>
</div>
```

### 3.5 Behavior

- **Desktop:** Horizontal split. Splitter is a 6px-wide vertical bar at the boundary.
- **Drag:** `onMouseDown` on splitter → `mousemove` listener on `document` → clamp ratio between `minLeftRatio` and `maxLeftRatio` → update `leftRatio` state → `onMouseUp` cleans up.
- **Touch:** Same logic via `onTouchStart` / `onTouchMove` / `onTouchEnd`.
- **Transition:** When drag ends, apply `transition: width 150ms ease-out` to the left panel for a smooth settle.
- **Mobile:** `orientation='vertical'` — panels stack vertically, splitter hidden, mobile tab bar controls visibility.

### 3.6 Mobile Adaptation

On screens < 768px, `SplitScreen` renders a **tabbed interface** instead of a split:

```typescript
// Inside SplitScreen.tsx
const isMobile = useMediaQuery('(max-width: 767px)');

if (isMobile) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? left : right}
      </div>
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
```

---

## 4. ChatPanel

### 4.1 File

`src/components/ChatPanel.tsx`

### 4.2 Props / Interface

```typescript
// src/types/chat.ts — extend existing
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  section?: SectionType;
  metadata?: Record<string, unknown>;
  /** Whether this message has suggestion chips visible */
  hasActions?: boolean;
  /** Whether this message is currently being streamed */
  isStreaming?: boolean;
}

export interface ChatPanelProps {
  /** Optional class override */
  className?: string;
}

// ── Sub-component interfaces ──

export interface ChatHeaderProps {
  agentName: string;        // "Aether Coach"
  isOnline: boolean;
  avatarIcon?: string;      // Material icon name, default "smart_toy"
}

export interface SessionBadgeProps {
  label: string;            // "Session Started • Focus: Senior DevOps"
}

export interface AgentMessageProps {
  message: ChatMessage;
  onApply?: (messageId: string) => void;
  onDetails?: (messageId: string) => void;
}

export interface UserMessageProps {
  message: ChatMessage;
}

export interface TypingIndicatorProps {
  visible: boolean;
}

export interface ChatInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  disabled?: boolean;
}

export interface SuggestionChipsProps {
  messageId: string;
  chips: SuggestionChip[];
  onAction: (messageId: string, action: string) => void;
}

export interface SuggestionChip {
  id: string;
  label: string;            // "Apply", "Details"
  action: string;
  variant?: 'primary' | 'secondary';
}
```

### 4.3 States

| State | Visual |
|-------|--------|
| **Idle** | Header visible, empty message list, input enabled with placeholder |
| **Loading** | TypingIndicator dots animating, input disabled |
| **Streaming** | Last assistant message shows streaming text, input disabled |
| **Ready** | Messages visible, input enabled, suggestion chips under last AI message |
| **Error** | System message in red, input enabled |
| **Empty** | Welcome message from Aether, session badge visible |

### 4.4 Component Structure

```
┌──────────────────────────────────────┐
│ ChatHeader                           │
│  ┌────┐  Aether Coach               │
│  │ 🤖 │  ● Online                    │
│  └────┘                              │
├──────────────────────────────────────┤
│ SessionBadge                         │
│  "Session Started • Focus: Senior    │
│   DevOps"                            │
├──────────────────────────────────────┤
│ MessageList (scrollable)             │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ AgentMessage                 │    │
│  │  ┌──┐                       │    │
│  │  │🧠│  Aether AI             │    │
│  │  └──┘                       │    │
│  │  ┌──────────────────────┐   │    │
│  │  │ Message text...       │   │    │
│  │  └──────────────────────┘   │    │
│  │  [Apply] [Details]          │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ UserMessage                   │    │
│  │  ┌──────────────────────┐   │    │
│  │  │ User text...         │   │    │
│  │  └──────────────────────┘   │    │
│  └──────────────────────────────┘    │
│                                      │
│  ● ● ● TypingIndicator               │
│                                      │
├──────────────────────────────────────┤
│ ChatInput                            │
│  ┌─────────────────────────┐  ┌──┐   │
│  │ Tell Aether what to... │  │➤│   │
│  └─────────────────────────┘  └──┘   │
└──────────────────────────────────────┘
```

### 4.5 Styling

```tsx
// ChatPanel container
<div className={cn(
  "flex flex-col h-full glass-panel rounded-2xl overflow-hidden",
  "bg-[rgba(20,19,19,0.7)] backdrop-blur-[16px]",
  "border border-[rgba(255,255,255,0.08)]",
  className
)}>

// ChatHeader
<div className="p-6 border-b border-[rgba(255,255,255,0.08)]
  flex justify-between items-center bg-[#141313]/30">
  <div className="flex items-center gap-3">
    {/* Avatar */}
    <div className="w-8 h-8 rounded-full bg-[#6001d1]/20
      flex items-center justify-center
      border border-[#d2bbff]/30">
      <span className="material-symbols-outlined text-[#d2bbff] text-sm">
        smart_toy
      </span>
    </div>
    <div>
      <h2 className="text-lg text-[#e5e2e1]">Aether Coach</h2>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#4ae176]
          shadow-[0_0_8px_rgba(74,225,118,0.6)]" />
        <span className="text-[10px] text-[#4ae176]">Online</span>
      </div>
    </div>
  </div>
</div>

// SessionBadge
<span className="text-[10px] text-[#c4c7c7]
  bg-[#353434]/50 px-3 py-1 rounded-full
  border border-[rgba(255,255,255,0.08)]">
  {label}
</span>

// AgentMessage bubble
<div className="bg-[#2b2a2a]/80 rounded-2xl rounded-tl-none
  p-4 text-[15px] text-[#e5e2e1]
  shadow-[0_0_20px_rgba(96,1,209,0.15)]
  border border-[rgba(96,1,209,0.3)]">

// UserMessage bubble
<div className="bg-[#6001d1]/20 rounded-2xl rounded-tr-none
  p-4 text-[15px] text-[#e5e2e1]
  ml-auto max-w-[85%]">

// ChatInput
<div className="relative">
  <input
    className="w-full bg-[#1c1b1b]
      border border-[rgba(255,255,255,0.08)] rounded-xl
      py-3 pl-4 pr-12 text-[#e5e2e1]
      placeholder:text-[#c4c7c7]
      focus:outline-none focus:border-[#d2bbff]"
    placeholder="Tell Aether what to improve..."
  />
  <button className="absolute right-2 top-1/2 -translate-y-1/2
    text-[#d2bbff] p-2">
    <span className="material-symbols-outlined">send</span>
  </button>
</div>

// Suggestion chips
<button className="px-4 py-2 text-xs font-semibold
  rounded-lg bg-[#6001d1] text-white
  hover:bg-[#6001d1]/80 transition-colors">
  Apply
</button>
<button className="px-4 py-2 text-xs font-semibold
  rounded-lg bg-white/5 text-[#d2bbff]
  hover:bg-white/10 transition-colors">
  Details
</button>
```

### 4.6 Behavior

- **Auto-scroll:** `MessageList` uses a `useRef` + `useEffect` that calls `scrollTo({ top: scrollHeight, behavior: 'smooth' })` whenever `messages.length` or the last message's content changes.
- **Send:** Enter key sends; Shift+Enter inserts newline. On send, `useChatStore.addMessage('user', value)` is called, input is cleared, and `isStreaming` is set to `true`.
- **Streaming:** When `isStreaming` is true, the last assistant message's content is updated via `useChatStore.updateLastMessage()` as chunks arrive.
- **TypingIndicator:** Visible when `isStreaming` is true and no assistant message content has arrived yet (initial latency period).
- **SuggestionChips:** Rendered under the last AI message when `message.hasActions` is true. "Apply" calls `onApply(messageId)`, "Details" calls `onDetails(messageId)`.

---

## 5. CanvasPanel

### 5.1 File

`src/components/CanvasPanel.tsx`

### 5.2 Props / Interface

```typescript
// src/types/canvas.ts — extend existing
export interface CanvasPanelProps {
  /** Optional class override */
  className?: string;
}

export interface ResumeCanvasProps {
  resume: ResumeStoreData;
  /** Currently active/highlighted section */
  activeSection?: string | null;
  /** Called when a section block is tapped */
  onSectionTap?: (section: string) => void;
}

export interface ResumeHeaderProps {
  fullName: string;
  jobTitle: string;
  location?: string;
  email?: string;
  github?: string;
  website?: string;
}

export interface ResumeSectionProps {
  title: string;
  type: SectionType;
  children: React.ReactNode;
  isActive?: boolean;
  onTap?: () => void;
  atsScore?: number;          // 0–100, for heatmap coloring
}

export interface ATSScoreWidgetProps {
  score: number;              // 0–100
  label?: string;             // "ATS Match"
  isAnalyzing?: boolean;
  className?: string;
}

export interface CircularScoreProps {
  score: number;              // 0–100
  size?: number;              // default 80 (px)
  strokeWidth?: number;       // default 8
  gradientId?: string;        // SVG gradient ID
}

export interface PulseRingProps {
  visible: boolean;
  color?: string;             // default "#4F46E5"
}
```

### 5.3 States

| State | Visual |
|-------|--------|
| **Empty** | Canvas shows empty state: "Your resume will appear here" with shimmer skeleton |
| **Loading** | Shimmer animation on skeleton blocks |
| **Populated** | Full resume rendered with header, sections, contacts |
| **Analyzing** | ATS Score widget shows shimmer/pulse, score animates to new value |
| **Active Section** | Tapped section gets a purple border highlight |

### 5.4 Component Structure

```
┌──────────────────────────────────────────────┐
│ CanvasPanel                                   │
│                                               │
│  ┌──────────────────────────────────────┐     │
│  │ ResumeCanvas                          │     │
│  │                                       │     │
│  │  ┌────────────────────────────────┐   │     │
│  │  │ ResumeHeader                   │   │     │
│  │  │  Alexander Volkov              │   │     │
│  │  │  Senior DevOps Engineer         │   │     │
│  │  │  📍 Berlin  ✉️ alex@...  🔗 gh │   │     │
│  │  └────────────────────────────────┘   │     │
│  │                                       │     │
│  │  ┌────────────────────────────────┐   │     │
│  │  │ ResumeSection: Summary        │   │     │
│  │  │  Results-driven Senior...     │   │     │
│  │  └────────────────────────────────┘   │     │
│  │                                       │     │
│  │  ┌────────────────────────────────┐   │     │
│  │  │ ResumeSection: Experience     │   │     │
│  │  │  • Senior DevOps at...        │   │     │
│  │  │  • Platform Engineer at...    │   │     │
│  │  └────────────────────────────────┘   │     │
│  │                                       │     │
│  │  ┌────────────────────────────────┐   │     │
│  │  │ ResumeSection: Skills         │   │     │
│  │  │  Kubernetes, Docker, Terraform │   │     │
│  │  └────────────────────────────────┘   │     │
│  └──────────────────────────────────────┘     │
│                                               │
│  ┌──────────────────────┐                     │
│  │ ATSScoreWidget       │ ← absolute top-right│
│  │  ┌──────────┐       │                     │
│  │  │   84%    │       │                     │
│  │  │  ◯◯◯◯◯   │       │                     │
│  │  │  pulse   │       │                     │
│  │  └──────────┘       │                     │
│  │  ATS Match          │                     │
│  └──────────────────────┘                     │
└──────────────────────────────────────────────┘
```

### 5.5 Styling

```tsx
// CanvasPanel container
<div className={cn(
  "w-full h-full relative",
  className
)}>

// ResumeCanvas — glass panel
<div className="glass-panel w-full h-full rounded-2xl
  overflow-y-auto p-8 md:p-12
  bg-[rgba(20,19,19,0.7)] backdrop-blur-[16px]
  border border-[rgba(255,255,255,0.08)]">

// ResumeHeader
<header className="border-b border-[rgba(255,255,255,0.08)] pb-6">
  <h1 className="text-4xl md:text-5xl font-bold text-[#e5e2e1] mb-2">
    {fullName}
  </h1>
  <h2 className="text-lg text-[#d2bbff] mb-4">{jobTitle}</h2>
  <div className="flex flex-wrap gap-4 text-sm text-[#c4c7c7]">
    {location && <span>📍 {location}</span>}
    {email && <span>✉️ {email}</span>}
    {github && <span>🔗 {github}</span>}
  </div>
</header>

// ResumeSection
<section className="mb-8">
  <h3 className="text-2xl text-[#e5e2e1] mb-3">{title}</h3>
  <p className="text-lg text-[#c4c7c7] leading-relaxed">
    {children}
  </p>
</section>

// ATSScoreWidget — floating, absolute top-right
<div className={cn(
  "absolute -top-4 -right-4 z-20",
  "glass-panel rounded-2xl p-4",
  "flex flex-col items-center gap-2",
  "shadow-[0_0_30px_rgba(79,70,229,0.25),inset_0_0_20px_rgba(79,70,229,0.1)]",
  "border border-[#4F46E5]/30",
  "w-32",
  className
)}>
  <div className="relative w-20 h-20 flex items-center justify-center">
    {/* SVG CircularProgressbar with gradient */}
    <svg className="absolute inset-0 w-full h-full rotate-[-90deg]"
      viewBox="0 0 100 100">
      <defs>
        <linearGradient id="ats-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#d2bbff" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="none"
        stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
      <circle cx="50" cy="50" r="45" fill="none"
        stroke="url(#ats-grad)"
        strokeDasharray="282.7"
        strokeDashoffset={282.7 - (282.7 * score) / 100}
        strokeLinecap="round" strokeWidth="8"
        className="transition-all duration-1000 ease-out" />
    </svg>
    {/* Pulse ring */}
    <div className="absolute inset-0 rounded-full
      border border-[#4F46E5]/20 pulse-ring m-2" />
    <span className="text-2xl text-[#e5e2e1] relative z-10 font-bold">
      {score}<span className="text-sm">%</span>
    </span>
  </div>
  <span className="text-[10px] text-[#d2bbff] tracking-widest uppercase">
    {label || "ATS Match"}
  </span>
</div>
```

### 5.6 Behavior

- **Section tap:** Clicking a `ResumeSection` calls `onSectionTap(type)` which dispatches a `BLOCK_TAPPED` event → `useResumeStore.setActiveSection(section)` → `window.dispatchEvent(new CustomEvent('focus-chat', { detail: { section } }))`.
- **ATS Score animation:** When `score` changes, the SVG `stroke-dashoffset` transitions over 1s with `ease-out`. The `PulseRing` animates continuously.
- **Shimmer loading:** When `resume` is empty or `isAnalyzing`, skeleton blocks with `animate-shimmer` class are shown.
- **Empty state:** If `resume.fullName` is empty, show a centered prompt: "Start a conversation with Aether to build your resume."

---

## 6. Mobile Adaptation

### 6.1 MobileTabBar

**File:** `src/components/MobileTabBar.tsx`

```typescript
export type MobileTab = 'chat' | 'resume' | 'score';

export interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}
```

### 6.2 Styling

```tsx
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
  <div className="glass-card mx-2 mb-2 rounded-2xl
    bg-[rgba(20,19,19,0.85)] backdrop-blur-[16px]">
    <div className="flex items-center justify-around py-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1",
              "px-4 py-2 rounded-xl transition-all duration-200",
              "min-w-[64px] min-h-[56px]",
              isActive
                ? "bg-[#6001d1]/20 text-[#d2bbff]"
                : "text-[#c4c7c7] active:bg-white/5"
            )}
          >
            <tab.icon size={24} strokeWidth={1.5} />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  </div>
</nav>
```

### 6.3 Tab Content Transition

```css
/* In globals.css */
@keyframes tab-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes tab-slide-in {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

.animate-tab-fade {
  animation: tab-fade-in 0.2s ease-out;
}

.animate-tab-slide {
  animation: tab-slide-in 0.25s ease-out;
}
```

### 6.4 Tab Mapping

| Tab | Content | Icon |
|-----|---------|------|
| **Chat** | ChatPanel (full width) | `MessageSquare` (lucide) |
| **Resume** | CanvasPanel (full width, no ATS widget) | `FileText` (lucide) |
| **Score** | ATSScoreWidget (full screen, detailed breakdown) | `BarChart3` (lucide) |

---

## 7. Animations

### 7.1 Typing Dots

```css
/* In globals.css */
.typing-dot {
  animation: typing 1.4s infinite ease-in-out both;
}
.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }
.typing-dot:nth-child(3) { animation-delay: 0s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
```

**Usage:** Three `<span>` elements inside `TypingIndicator`, each 6px, rounded-full, bg-[#d2bbff].

### 7.2 Pulse Ring

```css
/* In globals.css */
.pulse-ring {
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }
  100% {
    transform: scale(0.8);
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
}
```

**Usage:** A `div` inside `ATSScoreWidget` positioned absolutely over the circular progress bar.

### 7.3 Shimmer

```css
/* Already exists in globals.css */
.animate-shimmer {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(90deg, #6001d1 0%, #4F46E5 50%, #6001d1 100%);
  background-size: 200% auto;
}

@keyframes shimmer {
  0% { background-position: 0% center; }
  100% { background-position: -200% center; }
}
```

**Usage:** Skeleton blocks in `CanvasPanel` when resume is empty or loading.

### 7.4 Fade-In for Messages

```css
@keyframes message-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-message-in {
  animation: message-fade-in 0.3s ease-out;
}
```

**Usage:** Each new message in `MessageList` gets this class.

### 7.5 Slide for Mobile Tabs

```css
@keyframes tab-slide-in {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

.animate-tab-slide {
  animation: tab-slide-in 0.25s ease-out;
}
```

**Usage:** Tab content container in mobile mode.

### 7.6 ATS Score Transition

The SVG `stroke-dashoffset` transition is handled via CSS:

```css
.ats-score-arc {
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 8. Styling System

### 8.1 Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#141313` | Page background |
| `--text-primary` | `#e5e2e1` | Primary text |
| `--text-secondary` | `#c4c7c7` | Secondary/muted text |
| `--accent-purple` | `#6001d1` | Primary accent (buttons, highlights) |
| `--accent-indigo` | `#4F46E5` | Secondary accent (gradients, ATS) |
| `--accent-light` | `#d2bbff` | Light purple (labels, icons) |
| `--glass-bg` | `rgba(20, 19, 19, 0.7)` | Glass panel background |
| `--glass-border` | `rgba(255, 255, 255, 0.08)` | Glass panel border |
| `--online-green` | `#4ae176` | Online indicator |
| `--chat-bubble` | `#2b2a2a` | AI message bubble background |
| `--user-bubble` | `#6001d1` | User message bubble background |

### 8.2 Glass Panel Utility

```css
.glass-panel {
  background: rgba(20, 19, 19, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### 8.3 Aura Glow

```css
.chat-glow {
  box-shadow: 0 0 20px rgba(96, 1, 209, 0.15);
  border: 1px solid rgba(96, 1, 209, 0.3);
}

.ats-glow {
  box-shadow:
    0 0 30px rgba(79, 70, 229, 0.25),
    inset 0 0 20px rgba(79, 70, 229, 0.1);
}
```

### 8.4 Tailwind Config Additions

No config changes needed — all styling uses inline classes or custom CSS in `globals.css`. The existing `@theme` block and `glass`, `glass-card`, `glow` classes are sufficient.

---

## 9. Data Flow

### 9.1 Store Wiring

```
┌─────────────────────────────────────────────────────────────┐
│                        SplitScreen                           │
│                                                              │
│  ┌────────────────────────┐    ┌──────────────────────────┐ │
│  │      ChatPanel         │    │       CanvasPanel         │ │
│  │                        │    │                           │ │
│  │  useChatStore          │    │  useResumeStore           │ │
│  │  ├─ session.messages   │    │  ├─ resume (full data)   │ │
│  │  ├─ inputValue         │    │  ├─ activeSection         │ │
│  │  ├─ isStreaming        │    │  └─ history (undo/redo)   │ │
│  │  └─ addMessage()       │    │                           │ │
│  │                        │    │  useATSStore              │ │
│  │  ┌──────────────────┐  │    │  ├─ score (overall +      │ │
│  │  │ Canvas Sync via  │  │    │  │   breakdown)           │ │
│  │  │ CustomEvent      │  │    │  ├─ isAnalyzing           │ │
│  │  │ 'focus-chat'     │◄─┼────┼──┤  └─ suggestions         │ │
│  │  └──────────────────┘  │    │                           │ │
│  └────────────────────────┘    └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Event Flow

```
1. User types message in ChatInput
   → useChatStore.addMessage('user', text)
   → API call to /api/generate or /api/update
   → useChatStore.setIsStreaming(true)

2. AI responds (streaming)
   → useChatStore.addMessage('assistant', '')
   → For each chunk: useChatStore.updateLastMessage(chunk)
   → On complete: useChatStore.setIsStreaming(false)
   → useATSStore.setScore(newScore)  // if ATS was recalculated
   → useResumeStore.updateField(...)  // if resume was updated

3. User taps a section in CanvasPanel
   → useResumeStore.setActiveSection('experience')
   → window.dispatchEvent(new CustomEvent('focus-chat', { detail: { section: 'experience' } }))
   → ChatPanel listens, scrolls to context, updates input placeholder

4. User clicks "Apply" on suggestion chip
   → useResumeStore.applySuggestion(blocks)
   → useATSStore.applySuggestion(suggestionId)
   → CanvasPanel re-renders with updated resume
```

### 9.3 Store Selectors (Performance)

To prevent unnecessary re-renders, use granular selectors:

```typescript
// ChatPanel — only re-render on messages change
const messages = useChatStore((s) => s.session.messages);
const isStreaming = useChatStore((s) => s.isStreaming);

// CanvasPanel — only re-render on resume data change
const resume = useResumeStore((s) => s.resume);
const activeSection = useResumeStore((s) => s.activeSection);

// ATSScoreWidget — only re-render on score change
const score = useATSStore((s) => s.score);
const isAnalyzing = useATSStore((s) => s.isAnalyzing);
```

---

## 10. Implementation Order

### Phase 2.1 — Foundation (Day 1)

| Order | File | Description |
|-------|------|-------------|
| 1 | `src/types/split-screen.ts` | SplitScreen types (NEW) |
| 2 | `src/types/chat.ts` | Extend `ChatMessage` with `hasActions`, `isStreaming` |
| 3 | `src/types/canvas.ts` | Extend with `CanvasPanelProps`, `ATSScoreWidgetProps` |
| 4 | `src/app/globals.css` | Add animation keyframes: `typing`, `pulse-ring`, `message-fade-in`, `tab-fade-in`, `tab-slide-in`, `ats-score-arc` |
| 5 | `src/components/SplitScreen.tsx` | SplitScreen with drag handle + mobile detection |

### Phase 2.2 — ChatPanel (Day 1–2)

| Order | File | Description |
|-------|------|-------------|
| 6 | `src/components/ChatPanel.tsx` | Main ChatPanel container |
| 7 | `src/components/ChatPanel/ChatHeader.tsx` | Agent avatar, name, online indicator |
| 8 | `src/components/ChatPanel/SessionBadge.tsx` | Session info badge |
| 9 | `src/components/ChatPanel/MessageList.tsx` | Scrollable message container with auto-scroll |
| 10 | `src/components/ChatPanel/AgentMessage.tsx` | AI message bubble with avatar |
| 11 | `src/components/ChatPanel/UserMessage.tsx` | User message bubble |
| 12 | `src/components/ChatPanel/TypingIndicator.tsx` | Three animated dots |
| 13 | `src/components/ChatPanel/SuggestionChips.tsx` | Apply / Details buttons |
| 14 | `src/components/ChatPanel/ChatInput.tsx` | Text input + send button |

### Phase 2.3 — CanvasPanel (Day 2–3)

| Order | File | Description |
|-------|------|-------------|
| 15 | `src/components/CanvasPanel.tsx` | Main CanvasPanel container |
| 16 | `src/components/CanvasPanel/ResumeCanvas.tsx` | Resume renderer with sections |
| 17 | `src/components/CanvasPanel/ResumeHeader.tsx` | Name, title, contacts |
| 18 | `src/components/CanvasPanel/ResumeSection.tsx` | Clickable section block |
| 19 | `src/components/CanvasPanel/ATSScoreWidget.tsx` | Floating score widget with SVG circle |
| 20 | `src/components/CanvasPanel/CircularScore.tsx` | SVG circular progress with gradient |
| 21 | `src/components/CanvasPanel/PulseRing.tsx` | Animated pulsing ring |

### Phase 2.4 — Mobile & Integration (Day 3)

| Order | File | Description |
|-------|------|-------------|
| 22 | `src/components/MobileTabBar.tsx` | Bottom tab bar for mobile |
| 23 | `src/app/workspace/page.tsx` | NEW route — renders SplitScreen |
| 24 | `src/app/layout.tsx` | Conditionally hide Header/MobileNav on `/workspace` |
| 25 | `src/components/CanvasPanel/ShimmerSkeleton.tsx` | Loading skeleton for canvas |

### Phase 2.5 — Polish (Day 4)

| Order | Task | Description |
|-------|------|-------------|
| 26 | Animations | Verify all CSS keyframes, transitions, and timing |
| 27 | Responsive | Test at 320px, 768px, 1024px, 1440px |
| 28 | Touch | Verify splitter drag on mobile, tab switching |
| 29 | A11y | ARIA labels on splitter, keyboard nav for tabs |
| 30 | Edge cases | Empty resume, long messages, rapid sends, network errors |

---

## Appendix A: File Summary

| File | Action | Lines (est.) |
|------|--------|-------------|
| `src/types/split-screen.ts` | CREATE | 25 |
| `src/types/chat.ts` | MODIFY | +5 |
| `src/types/canvas.ts` | MODIFY | +15 |
| `src/app/globals.css` | MODIFY | +60 |
| `src/components/SplitScreen.tsx` | CREATE | 120 |
| `src/components/ChatPanel.tsx` | CREATE | 200 |
| `src/components/ChatPanel/ChatHeader.tsx` | CREATE | 50 |
| `src/components/ChatPanel/SessionBadge.tsx` | CREATE | 20 |
| `src/components/ChatPanel/MessageList.tsx` | CREATE | 60 |
| `src/components/ChatPanel/AgentMessage.tsx` | CREATE | 50 |
| `src/components/ChatPanel/UserMessage.tsx` | CREATE | 30 |
| `src/components/ChatPanel/TypingIndicator.tsx` | CREATE | 25 |
| `src/components/ChatPanel/SuggestionChips.tsx` | CREATE | 40 |
| `src/components/ChatPanel/ChatInput.tsx` | CREATE | 50 |
| `src/components/CanvasPanel.tsx` | CREATE | 80 |
| `src/components/CanvasPanel/ResumeCanvas.tsx` | CREATE | 100 |
| `src/components/CanvasPanel/ResumeHeader.tsx` | CREATE | 40 |
| `src/components/CanvasPanel/ResumeSection.tsx` | CREATE | 50 |
| `src/components/CanvasPanel/ATSScoreWidget.tsx` | CREATE | 80 |
| `src/components/CanvasPanel/CircularScore.tsx` | CREATE | 60 |
| `src/components/CanvasPanel/PulseRing.tsx` | CREATE | 20 |
| `src/components/CanvasPanel/ShimmerSkeleton.tsx` | CREATE | 40 |
| `src/components/MobileTabBar.tsx` | CREATE | 60 |
| `src/app/workspace/page.tsx` | CREATE | 30 |
| `src/app/layout.tsx` | MODIFY | +10 |

**Total new files:** 20  
**Total modified files:** 4  
**Estimated total lines:** ~1,360

---

## Appendix B: Dependencies

All dependencies are already in `package.json`:

| Package | Version | Used By |
|---------|---------|---------|
| `react` | ^19.2.4 | All components |
| `zustand` | ^5.0.14 | All stores |
| `nanoid` | ^5.1.16 | Message IDs |
| `react-circular-progressbar` | ^2.2.0 | ATS Score (optional — we use SVG directly) |
| `lucide-react` | ^0.544.0 | Mobile tab icons |
| `clsx` | ^2.1.1 | Conditional classes |
| `tailwind-merge` | ^3.3.1 | `cn()` utility |

No new npm packages required.
