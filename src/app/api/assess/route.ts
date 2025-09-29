// src/app/api/assess/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resumeSchema } from '@/lib/validators';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Схема для ответа от AI
const assessmentSchema = z.object({
  confidenceScore: z.number().min(0).max(100),
  recommendations: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = resumeSchema.parse(body);

    const { targetJob, ...resumeData } = parsedData;

    let prompt = `
      Analyze the following resume data and the target job description. Provide a "confidence score" and a list of actionable recommendations for improvement.

      The confidence score should be a number between 0 and 100, representing how well the resume is tailored for the target job and its overall quality.
      The recommendations should be specific, actionable suggestions to improve the resume.

      The output MUST be a valid JSON object with the following structure: { "confidenceScore": number, "recommendations": string[] }.

      Resume Data:
      ${JSON.stringify(resumeData, null, 2)}

      Target Job Title: ${targetJob?.title || 'Not provided'}
      Target Job Description:
      ${targetJob?.description || 'Not provided'}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonResponse = JSON.parse(cleanedText);

    // Валидация ответа от AI
    const validatedResponse = assessmentSchema.parse(jsonResponse);

    return new Response(JSON.stringify(validatedResponse), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in API route:", error);
    if (error instanceof Error) {
        return new Response(JSON.stringify({ error: "Failed to assess resume.", details: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ error: "An unknown error occurred." }), { status: 500 });
  }
}