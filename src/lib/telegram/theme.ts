// src/lib/telegram/theme.ts
// Maps Telegram WebApp theme parameters to CSS custom properties.

import type { TelegramThemeParams } from '@/types/telegram';

/** CSS custom property names that mirror Telegram theme keys. */
export const TELEGRAM_CSS_VARS = {
  bg: '--tg-bg',
  text: '--tg-text',
  hint: '--tg-hint',
  link: '--tg-link',
  button: '--tg-button',
  buttonText: '--tg-button-text',
  secondaryBg: '--tg-secondary-bg',
  headerBg: '--tg-header-bg',
  accentText: '--tg-accent-text',
  sectionBg: '--tg-section-bg',
  sectionHeaderText: '--tg-section-header-text',
  subtitleText: '--tg-subtitle-text',
  destructiveText: '--tg-destructive-text',
} as const;

export interface MappedTheme {
  bg: string;
  text: string;
  hint: string;
  link: string;
  button: string;
  buttonText: string;
  secondaryBg: string;
  headerBg?: string;
  accentText?: string;
  sectionBg?: string;
  sectionHeaderText?: string;
  subtitleText?: string;
  destructiveText?: string;
}

/** Dark fallback palette used when Telegram theme params are unavailable. */
export function getDefaultTelegramTheme(): MappedTheme {
  return {
    bg: '#0b0f19',
    text: '#e5e2e1',
    hint: '#c4c7c7',
    link: '#d2bbff',
    button: '#6001d1',
    buttonText: '#ffffff',
    secondaryBg: '#141313',
  };
}

/**
 * Map Telegram theme params to CSS custom properties.
 * Falls back to dark theme defaults if params are missing.
 */
export function mapTelegramTheme(params: TelegramThemeParams | null): MappedTheme {
  if (!params) {
    return getDefaultTelegramTheme();
  }

  return {
    bg: params.bg_color,
    text: params.text_color,
    hint: params.hint_color,
    link: params.link_color,
    button: params.button_color,
    buttonText: params.button_text_color,
    secondaryBg: params.secondary_bg_color,
    headerBg: params.header_bg_color,
    accentText: params.accent_text_color,
    sectionBg: params.section_bg_color,
    sectionHeaderText: params.section_header_text_color,
    subtitleText: params.subtitle_text_color,
    destructiveText: params.destructive_text_color,
  };
}

/**
 * Apply Telegram theme as CSS custom properties on the document root.
 * Safe to call on the server (no-op if document is undefined).
 */
export function applyTelegramTheme(params: TelegramThemeParams | null): void {
  if (typeof document === 'undefined') return;

  const theme = mapTelegramTheme(params);
  const root = document.documentElement;

  root.style.setProperty(TELEGRAM_CSS_VARS.bg, theme.bg);
  root.style.setProperty(TELEGRAM_CSS_VARS.text, theme.text);
  root.style.setProperty(TELEGRAM_CSS_VARS.hint, theme.hint);
  root.style.setProperty(TELEGRAM_CSS_VARS.link, theme.link);
  root.style.setProperty(TELEGRAM_CSS_VARS.button, theme.button);
  root.style.setProperty(TELEGRAM_CSS_VARS.buttonText, theme.buttonText);
  root.style.setProperty(TELEGRAM_CSS_VARS.secondaryBg, theme.secondaryBg);

  if (theme.headerBg) {
    root.style.setProperty(TELEGRAM_CSS_VARS.headerBg, theme.headerBg);
  }
  if (theme.accentText) {
    root.style.setProperty(TELEGRAM_CSS_VARS.accentText, theme.accentText);
  }
  if (theme.sectionBg) {
    root.style.setProperty(TELEGRAM_CSS_VARS.sectionBg, theme.sectionBg);
  }
  if (theme.sectionHeaderText) {
    root.style.setProperty(TELEGRAM_CSS_VARS.sectionHeaderText, theme.sectionHeaderText);
  }
  if (theme.subtitleText) {
    root.style.setProperty(TELEGRAM_CSS_VARS.subtitleText, theme.subtitleText);
  }
  if (theme.destructiveText) {
    root.style.setProperty(TELEGRAM_CSS_VARS.destructiveText, theme.destructiveText);
  }
}
