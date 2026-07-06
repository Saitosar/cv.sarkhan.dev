export interface ChatPromptInput {
  message: string;
  resumeData?: Record<string, unknown>;
  jobDescription?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function buildChatPrompt(input: ChatPromptInput): string {
  const parts: string[] = [];

  if (input.resumeData) {
    parts.push(`[CURRENT RESUME CONTEXT]\n${JSON.stringify(input.resumeData, null, 2)}\n`);
  }

  if (input.jobDescription) {
    parts.push(`[TARGET JOB DESCRIPTION]\n${input.jobDescription}\n`);
  }

  if (input.history && input.history.length > 0) {
    const recentHistory = input.history.slice(-10);
    parts.push(
      `[CONVERSATION HISTORY]\n${recentHistory
        .map((m) => `${m.role === 'user' ? 'User' : 'Aether'}: ${m.content}`)
        .join('\n')}\n`
    );
  }

  parts.push(`[USER MESSAGE]\n${input.message}\n`);

  return parts.join('\n---\n');
}
