// src/components/AssessmentResultDisplay.tsx
"use client";

import ReactMarkdown from 'react-markdown';
import { ScoreCircle } from './ScoreCircle';
import { Loader2 } from 'lucide-react';

// --- НОВЫЙ ТИП ДАННЫХ ---
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

// Компонент для секций, чтобы избежать повторения кода
const FeedbackSection = ({ title, items, icon, colorClass }: { title: string; items: string[]; icon: string; colorClass: string; }) => (
  <div>
    <h3 className={`text-lg font-semibold text-white/90 mb-3 flex items-center gap-2 ${colorClass}`}>
      <span>{icon}</span>
      {title}
    </h3>
    <ul className="list-disc pl-5 space-y-4 text-white/80 text-sm">
      {items.map((item, index) => (
        <li key={index} className="text-white/90">
          {/* ИСПОЛЬЗУЕМ REACT MARKDOWN ДЛЯ РЕНДЕРИНГА */}
          <ReactMarkdown 
            // Предотвращаем рендеринг вложенного <p> внутри <li>
            components={{
              p: ({ node, ...props }) => <span {...props} />,
            }}
          >
            {item}
          </ReactMarkdown>
        </li>
      ))}
    </ul>
  </div>
);

export function AssessmentResultDisplay({ result, error, isLoading }: AssessmentResultDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-white/80 mb-4" />
        <p className="text-white/70 text-sm">Analyzing your resume, this may take a moment...</p>
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
        <p className="text-lg font-semibold text-white italic">"{result.mentorship_tone_example}"</p>
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