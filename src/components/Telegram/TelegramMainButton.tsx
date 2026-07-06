'use client';

import * as React from 'react';
import { useTelegramContext } from './TelegramProvider';

interface TelegramMainButtonProps {
  /** Button text. Defaults to "Open Full Workspace". */
  text?: string;
  /** Optional hex color for the button background. */
  color?: string;
  /** Optional hex color for the button text. */
  textColor?: string;
  /** Whether the button is visible. */
  visible?: boolean;
  /** Whether the button is active (clickable). */
  active?: boolean;
  /** Called when the main button is pressed */
  onClick: () => void;
}

export default function TelegramMainButton({
  text = 'Open Full Workspace',
  color,
  textColor,
  visible = true,
  active = true,
  onClick,
}: TelegramMainButtonProps) {
  const { webApp } = useTelegramContext();

  React.useEffect(() => {
    if (!webApp) return;

    const mainButton = webApp.MainButton;

    mainButton.setParams({
      text,
      color,
      textColor,
      isActive: active,
      isVisible: visible,
    });

    mainButton.onClick(onClick);

    return () => {
      mainButton.offClick(onClick);
      mainButton.hide();
    };
  }, [webApp, text, color, textColor, visible, active, onClick]);

  return null; // Renders nothing — controls Telegram native UI.
}
