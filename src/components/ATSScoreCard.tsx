'use client';

import { useMemo } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { calculateATSScore } from '@/lib/ats-scorer';
import type { ATSScore } from '@/types/ats';
import type { ResumeFormData } from '@/lib/validators';

interface ATSScoreCardProps {
  resumeData: ResumeFormData | null;
  targetJobDescription?: string;
}

export function ATSScoreCard({ resumeData, targetJobDescription }: ATSScoreCardProps) {
  const score: ATSScore | null = useMemo(() => {
    if (!resumeData) return null;
    return calculateATSScore(resumeData, targetJobDescription);
  }, [resumeData, targetJobDescription]);

  if (!score) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-display mb-4">ATS Score</h3>
        <p className="text-sm text-white/60">
          Fill out your resume to see your ATS compatibility score
        </p>
      </div>
    );
  }

  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 80) return { path: '#10b981', text: '#10b981', trail: 'rgba(16, 185, 129, 0.2)' };
    if (scoreValue >= 60) return { path: '#f59e0b', text: '#f59e0b', trail: 'rgba(245, 158, 11, 0.2)' };
    return { path: '#ef4444', text: '#ef4444', trail: 'rgba(239, 68, 68, 0.2)' };
  };

  const colors = getScoreColor(score.overall);

  return (
    <div className="glass-card p-6 rounded-2xl space-y-6">
      {/* Overall Score */}
      <div className="flex items-center gap-6">
        <div className="w-24 h-24">
          <CircularProgressbar
            value={score.overall}
            text={`${score.overall}`}
            styles={buildStyles({
              pathColor: colors.path,
              textColor: colors.text,
              trailColor: colors.trail,
              textSize: '24px',
            })}
          />
        </div>
        <div>
          <h3 className="text-xl font-display mb-1">ATS Score</h3>
          <p className="text-sm text-white/60">
            {score.overall >= 80 && 'Excellent! ATS-optimized'}
            {score.overall >= 60 && score.overall < 80 && 'Good, but can improve'}
            {score.overall < 60 && 'Needs improvement'}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white/80">Breakdown</h4>
        {Object.entries(score.breakdown).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-white/70 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${value}%`,
                    backgroundColor: getScoreColor(value).path,
                  }}
                />
              </div>
              <span className="text-sm font-medium w-10 text-right" style={{ color: getScoreColor(value).path }}>
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {score.suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
            <AlertCircle size={16} className="text-yellow-400" />
            Suggestions
          </h4>
          <ul className="space-y-2">
            {score.suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="text-sm text-white/70 flex items-start gap-2 bg-white/5 p-2 rounded-lg"
              >
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keywords Match */}
      {targetJobDescription && score.matchedKeywords.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-400" />
            Matched Keywords ({score.matchedKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {score.matchedKeywords.slice(0, 10).map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full border border-green-400/30"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords */}
      {targetJobDescription && score.missingKeywords.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/80 flex items-center gap-2">
            <XCircle size={16} className="text-red-400" />
            Missing Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {score.missingKeywords.slice(0, 10).map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-full border border-red-400/30"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-white/50">
          💡 This score is calculated locally without AI to give you instant feedback
        </p>
      </div>
    </div>
  );
}
