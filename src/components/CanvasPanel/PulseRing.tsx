'use client';

import * as React from 'react';
import type { PulseRingProps } from '@/types/canvas';

export default function PulseRing({ visible, color = '#4F46E5' }: PulseRingProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute inset-0 rounded-full pulse-ring m-2"
      style={{ borderColor: `${color}33` }}
    />
  );
}
