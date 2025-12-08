// src/app/api/generate/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { resumeSchema } from '@/lib/validators';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = resumeSchema.parse(body);

    const { targetJob, ...resumeData } = parsedData;

    let prompt = `
      Based on the following resume data in JSON format, generate a professional resume.
      The output should be a JSON object with the same structure as the input, but with improved and professionally written content.
      The "summary" should be a compelling professional summary.
      For each entry in "experience", generate 3-4 achievement-oriented bullet points for the "description".
      
      Resume Data:
      ${JSON.stringify(resumeData, null, 2)}
    `;

    // Если пользователь указал целевую вакансию, добавляем это в промпт
    if (targetJob && (targetJob.title || targetJob.description)) {
      prompt += `
      
      ---
      IMPORTANT INSTRUCTION:
      Tailor the generated resume to be highly relevant for the following target job.
      Use the keywords and requirements from the job description to enhance the summary and experience descriptions.

      Target Job Title: ${targetJob.title || 'Not provided'}
      Target Job Description:
      ${targetJob.description || 'Not provided'}
      ---
      `;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Очистка ответа от возможных markdown-артефактов
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Попытка распарсить JSON, который вернул AI
    const jsonResponse = JSON.parse(cleanedText);

    return new Response(JSON.stringify(jsonResponse), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in API route:", error);
    // Отправляем более информативный ответ об ошибке
    if (error instanceof Error) {
        return new Response(JSON.stringify({ error: "Failed to generate resume.", details: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ error: "An unknown error occurred." }), { status: 500 });
  }
}