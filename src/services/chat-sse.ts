import { useChatStore } from '@/stores/useChatStore';
import type { ResumeStoreData } from '@/types/resume';
import type { ChatMode } from '@/types/chat';

interface ChatSSEOptions {
  onToken?: (token: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

export class ChatSSEService {
  private abortController: AbortController | null = null;

  /**
   * Send a message to the AI and stream the response.
   */
  async send(
    message: string,
    resumeData: ResumeStoreData | null,
    jobDescription?: string,
    mode?: ChatMode,
    options?: ChatSSEOptions
  ): Promise<void> {
    const store = useChatStore.getState();

    // Add user message
    store.addMessage('user', message);
    store.setIsStreaming(true);
    store.setStatus('chatting');

    // Add empty assistant message for streaming
    store.addMessage('assistant', '');

    this.abortController = new AbortController();

    try {
      const response = await fetch('/api/sse/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: store.session.id,
          resumeData,
          jobDescription,
          mode: mode ?? store.session.mode,
          history: store.session.messages
            .slice(-20)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        let errorText: string;
        try {
          const errorData = await response.json();
          errorText = errorData.error || `Server error (${response.status})`;
        } catch {
          errorText = response.status === 500
            ? 'The AI service is temporarily unavailable. Please try again.'
            : `Request failed (${response.status})`;
        }
        throw new Error(errorText);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));

              switch (event.type) {
                case 'token': {
                  const current = useChatStore.getState().session.messages.slice(-1)[0]?.content ?? '';
                  useChatStore.getState().updateLastMessage(current + event.content);
                  options?.onToken?.(event.content);
                  break;
                }

                case 'done': {
                  const storeNow = useChatStore.getState();
                  storeNow.setIsStreaming(false);
                  storeNow.setStatus('ready');

                  const lastMessage = storeNow.session.messages[storeNow.session.messages.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    useChatStore.getState().updateLastMessage(
                      lastMessage.content
                    );
                    // Mark message as having actions (suggestion chips)
                    const messages = [...storeNow.session.messages];
                    messages[messages.length - 1] = {
                      ...lastMessage,
                      hasActions: true,
                      source: mode ?? store.session.mode,
                    };
                    useChatStore.setState({
                      session: { ...storeNow.session, messages },
                    });
                  }

                  options?.onDone?.();
                  break;
                }

                case 'error': {
                  const storeNow = useChatStore.getState();
                  storeNow.setIsStreaming(false);
                  storeNow.setStatus('ready');
                  storeNow.addErrorMessage(
                    `⚠️ **Error:** ${event.error}\n\nPlease try again or check your connection.`,
                    message
                  );
                  options?.onError?.(event.error);
                  break;
                }
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      }
    } catch (error) {
      const store = useChatStore.getState();
      store.setIsStreaming(false);
      store.setStatus('ready');

      if (error instanceof DOMException && error.name === 'AbortError') {
        // User cancelled — leave any partial content in place
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      store.addErrorMessage(
        `⚠️ **Error:** ${errorMessage}\n\nPlease try again or check your connection.`,
        message
      );
      options?.onError?.(errorMessage);
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Cancel the current streaming request.
   */
  cancel(): void {
    this.abortController?.abort();
    this.abortController = null;
    useChatStore.getState().setIsStreaming(false);
    useChatStore.getState().setStatus('ready');
  }
}

export const chatSSE = new ChatSSEService();
