import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AIRouter } from '@/lib/ai/router';
import { parseLinkedInProfile, enrichResumeWithLinkedIn, type LinkedInContext } from '@/lib/linkedin-parser';

import { getLogger } from '@/lib/monitoring/logger';

const log = getLogger();
const router = new AIRouter();

const updateRequestSchema = z.object({
  oldResume: z.string().min(50),
  targetJobTitle: z.string().optional(),
  targetJobDescription: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  linkedinProfileText: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = updateRequestSchema.parse(body);

    const { oldResume, targetJobTitle, targetJobDescription, linkedinUrl, linkedinProfileText } = validatedData;

    // Parse and enrich with LinkedIn context if provided
    let enrichedResume = oldResume;
    let linkedInContext: LinkedInContext | null = null;

    if (linkedinProfileText && linkedinProfileText.trim().length > 50) {
      try {
        linkedInContext = await parseLinkedInProfile(linkedinProfileText);
        enrichedResume = enrichResumeWithLinkedIn(oldResume, linkedInContext);
        log.info({ linkedInKeys: Object.keys(linkedInContext) }, 'LinkedIn context parsed successfully');
      } catch (error) {
        log.error({ error }, 'Failed to parse LinkedIn profile');
      }
    }

    // AIRouter expects structured resume data when possible; fall back to plain text blob
    let resumeData: Record<string, unknown>;
    try {
      resumeData = JSON.parse(enrichedResume);
    } catch {
      resumeData = { rawText: enrichedResume };
    }

    const result = await router.route({
      task: targetJobTitle || targetJobDescription ? 'tailor' : 'generate',
      resumeData,
      message: targetJobTitle || targetJobDescription
        ? `Tailor resume for ${targetJobTitle || 'the target role'}`
        : 'Improve this resume',
      jobDescription: targetJobDescription,
    });

    const content = typeof result.content === 'string'
      ? result.content
      : JSON.stringify(result.content);

    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new Error('Could not extract valid JSON from AI response');
    }

    const jsonString = content.substring(firstBrace, lastBrace + 1);
    const jsonResponse = JSON.parse(jsonString);

    const responseWithMeta = {
      ...jsonResponse,
      isTailored: !!(targetJobTitle || targetJobDescription),
      targetJobTitle: targetJobTitle || null,
    };

    return NextResponse.json(responseWithMeta);
  } catch (error) {
    log.error({ error }, 'Error in /api/update');

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to tailor resume', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
