// src/app/import/page.tsx
"use client";

import { useState, type FormEvent } from 'react';
import { LivePreview } from '@/components/LivePreview';
import { TemplateSelector, type TemplateName } from '@/components/TemplateSelector';

export default function ImportPage() {
  const [resumeData, setResumeData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>("Классический");

  // Логика для импорта (в MVP просто отправим URL как текст)
  const handleImport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = (event.target as HTMLFormElement).elements.namedItem('linkedinUrl') as HTMLInputElement;

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: `LinkedIn Profile: ${url.value}`, template: selectedTemplate }),
    });
    const result = await response.json();
    setResumeData(result);
  };

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-card p-8">
        <h1 className="font-display text-3xl mb-4">Import from LinkedIn</h1>
        <form onSubmit={handleImport}>
          <input
            name="linkedinUrl"
            className="w-full bg-white/10 border border-white/20 rounded-md p-3 text-white"
            placeholder="Paste LinkedIn profile link..."
          />
          <button type="submit" className="card-button w-full mt-4">
            Import & Generate
          </button>
        </form>
      </div>
     <div className="flex flex-col gap-8">
        <div className="glass-card p-8 flex-grow">
        <h2 className="font-display text-2xl mb-4">Live Preview</h2>
        <LivePreview data={resumeData} template={selectedTemplate} />
      </div>
      <div className="glass-card p-8">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
          />
        </div>
        </div>
    </div>
  );
}