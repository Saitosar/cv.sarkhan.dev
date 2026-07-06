import { AIRouter } from '@/lib/ai/router';
import type { TaskType } from '@/lib/ai/router';

const router = new AIRouter();

const ALLOWED_TASKS: TaskType[] = [
  'ats-score',
  'generate',
  'tailor',
  'analyze',
  'suggest',
  'suggestions',
  'search',
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { task, message, resumeData, jobDescription, history, mode } = body;

    if (!task || !ALLOWED_TASKS.includes(task)) {
      return new Response(
        JSON.stringify({
          error: `Invalid task. Allowed: ${ALLOWED_TASKS.join(', ')}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await router.route({
      task,
      message,
      resumeData,
      jobDescription,
      history,
      mode,
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[AI Route] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
