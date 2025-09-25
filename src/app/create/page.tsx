// src/app/create/page.tsx
"use client";

import { useState } from 'react';
import { CreateResumeForm } from "@/components/CreateResumeForm";
import { LivePreview } from '@/components/LivePreview';
import { TemplateSelector, type TemplateName } from '@/components/TemplateSelector'; // Импортируем компонент и тип

type ResumeData = {
  result: string;
} | null;

export default function CreatePage() {
  const [resumeData, setResumeData] = useState<ResumeData>(null);
  // 1. Добавляем состояние для выбранного шаблона
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>("Классический");

  const handleGenerate = (data: ResumeData) => {
    setResumeData(data);
  };

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Левая колонка: Форма */}
      <div className="glass-card p-8">
        <h1 className="font-display text-3xl mb-4">Create from scratch</h1>
        <p className="text-white/70 mb-6">Fill in the details below to generate your resume.</p>
        {/* 2. Передаем выбранный шаблон в форму */}
        <CreateResumeForm 
          onGenerate={handleGenerate} 
          template={selectedTemplate} 
        />
      </div>

      {/* Правая колонка: Предпросмотр и выбор шаблона */}
      <div className="flex flex-col gap-8">
        <div className="glass-card p-8 flex-grow">
          <h2 className="font-display text-2xl mb-4">Live Preview</h2>
          <LivePreview data={resumeData} template={selectedTemplate} />
        </div>
        <div className="glass-card p-8">
          {/* 3. Вставляем наш новый компонент */}
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
          />
        </div>
      </div>
    </div>
  );
}