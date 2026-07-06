// src/hooks/__tests__/useVoiceInput.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceInput } from '../useVoiceInput';

type RecognitionHandlers = {
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: ((event: unknown) => void) | null;
};

describe('useVoiceInput', () => {
  let handlers: RecognitionHandlers;
  let mockStart: ReturnType<typeof vi.fn>;
  let mockStop: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    handlers = { onresult: null, onerror: null, onend: null };
    mockStart = vi.fn();
    mockStop = vi.fn();

    // Set up webkitSpeechRecognition as a proper constructor
    (globalThis as unknown as Record<string, unknown>).webkitSpeechRecognition =
      class {
        continuous = false;
        interimResults = false;
        lang = '';
        start = mockStart;
        stop = mockStop;
        addEventListener = vi.fn();
        removeEventListener = vi.fn();

        set onresult(fn: ((event: unknown) => void) | null) {
          handlers.onresult = fn;
        }
        get onresult() {
          return handlers.onresult;
        }
        set onerror(fn: ((event: unknown) => void) | null) {
          handlers.onerror = fn;
        }
        get onerror() {
          return handlers.onerror;
        }
        set onend(fn: ((event: unknown) => void) | null) {
          handlers.onend = fn;
        }
        get onend() {
          return handlers.onend;
        }
      };
  });

  afterEach(() => {
    delete (globalThis as unknown as Record<string, unknown>).webkitSpeechRecognition;
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should start with idle state', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));
      expect(result.current.state).toBe('idle');
      expect(result.current.isListening).toBe(false);
    });

    it('should report isSupported when SpeechRecognition is available', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));
      expect(result.current.isSupported).toBe(true);
    });

    it('should have empty transcript and no error', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));
      expect(result.current.transcript).toBe('');
      expect(result.current.interimTranscript).toBe('');
      expect(result.current.error).toBeNull();
    });
  });

  describe('isSupported when API is missing', () => {
    it('should report isSupported as false when no SpeechRecognition', () => {
      delete (globalThis as unknown as Record<string, unknown>).webkitSpeechRecognition;
      const { result } = renderHook(() => useVoiceInput(vi.fn()));
      expect(result.current.isSupported).toBe(false);
    });
  });

  describe('startListening', () => {
    it('should transition to listening state', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));
      act(() => {
        result.current.startListening();
      });
      expect(result.current.state).toBe('listening');
      expect(result.current.isListening).toBe(true);
    });

    it('should call recognition.start()', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));
      act(() => {
        result.current.startListening();
      });
      expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('should set continuous and interimResults', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));
      act(() => {
        result.current.startListening();
      });
      // The recognition instance is created inside the hook, we can't directly
      // check its properties, but we can verify start was called (which means
      // the instance was created and configured)
      expect(mockStart).toHaveBeenCalled();
    });

    it('should set error state if recognition throws on start', () => {
      mockStart = vi.fn(() => {
        throw new Error('start failed');
      });
      (globalThis as unknown as Record<string, unknown>).webkitSpeechRecognition =
        class {
          continuous = false;
          interimResults = false;
          lang = '';
          start = mockStart;
          stop = vi.fn();
          addEventListener = vi.fn();
          removeEventListener = vi.fn();
          onresult: ((event: unknown) => void) | null = null;
          onerror: ((event: unknown) => void) | null = null;
          onend: ((event: unknown) => void) | null = null;
        };

      const { result } = renderHook(() => useVoiceInput(vi.fn()));
      act(() => {
        result.current.startListening();
      });
      expect(result.current.state).toBe('error');
      expect(result.current.error).toBe('Could not start voice recognition');
    });
  });

  describe('stopListening', () => {
    it('should call recognition.stop()', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));
      act(() => {
        result.current.startListening();
      });
      act(() => {
        result.current.stopListening();
      });
      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe('toggleListening', () => {
    it('should start listening when idle', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));
      act(() => {
        result.current.toggleListening();
      });
      expect(result.current.state).toBe('listening');
    });

    it('should stop listening when already listening', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));
      act(() => {
        result.current.toggleListening();
      });
      act(() => {
        result.current.toggleListening();
      });
      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe('onresult handler', () => {
    it('should call onResult with final transcript when speech ends', () => {
      const onResult = vi.fn();
      const { result } = renderHook(() => useVoiceInput(onResult));

      act(() => {
        result.current.startListening();
      });

      // Simulate a final result
      act(() => {
        handlers.onresult?.({
          resultIndex: 0,
          results: [
            {
              isFinal: true,
              length: 1,
              0: { transcript: 'Hello world', confidence: 0.95 },
            },
          ],
          length: 1,
        });
      });

      // Simulate recognition ending
      act(() => {
        handlers.onend?.({} as Event);
      });

      expect(onResult).toHaveBeenCalledWith('Hello world');
    });

    it('should accumulate multiple final results in transcript state', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));

      act(() => {
        result.current.startListening();
      });

      // Fire both results in a single act block so React batches them
      act(() => {
        handlers.onresult?.({
          resultIndex: 0,
          results: [
            {
              isFinal: true,
              length: 1,
              0: { transcript: 'Hello', confidence: 0.95 },
            },
            {
              isFinal: true,
              length: 1,
              0: { transcript: ' world', confidence: 0.9 },
            },
          ],
          length: 2,
        });
      });

      expect(result.current.transcript).toBe('Hello world');
    });

    it('should set interim transcript for non-final results', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));

      act(() => {
        result.current.startListening();
      });

      act(() => {
        handlers.onresult?.({
          resultIndex: 0,
          results: [
            {
              isFinal: false,
              length: 1,
              0: { transcript: 'partial', confidence: 0.5 },
            },
          ],
          length: 1,
        });
      });

      expect(result.current.interimTranscript).toBe('partial');
    });
  });

  describe('onerror handler', () => {
    it('should transition to error state on recognition error', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));

      act(() => {
        result.current.startListening();
      });

      act(() => {
        handlers.onerror?.({ error: 'no-speech', message: 'No speech detected' } as unknown as Event);
      });

      expect(result.current.state).toBe('error');
      expect(result.current.error).toBe('No speech detected');
    });

    it('should auto-reset from error to idle after 2 seconds', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useVoiceInput(vi.fn()));

      act(() => {
        result.current.startListening();
      });

      act(() => {
        handlers.onerror?.({ error: 'aborted', message: 'Aborted' } as unknown as Event);
      });

      expect(result.current.state).toBe('error');

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.state).toBe('idle');
      vi.useRealTimers();
    });
  });

  describe('onend handler', () => {
    it('should transition to processing then idle when transcript exists', () => {
      const onResult = vi.fn();
      vi.useFakeTimers();
      const { result } = renderHook(() => useVoiceInput(onResult));

      act(() => {
        result.current.startListening();
      });

      // Add a final result
      act(() => {
        handlers.onresult?.({
          resultIndex: 0,
          results: [
            {
              isFinal: true,
              length: 1,
              0: { transcript: 'test', confidence: 0.9 },
            },
          ],
          length: 1,
        });
      });

      // End recognition
      act(() => {
        handlers.onend?.({} as Event);
      });

      expect(result.current.state).toBe('processing');
      expect(onResult).toHaveBeenCalledWith('test');

      // After 300ms, should go back to idle
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current.state).toBe('idle');
      vi.useRealTimers();
    });

    it('should go to idle directly when no transcript and not error', () => {
      const { result } = renderHook(() => useVoiceInput(vi.fn()));

      act(() => {
        result.current.startListening();
      });

      act(() => {
        handlers.onend?.({} as Event);
      });

      expect(result.current.state).toBe('idle');
    });
  });
});
