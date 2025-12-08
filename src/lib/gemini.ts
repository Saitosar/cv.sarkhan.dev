import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

export async function generateResume(input: string) {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-001" });
  const prompt = `
You are a professional resume writer. From the input below, produce:
1) A 3–4 sentence professional summary.
2) For each job, 2–3 bullet achievements (use metrics if possible).
3) Skills list (comma-separated).
Return STRICT JSON with keys: summary (string), achievements (array of strings), skills (array of strings).

INPUT:
${input}
Respond with JSON only.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
