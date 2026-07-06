// src/lib/telegram/__tests__/theme.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  mapTelegramTheme,
  applyTelegramTheme,
  getDefaultTelegramTheme,
  TELEGRAM_CSS_VARS,
} from '../theme';
import type { TelegramThemeParams } from '@/types/telegram';

function createMockThemeParams(overrides?: Partial<TelegramThemeParams>): TelegramThemeParams {
  return {
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#999999',
    link_color: '#0044cc',
    button_color: '#0088ff',
    button_text_color: '#ffffff',
    secondary_bg_color: '#f0f0f0',
    ...overrides,
  };
}

describe('getDefaultTelegramTheme', () => {
  it('should return dark fallback palette', () => {
    const theme = getDefaultTelegramTheme();
    expect(theme.bg).toBe('#0b0f19');
    expect(theme.text).toBe('#e5e2e1');
    expect(theme.hint).toBe('#c4c7c7');
    expect(theme.link).toBe('#d2bbff');
    expect(theme.button).toBe('#6001d1');
    expect(theme.buttonText).toBe('#ffffff');
    expect(theme.secondaryBg).toBe('#141313');
  });
});

describe('mapTelegramTheme', () => {
  it('should return dark fallback when params is null', () => {
    const theme = mapTelegramTheme(null);
    expect(theme.bg).toBe('#0b0f19');
    expect(theme.text).toBe('#e5e2e1');
  });

  it('should map all required fields from params', () => {
    const params = createMockThemeParams();
    const theme = mapTelegramTheme(params);
    expect(theme.bg).toBe('#ffffff');
    expect(theme.text).toBe('#000000');
    expect(theme.hint).toBe('#999999');
    expect(theme.link).toBe('#0044cc');
    expect(theme.button).toBe('#0088ff');
    expect(theme.buttonText).toBe('#ffffff');
    expect(theme.secondaryBg).toBe('#f0f0f0');
  });

  it('should include optional fields when present', () => {
    const params = createMockThemeParams({
      header_bg_color: '#111111',
      accent_text_color: '#222222',
      section_bg_color: '#333333',
      section_header_text_color: '#444444',
      subtitle_text_color: '#555555',
      destructive_text_color: '#ff0000',
    });
    const theme = mapTelegramTheme(params);
    expect(theme.headerBg).toBe('#111111');
    expect(theme.accentText).toBe('#222222');
    expect(theme.sectionBg).toBe('#333333');
    expect(theme.sectionHeaderText).toBe('#444444');
    expect(theme.subtitleText).toBe('#555555');
    expect(theme.destructiveText).toBe('#ff0000');
  });

  it('should not include optional fields when absent', () => {
    const params = createMockThemeParams();
    const theme = mapTelegramTheme(params);
    expect(theme.headerBg).toBeUndefined();
    expect(theme.accentText).toBeUndefined();
    expect(theme.sectionBg).toBeUndefined();
    expect(theme.sectionHeaderText).toBeUndefined();
    expect(theme.subtitleText).toBeUndefined();
    expect(theme.destructiveText).toBeUndefined();
  });
});

describe('applyTelegramTheme', () => {
  beforeEach(() => {
    // Clear any previously set CSS vars
    document.documentElement.style.cssText = '';
  });

  it('should set CSS custom properties on document root', () => {
    const params = createMockThemeParams();
    applyTelegramTheme(params);

    const root = document.documentElement;
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.bg)).toBe('#ffffff');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.text)).toBe('#000000');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.hint)).toBe('#999999');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.link)).toBe('#0044cc');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.button)).toBe('#0088ff');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.buttonText)).toBe('#ffffff');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.secondaryBg)).toBe('#f0f0f0');
  });

  it('should set dark fallback when params is null', () => {
    applyTelegramTheme(null);

    const root = document.documentElement;
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.bg)).toBe('#0b0f19');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.text)).toBe('#e5e2e1');
  });

  it('should set optional CSS vars when present', () => {
    const params = createMockThemeParams({
      header_bg_color: '#111111',
      accent_text_color: '#222222',
      section_bg_color: '#333333',
    });
    applyTelegramTheme(params);

    const root = document.documentElement;
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.headerBg)).toBe('#111111');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.accentText)).toBe('#222222');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.sectionBg)).toBe('#333333');
  });

  it('should not set optional CSS vars when absent', () => {
    const params = createMockThemeParams();
    applyTelegramTheme(params);

    const root = document.documentElement;
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.headerBg)).toBe('');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.accentText)).toBe('');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.sectionBg)).toBe('');
  });

  it('should overwrite previously set CSS vars', () => {
    const lightParams = createMockThemeParams();
    applyTelegramTheme(lightParams);

    const darkParams = createMockThemeParams({
      bg_color: '#0b0f19',
      text_color: '#e5e2e1',
    });
    applyTelegramTheme(darkParams);

    const root = document.documentElement;
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.bg)).toBe('#0b0f19');
    expect(root.style.getPropertyValue(TELEGRAM_CSS_VARS.text)).toBe('#e5e2e1');
  });
});
