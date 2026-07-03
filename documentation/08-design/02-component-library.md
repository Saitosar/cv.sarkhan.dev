# Component Library

**Status:** Draft  
**Last Updated:** 2026-07-03  
**Owner:** CTO (Sarkhan)

## Component Tree

```
Layout/
├── AppShell
│   ├── Header (logo, nav, pro badge, settings)
│   ├── SplitScreen
│   │   ├── ChatPanel (left, 30-35%)
│   │   └── CanvasPanel (right, 65-70%)
│   └── MobileNav (bottom nav for mobile)

ChatPanel/
├── ChatHeader (agent avatar, name, status)
├── MessageList
│   ├── AgentMessage (avatar + text + actions)
│   ├── UserMessage (text + timestamp)
│   └── SystemMessage (status updates, errors)
├── SuggestionChips (quick action buttons)
├── VoiceButton (microphone with recording indicator)
└── ChatInput (text input + send + attach)

CanvasPanel/
├── ResumeCanvas
│   ├── ResumeHeader (name, title, contact)
│   ├── SectionBlock (clickable, with ATS highlight)
│   │   ├── SectionHeader (title + edit button)
│   │   └── SectionContent (text, bullets, metrics)
│   ├── ATSScoreBadge (animated score display)
│   └── ActionToolbar (download, share, save)
├── TemplateSelector (3 templates)
├── ColorPalette (color themes)
└── SkeletonPreview (loading state)

Shared/
├── Button (variants: primary, secondary, ghost, danger)
├── Input (text, textarea, select)
├── Badge (status, score, pro)
├── Tooltip
├── Modal
├── Toast (success, error, warning, info)
├── Spinner
└── Avatar
```

## Key Components

### ChatMessage
```tsx
interface ChatMessageProps {
  role: 'agent' | 'user' | 'system';
  content: string;
  actions?: Action[];
  timestamp: Date;
  streaming?: boolean;
}
```

### ResumeSection
```tsx
interface ResumeSectionProps {
  type: 'experience' | 'education' | 'skills' | 'summary';
  data: any;
  atsScore?: number;
  onFocus: (section: string) => void;
  onEdit: (section: string, data: any) => void;
}
```

### ATSScoreBadge
```tsx
interface ATSScoreBadgeProps {
  score: number;
  dimensions: ATSScoreDimensions;
  animated?: boolean;
}
```
