export interface SuggestPromptInput {
  message: string;
  resumeData?: Record<string, unknown>;
  section?: string;
}

export function buildSuggestPrompt(input: SuggestPromptInput): string {
  return `You are a quick resume improvement assistant.

${input.resumeData ? `**Resume Context:**\n${JSON.stringify(input.resumeData, null, 2)}\n` : ''}
${input.section ? `**Focus Section:** ${input.section}\n` : ''}

**User Question:**
${input.message}

**Instructions:**
- Provide 2-3 concise, actionable suggestions
- Keep response under 200 words
- Focus on the most impactful changes
- Use plain text (no markdown)`;
}
