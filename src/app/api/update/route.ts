// src/app/api/update/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Input schema for update request
const updateRequestSchema = z.object({
  oldResume: z.string().min(50),
  targetJobTitle: z.string().optional(),
  targetJobDescription: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = updateRequestSchema.parse(body);

    const { oldResume, targetJobTitle, targetJobDescription, linkedinUrl } = validatedData;

    // Build the AI prompt based on whether target job is provided
    let prompt = '';

    if (targetJobTitle || targetJobDescription) {
      // SMART TAILORING MODE - Job-specific optimization
      prompt = `
You are an expert Resume Strategist and ATS Optimization Specialist.

Your mission: Transform the provided resume to PERFECTLY align with the target job, maximizing ATS compatibility and recruiter appeal.

---
**[STRATEGIC APPROACH]**

1. **Keyword Extraction & Integration**
   - Extract ALL critical keywords from the target job description (hard skills, soft skills, tools, methodologies, industry terms)
   - Strategically weave these keywords throughout the resume (summary, experience descriptions, skills)
   - Maintain natural, authentic language—avoid keyword stuffing

2. **Summary Rewrite**
   - Craft a powerful professional summary that positions the candidate as the IDEAL fit for this specific role
   - Lead with the target job title or a closely related variant
   - Highlight 3-4 key qualifications that directly match job requirements
   - Keep it concise (50-80 words) and impact-focused

3. **Experience Optimization**
   - Reframe past experiences to emphasize achievements relevant to the target role
   - Prioritize accomplishments that demonstrate required skills
   - Add metrics and quantifiable results where possible (percentages, dollar amounts, time saved)
   - Use strong action verbs that match the job description's language
   - If experience doesn't directly match, highlight transferable skills

4. **Skills Alignment**
   - Extract and list skills from both the old resume AND the job description
   - Prioritize skills mentioned in the job posting
   - Group skills logically (Technical Skills, Soft Skills, Tools, etc.)
   - Remove outdated or irrelevant skills

5. **ATS Optimization**
   - Use standard section headings (Experience, Skills, Education)
   - Avoid tables, images, or complex formatting
   - Include exact keyword matches from job description
   - Ensure dates are properly formatted (MM/YYYY format)

---
**[INPUT DATA]**

**Original Resume:**
${oldResume}

**Target Job Title:**
${targetJobTitle || 'Not provided'}

**Target Job Description:**
${targetJobDescription || 'Not provided'}

${linkedinUrl ? `**LinkedIn Profile URL:** ${linkedinUrl}\n(Use this as additional context for professional brand and skills)` : ''}

---
**[OUTPUT FORMAT]**

Return a JSON object with this EXACT structure:

{
  "fullName": "string",
  "jobTitle": "string (optimized for target role)",
  "summary": "string (50-80 words, role-specific)",
  "contact": {
    "email": "string",
    "phone": "string",
    "location": "string (optional)",
    "linkedin": "string (optional)"
  },
  "experience": [
    {
      "company": "string",
      "position": "string",
      "description": "string (bullet points with • separator, achievement-focused, keyword-rich)",
      "startDate": { "month": "string (Jan-Dec)", "year": "string (YYYY)" },
      "endDate": { "month": "string", "year": "string", "isCurrent": boolean }
    }
  ],
  "skills": [
    { "value": "string (prioritized by job relevance)" }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "years": "string (optional, e.g., '2018-2022')"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": "string (optional)"
    }
  ] (optional),
  "certifications": [
    { "name": "string" }
  ] (optional),
  "languages": [
    { "name": "string", "level": "string" }
  ] (optional),
  "atsScore": number (estimated 0-100, based on keyword match and optimization),
  "keywordsMatched": ["array of keywords from job description that are now in resume"],
  "improvementNotes": "string (brief notes on what was changed and why)"
}

**CRITICAL RULES:**
- Return ONLY valid JSON, no markdown code blocks or additional text
- Preserve all factual information from the original resume (don't invent experience)
- If original resume lacks contact info, use placeholder strings like "email@example.com"
- For experience descriptions, use bullet points separated by newlines with • character
- Estimated atsScore should reflect keyword coverage (aim for 75-95 for good matches)
- If target job description is weak/missing, estimate lower atsScore (50-70 range)
`;
    } else {
      // GENERAL IMPROVEMENT MODE - No target job specified
      prompt = `
You are a professional Resume Enhancement Specialist.

Task: Improve the provided resume by enhancing clarity, impact, and ATS-friendliness WITHOUT tailoring to a specific job.

**Improvements to make:**
1. **Summary**: Rewrite to be more compelling and results-oriented (focus on value proposition)
2. **Experience**: Reframe descriptions to be achievement-focused with metrics where possible
3. **Skills**: Organize and clean up skill list (remove duplicates, group logically)
4. **Grammar & Style**: Fix any issues, ensure consistent tense and formatting
5. **ATS Optimization**: Use standard headings, clear structure, proper date formats

**Original Resume:**
${oldResume}

${linkedinUrl ? `**LinkedIn Profile URL:** ${linkedinUrl}\n(Use as additional context)` : ''}

---
**[OUTPUT FORMAT]**

Return a JSON object with this structure:

{
  "fullName": "string",
  "jobTitle": "string",
  "summary": "string (50-80 words, value-focused)",
  "contact": {
    "email": "string",
    "phone": "string",
    "location": "string (optional)",
    "linkedin": "string (optional)"
  },
  "experience": [
    {
      "company": "string",
      "position": "string",
      "description": "string (bullet points with • separator, achievement-focused)",
      "startDate": { "month": "string", "year": "string" },
      "endDate": { "month": "string", "year": "string", "isCurrent": boolean }
    }
  ],
  "skills": [
    { "value": "string" }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "years": "string (optional)"
    }
  ],
  "projects": [ ... ] (optional),
  "certifications": [ ... ] (optional),
  "languages": [ ... ] (optional),
  "atsScore": number (estimated 60-75 for general improvement without job targeting),
  "improvementNotes": "string (what was improved)"
}

**CRITICAL:** Return ONLY valid JSON, no markdown or extra text.
`;
    }

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Extract JSON from response
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new Error("Could not extract valid JSON from AI response");
    }

    const jsonString = text.substring(firstBrace, lastBrace + 1);
    const jsonResponse = JSON.parse(jsonString);

    // Add metadata about tailoring
    const responseWithMeta = {
      ...jsonResponse,
      isTailored: !!(targetJobTitle || targetJobDescription),
      targetJobTitle: targetJobTitle || null,
    };

    return new Response(JSON.stringify(responseWithMeta), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in /api/update:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid input data",
          details: error.issues
        }),
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          error: "Failed to tailor resume",
          details: error.message
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ error: "An unknown error occurred" }),
      { status: 500 }
    );
  }
}
