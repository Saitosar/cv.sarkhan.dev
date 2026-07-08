# Positioning Task: "Why Aether vs ChatGPT/Claude?"

Implement the positioning content across 3 files:

## 1. Landing page — add a new comparison section
File: `/root/cv.sarkhan.dev/src/app/page.tsx`

Add a new section between the "How It Works" section (ends around line 86) and the "Everything you need to land interviews" section (starts around line 89).

The section should be a comparison grid that answers "Why not ChatGPT/Claude?" with these 6 points:

1. **ATS-Optimized** — ChatGPT doesn't know ATS parsers. Aether is trained on thousands of resumes and knows which keywords actually pass screening.
2. **Visual Editor** — ChatGPT gives text only. Aether has a Split-Screen: chat on the left, live Canvas with resume, ATS Score, PulseRing on the right. Real-time visual feedback.
3. **Specialized Tools** — AI Suggestions, HR Coach, Job Search, Voice Input. Not just a chat — a full career center.
4. **Privacy-First** — Guest data stays in LocalStorage, never leaves your browser. ChatGPT uses your data for training.
5. **Telegram Mini App** — Work directly from Telegram, no installation needed.
6. **Price** — $3/mo Pro vs $20/mo ChatGPT Plus.

Use the same glass-panel styling as the existing Feature components. Use the `Feature` component pattern already in the file. Add a compelling header: "Why Aether beats ChatGPT & Claude" with a subheader: "ChatGPT/Claude is a Swiss Army knife. Aether is a scalpel for your resume."

Use these icons from lucide-react (already imported): `ShieldCheck` (ATS), `Eye` (Visual), `Wrench` (Tools), `Lock` (Privacy), `Smartphone` (Telegram), `DollarSign` (Price). Add any missing imports.

## 2. Aether welcome message
File: `/root/cv.sarkhan.dev/src/stores/useChatStore.ts`

Update the initial assistant message (lines 33-34). Current:
```
"Hello! I'm Aether — your AI career expert. No prompt engineering needed — I already know what makes a great resume. Just send me a LinkedIn link, an old resume, or describe your experience. I'll read it, analyze it, and craft something ATS-optimized. No forms, no fuss."
```

New message:
```
"Hello! I'm Aether — your specialized AI career expert. Unlike general chatbots, I'm built specifically for resumes: I know ATS parsers, optimize for real recruiters, and show you live visual feedback. No prompt engineering needed — just send me a LinkedIn link, an old resume, or describe your experience. I'll read it, analyze it, and craft something ATS-optimized. No forms, no fuss."
```

## 3. Aether system prompt
File: `/root/cv.sarkhan.dev/src/lib/ai/config.ts`

Update the `chat` system prompt (line 38). Current:
```
`You are Aether, an AI Career Coach. You help users improve their resumes, provide career advice, and guide them through the job search process. Be supportive, professional, and actionable. Use markdown for formatting. When suggesting resume changes, be specific and provide before/after examples.`
```

New prompt:
```
`You are Aether, a specialized AI Career Coach — not a general chatbot. You are purpose-built for resume optimization, ATS parsing, and career coaching. You help users improve their resumes, provide career advice, and guide them through the job search process. Be supportive, professional, and actionable. Use markdown for formatting. When suggesting resume changes, be specific and provide before/after examples. Emphasize that unlike general AI tools, you provide specialized ATS optimization, live visual feedback, and targeted career tools.`
```

## IMPORTANT
- Maintain the exact same styling patterns (glass-panel, gradient-border, font-display, text colors)
- Do NOT break any existing functionality
- Keep the page responsive (grid-cols-1 md:grid-cols-2 for the comparison grid)
- Run `npm run build` after changes to verify no errors
