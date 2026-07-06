import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AIRouter } from '@/lib/ai/router';
import { resumeSchema } from '@/lib/validators';

const router = new AIRouter();

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

    const result = await router.route({
      task: 'analyze',
      resumeData,
      jobDescription: targetJob?.description,
    });

    const content = typeof result.content === 'string'
      ? result.content
      : JSON.stringify(result.content);

    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new Error('Could not find a valid JSON object in the AI response.');
    }

    const jsonString = content.substring(firstBrace, lastBrace + 1);
    const jsonResponse = JSON.parse(jsonString);
    const validatedResponse = assessmentSchema.parse(jsonResponse);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('Error in /api/assess:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to assess resume.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unknown error occurred.' },
      { status: 500 }
    );
  }
}
