// src/app/update/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { LivePreview } from '@/components/LivePreview';
import { TemplateSelector, type TemplateName, TEMPLATE_NAMES } from '@/components/TemplateSelector';
import { ColorPalette } from '@/components/ColorPalette';
import { ThemeToggle, type Theme } from '@/components/ThemeToggle';
import { classicPalettes, modernPalettes, creativePalettes } from '@/lib/palettes';
import { type ResumeFormData } from '@/lib/validators';
import { Loader2, Upload, FileText, Linkedin, MessageSquare, Sparkles, X, Briefcase } from 'lucide-react';
import DownloadPdfButton from '@/components/DownloadPdfButton';

export default function UpdatePage() {
  const [resumeData, setResumeData] = useState<ResumeFormData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>(TEMPLATE_NAMES.CLASSIC);
  
  const [palettes, setPalettes] = useState(classicPalettes);
  const [accentColor, setAccentColor] = useState(classicPalettes[0]);
  const [theme, setTheme] = useState<Theme>('dark');

  // Form state
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [targetJobDescription, setTargetJobDescription] = useState('');

  // Loading states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      setError(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    // VALIDATION: At least CV file or additional info must be provided
    // LinkedIn URL alone is not sufficient - it must be combined with CV or additional info
    if (!cvFile && !additionalInfo.trim()) {
      setError('Please provide either your old CV file or additional information. LinkedIn profile alone is not sufficient.');
      return;
    }

    setIsProcessing(true);

    try {
      let extractedCvText = '';
      let linkedInData = '';

      // Step 1: Parse uploaded CV file
      if (cvFile) {
        setProcessingStep('Extracting text from your CV...');
        const formData = new FormData();
        formData.append('file', cvFile);

        const parseResponse = await fetch('/api/parse-cv', {
          method: 'POST',
          body: formData,
        });

        if (!parseResponse.ok) {
          const errorData = await parseResponse.json();
          throw new Error(errorData.error || 'Failed to parse CV file');
        }

        const parseData = await parseResponse.json();
        extractedCvText = parseData.text;
        
        if (!extractedCvText || extractedCvText.trim().length < 10) {
          throw new Error('The CV file appears to be empty or could not be read properly. Please try another file.');
        }
      }

      // Step 2: Handle LinkedIn data
      if (linkedInUrl.trim()) {
        setProcessingStep('Processing LinkedIn information...');
        // Validate LinkedIn URL format
        const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
        if (!linkedInPattern.test(linkedInUrl.trim())) {
          throw new Error('Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/your-profile)');
        }
        linkedInData = linkedInUrl.trim();
      }

      // Step 3: Generate updated CV using AI
      setProcessingStep('AI is analyzing and creating your updated CV...');
      
      const updateResponse = await fetch('/api/update-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldCvText: extractedCvText || undefined,
          linkedInUrl: linkedInData || undefined,
          additionalInfo: additionalInfo.trim() || undefined,
          targetJob: {
            title: targetJobTitle.trim() || undefined,
            description: targetJobDescription.trim() || undefined,
          },
        }),
      });

      if (!updateResponse.ok) {
        let errorMessage = 'Failed to update CV';
        try {
          const errorData = await updateResponse.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          // If response is not JSON, try to get text
          const errorText = await updateResponse.text();
          errorMessage = errorText || `Server error: ${updateResponse.status} ${updateResponse.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const updatedResume: ResumeFormData = await updateResponse.json();
      setResumeData(updatedResume);
      setProcessingStep('CV updated successfully!');

    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating your CV');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="page-container">
        <div className="form-column glass-card">
          <div className="p-8">
            <h1 className="font-display text-3xl mb-3">Update Your CV</h1>
            <p className="text-white/50 text-sm mb-8">
              Upload your old CV or add new information. Include your LinkedIn profile for better results. We&apos;ll create an ATS-friendly resume.
            </p>

            <form onSubmit={handleUpdate} className="space-y-5">
              {/* CV File Upload */}
              <div>
                <label htmlFor="cvFile" className="block text-sm font-medium text-white/90 mb-3">
                  Old CV File
                </label>
                {!cvFile ? (
                  <label
                    htmlFor="cvFile"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 hover:border-neonViolet/50 transition-colors group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-white/40 group-hover:text-neonViolet transition-colors" />
                      <p className="mb-2 text-sm text-white/70">
                        <span className="font-semibold text-neonViolet">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-white/50">PDF, DOC, or DOCX (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      id="cvFile"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/20 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neonViolet/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-neonViolet" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{cvFile.name}</p>
                        <p className="text-xs text-white/50">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCvFile(null)}
                      className="flex-shrink-0 ml-3 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4 text-white/60 hover:text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* LinkedIn URL */}
              <div>
                <label htmlFor="linkedInUrl" className="block text-sm font-medium text-white/90 mb-3">
                  LinkedIn Profile
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="url"
                    id="linkedInUrl"
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg shadow-sm py-2.5 pl-10 pr-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neonViolet/50 focus:border-neonViolet transition-all"
                    placeholder="linkedin.com/in/your-profile"
                  />
                  {linkedInUrl && (
                    <button
                      type="button"
                      onClick={() => setLinkedInUrl('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
                      aria-label="Clear"
                    >
                      <X className="w-4 h-4 text-white/60 hover:text-white" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-white/50">
                  Note: We cannot access your LinkedIn profile directly. Please add your details in the &quot;What&apos;s New?&quot; section below for best results.
                </p>
              </div>

              {/* Target Job */}
              <div className="border-t border-white/10 pt-5">
                <label className="block text-sm font-medium text-white/90 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Target Job <span className="text-white/50 font-normal text-xs">(Optional)</span>
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={targetJobTitle}
                    onChange={(e) => setTargetJobTitle(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg shadow-sm py-2.5 px-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neonViolet/50 focus:border-neonViolet transition-all"
                    placeholder="Job title (e.g., Senior Product Manager)"
                  />
                  <textarea
                    value={targetJobDescription}
                    onChange={(e) => setTargetJobDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-lg shadow-sm py-2.5 px-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neonViolet/50 focus:border-neonViolet transition-all resize-none"
                    placeholder="Paste job description to tailor your CV..."
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t border-white/10 pt-5">
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-white/90 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  What&apos;s New? <span className="text-white/50 font-normal text-xs">(Optional)</span>
                </label>
                <textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg shadow-sm py-2.5 px-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neonViolet/50 focus:border-neonViolet transition-all resize-none"
                  placeholder="Share recent achievements, new skills, career changes, or anything else relevant..."
                />
              </div>

              {/* Helper Message */}
              {(!cvFile && !additionalInfo.trim()) && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-200/90 text-xs">
                  <p className="font-medium mb-1">⚠️ Required: Upload your old CV or add information in &quot;What&apos;s New?&quot;</p>
                  <p className="text-white/70">LinkedIn profile alone is not sufficient. Combine it with your CV or additional details for best results.</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Processing Status */}
              {isProcessing && (
                <div className="p-3 bg-neonViolet/10 border border-neonViolet/30 rounded-lg">
                  <div className="flex items-center gap-3 text-white">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{processingStep || 'Processing...'}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || (!cvFile && !additionalInfo.trim())}
                className="card-button card-button-shine w-full !mt-6 disabled:opacity-50 disabled:cursor-not-allowed !flex !items-center !justify-center gap-2 !py-3 !text-white !font-semibold"
                style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Updated CV</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="preview-column glass-card">
          <div className="flex flex-col gap-8 h-full p-2">
            <div className="p-8 flex-grow">
              <LivePreview 
                data={resumeData} 
                template={selectedTemplate}
                accentColor={accentColor}
                theme={theme}
              />
            </div>
            {resumeData && (
              <>
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
                    {selectedTemplate === "Креативный" && (
                      <ThemeToggle 
                        selectedTheme={theme}
                        onThemeChange={setTheme}
                      />
                    )}
                  </div>
                  <div className="border-t border-white/20 pt-6">
                    <DownloadPdfButton 
                      data={resumeData} 
                      template={selectedTemplate} 
                      accentColor={accentColor} 
                      theme={theme} 
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}