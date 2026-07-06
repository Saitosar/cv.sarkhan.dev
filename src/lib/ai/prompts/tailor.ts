export interface TailorPromptInput {
  resumeData: Record<string, unknown>;
  jobDescription: string;
  jobTitle?: string;
}

export function buildTailorPrompt(input: TailorPromptInput): string {
  return `You are a Resume Strategist and ATS Optimization Specialist.

**Mission:** Transform the provided resume to PERFECTLY align with the target job.

**Original Resume:**
${JSON.stringify(input.resumeData, null, 2)}

**Target Job:**
Title: ${input.jobTitle || 'Not provided'}
Description: ${input.jobDescription}

**Instructions:**
1. Extract ALL critical keywords from the job description
2. Strategically weave keywords throughout the resume (summary, experience, skills)
3. Rewrite the summary to position the candidate as the ideal fit
4. Reframe experience to emphasize achievements relevant to the target role
5. Prioritize skills mentioned in the job posting
6. Return ONLY valid JSON — no markdown wrapping

**Output Schema:**
{
  "fullName": string,
  "jobTitle": string,
  "summary": string,
  "contact": { "email": string, "phone": string },
  "experience": [{ "company": string, "position": string, "description": string, "startDate": { "month": string, "year": string }, "endDate": { "month": string, "year": string, "isCurrent": boolean } }],
  "skills": [{ "value": string }],
  "education": [{ "institution": string, "degree": string }],
  "atsScore": number,
  "keywordsMatched": string[],
  "improvementNotes": string
}`;
}
