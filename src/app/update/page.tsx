// src/app/update/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { LivePreview } from '@/components/LivePreview';
import { TemplateSelector, type TemplateName } from '@/components/TemplateSelector';
import { ColorPalette } from '@/components/ColorPalette';
import { ThemeToggle, type Theme } from '@/components/ThemeToggle';
import { classicPalettes, modernPalettes, creativePalettes } from '@/lib/palettes';

// Обновленный и более точный тип для данных этой страницы
type SimplePreviewData = { result: string } | null;

export default function UpdatePage() {
  const [resumeData, setResumeData] = useState<SimplePreviewData>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>("Классический");
  
  const [palettes, setPalettes] = useState(classicPalettes);
  const [accentColor, setAccentColor] = useState(classicPalettes[0]);
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    switch (selectedTemplate) {
      case "Современный":
        setPalettes(modernPalettes);
        setAccentColor(modernPalettes[0]);
        break;
      case "Креативный":
        setPalettes(creativePalettes);
        setAccentColor(creativePalettes[0]);
        break;
      default:
        setPalettes(classicPalettes);
        setAccentColor(classicPalettes[0]);
    }
  }, [selectedTemplate]);

  const handleUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedInfo = formData.get('updatedInfo') as string;
    setResumeData({ result: updatedInfo });
  };

  return (
    <div className="container mx-auto p-3 md:p-6 pb-24 md:pb-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
      <div className="glass-card p-4 md:p-8">
        
        <form onSubmit={handleUpdate} className="space-y-6">
            <div>
                <label htmlFor="updatedInfo" className="block text-sm font-medium text-white/80 mb-2">
                    Enter your updated information or a new job description.
                </label>
                <textarea
                    id="updatedInfo"
                    name="updatedInfo"
                    rows={10}
                    className="mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-neonViolet focus:border-neonViolet"
                    placeholder="e.g., I want to apply for a Senior Product Manager role at Google..."
                />
            </div>
            <div>
                <label htmlFor="resumeUpload" className="block text-sm font-medium text-white/80 mb-2">
                    Upload your existing resume (PDF/DOCX)
                </label>
                <input
                    type="file"
                    id="resumeUpload"
                    name="resumeUpload"
                    className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neonViolet file:text-black hover:file:bg-violet-400"
                    accept=".pdf,.doc,.docx"
                />
            </div>
            <button type="submit" className="card-button w-full !mt-8">
                Update Resume
            </button>
        </form>

      </div>

      <div className="flex flex-col gap-8">
        <div className="glass-card p-8 flex-grow">
          <LivePreview 
            data={resumeData} 
            template={selectedTemplate}
            accentColor={accentColor}
            theme={theme}
          />
        </div>
        <div className="glass-card p-8 space-y-6">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
          />
          <div className="border-t border-white/20"></div>
          <div className="flex justify-center items-center gap-8">
            <ColorPalette 
              palettes={palettes}
              selectedColor={accentColor}
              onColorChange={setAccentColor}
            />
            {selectedTemplate === "Креативный" && (
              <ThemeToggle 
                selectedTheme={theme}
                onThemeChange={setTheme}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}