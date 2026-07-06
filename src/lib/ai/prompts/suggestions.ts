export interface SuggestionsPromptInput {
  message?: string;
  resumeData?: Record<string, unknown>;
  section?: string;
  sectionContent?: string;
  jobDescription?: string;
}

export function buildSuggestionsPrompt(input: SuggestionsPromptInput): string {
  const parts: string[] = [
    `Analyze the following resume section and return structured improvement suggestions.`,
  ];

  if (input.section) {
    parts.push(`Section: ${input.section}`);
  }

  if (input.sectionContent) {
    parts.push(`Section Content:\n${input.sectionContent}`);
  }

  if (input.resumeData) {
    parts.push(`Full Resume Context:\n${JSON.stringify(input.resumeData, null, 2)}`);
  }

  if (input.jobDescription) {
    parts.push(`Target Job Description:\n${input.jobDescription}`);
  }

  parts.push(
    `Return ONLY valid JSON with a top-level "suggestions" array. Each suggestion must include:`
  );
  parts.push(
    `- type: one of "missing_keywords", "weak_action_verbs", "format_issues", "content_gaps", "metrics_missing", "summary_improvement", "ats_score"`
  );
  parts.push(`- severity: one of "high", "medium", "low"`);
  parts.push(`- title: short title`);
  parts.push(`- description: clear, actionable explanation`);
  parts.push(`- action: object with "type" ("apply", "replace", "insert", "delete") and optional targetText/replacementText`);
  parts.push(`- atsImpact: optional number 0-10`);

  return parts.join('\n\n');
}
