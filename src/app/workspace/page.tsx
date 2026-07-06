'use client';

import * as React from 'react';
import SplitScreen from '@/components/SplitScreen';
import ChatPanel from '@/components/ChatPanel';
import CanvasPanel from '@/components/CanvasPanel';
import JobSearchPanel from '@/components/JobSearch/JobSearchPanel';
import { cn } from '@/lib/utils';
import { Briefcase, FileText } from 'lucide-react';

export default function WorkspacePage() {
  const [showJobs, setShowJobs] = React.useState(false);

  return (
    <div className="h-[calc(100vh-48px)] md:h-screen p-4 md:p-6">
      <SplitScreen
        left={<ChatPanel />}
        right={
          <div className="relative w-full h-full">
            {showJobs ? <JobSearchPanel /> : <CanvasPanel />}
            <JobsToggle
              showJobs={showJobs}
              onToggle={() => setShowJobs((v) => !v)}
            />
          </div>
        }
      />
    </div>
  );
}

function JobsToggle({
  showJobs,
  onToggle,
}: {
  showJobs: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={showJobs}
      title={showJobs ? 'Show resume canvas' : 'Show job search'}
      className={cn(
        'hidden md:flex absolute top-4 right-4 z-40 items-center gap-2',
        'px-3 py-1.5 rounded-full text-xs font-medium',
        'glass-panel border border-white/10 hover:bg-white/5 transition-colors',
        showJobs ? 'text-[#d2bbff]' : 'text-[#c4c7c7]'
      )}
    >
      {showJobs ? <FileText size={14} /> : <Briefcase size={14} />}
      {showJobs ? 'Resume' : 'Jobs'}
    </button>
  );
}
