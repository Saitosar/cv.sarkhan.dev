'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import type { ChatMode } from '@/types/chat';
import { CHAT_MODES } from '@/types/hr-coach';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

export interface ModeToggleProps {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const tier = useSubscriptionStore((s) => s.tier);
  const isPro = tier === 'pro';

  return (
    <div
      role="tablist"
      aria-label="Chat mode"
      className="inline-flex items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[#1c1b1b] p-1"
    >
      {(Object.keys(CHAT_MODES) as ChatMode[]).map((m) => {
      const config = CHAT_MODES[m];
      const isActive = m === mode;
      const isHrCoach = m === 'hr-coach';
      const isDisabled = isHrCoach && !isPro;

      return (
        <button
          key={m}
          type="button"
          role="tab"
          aria-selected={isActive}
          aria-disabled={isDisabled}
          aria-controls={`mode-tabpanel-${m}`}
          id={`mode-tab-${m}`}
          tabIndex={isActive ? 0 : -1}
          onClick={() => {
            if (!isDisabled) {
              onChange(m);
            }
          }}
          title={isDisabled ? 'Upgrade to Pro to unlock HR Coach' : config.description}
          className={cn(
            'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
            isActive
              ? 'text-white'
              : isDisabled
              ? 'text-[#6b6b6b] cursor-not-allowed opacity-60'
              : 'text-[#c4c7c7] hover:text-[#e5e2e1]'
          )}
        >
          {isActive && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: config.color,
                opacity: 0.16,
              }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1">
            {isDisabled ? (
              <Lock size={13} className="text-[#6b6b6b]" />
            ) : (
              <span className="material-symbols-outlined text-[13px]" style={{ color: isActive ? config.color : undefined }}>
                {config.avatarIcon}
              </span>
            )}
          </span>
          <span className="relative z-10">{config.label}</span>
        </button>
      );
      })}
    </div>
  );
}
