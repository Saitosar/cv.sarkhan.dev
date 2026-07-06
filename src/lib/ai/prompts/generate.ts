export interface GeneratePromptInput {
  resumeData: Record<string, unknown>;
  targetRole?: string;
}

export function buildGeneratePrompt(input: GeneratePromptInput): string {
  return `You are an expert resume writer. Generate a professional resume for ${input.targetRole || 'the target role'} based on the following user data.

**User Data:**
${JSON.stringify(input.resumeData, null, 2)}

**Instructions:**
- Use a clean, ATS-friendly format
- Highlight achievements with quantifiable metrics
- Write a compelling 3-4 sentence professional summary
- For each experience entry, generate 3-4 achievement-oriented bullet points
- Keep it to one page unless the user has >10 years of experience
- Return ONLY valid JSON matching the resume schema — no markdown wrapping`;
}
