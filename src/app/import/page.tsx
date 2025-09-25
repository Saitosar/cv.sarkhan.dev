// src/app/import/page.tsx
"use client";

import { useState } from 'react';
import { LivePreview } from '@/components/LivePreview';

export default function ImportPage() {
  const [resumeData, setResumeData] = useState(null);

  // Логика для импорта (в MVP просто отправим URL как текст)
  const handleImport = async (event) => {
    event.preventDefault();
    const url = event.target.elements.linkedinUrl.value;

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: `LinkedIn Profile: ${url}` }), // Отправляем URL
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
      <div className="glass-card p-8">
        <h2 className="font-display text-2xl mb-4">Live Preview</h2>
        <LivePreview data={resumeData} />
      </div>
    </div>
  );
}