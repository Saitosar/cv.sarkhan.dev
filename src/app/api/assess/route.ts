// src/app/api/assess/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resumeSchema } from '@/lib/validators';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 1. Упрощаем схему ответа. Убираем 'message'.
const assessmentSchema = z.object({
  confidenceScore: z.number().min(0).max(100),
  recommendations: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = resumeSchema.parse(body);

    const { targetJob, ...resumeData } = parsedData;

    // 2. Упрощаем и ужесточаем промпт.
    let prompt = `
      You are an expert career coach with a friendly, supportive, and encouraging mentor persona. Your goal is to help the user feel confident.

      Analyze the following resume data. Provide a "confidence score" and a list of actionable recommendations.

      The output MUST be a valid JSON object with the exact structure: { "confidenceScore": number, "recommendations": string[] }.

      **Confidence Score Rules:**
      - A number between 0 and 100.
      - If no target job is provided, the score cannot exceed 60%.

      **Recommendations Rules (CRITICAL - follow this exactly):**
      - Each recommendation in the array must be a single string without leading numbers or bullets.
      - **Tone is Key:** Start advice with a positive and encouraging observation about what the user has already done well.
      - For "Summary" and "Experience", each recommendation string MUST contain three parts, separated by two newlines (\\n\\n):
          "**What to improve:** [Your advice in a supportive tone]\\n\\n**Why it's important:** [Your explanation here]\\n\\n**Concrete Example:** [Your rewritten example based on user's text here]"
      - **For empty sections (Projects, Education, etc.):** Provide a SHORT, SINGLE-PARAGRAPH recommendation explaining why that specific section is important for a junior's resume. Be concise.

      Resume Data:
      ${JSON.stringify(resumeData, null, 2)}

      Target Job Title: ${targetJob?.title || 'Not provided'}
      Target Job Description:
      ${targetJob?.description || 'Not provided'}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    const cleanedText = text.replaceAll('```json', '').replaceAll('```', '').trim();
    const jsonResponse = JSON.parse(cleanedText);

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