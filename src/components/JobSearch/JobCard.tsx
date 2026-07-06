'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { JobCardProps } from '@/types/job-search';
import MatchScoreBadge from './MatchScoreBadge';
import { MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react';

export default function JobCard({ job, onSelect }: JobCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(job)}
      className={cn(
        'w-full text-left rounded-2xl border border-[rgba(255,255,255,0.08)]',
        'bg-[#1c1b1b]/60 hover:bg-[#1c1b1b]/90',
        'p-5 transition-all duration-200 group',
        'focus:outline-none focus:ring-1 focus:ring-[#d2bbff]/50'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[15px] font-semibold text-[#e5e2e1] truncate">
              {job.title}
            </h3>
            {job.url && (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#c4c7c7]">
                <ExternalLink size={14} />
              </span>
            )}
          </div>
          <p className="text-sm text-[#d2bbff] mb-2">{job.company}</p>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#c4c7c7] mb-3">
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> {job.location}
              </span>
            )}
            {job.salary && (
              <span className="inline-flex items-center gap-1">
                <DollarSign size={12} /> {job.salary}
              </span>
            )}
            {job.postedDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} /> {job.postedDate}
              </span>
            )}
          </div>

          <p className="text-[13px] text-[#c4c7c7] line-clamp-2 mb-4 leading-relaxed">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {job.matchedSkills.map((skill) => (
              <span
                key={`matched-${skill}`}
                className="text-[10px] px-2 py-1 rounded-full border border-[#4ae176]/30 text-[#4ae176] bg-[rgba(74,225,118,0.08)]"
              >
                {skill}
              </span>
            ))}
            {job.missingSkills.map((skill) => (
              <span
                key={`missing-${skill}`}
                className="text-[10px] px-2 py-1 rounded-full border border-[#f87171]/30 text-[#f87171] bg-[rgba(248,113,113,0.08)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0">
          <MatchScoreBadge score={job.matchScore} />
        </div>
      </div>
    </button>
  );
}
