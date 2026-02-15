'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { ValidationMessage } from './ValidationMessage';

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

// Фирменные стили
const inputStyle = "mt-1 block w-full bg-white/10 border border-white/20 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-neonViolet focus:border-neonViolet";
const baseLabelStyle = "block text-sm font-medium text-white/80";
const errorTextStyle = "mt-1 text-red-400 text-sm";
const hintTextStyle = "mt-1 text-xs text-white/50";

const Label = ({ htmlFor, children, required = true }: { htmlFor: string, children: React.ReactNode, required?: boolean }) => (
  <label htmlFor={htmlFor} className={baseLabelStyle}>
    {children} {required && <span className="text-red-400">*</span>}
  </label>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" x2="12" y1="3" y2="15"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

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

  // Watch fields
  const oldResumeWatch = watch('oldResume');
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
          hint: 'Add more details about your experience and skills (minimum 50 characters)',
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

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setValue('oldResume', text, { shouldValidate: true });
    };

    if (file.type === 'text/plain') {
      reader.readAsText(file);
    }
  };

  const onSubmit = (data: UpdateResumeFormData) => {
    onTailor(data);
  };

  return (
    <div className="p-4 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Your Current Resume Section */}
        <div>
          <h3 className="font-display text-xl mb-1">Your Current Resume</h3>
          <p className="text-sm text-white/60 mb-4">
            Upload or paste your existing resume that needs to be updated and tailored.
          </p>

          <div className="space-y-3 border border-white/20 p-4 rounded-md">
            {/* File Upload */}
            <div>
              <input
                type="file"
                id="resumeUpload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="resumeUpload"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-white/40 text-white/60 hover:text-white/90 transition-all cursor-pointer"
              >
                <UploadIcon />
                <span className="text-sm">Upload Resume (PDF, DOCX, TXT)</span>
              </label>
              {uploadedFileName && (
                <p className="mt-2 text-xs text-green-400">✓ {uploadedFileName}</p>
              )}
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative px-3 bg-[#0a0118] text-xs text-white/40">OR</div>
            </div>

            {/* Text Input */}
            <div>
              <Label htmlFor="oldResume">Resume Text</Label>
              <textarea
                {...register('oldResume')}
                id="oldResume"
                rows={10}
                placeholder="Paste your current resume here...&#10;&#10;Include your work experience, skills, education, and any other relevant information."
                className={inputStyle + " resize-none"}
              />
              {errors.oldResume && <p className={errorTextStyle}>{errors.oldResume.message}</p>}
              {oldResumeWatch && <ValidationMessage result={oldResumeValidation} />}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20"></div>

        {/* Target Job Section */}
        <div>
          <h3 className="font-display text-xl mb-1">Target Job (Optional)</h3>
          <p className="text-sm text-white/60 mb-4">
            Provide the job details to tailor your resume for maximum ATS compatibility and relevance.
          </p>

          <div className="space-y-3 border border-white/20 p-4 rounded-md">
            <div>
              <Label htmlFor="targetJobTitle" required={false}>Job Title</Label>
              <input
                {...register('targetJobTitle')}
                id="targetJobTitle"
                type="text"
                placeholder="e.g., Senior Software Engineer"
                className={inputStyle}
              />
              <p className={hintTextStyle}>The position you&apos;re applying for.</p>
            </div>

            <div>
              <Label htmlFor="targetJobDescription" required={false}>Job Description</Label>
              <textarea
                {...register('targetJobDescription')}
                id="targetJobDescription"
                rows={8}
                placeholder="Paste the complete job description here...&#10;&#10;Include requirements, responsibilities, and desired qualifications. The more detail you provide, the better the AI can tailor your resume."
                className={inputStyle + " resize-none"}
              />
              <p className={hintTextStyle}>
                Copy the full job posting for best results. AI will extract keywords and match requirements.
              </p>
            </div>
          </div>

          {/* Pro Tip */}
          {!targetJobDescriptionWatch && (
            <div className="mt-3 p-3 rounded-md bg-yellow-500/10 border border-yellow-400/30">
              <p className="text-xs text-yellow-300">
                💡 <strong>Pro Tip:</strong> Without a target job description, the AI will improve your
                resume&apos;s overall quality but won&apos;t optimize it for a specific position. Add a job description
                for maximum impact!
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-white/20"></div>

        {/* LinkedIn Section */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display text-xl flex items-center gap-2">
              <LinkedInIcon />
              LinkedIn Context (Optional)
            </h3>
            <button
              type="button"
              onClick={() => setShowLinkedInHelp(!showLinkedInHelp)}
              className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              {showLinkedInHelp ? 'Hide guide' : 'How to use?'}
            </button>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Add your LinkedIn profile context to enrich your resume with additional professional details.
          </p>

          {/* Help Section */}
          {showLinkedInHelp && (
            <div className="mb-4 p-4 rounded-md bg-blue-500/10 border border-blue-400/30">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">📋 How to Copy LinkedIn Profile:</h4>
              <ol className="text-xs text-white/70 space-y-1.5 list-decimal list-inside ml-2">
                <li>Open your LinkedIn profile in browser</li>
                <li>Click &quot;More&quot; → &quot;Save to PDF&quot; OR copy text from your profile page</li>
                <li>If using PDF: Open it and copy all text</li>
                <li>Paste the text below in the &quot;Profile Text&quot; field</li>
                <li>AI will extract: headline, about, skills, experience, certifications</li>
              </ol>
              <p className="text-xs text-blue-300 mt-2">
                💡 Include About, Experience, and Skills sections for best results
              </p>
            </div>
          )}

          <div className="space-y-3 border border-white/20 p-4 rounded-md">
            <div>
              <Label htmlFor="linkedinUrl" required={false}>LinkedIn Profile URL</Label>
              <input
                {...register('linkedinUrl')}
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/your-profile"
                className={inputStyle}
              />
              {errors.linkedinUrl && <p className={errorTextStyle}>{errors.linkedinUrl.message}</p>}
              <p className={hintTextStyle}>Your LinkedIn profile link (optional, for reference).</p>
            </div>

            <div>
              <Label htmlFor="linkedinProfileText" required={false}>LinkedIn Profile Text</Label>
              <textarea
                {...register('linkedinProfileText')}
                id="linkedinProfileText"
                rows={6}
                placeholder="Paste text from your LinkedIn profile here...&#10;&#10;Include: About section, Experience descriptions, Skills, Certifications, etc."
                className={inputStyle + " resize-none font-mono text-sm"}
              />
              <p className={hintTextStyle}>
                This helps AI understand your professional brand and fill any gaps in your resume.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isTailoring}
          className="w-full px-6 py-3 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isTailoring ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Tailoring Your Resume...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              Tailor Resume to Job
            </>
          )}
        </button>

      </form>
    </div>
  );
}
