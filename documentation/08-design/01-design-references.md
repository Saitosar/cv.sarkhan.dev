# Design References

**Status:** Draft  
**Last Updated:** 2026-07-03  
**Owner:** CTO (Sarkhan)

## Design Inspiration

| Reference | Why | Key Elements to Steal |
|-----------|-----|----------------------|
| **Linear** | Minimalism, dark theme, clean typography | Sidebar navigation, subtle animations, monochrome palette |
| **Vercel** | Geometric precision, excellent typography | Dark/light balance, spacing system, component consistency |
| **Arc Browser** | Innovative UI, smooth animations | Split-screen patterns, command bar, micro-interactions |
| **ChatGPT** | Conversational UI, simplicity | Chat bubbles, streaming text, suggestion chips |
| **Claude** | Minimalist chat, clean interface | Clean message layout, code blocks, file attachments |

## Color Palette

```css
:root {
  /* Dark theme (default) */
  --bg-primary: #0a0a0b;
  --bg-secondary: #18181b;
  --bg-tertiary: #27272a;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-tertiary: #71717a;
  --accent: #6366f1;        /* Indigo */
  --accent-hover: #818cf8;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --border: #27272a;
  --glass: rgba(255, 255, 255, 0.03);
}
```

## Typography

```css
/* Font system */
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
}
```

## Split-Screen Layout

```
┌──────────────────────────────────────────────┐
│  Header (Logo, Settings, Pro badge)          │
├──────────────┬───────────────────────────────┤
│              │                               │
│   Chat       │   Interactive Canvas          │
│   (30-35%)   │   (65-70%)                    │
│              │                               │
│  ┌────────┐  │  ┌─────────────────────────┐  │
│  │ Agent  │  │  │  Resume Preview         │  │
│  │ avatar │  │  │  ┌───────────────────┐ │  │
│  │        │  │  │  │ Name, Title       │ │  │
│  │ "Hi!   │  │  │  ├───────────────────┤ │  │
│  │  Let's │  │  │  │ Experience         │ │  │
│  │  build"│  │  │  │ • Senior Dev...   │ │  │
│  └────────┘  │  │  │ • Optimized DB... │ │  │
│              │  │  ├───────────────────┤ │  │
│  [Input] 🎤  │  │  │ Skills            │ │  │
│              │  │  └───────────────────┘ │  │
│              │  │  [ATS: 85/100]         │  │
│              │  └─────────────────────────┘  │
└──────────────┴───────────────────────────────┘
```
