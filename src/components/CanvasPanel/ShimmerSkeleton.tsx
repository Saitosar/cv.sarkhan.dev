'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export default function ShimmerSkeleton() {
  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <div className={cn('h-4 rounded-lg', 'animate-shimmer')} />
      <div className={cn('h-3 rounded-lg w-[90%]', 'animate-shimmer')} />
      <div className={cn('h-3 rounded-lg w-[80%]', 'animate-shimmer')} />
      <div className={cn('h-3 rounded-lg w-[70%]', 'animate-shimmer')} />
      <div className="h-8" />
      <div className={cn('h-4 rounded-lg w-[60%]', 'animate-shimmer')} />
      <div className={cn('h-3 rounded-lg w-[90%]', 'animate-shimmer')} />
      <div className={cn('h-3 rounded-lg w-[75%]', 'animate-shimmer')} />
    </div>
  );
}
