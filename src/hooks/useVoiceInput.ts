'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { VoiceState } from '@/types/voice';

interface UseVoiceInputReturn {
  state: VoiceState;
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionCtor = new () => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionInstance = any;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition ||
    null
  );
}

export function useVoiceInput(onResult: (text: string) => void): UseVoiceInputReturn {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef('');
  const isSupported = getSpeechRecognition() !== null;

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser');
      setState('error');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    setState('listening');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: Event) => {
      const speechEvent = event as unknown as {
        resultIndex: number;
        results: {
          isFinal: boolean;
          [index: number]: { transcript: string; confidence: number };
          length: number;
        }[];
      };

      let final = '';
      let interim = '';

      for (let i = speechEvent.resultIndex; i < speechEvent.results.length; i++) {
        const result = speechEvent.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      if (final) {
        setTranscript((prev) => {
          const next = prev + final;
          finalTranscriptRef.current = next;
          return next;
        });
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: Event) => {
      const err = event as unknown as { error: string; message?: string };
      setError(err.message || err.error || 'Voice recognition failed');
      setState('error');
    };

    recognition.onend = () => {
      setInterimTranscript('');
      const finalText = finalTranscriptRef.current || transcript;
      if (finalText) {
        setState('processing');
        onResult(finalText.trim());
        setTimeout(() => {
          setState('idle');
          setTranscript('');
          finalTranscriptRef.current = '';
        }, 300);
      } else if (state !== 'error') {
        setState('idle');
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setError('Could not start voice recognition');
      setState('error');
    }
  }, [onResult, transcript, state]);

  useEffect(() => {
    finalTranscriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (state === 'error') {
      const timer = setTimeout(() => setState('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const toggleListening = useCallback(() => {
    if (state === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  }, [state, startListening, stopListening]);

  return {
    state,
    isListening: state === 'listening',
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
