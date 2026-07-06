import { AIRouter } from '@/lib/ai/router';
import { writeSSEEvent } from '@/lib/ai/streaming';

const router = new AIRouter();

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, sessionId, resumeData, jobDescription, history, mode } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), 30_000);

    const stream = new ReadableStream({
      async start(controller) {
        const writer = controller as unknown as WritableStreamDefaultWriter;

        try {
          const generator = router.routeStream({
            task: 'chat',
            message,
            resumeData,
            jobDescription,
            history,
            sessionId,
            mode,
            signal: abortController.signal,
          });

          for await (const event of generator) {
            writeSSEEvent(writer, event);

            if (event.type === 'done' || event.type === 'error') {
              controller.close();
              return;
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          writeSSEEvent(writer, {
            type: 'error',
            data: { error: errorMessage, code: 'INTERNAL_ERROR' },
          });
          controller.close();
        } finally {
          clearTimeout(timeout);
        }
      },
      cancel() {
        abortController.abort();
        clearTimeout(timeout);
      },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (error) {
    console.error('[SSE Chat] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to process request';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
