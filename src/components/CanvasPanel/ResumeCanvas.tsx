'use client';

import * as React from 'react';
import type { ResumeCanvasProps } from '@/types/canvas';
import ResumeHeader from './ResumeHeader';
import ResumeSection from './ResumeSection';
import ShimmerSkeleton from './ShimmerSkeleton';

const sectionTypes = [
  { key: 'summary', title: 'Professional Summary' },
  { key: 'experience', title: 'Experience' },
  { key: 'education', title: 'Education' },
  { key: 'skills', title: 'Skills' },
  { key: 'certifications', title: 'Certifications' },
  { key: 'projects', title: 'Projects' },
] as const;

export default function ResumeCanvas({
  resume,
  activeSection,
  onSectionTap,
}: ResumeCanvasProps) {
  const isEmpty = !resume.fullName && !resume.jobTitle;

  if (isEmpty) {
    return (
      <div className="glass-panel w-full h-full rounded-2xl overflow-y-auto p-8 md:p-12">
        <div className="h-full flex flex-col items-center justify-center text-center gap-6">
          <p className="text-lg text-[#c4c7c7]">
            Start a conversation with Aether to build your resume.
          </p>
          <ShimmerSkeleton />
        </div>
      </div>
    );
  }

  const experienceText = resume.experience
    .map(
      (exp) =>
        `• ${exp.position} at ${exp.company}${exp.description ? ` — ${exp.description}` : ''}`
    )
    .join('\n');

  const educationText = resume.education
    .map((edu) => `• ${edu.degree}, ${edu.institution}${edu.endYear ? ` (${edu.endYear})` : ''}`)
    .join('\n');

  const skillsText = resume.skills.map((s) => s.name).join(', ');
  const certificationsText = resume.certifications
    .map((c) => `• ${c.name}${c.issuer ? ` — ${c.issuer}` : ''}`)
    .join('\n');
  const projectsText = (resume.projects ?? [])
    .map((p) => `• ${p.name}${p.description ? ` — ${p.description}` : ''}`)
    .join('\n');

  const sections: { key: typeof sectionTypes[number]['key']; content: string }[] = [
    { key: 'summary', content: resume.summary },
    { key: 'experience', content: experienceText },
    { key: 'education', content: educationText },
    { key: 'skills', content: skillsText },
    { key: 'certifications', content: certificationsText },
    { key: 'projects', content: projectsText },
  ];

  return (
    <div className="glass-panel w-full h-full rounded-2xl overflow-y-auto p-8 md:p-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        <ResumeHeader
          fullName={resume.fullName}
          jobTitle={resume.jobTitle}
          location={resume.location}
          email={resume.contact?.email}
          github={resume.github}
          website={resume.website}
        />

        {sections.map(
          (section) =>
            section.content && (
              <ResumeSection
                key={section.key}
                title={
                  sectionTypes.find((s) => s.key === section.key)?.title ?? section.key
                }
                type={section.key}
                isActive={activeSection === section.key}
                onTap={() => onSectionTap?.(section.key)}
              >
                <div className="whitespace-pre-line">{section.content}</div>
              </ResumeSection>
            )
        )}
      </div>
    </div>
  );
}
