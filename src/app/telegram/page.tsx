'use client';

import * as React from 'react';
import { TelegramProvider, useTelegramContext } from '@/components/Telegram/TelegramProvider';
import TelegramBackButton from '@/components/Telegram/TelegramBackButton';
import TelegramMainButton from '@/components/Telegram/TelegramMainButton';
import ChatPanel from '@/components/ChatPanel';
import { applyTelegramTheme } from '@/lib/telegram/theme';

function TelegramContent() {
  const { isInTelegram, theme, webApp } = useTelegramContext();
  const [showBack, setShowBack] = React.useState(false);
  const [origin, setOrigin] = React.useState('');

  React.useEffect(() => {
    applyTelegramTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!isInTelegram) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
        style={{
          backgroundColor: 'var(--tg-bg, #0b0f19)',
          color: 'var(--tg-text, #e5e2e1)',
        }}
      >
        <div className="text-6xl mb-6">📱</div>
        <h1 className="text-2xl font-bold mb-3">Open in Telegram</h1>
        <p className="mb-6 max-w-sm" style={{ color: 'var(--tg-hint, #c4c7c7)' }}>
          This page is designed to work inside Telegram. Open it from a Telegram bot or
          use the link below to launch the full version in your browser.
        </p>
        <a
          href="/workspace"
          className="px-6 py-3 rounded-xl font-semibold transition-colors"
          style={{
            backgroundColor: 'var(--tg-button, #6001d1)',
            color: 'var(--tg-button-text, #ffffff)',
          }}
        >
          Open Full Workspace
        </a>
      </div>
    );
  }

  const workspaceUrl = origin ? `${origin}/workspace` : '/workspace';

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden"
      style={{
        backgroundColor: 'var(--tg-bg, #0b0f19)',
        color: 'var(--tg-text, #e5e2e1)',
      }}
    >
      <TelegramBackButton visible={showBack} onBack={() => setShowBack(false)} />
      <TelegramMainButton
        text="Open Full Workspace"
        onClick={() => {
          if (webApp?.openLink) {
            webApp.openLink(workspaceUrl);
          } else {
            window.open(workspaceUrl, '_blank');
          }
        }}
      />

      {/* ATS Score mini-widget */}
      <div className="px-4 py-2">
        <div className="glass-panel rounded-xl p-3 flex items-center gap-3 border border-[#4F46E5]/20">
          <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle cx="50" cy="50" fill="none" r="45" stroke="url(#tgAtsGrad)" strokeDasharray="282.7" strokeDashoffset="56.5" strokeLinecap="round" strokeWidth="8" />
              <defs>
                <linearGradient id="tgAtsGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#d2bbff" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xs text-[#e5e2e1] relative z-10 font-bold">80<span className="text-[8px]">%</span></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#e5e2e1]">ATS Match</p>
            <p className="text-[10px] text-[#c4c7c7] truncate">Target: Senior DevOps Engineer</p>
          </div>
          <button
            type="button"
            className="text-[10px] px-2.5 py-1 rounded-lg bg-[#6001d1]/20 text-[#d2bbff] border border-[#d2bbff]/30 hover:bg-[#6001d1]/30 transition-colors flex-shrink-0"
          >
            Improve
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatPanel className="h-full rounded-none border-0 bg-transparent shadow-none" />
      </div>
    </div>
  );
}

export default function TelegramPage() {
  return (
    <TelegramProvider>
      <TelegramContent />
    </TelegramProvider>
  );
}
