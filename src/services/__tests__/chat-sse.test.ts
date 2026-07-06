import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatSSEService } from '../chat-sse';
import { useChatStore } from '@/stores/useChatStore';

describe('ChatSSEService', () => {
  let service: ChatSSEService;

  beforeEach(() => {
    service = new ChatSSEService();
    useChatStore.getState().clearSession();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createMockReader(events: string[]): ReadableStreamDefaultReader<Uint8Array> {
    let index = 0;
    return {
      read: vi.fn(async () => {
        if (index >= events.length) return { done: true, value: undefined };
        const value = new TextEncoder().encode(events[index]);
        index++;
        return { done: false, value };
      }),
      releaseLock: vi.fn(),
      cancel: vi.fn(),
    } as unknown as ReadableStreamDefaultReader<Uint8Array>;
  }

  it('adds user message, streams assistant response, and sets hasActions on done', async () => {
    const reader = createMockReader([
      'data: {"type":"token","content":"Hello "}\n\n',
      'data: {"type":"token","content":"Aether"}\n\n',
      'data: {"type":"done","content":"Hello Aether","task":"chat","model":"m","latencyMs":10}\n\n',
    ]);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => reader },
    });
    vi.stubGlobal('fetch', mockFetch);

    const onDone = vi.fn();
    await service.send('hi', null, undefined, { onDone });

    const state = useChatStore.getState();
    const messages = state.session.messages;

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('hi');
    expect(messages[1].role).toBe('assistant');
    expect(messages[1].content).toBe('Hello Aether');
    expect(messages[1].hasActions).toBe(true);
    expect(state.isStreaming).toBe(false);
    expect(onDone).toHaveBeenCalled();
  });

  it('handles error event from stream', async () => {
    const reader = createMockReader([
      'data: {"type":"error","error":"model failed","code":"MODEL_ERROR"}\n\n',
    ]);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => reader },
    }));

    const onError = vi.fn();
    await service.send('hi', null, undefined, { onError });

    const state = useChatStore.getState();
    const messages = state.session.messages;

    expect(messages[messages.length - 1].role).toBe('assistant');
    expect(messages[messages.length - 1].content).toContain('Error');
    expect(state.isStreaming).toBe(false);
    expect(onError).toHaveBeenCalledWith('model failed');
  });

  it('cancels current request', () => {
    const abort = vi.fn();
    const controller = { abort } as unknown as AbortController;
    service['abortController'] = controller;

    service.cancel();

    expect(abort).toHaveBeenCalled();
    expect(useChatStore.getState().isStreaming).toBe(false);
  });

  it('does not send when request fails with non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    }));

    await service.send('hi', null);

    const messages = useChatStore.getState().session.messages;
    expect(messages[messages.length - 1].content).toContain('Server error');
  });
});
