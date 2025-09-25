// src/app/create/page.tsx
"use client";

import { useState } from 'react';
import { CreateResumeForm } from "@/components/CreateResumeForm";
import { LivePreview } from '@/components/LivePreview';

// 1. Определяем тип для данных резюме
type ResumeData = {
  result: string;
} | null;

export default function CreatePage() {
  const [resumeData, setResumeData] = useState<ResumeData>(null);

  // 2. Применяем тип к параметру функции
  const handleGenerate = (data: ResumeData) => {
    setResumeData(data);
  };

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-card p-8">
        <h1 className="font-display text-3xl mb-4">Create from scratch</h1>
        <p className="text-white/70 mb-6">Fill in the details below to generate your resume.</p>
        <CreateResumeForm onGenerate={handleGenerate} />
      </div>

      <div className="glass-card p-8">
        <h2 className="font-display text-2xl mb-4">Live Preview</h2>
        <LivePreview data={resumeData} />
      </div>
    </div>
  );
}