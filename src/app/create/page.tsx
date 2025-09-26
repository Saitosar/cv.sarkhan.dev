// src/app/create/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { CreateResumeForm } from "@/components/CreateResumeForm";
import { LivePreview } from '@/components/LivePreview';
import { TemplateSelector, type TemplateName } from '@/components/TemplateSelector';
import { ColorPalette } from '@/components/ColorPalette';
import { ThemeToggle, type Theme } from '@/components/ThemeToggle';
import { classicPalettes, modernPalettes, creativePalettes, type ColorScheme } from '@/lib/palettes';

type ResumeData = { result: string; } | null;

export default function CreatePage() {
  const [resumeData, setResumeData] = useState<ResumeData>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>("Классический");
  
  // --- Новые состояния для управления темами ---
  const [palettes, setPalettes] = useState(classicPalettes);
  const [accentColor, setAccentColor] = useState(classicPalettes[0]);
  const [theme, setTheme] = useState<Theme>('dark');

  // Этот эффект будет менять палитру и сбрасывать цвет при смене шаблона
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

  const handleGenerate = (data: ResumeData) => {
    setResumeData(data);
  };

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-card p-8">
        <CreateResumeForm 
          onGenerate={handleGenerate} 
          template={selectedTemplate} 
        />
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
          
          {/* --- Новые UI элементы --- */}
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