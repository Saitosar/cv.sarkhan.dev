'use client';

import * as React from 'react';
import type {
  TelegramContextValue,
  TelegramWebApp,
  TelegramThemeParams,
} from '@/types/telegram';
import { applyTelegramTheme } from '@/lib/telegram/theme';

const TelegramContext = React.createContext<TelegramContextValue>({
  isInTelegram: false,
  webApp: null,
  user: null,
  theme: null,
  colorScheme: 'dark',
  isExpanded: false,
});

export function useTelegramContext(): TelegramContextValue {
  return React.useContext(TelegramContext);
}

interface TelegramProviderProps {
  children: React.ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [context, setContext] = React.useState<TelegramContextValue>({
    isInTelegram: false,
    webApp: null,
    user: null,
    theme: null,
    colorScheme: 'dark',
    isExpanded: false,
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const tg = (
      window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }
    ).Telegram?.WebApp;

    if (!tg?.initData) {
      // Not running inside Telegram — keep fallback state.
      return;
    }

    tg.ready();
    tg.expand();

    const updateTheme = (theme: TelegramThemeParams | null, colorScheme: 'light' | 'dark') => {
      applyTelegramTheme(theme);
      setContext((prev) => ({
        ...prev,
        theme,
        colorScheme,
      }));
    };

    const handleThemeChanged = () => {
      updateTheme(tg.themeParams, tg.colorScheme);
    };

    const handleViewportChanged = () => {
      setContext((prev) => ({
        ...prev,
        isExpanded: tg.isExpanded,
        viewportHeight: tg.viewportHeight,
        viewportStableHeight: tg.viewportStableHeight,
      }));
    };

    tg.onEvent('themeChanged', handleThemeChanged);
    tg.onEvent('viewportChanged', handleViewportChanged);

    setContext({
      isInTelegram: true,
      webApp: tg,
      user: tg.initDataUnsafe.user ?? null,
      theme: tg.themeParams,
      colorScheme: tg.colorScheme,
      isExpanded: tg.isExpanded,
    });

    applyTelegramTheme(tg.themeParams);

    return () => {
      tg.offEvent('themeChanged', handleThemeChanged);
      tg.offEvent('viewportChanged', handleViewportChanged);
    };
  }, []);

  return (
    <TelegramContext.Provider value={context}>
      {children}
    </TelegramContext.Provider>
  );
}

export default TelegramProvider;
