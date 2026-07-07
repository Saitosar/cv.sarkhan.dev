# Stitch Implementation Plan — Refined

**Date:** 2026-07-07
**Status:** Blocks 1, 2, 7 ✅ DONE | Blocks 3–6 remaining
**Reference:** `designs/stitch-confidence-final.html`

---

## Current State Summary

| Block | Status | Notes |
|-------|--------|-------|
| 1 — Form deletion | ✅ DONE | Pages removed, redirects in place |
| 2 — SideNav | ✅ DONE | SideNav.tsx exists, integrated in ClientLayoutWrapper |
| 7 — CSS animations | ✅ DONE | All Stitch classes in globals.css (shimmer-bg, chat-glow, ats-glow, pulse-ring, typing-dot, glass-panel) |
| 3 — Home page | 🔄 Minor | Feature icons: lucide-react vs Material Symbols decision |
| 4 — Workspace | ✅ DONE | QuickActionButtons already in ChatPanel.tsx (lines 84–88, 101–121). All sub-components Stitch-compliant. |
| 5 — Pricing | 🔄 Minor | ATS Score preview for Pro plan missing |
| 6 — Telegram | 🔄 Minor | ATS Score mini-widget missing (Quick Actions already render via ChatPanel) |

---

## Stitch Design Tokens (from reference)

```
Primary purple:    #6001d1
Indigo accent:     #4F46E5
Light purple:      #d2bbff
Text primary:      #e5e2e1
Text secondary:    #c4c7c7
Text muted:        #e0e0e0
Bg dark:           #141313
Bg card:           #1c1b1b
Bg lighter:        #2b2a2a / #353434
Online green:      #4ae176
Border:            rgba(255,255,255,0.08)
```

---

## Block 3: Home Page — Stitch Color Compliance

**File:** `src/app/page.tsx`

### What's already correct
- Hero heading + subtitle — fine
- CTA "Open Workspace" — `shimmer-bg` class ✓
- Feature cards use `glass-panel` + `gradient-border` ✓
- Feature icon colors use `text-[#6001d1]` ✓
- Footer links + copyright — fine

### Decision needed: lucide-react → Material Symbols?

**Current:** Feature grid uses `lucide-react` icons (`ShieldCheck`, `Bot`, `Rocket`).
**Stitch reference:** Uses `material-symbols-outlined` everywhere (dashboard, description, work, insights, smart_toy, psychology, add, send).

**Recommendation:** Switch to Material Symbols for visual consistency with the rest of the app (SideNav, ChatHeader, ChatInput all use Material Symbols). This avoids mixing icon families.

### Changes required

1. **Remove lucide-react import** (line 2):
   ```tsx
   // Remove:
   import { ShieldCheck, Bot, Rocket } from "lucide-react";
   ```

2. **Replace icon JSX in Feature component** (line 16):
   ```tsx
   // Current:
   <ShieldCheck size={32} strokeWidth={1.5} className="text-[#6001d1]" />
   // → Replace with:
   <span className="material-symbols-outlined text-3xl text-[#6001d1]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
   ```

3. **Icon mapping:**
   | Current (lucide) | → Material Symbol | Notes |
   |---|---|---|
   | `ShieldCheck` | `verified` | Filled variant for emphasis |
   | `Bot` | `smart_toy` | Matches ChatHeader icon |
   | `Rocket` | `rocket_launch` | |

4. **No other changes needed** — colors, layout, footer all Stitch-compliant.

**Effort:** ~10 minutes

---

## Block 4: Workspace — Verification Only

**File:** `src/app/workspace/page.tsx` + sub-components

### Verified ✅ (no changes needed)

