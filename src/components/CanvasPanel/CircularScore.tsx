'use client';

import * as React from 'react';
import type { CircularScoreProps } from '@/types/canvas';

function getScoreColor(score: number): [string, string] {
  if (score < 50) return ['#ef4444', '#f87171']; // red
  if (score < 75) return ['#eab308', '#facc15']; // yellow
  return ['#4F46E5', '#d2bbff']; // green/violet
}

export default function CircularScore({
  score,
  size = 80,
  strokeWidth = 8,
}: CircularScoreProps) {
  const gradientId = React.useId();
  const radius = (100 - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * Math.max(0, Math.min(100, score))) / 100;
  const [startColor, endColor] = getScoreColor(score);

  return (
    <svg
      className="absolute inset-0 w-full h-full rotate-[-90deg]"
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        className="ats-score-arc"
      />
    </svg>
  );
}
