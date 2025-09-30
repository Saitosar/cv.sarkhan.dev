// src/app/create/page.tsx
"use client";

// useRef и useReactToPrint БОЛЬШЕ НЕ НУЖНЫ
import { useState, useEffect } from 'react'; 
import { CreateResumeForm } from "@/components/CreateResumeForm";
import { LivePreview } from '@/components/LivePreview';
import { TemplateSelector, type TemplateName } from '@/components/TemplateSelector';
import { ColorPalette } from '@/components/ColorPalette';
import { ThemeToggle, type Theme } from '@/components/ThemeToggle';
import { classicPalettes, modernPalettes, creativePalettes } from '@/lib/palettes';
import { AssessmentResultDisplay } from '@/components/AssessmentResultDisplay';
import { Tabs, TabContent } from '@/components/ui/Tabs';
import { type ResumeFormData } from '@/lib/validators';
import { Download } from 'lucide-react';

type AssessmentResult = {
  resume_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  mentorship_tone_example: string;
};

type RightPanelView = 'preview' | 'assessment';

export default function CreatePage() {
  const [resumeData, setResumeData] = useState<ResumeFormData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>("Классический");
  const [palettes, setPalettes] = useState(classicPalettes);
  const [accentColor, setAccentColor] = useState(classicPalettes[0]);
  const [theme, setTheme] = useState<Theme>('dark');
  
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('preview');
  
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  // --- УДАЛЕНА ЛОГИКА useReactToPrint ---

  useEffect(() => {
    switch (selectedTemplate) {
      case "Современный": setPalettes(modernPalettes); setAccentColor(modernPalettes[0]); break;
      case "Креативный": setPalettes(creativePalettes); setAccentColor(creativePalettes[0]); break;
      default: setPalettes(classicPalettes); setAccentColor(classicPalettes[0]);
    }
  }, [selectedTemplate]);

  const handleGenerate = (data: ResumeFormData) => {
    setResumeData(data);
    setRightPanelView('preview'); 
  };
  
  const handleAssess = async (values: ResumeFormData) => {
    setIsAssessing(true);
    setAssessmentResult(null);
    setAssessmentError(null);
    setRightPanelView('assessment');

    try {
      const response = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assess resume.");
      }
      const data: AssessmentResult = await response.json();
      setAssessmentResult(data);
    } catch (error) {
      console.error("Assessment error:", error);
      setAssessmentError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsAssessing(false);
    }
  };
  
  const tabs: { id: RightPanelView, label: string }[] = [
      { id: 'preview', label: 'Preview' },
      { id: 'assessment', label: 'Assessment' }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="page-container">
        <div className="form-column glass-card">
          <CreateResumeForm 
            onGenerate={handleGenerate}
            onAssess={handleAssess}
            isAssessing={isAssessing}
          />
        </div>
        <div className="preview-column glass-card">
          <Tabs
            tabs={tabs}
            activeTab={rightPanelView}
            onTabChange={(tab) => setRightPanelView(tab)}
          >
            <TabContent id="preview">
              <div className="flex flex-col gap-8 h-full p-2">
                <div className="p-8 flex-grow">
                  {/* --- ОБРАТИТЕ ВНИМАНИЕ: ref больше не передается --- */}
                  <LivePreview 
                    data={resumeData}
                    template={selectedTemplate}
                    accentColor={accentColor}
                    theme={theme}
                  />
                </div>
                <div className="p-8 space-y-6">
                  <TemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={setSelectedTemplate} />
                  <div className="border-t border-white/20"></div>
                  <div className="flex justify-center items-center gap-8">
                    <ColorPalette palettes={palettes} selectedColor={accentColor} onColorChange={setAccentColor} />
                    {selectedTemplate === "Креативный" && ( <ThemeToggle selectedTheme={theme} onThemeChange={setTheme} /> )}
                  </div>
                  {/* --- ИЗМЕНЕНИЕ: Кнопка теперь вызывает window.print() --- */}
                  <button onClick={() => window.print()} className="card-button w-full flex items-center justify-center gap-2">
                    <Download size={20} />
                    Download PDF
                  </button>
                </div>
              </div>
            </TabContent>
            
            <TabContent id="assessment">
              <AssessmentResultDisplay 
                result={assessmentResult}
                error={assessmentError}
                isLoading={isAssessing}
              />
            </TabContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}