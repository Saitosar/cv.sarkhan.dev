'use client';

import { useCallback } from 'react';
import { useTelegramContext } from '@/components/Telegram/TelegramProvider';
import type { TelegramHapticHelpers } from '@/types/telegram';

export function useTelegram() {
  const ctx = useTelegramContext();

  const openLink = useCallback(
    (url: string, options?: { tryInstantView?: boolean }) => {
      if (ctx.webApp) {
        ctx.webApp.openLink(url, { try_instant_view: options?.tryInstantView ?? false });
      } else {
        window.open(url, '_blank');
      }
    },
    [ctx.webApp]
  );

  const closeApp = useCallback(() => {
    ctx.webApp?.close();
  }, [ctx.webApp]);

  const hapticFeedback: TelegramHapticHelpers = {
    impactOccurred: useCallback(
      (style) => {
        ctx.webApp?.HapticFeedback?.impactOccurred(style);
      },
      [ctx.webApp]
    ),
    notificationOccurred: useCallback(
      (type) => {
        ctx.webApp?.HapticFeedback?.notificationOccurred(type);
      },
      [ctx.webApp]
    ),
    selectionChanged: useCallback(() => {
      ctx.webApp?.HapticFeedback?.selectionChanged();
    }, [ctx.webApp]),
  };

  return {
    isInTelegram: ctx.isInTelegram,
    webApp: ctx.webApp,
    user: ctx.user,
    theme: ctx.theme,
    colorScheme: ctx.colorScheme,
    isExpanded: ctx.isExpanded,
    backButton: ctx.webApp?.BackButton ?? null,
    mainButton: ctx.webApp?.MainButton ?? null,
    hapticFeedback,
    openLink,
    closeApp,
  };
}

export default useTelegram;
