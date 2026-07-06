import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getGemini() {
  if (!client) {
    const key = process.env.OLLAMA_CLOUD_API_KEY;
    if (!key) throw new Error('OLLAMA_CLOUD_API_KEY is not set');
    client = new OpenAI({
      apiKey: key,
      baseURL: 'https://ollama.com/v1',
    });
  }
  return client;
}

export async function generateResume(input: string) {
  const openai = getGemini();
  const completion = await openai.chat.completions.create({
    model: 'deepseek-v4-flash',
    messages: [
      {
        role: 'system',
        content:
          'You are a professional resume writer. From the input below, produce:\n1) A 3–4 sentence professional summary.\n2) For each job, 2–3 bullet achievements (use metrics if possible).\n3) Skills list (comma-separated).\nReturn STRICT JSON with keys: summary (string), achievements (array of strings), skills (array of strings).\nRespond with JSON only.',
      },
      { role: 'user', content: input },
    ],
    response_format: { type: 'json_object' },
  });
  return completion.choices[0]?.message?.content ?? '';
}
