export interface ATSScorePromptInput {
  resumeData: Record<string, unknown>;
  jobDescription?: string;
}

export function buildATSScorePrompt(input: ATSScorePromptInput): string {
  return `Analyze the following resume data and job description (if provided) for ATS compatibility.

**Resume Data:**
${JSON.stringify(input.resumeData, null, 2)}

${input.jobDescription ? `**Target Job Description:**\n${input.jobDescription}\n` : ''}

**Instructions:**
- Score the resume 0-100 for ATS compatibility
- Provide breakdown scores for: keywords, formatting, completeness, readability
- List matched and missing keywords (if job description provided)
- Provide 3-5 actionable suggestions for improvement
- Return ONLY valid JSON — no markdown wrapping, no commentary

**Output Schema:**
{
  "overall": number,
  "breakdown": {
    "keywords": number,
    "formatting": number,
    "completeness": number,
    "readability": number
  },
  "suggestions": string[],
  "matchedKeywords": string[],
  "missingKeywords": string[]
}`;
}
