/**
 * LinkedIn Profile Context Parser
 * Extracts structured data from LinkedIn profile text
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface LinkedInContext {
  headline?: string;
  about?: string;
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    description?: string;
    duration?: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    field?: string;
  }>;
  certifications?: string[];
  languages?: Array<{
    name: string;
    proficiency?: string;
  }>;
}

/**
 * Parse LinkedIn profile text using AI to extract structured data
 */
export async function parseLinkedInProfile(profileText: string): Promise<LinkedInContext> {
  if (!profileText || profileText.trim().length < 50) {
    return {};
  }

  const prompt = `
You are a LinkedIn Profile Parser AI. Extract structured information from the provided LinkedIn profile text.

Your task: Parse the raw text and return a clean JSON object with the profile's key information.

**LinkedIn Profile Text:**
${profileText}

---

**Output Format (return ONLY valid JSON, no markdown):**

{
  "headline": "string (professional headline/title)",
  "about": "string (about/summary section)",
  "skills": ["array of skills mentioned"],
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "description": "role description if available",
      "duration": "time period (e.g., '2020-2023' or '3 years')"
    }
  ],
  "education": [
    {
      "school": "institution name",
      "degree": "degree type",
      "field": "field of study (optional)"
    }
  ],
  "certifications": ["array of certifications"],
  "languages": [
    {
      "name": "language name",
      "proficiency": "level (e.g., Native, Professional, Elementary)"
    }
  ]
}

**Rules:**
- Extract only information that is explicitly present in the text
- If a section is missing or empty, omit it from the JSON or return empty array
- Clean up formatting artifacts (bullets, extra spaces, line breaks)
- Preserve actual content, don't invent information
- Return valid JSON only, no markdown code blocks
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Extract JSON from response
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No valid JSON found in AI response");
    }

    const jsonString = text.substring(firstBrace, lastBrace + 1);
    const parsed: LinkedInContext = JSON.parse(jsonString);

    return parsed;
  } catch (error) {
    console.error("Error parsing LinkedIn profile:", error);
    return {};
  }
}

/**
 * Enrich resume data with LinkedIn context
 */
export function enrichResumeWithLinkedIn(
  resumeText: string,
  linkedInContext: LinkedInContext
): string {
  if (!linkedInContext || Object.keys(linkedInContext).length === 0) {
    return resumeText;
  }

  let enriched = resumeText;

  // Add LinkedIn context as additional information
  const contextParts: string[] = [];

  if (linkedInContext.headline) {
    contextParts.push(`LinkedIn Headline: ${linkedInContext.headline}`);
  }

  if (linkedInContext.about) {
    contextParts.push(`LinkedIn About: ${linkedInContext.about}`);
  }

  if (linkedInContext.skills && linkedInContext.skills.length > 0) {
    contextParts.push(`LinkedIn Skills: ${linkedInContext.skills.join(', ')}`);
  }

  if (linkedInContext.certifications && linkedInContext.certifications.length > 0) {
    contextParts.push(`Certifications: ${linkedInContext.certifications.join(', ')}`);
  }

  if (contextParts.length > 0) {
    enriched += "\n\n--- ADDITIONAL CONTEXT FROM LINKEDIN ---\n";
    enriched += contextParts.join('\n\n');
  }

  return enriched;
}

/**
 * Validate LinkedIn URL format
 */
export function isValidLinkedInUrl(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === 'linkedin.com' ||
      urlObj.hostname === 'www.linkedin.com' ||
      urlObj.hostname.endsWith('.linkedin.com')
    );
  } catch {
    return false;
  }
}
