// src/types/voice.ts

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

export interface VoiceInputProps {
  /** Called with transcribed text when speech is recognized */
  onResult: (text: string) => void;
  /** Called when voice state changes */
  onStateChange?: (state: VoiceState) => void;
  /** Whether voice input is disabled */
  disabled?: boolean;
}

export interface VoiceButtonProps {
  state: VoiceState;
  onClick: () => void;
  disabled?: boolean;
}

// ── Browser Speech Recognition Types ──

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
