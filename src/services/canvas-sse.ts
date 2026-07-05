// src/services/canvas-sse.ts
// Из Canvas Sync Protocol — SSE для стриминга AI-обновлений

import { useResumeStore } from '@/stores/useResumeStore';
import type { SyncEvent } from '@/types/canvas';

class CanvasSSEService {
  private eventSource: EventSource | null = null;

  connect(sessionId: string): void {
    this.eventSource = new EventSource(`/api/sse/canvas?session=${sessionId}`);

    this.eventSource.addEventListener('block-update', (e) => {
      const data = JSON.parse((e as MessageEvent).data) as SyncEvent;
      if (data.type === 'CANVAS_UPDATED') {
        useResumeStore.getState().applySuggestion(data.blocks);
      }
    });

    this.eventSource.addEventListener('focus-chat', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      window.dispatchEvent(
        new CustomEvent('focus-chat', { detail: data })
      );
    });

    this.eventSource.onerror = () => {
      console.warn('SSE connection lost, retrying...');
    };
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }
}

export const canvasSSE = new CanvasSSEService();
export { CanvasSSEService };
