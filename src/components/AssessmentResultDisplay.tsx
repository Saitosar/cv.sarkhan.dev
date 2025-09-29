// src/components/AssessmentResultDisplay.tsx
"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ScoreCircle } from './ScoreCircle';
import { Loader2 } from 'lucide-react'; // Импортируем иконку загрузки

// --- НАШ СПИСОК СОВЕТОВ ---
const loadingTips = [
  "Analyzing your 'Experience' section for action verbs...",
  "Checking summary for keywords that match your target role...",
  "Did you know? Resumes with metrics are 40% more effective.",
  "Ensuring your skills are clearly and concisely listed...",
  "Verifying contact information is present and professional.",
];

type AssessmentResult = {
  confidenceScore: number;
  recommendations: string[];
  message: string;
};

interface AssessmentResultDisplayProps {
  result: AssessmentResult | null;
  error: string | null;
  isLoading: boolean;
}

export function AssessmentResultDisplay({ result, error, isLoading }: AssessmentResultDisplayProps) {
  // Состояние для хранения текущего совета
  const [currentTip, setCurrentTip] = useState(loadingTips[0]);

  // Эффект для смены советов во время загрузки
  useEffect(() => {
    if (isLoading) {
      const intervalId = setInterval(() => {
        setCurrentTip(prevTip => {
          const currentIndex = loadingTips.indexOf(prevTip);
          const nextIndex = (currentIndex + 1) % loadingTips.length;
          return loadingTips[nextIndex];
        });
      }, 3000); // Меняем совет каждые 3 секунды

      // Очищаем интервал, когда загрузка завершится
      return () => clearInterval(intervalId);
    }
  }, [isLoading]);


  // --- ОБНОВЛЕННЫЙ БЛОК ЗАГРУЗКИ ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-white/80 mb-4" />
        <p className="text-white/70 text-sm">
          {currentTip}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-500 bg-red-50/10 rounded-lg">
        <h3 className="text-lg font-semibold text-red-500">Assessment Error</h3>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
        <div className="flex items-center justify-center h-full p-4">
            <p className="text-center text-white/70">Click "Assess Resume" to get feedback.</p>
        </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4 text-white">Resume Assessment</h2>
      
      <div className="mb-6 p-4 rounded-md bg-white/5 text-center">
        <p className="text-lg font-semibold text-white">{result.message}</p>
      </div>
      
      <div className="flex flex-col items-center gap-y-8">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-xl font-semibold text-white/90 mb-4">Confidence Score</h3>
          <ScoreCircle score={result.confidenceScore} />
        </div>
        
        <div className="w-full">
          <h3 className="text-xl font-semibold text-white/90 text-center mb-4">Recommendations for Improvement</h3>
          <div className="space-y-4">
            {result.recommendations.map((rec, index) => (
              <div key={index} className="prose prose-invert max-w-none text-white/80 p-4 border border-white/10 rounded-lg bg-white/5 prose-p:my-2 prose-strong:text-neonCyan">
                <ReactMarkdown>{rec}</ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}