| Component | Stitch check | Status |
|-----------|-------------|--------|
| ChatPanel.tsx | QuickActionButtons (Import LinkedIn, Tailor for Job, Improve ATS) present above ChatInput | ✅ |
| ChatHeader.tsx | smart_toy icon, Online status, #6001d1 colors | ✅ |
| SessionBadge.tsx | `focus` prop wired from `resume.targetJob?.title` | ✅ |
| ChatInput.tsx | Stitch placeholder, colors, send icon | ✅ |
| AgentMessage.tsx | chat-glow, rounded-2xl, rounded-tl-none | ✅ |
| ATSScoreWidget.tsx | ats-glow, pulse-ring, glass-panel, #4F46E5 border | ✅ |
| SuggestionPanel.tsx | glass-panel, #6001d1 badge, #d2bbff accent | ✅ |
| QuickActionButton | glass-panel, material-symbols-outlined icons | ✅ |

**Effort:** 0 — already done.

---

## Block 5: Pricing — ATS Score Preview for Pro

**File:** `src/app/pricing/page.tsx` + `src/components/Billing/PricingCard.tsx`

### What's already correct
- FAQ items use `glass-panel` ✓
- PricingCard uses `#6001d1` for Pro badge, `#8B5CF6` border glow, `#d2bbff` check icons ✓
- "Most Popular" badge on Pro plan ✓
- CTA button uses `bg-[#6001d1]` with purple glow shadow ✓

### What's missing
- **ATS Score preview** for the Pro plan card — show a mini ATS score ring to visually demonstrate what Pro unlocks

### Changes required

**In `src/app/pricing/page.tsx`:**

1. **Add ATS Score preview to Pro plan features** — insert a visual ATS score ring between the feature list and the CTA button in the Pro card. This is best done by adding a `showATSPreview` prop to `PricingCard`.

**In `src/components/Billing/PricingCard.tsx`:**

1. **Add `showATSPreview` prop** (optional, default false):
   ```tsx
   export interface PricingCardProps {
     plan: SubscriptionPlan;
     isCurrent: boolean;
     onSubscribe: () => void;
     showATSPreview?: boolean;
   }
   ```

2. **Render ATS preview when `showATSPreview && isPro`** — insert after the feature list (`<ul>`) and before the CTA button:
   ```tsx
   {showATSPreview && isPro && (
     <div className="mb-6 p-4 rounded-xl bg-[#6001d1]/10 border border-[#d2bbff]/20">
       <div className="flex items-center gap-4">
         <div className="relative w-16 h-16 flex items-center justify-center">
           <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
             <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
             <circle cx="50" cy="50" fill="none" r="45" stroke="url(#atsGrad)" strokeDasharray="282.7" strokeDashoffset="56.5" strokeLinecap="round" strokeWidth="8" />
             <defs>
               <linearGradient id="atsGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                 <stop offset="0%" stopColor="#4F46E5" />
                 <stop offset="100%" stopColor="#d2bbff" />
               </linearGradient>
             </defs>
           </svg>
           <span className="text-xl text-[#e5e2e1] relative z-10 font-bold">80<span className="text-xs">%</span></span>
         </div>
         <div className="flex-1">
           <p className="text-sm font-semibold text-[#e5e2e1]">AI-Powered ATS Scoring</p>
           <p className="text-xs text-[#c4c7c7] mt-1">Real-time analysis against any job description</p>
         </div>
       </div>
     </div>
   )}
   ```

3. **Pass `showATSPreview` in pricing page** (line 88):
   ```tsx
   <PricingCard
     key={plan.id}
     plan={plan}
     isCurrent={tier === plan.tier}
     onSubscribe={() => handleSubscribe(plan)}
     showATSPreview={plan.tier === 'pro'}
   />
   ```

**Effort:** ~15 minutes

---

## Block 6: Telegram — ATS Score Mini-Widget

**File:** `src/app/telegram/page.tsx`

### What's already correct
- Uses `<ChatPanel>` — QuickActionButtons already render via ChatPanel ✓
- Telegram-specific theme variables (`var(--tg-*)`) ✓
- Back button + Main button ✓

