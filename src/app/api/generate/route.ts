import { NextResponse } from 'next/server';
import { AIRouter } from '@/lib/ai/router';
import { resumeSchema } from '@/lib/validators';

const router = new AIRouter();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedData = resumeSchema.parse(body);
    const { targetJob, ...resumeData } = parsedData;

    const result = await router.route({
      task: 'generate',
      resumeData,
      jobDescription: targetJob?.description,
    });

    // AI response may be wrapped as string or already parsed
    const content = typeof result.content === 'string'
      ? result.content
      : JSON.stringify(result.content);

    // Clean markdown code fences and parse
    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonResponse = JSON.parse(cleaned);

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error in /api/generate:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to generate resume.', details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'An unknown error occurred.' },
      { status: 500 }
    );
  }
}
