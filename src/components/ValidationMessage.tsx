'use client';

import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import type { ValidationResult } from '@/lib/field-validators';

interface ValidationMessageProps {
  result: ValidationResult;
  className?: string;
}

export function ValidationMessage({ result, className = '' }: ValidationMessageProps) {
  const icons = {
    success: <CheckCircle size={14} />,
    warning: <AlertCircle size={14} />,
    error: <XCircle size={14} />,
  };

  const colors = {
    success: 'text-green-400 bg-green-500/10 border-green-400/30',
    warning: 'text-yellow-400 bg-yellow-500/10 border-yellow-400/30',
    error: 'text-red-400 bg-red-500/10 border-red-400/30',
  };

  if (!result.message) {
    return null;
  }

  return (
    <div className={`mt-2 space-y-1 ${className}`}>
      {/* Main message */}
      <div className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg border ${colors[result.severity]}`}>
        <span className="mt-0.5">{icons[result.severity]}</span>
        <span className="flex-grow">{result.message}</span>
      </div>

      {/* Hint */}
      {result.hint && (
        <div className="flex items-start gap-2 text-xs text-white/60 px-3 py-1">
          <Info size={12} className="mt-0.5 flex-shrink-0" />
          <span>{result.hint}</span>
        </div>
      )}
    </div>
  );
}
