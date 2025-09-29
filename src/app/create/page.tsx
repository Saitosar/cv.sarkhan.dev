// src/app/create/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react'; // 1. Импортируем useRef
import { CreateResumeForm } from "@/components/CreateResumeForm";
import { LivePreview } from '@/components/LivePreview';
import { TemplateSelector, type TemplateName } from '@/components/TemplateSelector';
import { ColorPalette } from '@/components/ColorPalette';
import { ThemeToggle, type Theme } from '@/components/ThemeToggle';
import { classicPalettes, modernPalettes, creativePalettes } from '@/lib/palettes';
import { resumeSchema } from '@/lib/validators';
import type { z } from 'zod';

type ResumeData = z.infer<typeof resumeSchema> | null;

export default function CreatePage() {
  const [resumeData, setResumeData] = useState<ResumeData>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>("Классический");
  
  const [palettes, setPalettes] = useState(classicPalettes);
  const [accentColor, setAccentColor] = useState(classicPalettes[0]);
  const [theme, setTheme] = useState<Theme>('dark');
  
  // 2. Создаем "якорь" для блока с превью
  const previewRef = useRef<HTMLDivElement>(null);

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

  // 3. Обновляем функцию, добавляя логику скролла
  const handleGenerate = (data: ResumeData) => {
    setResumeData(data);
    // После обновления данных, плавно скроллим к блоку с превью
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        {/* 4. Привязываем "якорь" к этому div */}
        <div ref={previewRef} className="glass-card p-8 flex-grow">
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