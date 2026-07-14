# UX/UI Audit Report — cv.sarkhan.dev

**URL Audited:** https://cv-sarkhan-dev.vercel.app/
**Status:** Critical Review
**Overall Score:** 4.5/10

---

## 🚀 Executive Summary
The platform presents a visually polished "Dark Glass" aesthetic that aligns with modern AI SaaS trends. However, the current user experience is severely hampered by critical functional failures (HTTP 500 errors in chat) and significant "UI gaps" where visual components exist but behave like placeholders. The "Confidence/Stitch" design language is present in the shell but fails in the details (missing fonts, invisible handles, and broken flows).

---

## 📸 Visual Inventory & References
- **Landing Page:** [MEDIA:/root/.hermes/cache/screenshots/browser_screenshot_02e0cfdbfedd41868c46934672ba3f75.png]
- **Workspace (Chat/Canvas):** [MEDIA:/root/.hermes/cache/screenshots/browser_screenshot_c9298d1d165a4ddc9c75defd8973fa35.png]
- **Pricing Page:** [MEDIA:/root/.hermes/cache/screenshots/browser_screenshot_508bf683fb1f444d8191451992550b36.png]
- **Telegram Landing:** [MEDIA:/root/.hermes/cache/screenshots/browser_screenshot_6eaac6e7366d4cbaafe6040275c03ac8.png]
- **404 State (Login/Register):** [MEDIA:/root/.hermes/cache/screenshots/browser_screenshot_62c3039ee6574fbab4f75d9339ac27e5.png]

---

## 🔍 Detailed Findings

### 1. Visual Design & "Confidence" Consistency
**Finding:** The "Glassmorphism" shell is high-quality, but the "Sarthan/Stitch" design system is incomplete.
- **P0: Missing Material Symbols.** Icons like `smart_toy`, `send`, and `refresh` are rendered as plain text. This is a critical failure of the design system's implementation.
- **P1: Invisible Interaction Handles.** The `SplitScreen` drag handle is nearly invisible (1.5px, low contrast). It lacks a "grip" icon or hover state, making the split-screen feature undiscoverable.
- **P1: Font Inconsistency.** A mix of Geist and Inter is used without a clear typographic scale, leading to a slightly disjointed feel in long-form text.

### 2. Workspace Usability (The "Core Loop")
**Finding:** The core AI-driven resume creation loop is completely broken.
- **P0: Backend Dead-End.** All chat interactions return an HTTP 500 error. The UI clears the user's input upon failure, causing data loss and frustration.
- **P1: Demotivating Empty State.** The ATS Score displays `0%` immediately for new users. Showing a "failing" grade before any data is entered is a negative UX pattern.
- **P2: Repetitive Paywalls.** The `ProFeatureGate` appears twice (once for HR Coach, once for Suggestions), creating a redundant and intrusive "nag" experience.

### 3. Payment & Subscription Flow
**Finding:** The pricing page is a high-fidelity mockup rather than a functional product.
- **P1: Trust Gap (Stub Mode).** The FAQ explicitly states that billing is in "stub mode" and payment processing is disabled. This destroys trust for any user ready to convert.
- **P2: Lack of Feedback.** The "Subscribe" button provides no loading states or confirmation modals, simply updating a local state.

### 4. Authentication & Telegram Integration
**Finding:** The authentication journey is non-existent or broken.
- **P0: Dead Auth Links.** `/login` and `/register` both return 404 errors. Users have no way to create a permanent account.
- **P1: Telegram Fallback.** The Telegram page is a simple bridge. It lacks a deep-link (`tg://`) or a bot username, making the "Open in Telegram" action ambiguous.

---

## 📊 Summary Table

| Priority | Finding | Impact | Recommended Fix |
| :--- | :--- | :--- | :--- |
| **P0** | Chat HTTP 500 | Blocker | Fix `/api/ai/route` and add "Retry" button. |
| **P0** | Missing Icons | Visual Fail | Import Material Symbols font in `layout.tsx`. |
| **P0** | 404 on Login/Reg | Blocker | Implement/Fix Auth routes. |
| **P1** | Invisible Drag Handle | UX Friction | Add 3-dot grip and widen hover area to 8px. |
| **P1** | 0% ATS Score | Psychological | Hide score until content is present. |
| **P2** | Stub Pricing | Trust Loss | Implement real payment gateway or "Waitlist" CTA. |
| **P2** | Duplicate Paywalls | Friction | Consolidate `ProFeatureGate` into a single workspace overlay. |

---

## 🏁 Conclusion
The project has an impressive "visual shell" but is currently a **prototype disguised as a product**. To move from a 4.5 to an 8+, the team must prioritize **functional reliability (Auth + Chat)** over visual polish. The "Confidence" design language must be fully implemented (Icons + Typography) to ensure the professional credibility of a tool designed for high-stakes career moves.
