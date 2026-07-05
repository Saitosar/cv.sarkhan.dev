// src/types/ats.ts
//
// ATSScore — совместим с существующим кодом (ats-scorer.ts, ATSScoreCard.tsx)
// breakdown — основное поле (используется в Object.entries(score.breakdown))
// sections — дополнительное поле для детального анализа

import type { SectionType } from './chat';

export interface ATSScore {
  overall: number;           // 0–100
  breakdown: {
    keywords: number;
    formatting: number;
    completeness: number;
    readability: number;
  };
  sections?: ATSSectionScore[];  // дополнительно, для детального анализа
  suggestions: string[];         // string[] — совместимо с ats-scorer.ts
  matchedKeywords: string[];
  missingKeywords: string[];
  lastAnalyzed: number | null;
}

export interface ATSSectionScore {
  section: SectionType;
  score: number;             // 0–100
  weight: number;            // вклад в overall (0–1)
  issues: string[];
}

export interface ATSSuggestion {
  id: string;
  section: SectionType;
  severity: 'high' | 'medium' | 'low';
  message: string;
  actionLabel?: string;
  applied: boolean;
}
