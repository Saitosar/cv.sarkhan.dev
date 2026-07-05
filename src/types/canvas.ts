// src/types/canvas.ts
// Из Canvas Sync Protocol (05-canvas-sync-protocol.md)

import type { ChatMessage } from './chat';

export interface ResumeBlock {
  id: string;
  section: string;
  type: 'experience' | 'skill' | 'education' | 'summary' | 'certification' | 'project';
  content: Record<string, unknown>;
  order: number;
  version: number;
}

// ── Canvas Panel Props ──
export interface CanvasPanelProps {
  /** Optional class override */
  className?: string;
}

export interface ResumeCanvasProps {
  resume: import('./resume').ResumeStoreData;
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
  type: import('./chat').SectionType;
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

// ── Canvas Events ──
export type CanvasEvent =
  | { type: 'BLOCK_TAPPED'; blockId: string; section: string }
  | { type: 'BLOCK_DRAGGED'; blockId: string; x: number; y: number }
  | { type: 'BLOCK_RESIZED'; blockId: string; width: number; height: number }
  | { type: 'BLOCK_DELETED'; blockId: string }
  | { type: 'SECTION_REORDERED'; section: string; fromIndex: number; toIndex: number }
  | { type: 'CANVAS_ZOOM_CHANGED'; zoom: number };

// ── Chat Events ──
export type ChatEvent =
  | { type: 'AI_SUGGESTION'; suggestionId: string; section: string; content: unknown }
  | { type: 'AI_APPLIED'; suggestionId: string }
  | { type: 'AI_REJECTED'; suggestionId: string }
  | { type: 'USER_MESSAGE'; messageId: string; text: string }
  | { type: 'UNDO'; targetId?: string }
  | { type: 'REDO' };

// ── Sync Events (bridge between chat & canvas) ──
export type SyncEvent =
  | { type: 'FOCUS_CHAT'; section: string; blockId: string }
  | { type: 'FOCUS_CANVAS'; section: string }
  | { type: 'CANVAS_UPDATED'; blocks: ResumeBlock[] }
  | { type: 'CHAT_UPDATED'; history: ChatMessage[] };
