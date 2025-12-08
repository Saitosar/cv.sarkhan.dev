// src/app/api/update-cv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resumeSchema } from '@/lib/validators';
import { z } from 'zod';

// Check for API key
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Schema for the update request
const updateRequestSchema = z.object({
  oldCvText: z.string().optional(), // Extracted text from uploaded CV
  linkedInUrl: z.string().url().optional(), // LinkedIn profile URL
  additionalInfo: z.string().optional(), // Free-form text from user
  targetJob: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedRequest = updateRequestSchema.parse(body);

    const { oldCvText, linkedInUrl, additionalInfo, targetJob } = parsedRequest;

    // Check if API key is configured
    if (!genAI) {
      return NextResponse.json(
        { 
          error: 'GEMINI_API_KEY is not configured',
          details: 'Please set GEMINI_API_KEY in your .env.local file. Get your API key from https://aistudio.google.com/app/apikey'
        },
        { status: 500 }
      );
    }

    // VALIDATION: At least one source must be provided
    if (!oldCvText && !linkedInUrl && !additionalInfo) {
      return NextResponse.json(
        { error: 'At least one of the following must be provided: old CV text, LinkedIn URL, or additional information.' },
        { status: 400 }
      );
    }

    // Build the comprehensive prompt for AI
    let prompt = `
You are an expert resume writer and career coach. Your task is to create or update a professional resume that will pass ATS (Applicant Tracking System) screening and impress human recruiters.

**INSTRUCTIONS:**
1. Analyze ALL provided information sources (old CV, LinkedIn URL, additional user notes)
2. Extract and structure the most relevant, up-to-date information
3. Create a professional, ATS-friendly resume in JSON format matching the resumeSchema structure
4. Prioritize recent experience and achievements
5. Use action verbs and quantifiable metrics where possible
6. Ensure all dates are in the format: { month: "Jan", year: "2020" }
7. If information is missing or unclear, make reasonable inferences but prioritize accuracy
8. Focus on creating a compelling professional summary
9. Structure experience entries with achievement-oriented descriptions
10. If a LinkedIn URL is provided, extract relevant information that would typically be found on a LinkedIn profile (current position, experience, skills, education)

**RESUME SCHEMA STRUCTURE:**
{
  "fullName": "string (required)",
  "jobTitle": "string (required)",
  "summary": "string (3-4 sentences, required)",
  "contact": {
    "email": "string (required)",
    "phone": "string (required)",
    "linkedin": "string (optional URL) - if not available, OMIT this field entirely, do NOT set to null"
  },
  "experience": [{
    "company": "string (required)",
    "position": "string (required)",
    "description": "string (required - must be a single string, NOT an array. Join multiple bullet points with newlines or semicolons)",
    "startDate": { "month": "Jan", "year": "2020" },
    "endDate": { "month": "Dec", "year": "2022", "isCurrent": false } OR null if current position
  }],
  "projects": [{
    "name": "string",
    "description": "string",
    "technologies": "string"
  }],
  "education": [{
    "institution": "string",
    "degree": "string",
    "years": "string"
  }],
  "skills": [{ "value": "string" }],
  "languages": [{ "language": "string", "proficiency": "string" }],
  "achievements": [{ "value": "string" }],
  "trainings": [{ "value": "string" }],
  "certifications": [{ "value": "string" }],
  "targetJob": {
    "title": "string (optional)",
    "description": "string (optional)"
  }
}

`;

    // Add information sources to the prompt
    if (oldCvText) {
      prompt += `
---
**OLD CV CONTENT (Extracted Text):**
${oldCvText}

Note: This is raw extracted text from an old CV. Extract relevant information but prioritize newer data from other sources.
---
`;
    }

    if (linkedInUrl) {
      prompt += `
---
**LINKEDIN PROFILE URL:**
${linkedInUrl}

IMPORTANT: The user has provided their LinkedIn profile URL. Based on typical LinkedIn profile structures, extract and include:
- Current position and company
- Recent work experience (positions, companies, dates)
- Skills and endorsements
- Education background
- Any notable achievements or certifications mentioned
- Professional summary/headline

Note: If you cannot access the actual profile content, use the URL as context and make reasonable inferences based on the profile URL structure, or ask the user to provide more details in the additional information section.
---
`;
    }

    if (additionalInfo) {
      prompt += `
---
**ADDITIONAL USER INFORMATION (Free-form notes):**
${additionalInfo}

Note: This is additional information the user wants to include. Integrate this into the resume appropriately. This may include:
- Recent achievements or projects
- New skills learned
- Career changes or transitions
- Specific accomplishments they want highlighted
- Any other relevant information
---
`;
    }

    if (targetJob?.title || targetJob?.description) {
      prompt += `
---
**TARGET JOB INFORMATION:**
Title: ${targetJob.title || 'Not provided'}
Description: ${targetJob.description || 'Not provided'}

IMPORTANT: Tailor the resume to match this target job. Use keywords from the job description, emphasize relevant experience, and adjust the summary to align with the role requirements.
---
`;
    }

    prompt += `
---
**FINAL INSTRUCTIONS:**
1. Return ONLY valid JSON that matches the resumeSchema structure exactly
2. Do NOT include markdown code blocks (no \`\`\`json)
3. Ensure all required fields are present (fullName, jobTitle, summary, contact.email, contact.phone)
4. Use current date context: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
5. If dates are missing or unclear, use reasonable estimates but mark endDate.isCurrent as true for the most recent position if it seems current
6. Create compelling, achievement-oriented descriptions for experience entries
7. Ensure the resume is ATS-friendly (use standard section names, clear formatting in JSON structure)
8. If contact information is missing from sources, use placeholder values that make sense (e.g., "user@example.com" for email, "+1-XXX-XXX-XXXX" for phone) - but clearly indicate these are placeholders

**CRITICAL DATA TYPE REQUIREMENTS:**
- "description" in experience MUST be a STRING (not an array). If you have multiple bullet points, join them with "\\n" or "; "
- "linkedin" in contact is OPTIONAL - if not available, OMIT the field entirely (do NOT set to null)
- "endDate" in experience is OPTIONAL - if it's a current position, either omit endDate or set isCurrent: true. Do NOT set month/year to null.
- All date fields (month, year) must be STRINGS, never null
- If a field is optional and has no value, OMIT it from the JSON (do NOT include it with null value)

Return the complete resume JSON now:
`;

    // Use Gemini to generate the resume
    // Use published Gemini models: gemini-2.5-flash-live (primary), with fallbacks
    let text: string = '';
    
    // Helper function to generate content with retry logic
    const generateWithRetry = async (modelName: string, maxRetries = 2, delayMs = 1000): Promise<string> => {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const currentModel = genAI.getGenerativeModel({ model: modelName });
          const currentResult = await currentModel.generateContent(prompt);
          const currentResponse = await currentResult.response;
          const responseText = await currentResponse.text();
          if (!responseText || responseText.trim().length === 0) {
            throw new Error(`Model ${modelName} returned empty response`);
          }
          return responseText;
        } catch (error: unknown) {
          const errorObj = error as { status?: number; message?: string };
          const isRateLimit = errorObj.status === 429 || errorObj.message?.includes('429') || errorObj.message?.includes('rate limit');
          const isServiceUnavailable = errorObj.status === 503 || errorObj.message?.includes('503') || errorObj.message?.includes('overloaded') || errorObj.message?.includes('Service Unavailable');
          
          // Retry on rate limit or service unavailable
          if ((isRateLimit || isServiceUnavailable) && attempt < maxRetries) {
            const waitTime = delayMs * Math.pow(2, attempt); // Exponential backoff
            const errorType = isRateLimit ? 'Rate limited' : 'Service unavailable';
            console.warn(`${errorType} on ${modelName}, attempt ${attempt + 1}/${maxRetries + 1}. Waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          throw error;
        }
      }
      // This should never be reached, but TypeScript needs it
      throw new Error(`Failed to generate content with ${modelName} after ${maxRetries + 1} attempts`);
    };
    
    // List of models to try in order of preference
    const modelsToTry = [
      "gemini-2.5-flash-live",
      "gemini-2.0-flash-live",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.5-flash-preview-09-2025",
      "gemini-2.5-flash-lite"
    ];
    
    let lastError: Error | null = null;
    const triedModels: string[] = [];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting to use model: ${modelName}`);
        text = await generateWithRetry(modelName);
        console.log(`Successfully used model: ${modelName}`);
        break; // Success! Exit the loop
      } catch (modelError: unknown) {
        triedModels.push(modelName);
        const errorObj = modelError as { status?: number; message?: string };
        lastError = modelError instanceof Error ? modelError : new Error(String(modelError));
        
        const isRateLimit = errorObj.status === 429 || errorObj.message?.includes('429') || errorObj.message?.includes('rate limit');
        const isServiceUnavailable = errorObj.status === 503 || errorObj.message?.includes('503') || errorObj.message?.includes('overloaded') || errorObj.message?.includes('Service Unavailable');
        const isNotFound = errorObj.status === 404 || errorObj.message?.includes('404') || errorObj.message?.includes('not found');
        
        // If it's a rate limit, service unavailable, or not found, try next model
        if (isRateLimit || isServiceUnavailable || isNotFound) {
          console.warn(`Model ${modelName} failed (${isRateLimit ? 'rate limit' : isServiceUnavailable ? 'service unavailable' : 'not found'}), trying next model...`);
          continue; // Try next model
        } else {
          // For other errors, log but still try next model
          const errorMsg = errorObj.message || String(modelError);
          console.warn(`Model ${modelName} failed with error: ${errorMsg}, trying next model...`);
          continue;
        }
      }
    }
    
    // If we've tried all models and still failed
    if (!text || text.trim().length === 0) {
      console.error(`All ${triedModels.length} models failed. Tried: ${triedModels.join(', ')}`);
      const errorMessage = lastError?.message || 'Failed to generate content. All models failed.';
      throw new Error(`AI model error: ${errorMessage} Please try again later.`);
    }

    // Ensure we have text from AI
    if (!text || text.trim().length === 0) {
      throw new Error("AI model returned empty response. Please try again.");
    }

    // Extract JSON from response
    let jsonString = text.trim();
    
    // Remove markdown code blocks if present
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find JSON object boundaries
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new Error("Could not find valid JSON in AI response. The AI may have returned an error or unexpected format.");
    }
    
    jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    
    // Parse and validate the JSON
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Extracted JSON string:', jsonString);
      console.error('Full response text:', text);
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. The AI may have returned invalid JSON.`);
    }
    
    // Normalize the data to fix common AI response issues
    const normalizeResumeData = (data: unknown): unknown => {
      if (!data || typeof data !== 'object') return data;
      const normalized = { ...data as Record<string, unknown> };
      
      // Fix contact.linkedin: remove if null
      if (normalized.contact && typeof normalized.contact === 'object') {
        const contact = normalized.contact as Record<string, unknown>;
        if (contact.linkedin === null || contact.linkedin === undefined) {
          delete contact.linkedin;
        }
      }
      
      // Fix experience descriptions: convert arrays to strings
      if (normalized.experience && Array.isArray(normalized.experience)) {
        normalized.experience = normalized.experience.map((exp: unknown) => {
          if (!exp || typeof exp !== 'object') return exp;
          const normalizedExp = { ...exp as Record<string, unknown> };
          
          // Convert description array to string
          if (Array.isArray(normalizedExp.description)) {
            normalizedExp.description = normalizedExp.description
              .filter((item: unknown) => item !== null && item !== undefined)
              .join('\n');
          }
          
          // Fix endDate: remove if month/year are null, or omit the field if completely null
          if (normalizedExp.endDate) {
            if (normalizedExp.endDate === null) {
              delete normalizedExp.endDate;
            } else if (typeof normalizedExp.endDate === 'object') {
              const endDate = normalizedExp.endDate as Record<string, unknown>;
              // If month or year is null, and it's not a current position, remove endDate
              if ((endDate.month === null || endDate.year === null) && 
                  endDate.isCurrent !== true) {
                delete normalizedExp.endDate;
              } else {
                // Remove null month/year if present
                if (endDate.month === null) delete endDate.month;
                if (endDate.year === null) delete endDate.year;
              }
            }
          }
          
          return normalizedExp;
        });
      }
      
      return normalized;
    };
    
    // Normalize the response
    jsonResponse = normalizeResumeData(jsonResponse);
    
    // Validate against schema
    let validatedResume;
    try {
      validatedResume = resumeSchema.parse(jsonResponse);
    } catch (validationError) {
      console.error('=== SCHEMA VALIDATION ERROR ===');
      console.error('Validation error type:', validationError?.constructor?.name);
      console.error('Validation error:', validationError);
      
      if (validationError instanceof z.ZodError) {
        console.error('ZodError detected, issues count:', validationError.issues?.length || 0);
        if (validationError.issues && Array.isArray(validationError.issues)) {
          console.error('Validation issues:', validationError.issues);
          const errorMessages = validationError.issues.map((e: z.ZodIssue) => {
            const path = e.path.length > 0 ? e.path.join('.') : 'root';
            return `${path}: ${e.message}`;
          }).join('; ');
          
          console.error('Formatted error messages:', errorMessages);
          console.error('Parsed JSON that failed validation:', JSON.stringify(jsonResponse, null, 2));
          
          // Throw with detailed error that will be caught by outer catch
          const detailedError = new Error(`Resume validation failed: ${errorMessages}`) as Error & { isValidationError: boolean; validationDetails: string };
          detailedError.isValidationError = true;
          detailedError.validationDetails = errorMessages;
          throw detailedError;
        }
      }
      
      // If it's not a ZodError or doesn't have errors array
      console.error('Non-ZodError validation failure');
      console.error('Parsed JSON:', JSON.stringify(jsonResponse, null, 2));
      const errorMessage = validationError instanceof Error ? validationError.message : 'Unknown validation error';
      const detailedError = new Error(`Resume validation failed: ${errorMessage}`) as Error & { isValidationError: boolean };
      detailedError.isValidationError = true;
      throw detailedError;
    }

    return NextResponse.json(validatedResume, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("=== ERROR UPDATING CV ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error:", error);
    
    // Check if it's a validation error (from our inner catch)
    const validationError = error as Error & { isValidationError?: boolean; validationDetails?: string };
    if (validationError?.isValidationError) {
      return NextResponse.json(
        { 
          error: "Resume validation failed",
          details: validationError.validationDetails || (error instanceof Error ? error.message : "The AI response doesn't match the expected schema. Please try again.")
        },
        { status: 400 }
      );
    }
    
    if (error instanceof z.ZodError && error.issues && Array.isArray(error.issues)) {
      const errorMessages = error.issues.map((e: z.ZodIssue) => {
        const path = e.path.length > 0 ? e.path.join('.') : 'root';
        return `${path}: ${e.message}`;
      }).join('; ');
      
      return NextResponse.json(
        { 
          error: "Validation error",
          details: errorMessages
        },
        { status: 400 }
      );
    }
    
    // Generic error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Final error message:", errorMessage);
    
    return NextResponse.json(
      { 
        error: "Failed to update CV",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
