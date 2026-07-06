'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, FileText, BarChart3, Briefcase } from 'lucide-react';
import type { MobileTab, MobileTabBarProps } from '@/types/split-screen';

const tabs: { id: MobileTab; label: string; icon: typeof MessageSquare }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'score', label: 'Score', icon: BarChart3 },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
];

export default function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="glass-card mx-2 mb-2 rounded-2xl bg-[rgba(20,19,19,0.85)] backdrop-blur-[16px]">
        <div
          role="tablist"
          aria-label="Mobile navigation"
          className="flex items-center justify-around py-2"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`mobile-tabpanel-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                aria-label={`${tab.label} tab`}
                className={cn(
                  'flex flex-col items-center justify-center gap-1',
                  'px-4 py-2 rounded-xl transition-all duration-200',
                  'min-w-[64px] min-h-[56px] active:scale-95 active:opacity-80',
                  isActive
                    ? 'bg-[#6001d1]/20 text-[#d2bbff]'
                    : 'text-[#c4c7c7] active:bg-white/5'
                )}
              >
                <Icon size={24} strokeWidth={1.5} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
