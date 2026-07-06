'use client';

import * as React from 'react';
import { useTelegramContext } from './TelegramProvider';

interface TelegramBackButtonProps {
  /** Whether the back button is visible */
  visible: boolean;
  /** Called when the back button is pressed */
  onClick?: () => void;
  /** Alias for onClick to match the architecture doc naming */
  onBack?: () => void;
}

export default function TelegramBackButton({ visible, onClick, onBack }: TelegramBackButtonProps) {
  const { webApp } = useTelegramContext();
  const handleClick = React.useMemo(() => onBack ?? onClick ?? (() => {}), [onBack, onClick]);

  React.useEffect(() => {
    if (!webApp) return;

    if (visible) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(handleClick);
    } else {
      webApp.BackButton.hide();
      webApp.BackButton.offClick(handleClick);
    }

    return () => {
      webApp.BackButton.offClick(handleClick);
      webApp.BackButton.hide();
    };
  }, [webApp, visible, handleClick]);

  return null; // Renders nothing — controls Telegram native UI.
}
