'use client';

import { Wand2 } from 'lucide-react';
import { findRoleTemplate, getRandomItems } from '@/lib/achievements-library';
import type { ResumeFormData } from '@/lib/validators';

interface FillSampleDataButtonProps {
  jobTitle: string;
  onFill: (data: Partial<ResumeFormData>) => void;
}

export function FillSampleDataButton({ jobTitle, onFill }: FillSampleDataButtonProps) {
  const handleFillSample = () => {
    const template = findRoleTemplate(jobTitle);

    if (!template) {
      // Generic sample data
      onFill({
        summary: 'Experienced professional with proven track record of delivering results and driving business growth.',
        skills: [
          { value: 'Leadership' },
          { value: 'Communication' },
          { value: 'Problem Solving' },
        ],
      });
      return;
    }

    // Role-specific sample data
    const randomAchievements = getRandomItems(template.achievements, 2);
    const randomSkills = getRandomItems(template.skills, 6);

    onFill({
      summary: template.summaries[0],
      experience: [
        {
          company: 'Tech Company Inc.',
          position: template.role,
          description: randomAchievements.map(a => `• ${a.text}`).join('\n'),
          startDate: { month: 'Jan', year: '2022' },
          endDate: { month: '', year: '', isCurrent: true },
        },
      ],
      skills: randomSkills.map(skill => ({ value: skill })),
      achievements: randomAchievements.map(a => ({ text: a.text })),
    });
  };

  return (
    <button
      type="button"
      onClick={handleFillSample}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 hover:border-purple-400/50 text-purple-300 hover:text-purple-200 transition-all text-sm font-medium"
    >
      <Wand2 size={16} />
      <span>Fill Sample Data</span>
    </button>
  );
}