### What's missing
- **ATS Score mini-widget** — a compact version of ATSScoreWidget adapted for Telegram's narrow WebView

### Changes required

**In `src/app/telegram/page.tsx`:**

1. **Add ATS Score mini-widget** above the ChatPanel, inside the Telegram content area (after the `TelegramMainButton` and before the ChatPanel div):

   ```tsx
   {/* ATS Score mini-widget */}
   <div className="px-4 py-2">
     <div className="glass-panel rounded-xl p-3 flex items-center gap-3 border border-[#4F46E5]/20">
       <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
         <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
           <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
           <circle cx="50" cy="50" fill="none" r="45" stroke="url(#tgAtsGrad)" strokeDasharray="282.7" strokeDashoffset="56.5" strokeLinecap="round" strokeWidth="8" />
           <defs>
             <linearGradient id="tgAtsGrad" x1="0%" x2="100%" y1="0%" y2="0%">
               <stop offset="0%" stopColor="#4F46E5" />
               <stop offset="100%" stopColor="#d2bbff" />
             </linearGradient>
           </defs>
         </svg>
         <span className="text-xs text-[#e5e2e1] relative z-10 font-bold">80<span className="text-[8px]">%</span></span>
       </div>
       <div className="flex-1 min-w-0">
         <p className="text-xs font-semibold text-[#e5e2e1]">ATS Match</p>
         <p className="text-[10px] text-[#c4c7c7] truncate">Target: Senior DevOps Engineer</p>
       </div>
       <button
         type="button"
         className="text-[10px] px-2.5 py-1 rounded-lg bg-[#6001d1]/20 text-[#d2bbff] border border-[#d2bbff]/30 hover:bg-[#6001d1]/30 transition-colors flex-shrink-0"
       >
         Improve
       </button>
     </div>
   </div>
   ```

2. **Note:** The Quick Actions (Import LinkedIn, Tailor for Job) are already rendered by `<ChatPanel>` — no additional work needed there.

**Effort:** ~15 minutes

---

## Priority Order

```
1. Block 3: Home page icons swap     (~10 min)  — quick win, visible on landing
2. Block 5: Pricing ATS preview      (~15 min)  — sells Pro plan
3. Block 6: Telegram ATS mini-widget  (~15 min)  — Telegram UX parity
```

**Total remaining effort:** ~40 minutes

---

## Stitch Color Compliance Checklist (all pages)

| Token | Hex | Used where | Status |
|-------|-----|-----------|--------|
| Primary purple | `#6001d1` | SideNav active, CTA buttons, Pro badge, feature icons, chat glow | ✅ |
| Indigo accent | `#4F46E5` | ATS glow, gradient border, ATS ring | ✅ |
| Light purple | `#d2bbff` | Expert Mode badge, send icon, check icons, ATS label | ✅ |
| Text primary | `#e5e2e1` | All headings, body text | ✅ |
| Text secondary | `#c4c7c7` | Subtle labels, placeholder, FAQ answers | ✅ |
| Bg dark | `#141313` | Page background, glass-panel base | ✅ |
| Bg card | `#1c1b1b` | SideNav, ChatInput | ✅ |
| Online green | `#4ae176` | Online status dot + shadow | ✅ |
| Border | `rgba(255,255,255,0.08)` | All panel borders | ✅ |

---

## Files to modify (complete list)

| File | Change | Block |
|------|--------|-------|
| `src/app/page.tsx` | Swap lucide-react icons → Material Symbols | 3 |
| `src/components/Billing/PricingCard.tsx` | Add `showATSPreview` prop + render ATS ring | 5 |
| `src/app/pricing/page.tsx` | Pass `showATSPreview` to Pro PricingCard | 5 |
| `src/app/telegram/page.tsx` | Add ATS Score mini-widget above ChatPanel | 6 |

**No new components to create.** All changes are modifications to existing files.
