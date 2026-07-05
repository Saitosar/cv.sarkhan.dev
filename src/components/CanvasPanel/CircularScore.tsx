'use client';

import * as React from 'react';
import type { CircularScoreProps } from '@/types/canvas';

export default function CircularScore({
  score,
  size = 80,
  strokeWidth = 8,
  gradientId = 'ats-grad',
}: CircularScoreProps) {
  const radius = (100 - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * Math.max(0, Math.min(100, score))) / 100;

  return (
    <svg
      className="absolute inset-0 w-full h-full rotate-[-90deg]"
      viewBox="0 0 100 100"
      width={size}
      height={size}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#d2bbff" />
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
