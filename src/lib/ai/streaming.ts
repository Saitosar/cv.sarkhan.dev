import type { RouterStreamEvent } from './router';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
};

/**
 * Server-side: writes a single SSE event to the response stream.
 */
export function writeSSEEvent(
  writer: WritableStreamDefaultWriter,
  event: RouterStreamEvent
): void {
  const encoder = new TextEncoder();

  switch (event.type) {
    case 'token':
      writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: 'token', content: event.data })}\n\n`)
      );
      break;
    case 'done':
      writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: 'done', ...(event.data as object) })}\n\n`)
      );
      break;
    case 'error':
      writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: 'error', ...(event.data as object) })}\n\n`)
      );
      break;
    default:
      // Ignore unknown events
      break;
  }
}

/**
 * Server-side: creates an SSE Response wrapping a ReadableStream.
 * The caller should use the controller in `start` to write events.
 */
export function createSSEResponse(stream: ReadableStream): Response {
  return new Response(stream, { headers: SSE_HEADERS });
}

/**
 * Client-side: parses SSE events from a ReadableStream reader.
 */
export function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<RouterStreamEvent> {
  const decoder = new TextDecoder();
  let buffer = '';

  return (async function* () {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            yield parsed as RouterStreamEvent;
          } catch {
            // Skip malformed events
          }
        }
      }
    }
  })();
}

/**
 * Convenience: headers for an SSE response.
 */
export { SSE_HEADERS };
