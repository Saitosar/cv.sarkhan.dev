// src/components/AssessmentResultDisplay.tsx
"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ScoreCircle } from './ScoreCircle';
import { Loader2 } from 'lucide-react';

type AssessmentResult = {
  resume_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  mentorship_tone_example: string;
};

interface AssessmentResultDisplayProps {
  result: AssessmentResult | null;
  error: string | null;
  isLoading: boolean;
}

// Список подсказок для экрана загрузки
const loadingTips = [
  "Analyzing work experience for quantifiable achievements...",
  "Checking for powerful action verbs to increase impact...",
  "Comparing your skills against the target job description...",
  "Assessing the clarity and structure of your summary...",
  "Formatting personalized recommendations...",
  "Almost there, just finalizing the report..."
];

const FeedbackSection = ({ title, items, icon, colorClass }: { title: string; items: string[]; icon: string; colorClass: string; }) => (
  <div>
    <h3 className={`text-lg font-semibold text-white/90 mb-3 flex items-center gap-2 ${colorClass}`}>
      <span>{icon}</span>
      {title}
    </h3>
    <ul className="list-disc pl-5 space-y-4 text-white/80 text-sm">
      {items.map((item, index) => (
        <li key={index} className="text-white/90">
          <ReactMarkdown components={{ p: ({ ...props }) => <span {...props} /> }}>
            {item}
          </ReactMarkdown>
        </li>
      ))}
    </ul>
  </div>
);

export function AssessmentResultDisplay({ result, error, isLoading }: AssessmentResultDisplayProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentTipIndex(prevIndex => (prevIndex + 1) % loadingTips.length);
      }, 2500); // Меняем подсказку каждые 2.5 секунды

      return () => clearInterval(interval); // Очистка при завершении загрузки
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 transition-all duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-white/80 mb-4" />
        <p className="text-white/70 text-sm h-10 flex items-center justify-center">
          {loadingTips[currentTipIndex]}
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
        <p className="text-center text-white/70">Click &quot;Assess Resume&quot; to get feedback.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center mb-4 text-white">Resume Assessment</h2>
      
      <div className="mb-6 p-4 rounded-md bg-white/5 text-center">
        <p className="text-lg font-semibold text-white italic">&quot;{result.mentorship_tone_example}&quot;</p>
      </div>
      
      <div className="flex flex-col items-center gap-y-8">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-xl font-semibold text-white/90 mb-4">Resume Score</h3>
          <ScoreCircle score={result.resume_score} />
        </div>
        
        <div className="w-full space-y-6">
          <FeedbackSection title="Strengths" items={result.strengths} icon="👍" colorClass="text-green-400" />
          <FeedbackSection title="Areas to Strengthen" items={result.weaknesses} icon="🤔" colorClass="text-yellow-400" />
          <FeedbackSection title="Actionable Recommendations" items={result.recommendations} icon="💡" colorClass="text-cyan-400" />
        </div>
      </div>
    </div>
  );
}