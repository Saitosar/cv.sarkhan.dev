// src/app/update/page.tsx
"use client";

import { useState } from 'react';
import { LivePreview } from '@/components/LivePreview';

export default function UpdatePage() {
  const [resumeData, setResumeData] = useState(null);

  // Здесь будет логика для обработки текста и отправки на API
  const handleUpdate = async (event) => {
    event.preventDefault();
    const text = event.target.elements.updatedInfo.value;
    
    // Аналогичный вызов API, как и в CreateResumeForm
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text }),
    });
    const result = await response.json();
    setResumeData(result);
  };

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-card p-8">
        <h1 className="font-display text-3xl mb-4">Update existing resume</h1>
        <form onSubmit={handleUpdate}>
          <textarea
            name="updatedInfo"
            rows={10}
            className="w-full bg-white/10 border border-white/20 rounded-md p-3 text-white"
            placeholder="Enter your updated information here..."
          />
          <button type="submit" className="card-button w-full mt-4">
            Update Resume
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