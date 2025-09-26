// src/app/import/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { LivePreview } from '@/components/LivePreview';
import { TemplateSelector, type TemplateName } from '@/components/TemplateSelector';
import { ColorPalette } from '@/components/ColorPalette';
import { ThemeToggle, type Theme } from '@/components/ThemeToggle';
import { classicPalettes, modernPalettes, creativePalettes, type ColorScheme } from '@/lib/palettes';

type PreviewData = { result: string; } | null;

export default function ImportPage() {
  const [resumeData, setResumeData] = useState<PreviewData>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>("Классический");
  
  // Вся необходимая логика для управления цветом и темой, как в create/page.tsx
  const [palettes, setPalettes] = useState(classicPalettes);
  const [accentColor, setAccentColor] = useState(classicPalettes[0]);
  const [theme, setTheme] = useState<Theme>('dark');

  // Умный помощник, который меняет палитру при смене шаблона
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

  const handleImport = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const linkedInUrl = formData.get('linkedInUrl') as string;
    // Временно просто показываем URL для теста
    setResumeData({ result: `Importing from: ${linkedInUrl}` });
  };

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-card p-8">
        
        {/* Здесь форма со страницы Import */}
        <form onSubmit={handleImport} className="space-y-6">
            <div>
                <label htmlFor="linkedInUrl" className="block text-sm font-medium text-white/80 mb-2">
                    Paste your LinkedIn profile URL
                </label>
                <input
                    type="url"
                    id="linkedInUrl"
                    name="linkedInUrl"
                    className="mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-neonViolet focus:border-neonViolet"
                    placeholder="https://www.linkedin.com/in/your-profile"
                />
            </div>
            <div className="text-center text-white/50">OR</div>
            <div>
                <label htmlFor="resumeUpload" className="block text-sm font-medium text-white/80 mb-2">
                    Upload your LinkedIn resume (PDF)
                </label>
                <input
                    type="file"
                    id="resumeUpload"
                    name="resumeUpload"
                    className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neonViolet file:text-black hover:file:bg-violet-400"
                    accept=".pdf"
                />
            </div>
            <button type="submit" className="card-button w-full !mt-8">
                Import & Generate
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