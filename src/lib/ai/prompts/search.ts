export interface SearchPromptInput {
  message: string;
  resumeData?: Record<string, unknown>;
}

export function buildSearchPrompt(input: SearchPromptInput): string {
  const parts: string[] = [
    `Calculate a job match score between the candidate's resume and the provided job listing.`,
    `Job Listing + Resume:\n${input.message}`,
  ];

  if (input.resumeData) {
    parts.push(`Candidate Resume:\n${JSON.stringify(input.resumeData, null, 2)}`);
  }

  parts.push(`Return ONLY valid JSON with:`);
  parts.push(`- matchScore: number 0-100`);
  parts.push(`- matchedSkills: array of matched skill strings`);
  parts.push(`- missingSkills: array of missing skill strings`);
  parts.push(`- reasoning: one-sentence explanation`);

  return parts.join('\n\n');
}
