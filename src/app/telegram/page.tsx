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
