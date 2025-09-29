// src/app/api/assess/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resumeSchema } from '@/lib/validators';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- НОВАЯ СХЕМА ДАННЫХ ОТ AI ---
const assessmentSchema = z.object({
  resume_score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
  mentorship_tone_example: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = resumeSchema.parse(body);
    const { targetJob, ...resumeData } = parsedData;

    // --- ВАШ НОВЫЙ, УЛУЧШЕННЫЙ ПРОМПТ ---
    const prompt = `
      You are a Resume Evaluator AI.
      Your role has two stages:

      Stage 1 — Objective Evaluation:
      - Act as both an ATS scanner and a human recruiter.
      - Be demanding and adhere to best practices of resume writing.
      - Evaluate the given CV against:
        a) General quality standards (clarity, structure, completeness, measurable impact, readability).
        b) Match with the provided job description (responsibilities, skills, languages, experience level).
      - Balance ATS-readiness and human readability.
      - Be objective: do not inflate scores just because of one strong section (e.g., summary).
      - Return one single Resume Score (0–100).

      Stage 2 — Coaching & Mentoring Feedback:
      - Communicate as a coach and mentor, not a cold system.
      - Provide supportive, motivating, and constructive feedback.
      - Structure feedback in three parts:
          1) "Strengths" — highlight what is already strong (to build confidence).
          2) "Weaknesses" — list critical gaps (clearly, but respectfully).
          3) "Recommendations" — 3–5 actionable tips, phrased positively and encouraging improvement.
      - Tone should be clear, professional, and motivating:
        - Do not shame the user.
        - Always emphasize that improvements are possible and achievable.
        - Frame weaknesses as "areas to strengthen" rather than "failures."

      Return output in strict JSON format and nothing else:
      {
        "resume_score": number,
        "strengths": ["..."],
        "weaknesses": ["..."],
        "recommendations": ["..."],
        "mentorship_tone_example": "A short motivating message that makes the user feel confident and willing to improve."
      }

      Resume Data to evaluate:
      ${JSON.stringify(resumeData, null, 2)}

      Target Job (if provided):
      Title: ${targetJob?.title || 'Not provided'}
      Description: ${targetJob?.description || 'Not provided'}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new Error("Could not find a valid JSON object in the AI response.");
    }
    const jsonString = text.substring(firstBrace, lastBrace + 1);
    
    const jsonResponse = JSON.parse(jsonString);
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