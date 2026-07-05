'use client';

import * as React from 'react';
import type { ResumeHeaderProps } from '@/types/canvas';

export default function ResumeHeader({
  fullName,
  jobTitle,
  location,
  email,
  github,
  website,
}: ResumeHeaderProps) {
  return (
    <header className="border-b border-[rgba(255,255,255,0.08)] pb-6">
      <h1 className="text-4xl md:text-5xl font-bold text-[#e5e2e1] mb-2">
        {fullName}
      </h1>
      <h2 className="text-lg text-[#d2bbff] mb-4">{jobTitle}</h2>
      <div className="flex flex-wrap gap-4 text-sm text-[#c4c7c7]">
        {location && <span>📍 {location}</span>}
        {email && <span>✉️ {email}</span>}
        {github && <span>🔗 {github}</span>}
        {website && <span>🌐 {website}</span>}
      </div>
    </header>
  );
}
