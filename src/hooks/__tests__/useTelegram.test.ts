// src/hooks/__tests__/useTelegram.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTelegram } from '../useTelegram';
import * as TelegramProvider from '@/components/Telegram/TelegramProvider';
import type { TelegramContextValue, TelegramWebApp } from '@/types/telegram';

function createMockWebApp(overrides?: Partial<TelegramWebApp>): TelegramWebApp {
  return {
    initData: 'test-init-data',
    initDataUnsafe: {
      user: { id: 123, first_name: 'Test', last_name: 'User', username: 'testuser' },
    },
    version: '7.0',
    platform: 'tdesktop',
    colorScheme: 'dark',
    themeParams: {
      bg_color: '#0b0f19',
      text_color: '#e5e2e1',
      hint_color: '#c4c7c7',
      link_color: '#d2bbff',
      button_color: '#6001d1',
      button_text_color: '#ffffff',
      secondary_bg_color: '#141313',
    },
    isExpanded: true,
    viewportHeight: 800,
    viewportStableHeight: 780,
    isClosingConfirmationEnabled: false,
    isVerticalSwipesEnabled: true,
    headerColor: '#0b0f19',
    backgroundColor: '#0b0f19',
    bottomBarColor: '#141313',
    ready: vi.fn(),
    expand: vi.fn(),
    close: vi.fn(),
    enableClosingConfirmation: vi.fn(),
    disableClosingConfirmation: vi.fn(),
    enableVerticalSwipes: vi.fn(),
    disableVerticalSwipes: vi.fn(),
    setHeaderColor: vi.fn(),
    setBackgroundColor: vi.fn(),
    setBottomBarColor: vi.fn(),
    BackButton: {
      isVisible: false,
      show: vi.fn(),
      hide: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
    },
    MainButton: {
      isVisible: false,
      isActive: true,
      isProgressVisible: false,
      text: '',
      color: '#6001d1',
      textColor: '#ffffff',
      show: vi.fn(),
      hide: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      showProgress: vi.fn(),
      hideProgress: vi.fn(),
      setText: vi.fn(),
      onClick: vi.fn(),
      offClick: vi.fn(),
      setParams: vi.fn(),
    },
    HapticFeedback: {
      impactOccurred: vi.fn(),
      notificationOccurred: vi.fn(),
      selectionChanged: vi.fn(),
    },
    onEvent: vi.fn(),
    offEvent: vi.fn(),
    sendData: vi.fn(),
    switchInlineQuery: vi.fn(),
    openLink: vi.fn(),
    openTelegramLink: vi.fn(),
    openInvoice: vi.fn(),
    showPopup: vi.fn(),
    showAlert: vi.fn(),
    showConfirm: vi.fn(),
    showScanQrPopup: vi.fn(),
    closeScanQrPopup: vi.fn(),
    readTextFromClipboard: vi.fn(),
    requestWriteAccess: vi.fn(),
    requestContact: vi.fn(),
    ...overrides,
  } as unknown as TelegramWebApp;
}

function createMockContext(overrides?: Partial<TelegramContextValue>): TelegramContextValue {
  return {
    isInTelegram: true,
    webApp: createMockWebApp(),
    user: { id: 123, first_name: 'Test', last_name: 'User', username: 'testuser' },
    theme: {
      bg_color: '#0b0f19',
      text_color: '#e5e2e1',
      hint_color: '#c4c7c7',
      link_color: '#d2bbff',
      button_color: '#6001d1',
      button_text_color: '#ffffff',
      secondary_bg_color: '#141313',
    },
    colorScheme: 'dark',
    isExpanded: true,
    ...overrides,
  };
}

