'use client';

import { useState, useEffect } from 'react';
import { findRoleTemplate, getRandomItems, type Achievement } from '@/lib/achievements-library';
import { Sparkles, Plus, X } from 'lucide-react';

interface AchievementsSuggestionsProps {
  jobTitle: string;
  onSelect: (text: string) => void;
  currentField?: 'summary' | 'achievement';
}

export function AchievementsSuggestions({
  jobTitle,
  onSelect,
  currentField = 'achievement',
}: AchievementsSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!jobTitle || jobTitle.length < 3) {
      setSuggestions([]);
      return;
    }

    const template = findRoleTemplate(jobTitle);
    if (template) {
      if (currentField === 'summary') {
        setSuggestions(template.summaries);
      } else {
        // Show random 3 achievements
        const randomAchievements = getRandomItems(template.achievements, 3);
        setSuggestions(randomAchievements.map(a => a.text));
      }
    } else {
      setSuggestions([]);
    }
  }, [jobTitle, currentField]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 glass-card p-4 rounded-lg border border-cyan-400/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-400" />
          <h4 className="text-sm font-medium text-cyan-400">
            AI Suggestions for {currentField === 'summary' ? 'Summary' : 'Achievements'}
          </h4>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-white/60 hover:text-white/90 transition-colors"
        >
          {isExpanded ? 'Show less' : 'Show all'}
        </button>
      </div>

      <div className="space-y-2">
        {(isExpanded ? suggestions : suggestions.slice(0, 2)).map((suggestion, index) => (
          <div
            key={index}
            className="group relative bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all cursor-pointer border border-white/10 hover:border-cyan-400/50"
            onClick={() => onSelect(suggestion)}
          >
            <div className="flex items-start gap-3">
              <Plus
                size={16}
                className="text-cyan-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform"
              />
              <p className="text-sm text-white/80 group-hover:text-white flex-grow">
                {suggestion}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-xs text-white/50">
          💡 Tip: Click to use suggestion or customize it for your experience
        </p>
      </div>
    </div>
  );
}
