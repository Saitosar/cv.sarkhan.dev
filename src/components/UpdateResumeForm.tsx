'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Sparkles, Briefcase, FileText, Linkedin } from 'lucide-react';
import { ValidationMessage } from './ValidationMessage';
import { AchievementsSuggestions } from './AchievementsSuggestions';
import { validateSummary } from '@/lib/field-validators';

// Validation schema for update form
const updateResumeSchema = z.object({
  oldResume: z.string().min(50, 'Resume text must be at least 50 characters'),
  targetJobTitle: z.string().optional(),
  targetJobDescription: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  linkedinProfileText: z.string().optional(),
});

export type UpdateResumeFormData = z.infer<typeof updateResumeSchema>;

interface UpdateResumeFormProps {
  onTailor: (data: UpdateResumeFormData) => void;
  isTailoring: boolean;
}

export function UpdateResumeForm({ onTailor, isTailoring }: UpdateResumeFormProps) {
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [showLinkedInHelp, setShowLinkedInHelp] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateResumeFormData>({
    resolver: zodResolver(updateResumeSchema),
    defaultValues: {
      oldResume: '',
      targetJobTitle: '',
      targetJobDescription: '',
      linkedinUrl: '',
      linkedinProfileText: '',
    },
  });

  // Watch fields for validation
  const oldResumeWatch = watch('oldResume');
  const targetJobTitleWatch = watch('targetJobTitle');
  const targetJobDescriptionWatch = watch('targetJobDescription');

  // Validation for old resume
  const oldResumeValidation = useMemo(
    () => {
      if (!oldResumeWatch) return { isValid: false, message: '', severity: 'error' as const };
      if (oldResumeWatch.length < 50) {
        return {
          isValid: false,
          message: 'Resume text is too short',
          severity: 'warning' as const,
          hint: 'Add more details about your experience and skills',
        };
      }
      return {
        isValid: true,
        message: 'Resume text looks good',
        severity: 'success' as const,
      };
    },
    [oldResumeWatch]
  );

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    // Simple text extraction for PDF/DOCX
    // In production, you'd use a proper library like pdf-parse or mammoth
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setValue('oldResume', text, { shouldValidate: true });
    };

    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      // For now, just show filename and let user paste text manually
      // In production, implement proper PDF/DOCX parsing
      console.log('File uploaded:', file.name);
    }
  };

  const onSubmit = (data: UpdateResumeFormData) => {
    onTailor(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-purple-400" size={28} />
          Smart Resume Tailoring
        </h2>
        <p className="text-white/60 text-sm">
          Transform your resume to perfectly match your target job. Our AI analyzes the job requirements
          and strategically positions your experience to maximize ATS compatibility.
        </p>
      </div>

      {/* Old Resume Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-white/90">
            <FileText size={16} className="inline mr-2" />
            Your Current Resume <span className="text-red-400">*</span>
          </label>
          {uploadedFileName && (
            <span className="text-xs text-green-400">📄 {uploadedFileName}</span>
          )}
        </div>

        {/* File Upload */}
        <div className="relative">
          <input
            type="file"
            id="resumeUpload"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
          />
          <label
            htmlFor="resumeUpload"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 hover:border-purple-400/50 text-white/70 hover:text-white transition-all cursor-pointer text-sm"
          >
            <Upload size={18} />
            <span>Upload Resume (PDF, DOCX, TXT)</span>
          </label>
        </div>

        <div className="relative">
          <span className="text-xs text-white/40 block text-center my-2">OR</span>
        </div>

        {/* Text Input */}
        <div>
          <textarea
            {...register('oldResume')}
            rows={12}
            placeholder="Paste your current resume here...&#10;&#10;Include your work experience, skills, education, and any other relevant information."
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          {errors.oldResume && (
            <p className="mt-2 text-sm text-red-400">{errors.oldResume.message}</p>
          )}
          {oldResumeWatch && <ValidationMessage result={oldResumeValidation} />}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 pt-6" />

      {/* Target Job Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase size={20} className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Target Job (Optional, but Recommended)</h3>
        </div>
        <p className="text-xs text-white/50">
          Providing job details dramatically improves resume relevance and ATS score. The AI will
          strategically incorporate keywords and tailor your experience to match requirements.
        </p>

        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Job Title
          </label>
          <input
            {...register('targetJobTitle')}
            type="text"
            placeholder="e.g., Senior Software Engineer"
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {targetJobTitleWatch && (
            <AchievementsSuggestions
              jobTitle={targetJobTitleWatch}
              currentField="summary"
              onSelect={(suggestion) => {
                // Could be used to pre-fill certain fields
                console.log('Suggestion selected:', suggestion);
              }}
            />
          )}
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Job Description
          </label>
          <textarea
            {...register('targetJobDescription')}
            rows={8}
            placeholder="Paste the complete job description here...&#10;&#10;Include requirements, responsibilities, and desired qualifications. The more detail you provide, the better the AI can tailor your resume."
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          {errors.targetJobDescription && (
            <p className="mt-2 text-sm text-red-400">{errors.targetJobDescription.message}</p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 pt-6" />

      {/* LinkedIn Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Linkedin size={20} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-white">LinkedIn Context (Optional)</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowLinkedInHelp(!showLinkedInHelp)}
            className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            {showLinkedInHelp ? 'Hide' : 'How to use?'}
          </button>
        </div>

        <p className="text-xs text-white/50">
          Adding your LinkedIn context helps the AI understand your professional brand and enriches
          your resume with additional details.
        </p>

        {/* Help Section */}
        {showLinkedInHelp && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/30 space-y-3">
            <h4 className="text-sm font-semibold text-blue-300">📋 How to Copy LinkedIn Profile:</h4>
            <ol className="text-xs text-white/70 space-y-2 list-decimal list-inside">
              <li>Open your LinkedIn profile in browser</li>
              <li>Click "More" → "Save to PDF" OR copy text from your profile page</li>
              <li>If using PDF: Open it and copy all text</li>
              <li>Paste the text below in the "Profile Text" field</li>
              <li>AI will extract: headline, about, skills, experience, certifications</li>
            </ol>
            <p className="text-xs text-blue-300 mt-2">
              💡 <strong>Tip:</strong> Include About, Experience, and Skills sections for best results
            </p>
          </div>
        )}

        {/* LinkedIn URL (for reference) */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            LinkedIn Profile URL (optional)
          </label>
          <input
            {...register('linkedinUrl')}
            type="url"
            placeholder="https://linkedin.com/in/your-profile"
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.linkedinUrl && (
            <p className="mt-2 text-sm text-red-400">{errors.linkedinUrl.message}</p>
          )}
        </div>

        {/* LinkedIn Profile Text */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            LinkedIn Profile Text
          </label>
          <textarea
            {...register('linkedinProfileText')}
            rows={6}
            placeholder="Paste text from your LinkedIn profile here...&#10;&#10;Include: About section, Experience descriptions, Skills, Certifications, etc."
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          />
          <p className="mt-2 text-xs text-white/40">
            ℹ️ This helps AI understand your professional brand and fill any gaps in your resume
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isTailoring}
          className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isTailoring ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Tailoring Your Resume...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Tailor Resume to Job
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      {!targetJobDescriptionWatch && (
        <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-400/30">
          <p className="text-sm text-yellow-300">
            💡 <strong>Pro Tip:</strong> Without a target job description, the AI will improve your
            resume's overall quality but won't optimize it for a specific position. Add a job description
            for maximum impact!
          </p>
        </div>
      )}
    </form>
  );
}
