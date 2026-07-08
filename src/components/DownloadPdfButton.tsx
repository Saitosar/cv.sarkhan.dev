// src/components/DownloadPdfButton.tsx
'use client';

import { pdf } from '@react-pdf/renderer';
import { useState } from 'react';
import ClassicResumePDF from '@/components/pdf/ResumePDF';
import ModernResumePDF from '@/components/pdf/ModernResumePDF';
import CreativeResumePDF from '@/components/pdf/CreativeResumePDF';
import type { ResumeFormData } from '@/lib/validators';
import { Loader2 } from 'lucide-react';
import { type TemplateName, TEMPLATE_NAMES } from './TemplateSelector';
import type { ColorScheme } from '@/lib/palettes';
type Theme = 'dark' | 'light';

interface DownloadPdfButtonProps {
    data: ResumeFormData | null;
    template: TemplateName;
    accentColor: ColorScheme;
    theme: Theme;
}

export default function DownloadPdfButton({ data, template, accentColor, theme }: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  const renderPdfDocument = () => {
    if (!data) return null;

    switch (template) {
        case TEMPLATE_NAMES.MODERN:
            return <ModernResumePDF data={data} accentColor={accentColor} />;
        case TEMPLATE_NAMES.CREATIVE:
            return <CreativeResumePDF data={data} accentColor={accentColor} theme={theme} />;
        case TEMPLATE_NAMES.CLASSIC:
        default:
            return <ClassicResumePDF data={data} accentColor={accentColor} />;
    }
  };

  const onDownload = async () => {
    const doc = renderPdfDocument();
    if (!doc) {
        alert("Please fill out the form to generate resume data first.");
        return;
    }
    
    try {
      setLoading(true);
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data?.fullName?.replace(/\s+/g, '_') || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to generate PDF", error);
        alert("Sorry, there was an error generating the PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onDownload}
      className="card-button w-full"
      disabled={loading}
    >
      {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Download as PDF'}
    </button>
  );
}