export interface AnalyzePromptInput {
  resumeData: Record<string, unknown>;
  jobDescription?: string;
}

export function buildAnalyzePrompt(input: AnalyzePromptInput): string {
  return `You are a Resume Evaluator AI — a combination of an ATS scanner, a seasoned recruiter, and a professional career coach.

**Resume Data:**
${JSON.stringify(input.resumeData, null, 2)}

${input.jobDescription ? `**Target Job Description:**\n${input.jobDescription}\n` : ''}

**Instructions:**
- Score the resume 0-100
- Identify 3-5 key strengths
- Identify 3-5 areas for improvement
- Provide 3-5 actionable, specific recommendations with before/after examples
- Include a short motivational message
- Return ONLY valid JSON — no markdown wrapping

**Output Schema:**
{
  "resume_score": number,
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "mentorship_tone_example": string
}`;
}
