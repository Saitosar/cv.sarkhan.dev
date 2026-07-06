// src/types/chat.ts

export type MessageRole = 'user' | 'assistant' | 'system';

export type SectionType =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'languages'
  | 'projects'
  | 'general';

export type ChatMode = 'aether' | 'hr-coach';

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
  /** Which chat mode produced this message */
  source?: ChatMode;
  /** Whether this message represents an error and may offer retry */
  isError?: boolean;
  /** Original user input preserved for retry after an error */
  retryInput?: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  focusSection: SectionType | null;
  status: 'idle' | 'loading' | 'ready' | 'chatting' | 'suggesting';
  /** Current chat mode */
  mode: ChatMode;
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
  /** Current chat mode */
  mode?: ChatMode;
  /** Called when mode toggle is clicked */
  onModeToggle?: () => void;
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

export interface MessageListProps {
  messages: ChatMessage[];
}

export interface SuggestionChip {
  id: string;
  label: string;            // "Apply", "Details"
  action: string;
  variant?: 'primary' | 'secondary';
}
