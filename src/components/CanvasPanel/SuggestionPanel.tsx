'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Lightbulb, Loader2, AlertCircle } from 'lucide-react';
import type { SuggestionPanelProps } from '@/types/suggestions';
import SuggestionCard from './SuggestionCard';

export default function SuggestionPanel({
  suggestions,
  isLoading,
  error,
  onApply,
  onDismiss,
  onRefresh,
  activeSection,
  className,
}: SuggestionPanelProps) {
  const sorted = React.useMemo(
    () =>
      [...suggestions].sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
    [suggestions]
  );

  const visible = sorted.filter((s) => !s.dismissed && !s.applied);

  const errorMessage = error ?? null;

  return (
    <div
      className={cn(
        'absolute bottom-4 right-4 z-30 w-[340px] max-h-[60vh]',
        'glass-panel rounded-2xl overflow-hidden flex flex-col',
        'shadow-[0_0_30px_rgba(96,1,209,0.15)] animate-panel-in',
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/8">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-[rgba(210,187,255,0.3)]" />
          <span className="text-sm font-semibold text-[rgba(210,187,255,0.3)]">
            AI Suggestions
          </span>
          {visible.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#6001d1]/30 text-[rgba(210,187,255,0.3)] text-xs">
              {visible.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh suggestions"
          className={cn(
            'p-1.5 rounded-lg text-[#c4c7c7] hover:text-[#d2bbff] hover:bg-white/5',
            'transition-colors disabled:opacity-40'
          )}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-lg">refresh</span>
          )}
        </button>
      </div>

      <div className="overflow-y-auto p-3 space-y-3">
        {errorMessage && (
          <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-300 animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {isLoading && visible.length === 0 && (
          <div className="space-y-3">
            <SuggestionSkeleton />
            <SuggestionSkeleton />
          </div>
        )}

        {!isLoading && !errorMessage && visible.length === 0 && (
          <div className="text-center py-8 px-2">
            <p className="text-sm text-[#c4c7c7]">
              {activeSection
                ? `Tap "Refresh" to get AI suggestions for ${activeSection}.`
                : 'Tap a resume section to analyze it.'}
            </p>
          </div>
        )}

        {!isLoading && errorMessage && visible.length === 0 && (
          <div className="text-center py-8 px-2">
            <p className="text-sm text-[#c4c7c7]">
              Fix the issue and tap &quot;Refresh&quot; to try again.
            </p>
          </div>
        )}

        {visible.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className="animate-suggestion-in"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <SuggestionCard
              suggestion={suggestion}
              onApply={() => onApply(suggestion)}
              onDismiss={() => onDismiss(suggestion.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SuggestionSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-white/5 animate-pulse space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-14 h-5 rounded-full bg-white/10" />
        <div className="w-24 h-4 rounded bg-white/10" />
      </div>
      <div className="w-full h-3 rounded bg-white/10" />
      <div className="w-2/3 h-3 rounded bg-white/10" />
      <div className="flex gap-2">
        <div className="w-16 h-7 rounded-lg bg-white/10" />
        <div className="w-16 h-7 rounded-lg bg-white/10" />
      </div>
    </div>
  );
}
