// src/types/suggestions.ts

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

export interface SuggestionPanelState {
  suggestions: Suggestion[];
  activeSection: string | null;
  loading: boolean;
  error: string | null;
}

export interface SuggestionPanelProps {
  /** Suggestions for the currently active section */
  suggestions: Suggestion[];
  /** Whether AI is generating suggestions */
  isLoading: boolean;
  /** Error message to display */
  error?: string | null;
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