describe('useTelegram', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return isInTelegram true when in Telegram context', () => {
    vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(createMockContext());
    const { result } = renderHook(() => useTelegram());
    expect(result.current.isInTelegram).toBe(true);
  });

  it('should return isInTelegram false when not in Telegram context', () => {
    vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(
      createMockContext({ isInTelegram: false, webApp: null, user: null, theme: null })
    );
    const { result } = renderHook(() => useTelegram());
    expect(result.current.isInTelegram).toBe(false);
    expect(result.current.webApp).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('should return user info from context', () => {
    vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(createMockContext());
    const { result } = renderHook(() => useTelegram());
    expect(result.current.user).toEqual({
      id: 123,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
    });
  });

  it('should return theme and colorScheme from context', () => {
    vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(createMockContext());
    const { result } = renderHook(() => useTelegram());
    expect(result.current.colorScheme).toBe('dark');
    expect(result.current.theme).toBeDefined();
    expect(result.current.theme!.bg_color).toBe('#0b0f19');
  });

  it('should return backButton and mainButton from webApp', () => {
    vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(createMockContext());
    const { result } = renderHook(() => useTelegram());
    expect(result.current.backButton).toBeDefined();
    expect(result.current.mainButton).toBeDefined();
  });

  it('should return null backButton/mainButton when webApp is null', () => {
    vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(
      createMockContext({ webApp: null })
    );
    const { result } = renderHook(() => useTelegram());
    expect(result.current.backButton).toBeNull();
    expect(result.current.mainButton).toBeNull();
  });

  describe('openLink', () => {
    it('should call webApp.openLink when in Telegram', () => {
      const webApp = createMockWebApp();
      vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(createMockContext({ webApp }));
      const { result } = renderHook(() => useTelegram());
      result.current.openLink('https://example.com');
      expect(webApp.openLink).toHaveBeenCalledWith('https://example.com', { try_instant_view: false });
    });

    it('should call window.open when not in Telegram', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(
        createMockContext({ webApp: null, isInTelegram: false })
      );
      const { result } = renderHook(() => useTelegram());
      result.current.openLink('https://example.com');
      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
      openSpy.mockRestore();
    });
  });

  describe('closeApp', () => {
    it('should call webApp.close when in Telegram', () => {
      const webApp = createMockWebApp();
      vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(createMockContext({ webApp }));
      const { result } = renderHook(() => useTelegram());
      result.current.closeApp();
      expect(webApp.close).toHaveBeenCalledTimes(1);
    });

    it('should not throw when webApp is null', () => {
      vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(
        createMockContext({ webApp: null })
      );
      const { result } = renderHook(() => useTelegram());
      expect(() => result.current.closeApp()).not.toThrow();
    });
  });

  describe('hapticFeedback', () => {
    it('should call impactOccurred for light/medium/heavy', () => {
      const webApp = createMockWebApp();
      vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(createMockContext({ webApp }));
      const { result } = renderHook(() => useTelegram());

      result.current.hapticFeedback.impactOccurred('light');
      expect(webApp.HapticFeedback!.impactOccurred).toHaveBeenCalledWith('light');

      result.current.hapticFeedback.impactOccurred('medium');
      expect(webApp.HapticFeedback!.impactOccurred).toHaveBeenCalledWith('medium');

      result.current.hapticFeedback.impactOccurred('heavy');
      expect(webApp.HapticFeedback!.impactOccurred).toHaveBeenCalledWith('heavy');
    });

    it('should call notificationOccurred for success/error/warning', () => {
      const webApp = createMockWebApp();
      vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(createMockContext({ webApp }));
      const { result } = renderHook(() => useTelegram());

      result.current.hapticFeedback.notificationOccurred('success');
      expect(webApp.HapticFeedback!.notificationOccurred).toHaveBeenCalledWith('success');

      result.current.hapticFeedback.notificationOccurred('error');
      expect(webApp.HapticFeedback!.notificationOccurred).toHaveBeenCalledWith('error');

      result.current.hapticFeedback.notificationOccurred('warning');
      expect(webApp.HapticFeedback!.notificationOccurred).toHaveBeenCalledWith('warning');
    });

    it('should call selectionChanged', () => {
      const webApp = createMockWebApp();
      vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(createMockContext({ webApp }));
      const { result } = renderHook(() => useTelegram());

      result.current.hapticFeedback.selectionChanged();
      expect(webApp.HapticFeedback!.selectionChanged).toHaveBeenCalledTimes(1);
    });

    it('should not throw when HapticFeedback is undefined', () => {
      const webApp = createMockWebApp({ HapticFeedback: undefined });
      vi.spyOn(TelegramProvider, 'useTelegramContext').mockReturnValue(createMockContext({ webApp }));
      const { result } = renderHook(() => useTelegram());

      expect(() => {
        result.current.hapticFeedback.impactOccurred('light');
        result.current.hapticFeedback.notificationOccurred('success');
        result.current.hapticFeedback.selectionChanged();
      }).not.toThrow();
    });
  });
});
