// src/app/update/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { UpdateResumeForm, type UpdateResumeFormData } from '@/components/UpdateResumeForm';
import { LivePreview } from '@/components/LivePreview';
import { SkeletonPreview } from '@/components/SkeletonPreview';
import { ATSScoreCard } from '@/components/ATSScoreCard';
import { TemplateSelector, type TemplateName, TEMPLATE_NAMES } from '@/components/TemplateSelector';
import { ColorPalette } from '@/components/ColorPalette';
import { ThemeToggle, type Theme } from '@/components/ThemeToggle';
import { classicPalettes, modernPalettes, creativePalettes } from '@/lib/palettes';
import { Tabs, TabContent } from '@/components/ui/Tabs';
import { type ResumeFormData } from '@/lib/validators';
import DownloadPdfButton from '@/components/DownloadPdfButton';
import { useAIStatus } from '@/hooks/useAIStatus';
import { TrendingUp, Zap } from 'lucide-react';

type RightPanelView = 'preview' | 'ats-score' | 'improvements';

interface TailoredResumeResponse extends ResumeFormData {
  atsScore?: number;
  keywordsMatched?: string[];
  improvementNotes?: string;
  isTailored?: boolean;
  targetJobTitle?: string | null;
}

export default function UpdatePage() {
  const [tailoredResume, setTailoredResume] = useState<TailoredResumeResponse | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>(TEMPLATE_NAMES.CLASSIC);

  const [palettes, setPalettes] = useState(classicPalettes);
  const [accentColor, setAccentColor] = useState(classicPalettes[0]);
  const [theme, setTheme] = useState<Theme>('dark');

  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('preview');
  const [isTailoring, setIsTailoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store original input for comparison
  const [originalInput, setOriginalInput] = useState<UpdateResumeFormData | null>(null);

  // AI status messages
  const aiStatus = useAIStatus(isTailoring);

  useEffect(() => {
    switch (selectedTemplate) {
      case TEMPLATE_NAMES.MODERN:
        setPalettes(modernPalettes);
        setAccentColor(modernPalettes[0]);
        break;
      case TEMPLATE_NAMES.CREATIVE:
        setPalettes(creativePalettes);
        setAccentColor(creativePalettes[0]);
        break;
      default:
        setPalettes(classicPalettes);
        setAccentColor(classicPalettes[0]);
    }
  }, [selectedTemplate]);

  const handleTailor = async (data: UpdateResumeFormData) => {
    setIsTailoring(true);
    setError(null);
    setOriginalInput(data);
    setRightPanelView('preview');

    try {
      const response = await fetch('/api/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to tailor resume');
      }

      const result: TailoredResumeResponse = await response.json();
      setTailoredResume(result);

      // Auto-switch to ATS score tab if job was provided
      if (data.targetJobDescription) {
        setTimeout(() => setRightPanelView('ats-score'), 1000);
      }
    } catch (err) {
      console.error('Tailoring error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsTailoring(false);
    }
  };

  const tabs: { id: RightPanelView; label: string }[] = [
    { id: 'preview', label: 'Preview' },
    { id: 'ats-score', label: 'ATS Score' },
    { id: 'improvements', label: 'What Changed' },
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 pb-24 md:pb-6">
      <div className="page-container">
        {/* Left Column - Form */}
        <div className="form-column glass-card">
          <UpdateResumeForm onTailor={handleTailor} isTailoring={isTailoring} />
        </div>

        {/* Right Column - Preview & Results */}
        <div className="preview-column glass-card">
          <Tabs
            tabs={tabs}
            activeTab={rightPanelView}
            onTabChange={(tab) => setRightPanelView(tab)}
          >
            {/* Preview Tab */}
            <TabContent id="preview">
              <div className="flex flex-col gap-8 h-full p-2">
                <div className="p-8 flex-grow">
                  {isTailoring ? (
                    <SkeletonPreview status={aiStatus} />
                  ) : error ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <div className="text-red-400 text-lg">⚠️ Error</div>
                        <p className="text-white/60">{error}</p>
                      </div>
                    </div>
                  ) : tailoredResume ? (
                    <>
                      {tailoredResume.isTailored && (
                        <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                          <div className="flex items-center gap-2 text-purple-300">
                            <Zap size={20} />
                            <span className="font-semibold">
                              Tailored for: {tailoredResume.targetJobTitle || 'Target Position'}
                            </span>
                          </div>
                        </div>
                      )}
                      <LivePreview
                        data={tailoredResume}
                        template={selectedTemplate}
                        accentColor={accentColor}
                        theme={theme}
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <div className="text-6xl">📄</div>
                        <p className="text-white/60">
                          Fill in the form and click "Tailor Resume" to see your optimized resume
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Controls */}
                {tailoredResume && !isTailoring && (
                  <div className="p-8 space-y-6">
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
                      {selectedTemplate === TEMPLATE_NAMES.CREATIVE && (
                        <ThemeToggle selectedTheme={theme} onThemeChange={setTheme} />
                      )}
                    </div>
                    <div className="border-t border-white/20 pt-6">
                      <DownloadPdfButton
                        data={tailoredResume}
                        template={selectedTemplate}
                        accentColor={accentColor}
                        theme={theme}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabContent>

            {/* ATS Score Tab */}
            <TabContent id="ats-score">
              <div className="p-6 space-y-6">
                {isTailoring ? (
                  <SkeletonPreview status={aiStatus} />
                ) : tailoredResume ? (
                  <>
                    {/* AI-Predicted Score */}
                    {tailoredResume.atsScore && (
                      <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                              AI-Predicted ATS Score
                            </h3>
                            <p className="text-sm text-white/60">
                              Based on job requirements and keyword matching
                            </p>
                          </div>
                          <div className="text-5xl font-bold text-green-400">
                            {tailoredResume.atsScore}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Matched Keywords */}
                    {tailoredResume.keywordsMatched && tailoredResume.keywordsMatched.length > 0 && (
                      <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <TrendingUp size={20} className="text-green-400" />
                          Keywords Successfully Integrated
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {tailoredResume.keywordsMatched.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 text-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full ATS Analysis */}
                    <div className="border-t border-white/20 pt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Detailed ATS Analysis
                      </h3>
                      <ATSScoreCard
                        resumeData={tailoredResume}
                        targetJobDescription={originalInput?.targetJobDescription}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white/60">Generate a tailored resume to see ATS score</p>
                  </div>
                )}
              </div>
            </TabContent>

            {/* Improvements Tab */}
            <TabContent id="improvements">
              <div className="p-6">
                {isTailoring ? (
                  <SkeletonPreview status={aiStatus} />
                ) : tailoredResume?.improvementNotes ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg bg-purple-500/10 border border-purple-400/30">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        🔧 Changes Made to Your Resume
                      </h3>
                      <div className="text-white/80 whitespace-pre-line">
                        {tailoredResume.improvementNotes}
                      </div>
                    </div>

                    {tailoredResume.isTailored && (
                      <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-400/30">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          🎯 Tailoring Strategy
                        </h3>
                        <ul className="space-y-2 text-white/80">
                          <li>✓ Summary repositioned to match target role</li>
                          <li>✓ Keywords from job description strategically integrated</li>
                          <li>✓ Experience reframed to highlight relevant achievements</li>
                          <li>✓ Skills prioritized based on job requirements</li>
                          <li>✓ ATS optimization applied throughout</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white/60">
                      Generate a tailored resume to see what changed
                    </p>
                  </div>
                )}
              </div>
            </TabContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
