'use client';

import * as React from 'react';
import { Suspense } from 'react';
import SplitScreen from '@/components/SplitScreen';
import ChatPanel from '@/components/ChatPanel';
import CanvasPanel from '@/components/CanvasPanel';
import { cn } from '@/lib/utils';
import { Briefcase, FileText, Lock } from 'lucide-react';

function JobsPlaceholder() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#2b2a2a]/80 flex items-center justify-center">
          <Lock size={32} className="text-[#c4c7c7]" />
        </div>
        <h3 className="text-lg font-semibold text-[#e5e2e1] mb-2">В разработке</h3>
        <p className="text-sm text-[#c4c7c7] max-w-[240px] mx-auto">
          Поиск и отслеживание вакансий скоро появятся. Следите за обновлениями!
        </p>
      </div>
    </div>
  );
}

function WorkspaceContent() {
  const [showJobs, setShowJobs] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setShowJobs(new URLSearchParams(window.location.search).get('tab') === 'jobs');
    }
  }, []);

  return (
    <div className="h-[calc(100dvh-48px)] md:h-[calc(100dvh-64px)] flex flex-col">
      {showJobs ? (
        <JobsPlaceholder />
      ) : (
        <div className="flex-1 p-4 pl-4 md:pl-6 pr-4 md:pr-0 pt-2 md:pt-3">
          <SplitScreen
            left={<ChatPanel />}
            right={
              <div className="relative w-full h-full">
                <CanvasPanel />
                <JobsToggle
                  showJobs={showJobs}
                  onToggle={() => setShowJobs((v) => !v)}
                />
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100dvh-48px)] md:h-[calc(100dvh-64px)] flex items-center justify-center">
        <span className="text-sm text-[#c4c7c7]">Loading workspace...</span>
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
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
